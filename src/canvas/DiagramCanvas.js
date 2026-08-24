import { SVG_DEFS, renderContainers, renderEdges, renderNodes, escapeXml } from './svgRenderer.js';

/**
 * Interactive Diagram Canvas: SVG viewport with pan, zoom, filtering,
 * selection and hover tooltips. All markup comes from the shared
 * svgRenderer so the exported SVG matches what is on screen.
 */
export class DiagramCanvas {
  constructor(containerElement, onNodeSelect) {
    this.container = containerElement;
    this.onNodeSelect = onNodeSelect;

    this.scale = 1;
    this.panX = 40;
    this.panY = 40;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.selectedNodeId = null;
    this.filterCategory = 'all';
    this.filterAction = 'all';
    this.filterProvider = 'all';
    this.searchTerm = '';

    this.layoutData = null;

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    this.container.innerHTML = `
      <div class="canvas-wrapper" id="canvas-viewport">
        <svg id="main-svg" class="canvas-svg" xmlns="http://www.w3.org/2000/svg">
          ${SVG_DEFS}
          <g id="viewport-group" transform="translate(40, 40) scale(1)">
            <g id="containers-layer"></g>
            <g id="edges-layer"></g>
            <g id="nodes-layer"></g>
          </g>
        </svg>
        <div id="canvas-tooltip" class="arch-tooltip"></div>
      </div>
    `;

    this.viewportGroup = document.getElementById('viewport-group');
    this.containersLayer = document.getElementById('containers-layer');
    this.edgesLayer = document.getElementById('edges-layer');
    this.nodesLayer = document.getElementById('nodes-layer');
    this.tooltip = document.getElementById('canvas-tooltip');
    this.viewport = document.getElementById('canvas-viewport');
  }

