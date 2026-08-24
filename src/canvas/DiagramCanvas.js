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
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.style.cursor = 'grab';
    });

    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
    }, { passive: false });
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
      el.addEventListener('mouseenter', (e) => node && this.showTooltip(e, node));
      el.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  selectNode(id) {
    this.selectedNodeId = id;
    this.renderNodeLayer();
    const node = this.layoutData?.nodes.find(n => n.id === id);
    if (node && this.onNodeSelect) this.onNodeSelect(node);
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