  bindEvents() {
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.diagram-node') || e.target.closest('.control-btn')) return;
      this.isDragging = true;
      this.didDrag = false;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const nextX = e.clientX - this.dragStartX;
      const nextY = e.clientY - this.dragStartY;
      if (Math.abs(nextX - this.panX) + Math.abs(nextY - this.panY) > 0) this.didDrag = true;
      this.panX = nextX;
      this.panY = nextY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.style.cursor = 'grab';
    });

    // Clicking empty canvas (without panning) clears the selection.
    this.viewport.addEventListener('click', (e) => {
      if (this.didDrag) return;
      if (e.target.closest('.diagram-node') || e.target.closest('.diagram-edge') || e.target.closest('.control-btn')) return;
      if (this.selectedNodeId) this.deselectNode();
    });

    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
    }, { passive: false });

    // Keyboard: +/- zoom, 0 resets, F fits — ignored while typing in a field.
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if (e.key === '+' || e.key === '=') { this.zoom(1.2); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { this.zoom(1 / 1.2); e.preventDefault(); }
      else if (e.key === '0') { this.animated(() => this.resetZoom()); e.preventDefault(); }
      else if (e.key === 'f' || e.key === 'F') { this.animated(() => this.fitToScreen()); e.preventDefault(); }
      else if (e.key === 'Escape' && this.selectedNodeId) { this.deselectNode(); }
    });
  }

  /** Runs a programmatic pan/zoom with a short CSS transition on the viewport. */
  animated(move) {
    if (!this.viewportGroup) return move();
    this.viewportGroup.style.transition = 'transform 0.35s ease';
    move();
    window.setTimeout(() => { this.viewportGroup.style.transition = ''; }, 380);
  }

  zoom(factor, clientX, clientY) {
    const newScale = Math.min(Math.max(0.2, this.scale * factor), 3.0);
    if (newScale === this.scale) return;

    if (clientX !== undefined && clientY !== undefined) {
      const rect = this.viewport.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    }

    this.scale = newScale;
    this.updateTransform();
    this.notifyZoomChange();
  }

  resetZoom() {
    this.scale = 1;
    this.panX = 40;
    this.panY = 40;
    this.updateTransform();
    this.notifyZoomChange();
  }

  fitToScreen() {
    if (!this.layoutData) return;
    const rect = this.viewport.getBoundingClientRect();
    const bounds = this.layoutData.bounds;

    const scaleX = (rect.width - 80) / bounds.width;
    const scaleY = (rect.height - 80) / bounds.height;
    this.scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.2);

    this.panX = (rect.width - bounds.width * this.scale) / 2;
    this.panY = Math.max(30, (rect.height - bounds.height * this.scale) / 2);

    this.updateTransform();
    this.notifyZoomChange();
  }

  updateTransform() {
    if (this.viewportGroup) {
      this.viewportGroup.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.scale})`);
    }
  }

  notifyZoomChange() {
    const zoomDisplay = document.getElementById('zoom-percentage');
    if (zoomDisplay) zoomDisplay.textContent = `${Math.round(this.scale * 100)}%`;
  }

  render(layoutData) {
    this.layoutData = layoutData;
    this.containersLayer.innerHTML = renderContainers(layoutData.containers);
    this.edgesLayer.innerHTML = renderEdges(layoutData.edges);
    this.renderNodeLayer();
    this.notifyZoomChange();
  }

  renderNodeLayer() {
    if (!this.layoutData) return;
    this.nodesLayer.innerHTML = renderNodes(this.layoutData.nodes, {
      selectedNodeId: this.selectedNodeId,
      filterCategory: this.filterCategory,
      filterAction: this.filterAction,
      filterProvider: this.filterProvider,
      searchTerm: this.searchTerm
    });
    this.bindNodeInteractions();
  }

  bindNodeInteractions() {
    this.nodesLayer.querySelectorAll('.diagram-node').forEach(el => {
      const id = el.getAttribute('data-id');
      const node = this.layoutData?.nodes.find(n => n.id === id);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectNode(id);
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (node) this.zoomToNode(node);
      });
      el.addEventListener('mouseenter', (e) => {
        if (node) this.showTooltip(e, node);
        this.highlightConnections(id);
      });
      el.addEventListener('mouseleave', () => {
        this.hideTooltip();
        this.highlightConnections(this.selectedNodeId);
      });
    });
    // Re-rendering the node layer wipes classes, so re-apply the selection's highlight.
    this.highlightConnections(this.selectedNodeId);
  }

  /**
   * Spotlights a node's direct connections: its edges light up (animated flow),
   * unrelated nodes and edges fade back. Pass null to clear.
   */
  highlightConnections(id) {
    const edgeEls = this.edgesLayer.querySelectorAll('.diagram-edge');
    const nodeEls = this.nodesLayer.querySelectorAll('.diagram-node');
    if (!id) {
      edgeEls.forEach(el => el.classList.remove('active', 'dim'));
      nodeEls.forEach(el => el.classList.remove('dim'));
      return;
    }

    const neighbors = new Set([id]);
    edgeEls.forEach(el => {
      const source = el.getAttribute('data-source');
      const target = el.getAttribute('data-target');
      const connected = source === id || target === id;
      el.classList.toggle('active', connected);
      el.classList.toggle('dim', !connected);
      if (connected) { neighbors.add(source); neighbors.add(target); }
    });
    nodeEls.forEach(el => {
      el.classList.toggle('dim', !neighbors.has(el.getAttribute('data-id')));
    });
  }

  selectNode(id) {
    this.selectedNodeId = id;
    this.renderNodeLayer();
    const node = this.layoutData?.nodes.find(n => n.id === id);
    if (node && this.onNodeSelect) this.onNodeSelect(node);
  }

  deselectNode() {
    this.selectedNodeId = null;
    this.renderNodeLayer();
    if (this.onNodeSelect) this.onNodeSelect(null);
  }

  /** Double-click: glide the viewport to center on a node. */
  zoomToNode(node) {
    const rect = this.viewport.getBoundingClientRect();
    const targetScale = Math.max(this.scale, 1.3);
    this.animated(() => {
      this.scale = targetScale;
      this.panX = rect.width / 2 - (node.x + node.width / 2) * targetScale;
      this.panY = rect.height / 2 - (node.y + node.height / 2) * targetScale;
      this.updateTransform();
      this.notifyZoomChange();
    });
  }

  showTooltip(e, node) {
    const rect = this.viewport.getBoundingClientRect();
    this.tooltip.style.left = `${e.clientX - rect.left + 15}px`;
    this.tooltip.style.top = `${e.clientY - rect.top + 15}px`;
    this.tooltip.innerHTML = `
      <div style="font-weight:700; color:${escapeXml(node.icon.categoryColor)}; margin-bottom:2px;">${escapeXml(node.name)}</div>
      <div style="color:#94a3b8; font-size:10px; font-family:'JetBrains Mono';">${escapeXml(node.type)}</div>
      <div style="margin-top:4px; font-size:10px;">
        ${escapeXml(node.icon.providerName)} · Action:
        <span style="text-transform:uppercase; font-weight:bold;">${escapeXml(node.action)}</span>
      </div>
    `;
    this.tooltip.style.display = 'block';
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  setFilterCategory(cat) {
    this.filterCategory = cat;
    this.renderNodeLayer();
  }

  setFilterAction(action) {
    this.filterAction = action;
    this.renderNodeLayer();
  }

  setFilterProvider(providerId) {
    this.filterProvider = providerId;
    this.renderNodeLayer();
  }

  setSearchTerm(term) {
    this.searchTerm = term;
    this.renderNodeLayer();
  }
}
