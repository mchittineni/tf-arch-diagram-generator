import { SAMPLE_PLANS, DEFAULT_SAMPLE_KEY } from './data/samplePlans.js';
import { parseTerraformPlan } from './parser/tfPlanParser.js';
import { computeArchitectureLayout } from './canvas/layoutEngine.js';
import { DiagramCanvas } from './canvas/DiagramCanvas.js';
import { renderStandaloneSvg } from './canvas/svgRenderer.js';
import { renderNavbar } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { ResourceInspector } from './components/ResourceInspector.js';
import { ImportModal } from './components/ImportModal.js';

/**
 * Application shell: builds the layout, wires the canvas, sidebar, inspector
 * and import modal together, and loads plans into them.
 */
export class App {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentTemplateKey = DEFAULT_SAMPLE_KEY;
    this.parsedPlan = null;
    this.layoutData = null;

    this.initShell();
    this.bootstrap();
  }

  /**
   * Loads a plan served by the CLI (`tf-arch serve <plan.json>`) when present,
   * otherwise falls back to the default built-in template.
   */
  async bootstrap() {
    try {
      const response = await fetch('plan.json', { cache: 'no-store' });
      const contentType = response.headers?.get?.('content-type') || '';
      if (response.ok && contentType.includes('json')) {
        const payload = await response.json();
        this.currentTemplateKey = 'custom';
        this.loadPlan(payload.plan ?? payload, payload.title);
        return;
      }
    } catch {
      // No CLI-served plan — fall through to the demo template.
    }
    this.loadPlan(SAMPLE_PLANS[DEFAULT_SAMPLE_KEY].data);
  }

  initShell() {
    this.appContainer.innerHTML = `
      <div id="navbar-container"></div>
      
      <div class="main-workspace">
        <aside id="sidebar-container" class="sidebar"></aside>

        <main id="canvas-container" style="flex:1; position:relative; overflow:hidden; display:flex;">
          <!-- The diagram owns this node exclusively; the overlays below are its
               siblings so re-rendering the canvas cannot destroy them. -->
          <div id="diagram-mount" class="diagram-mount"></div>

          <!-- Floating Zoom / Fit Controls -->
          <div class="canvas-controls">
            <button id="btn-zoom-in" class="control-btn" title="Zoom In">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <span id="zoom-percentage" class="zoom-level-text">100%</span>
            <button id="btn-zoom-out" class="control-btn" title="Zoom Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <div class="control-divider"></div>
            <button id="btn-fit-screen" class="control-btn" title="Fit to Screen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button id="btn-reset-view" class="control-btn" title="Reset View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
            <div class="control-divider"></div>
            <button id="btn-toggle-labels" class="control-btn active" title="Toggle Connection Labels">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"></path>
              </svg>
            </button>
          </div>

          <!-- Architecture Legend -->
          <div class="legend-overlay">
            <div class="legend-title">Planned Actions</div>
            <div class="legend-items">
              <div class="legend-item"><span class="legend-dot" style="background:#10b981;"></span> Create (+)</div>
              <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Modify (~)</div>
              <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Destroy (-)</div>
            </div>
          </div>
        </main>

        <!-- Inspector Drawer -->
        <aside id="inspector-container" class="inspector-drawer hidden"></aside>
      </div>

      <!-- Modals -->
      <div id="modal-container"></div>
    `;

    this.navContainer = document.getElementById('navbar-container');
    this.sidebarContainer = document.getElementById('sidebar-container');
    this.canvasContainer = document.getElementById('canvas-container');
    this.diagramMount = document.getElementById('diagram-mount');
    this.inspectorContainer = document.getElementById('inspector-container');
    this.modalContainer = document.getElementById('modal-container');

    // Initialize Diagram Canvas
    this.diagramCanvas = new DiagramCanvas(this.diagramMount, (node) => {
      if (node) this.inspector.show(node, this.layoutData?.edges, this.parsedPlan?.nodes);
      else this.inspector.hide();
    });

    // Initialize Inspector with navigation support
    this.inspector = new ResourceInspector(
      this.inspectorContainer,
      () => {
        this.diagramCanvas.selectNode(null);
      },
      (targetNodeId) => {
        this.diagramCanvas.selectNode(targetNodeId);
        const node = this.parsedPlan?.nodes.find(n => n.id === targetNodeId);
        if (node) this.inspector.show(node, this.layoutData?.edges, this.parsedPlan?.nodes);
        const layoutNode = this.layoutData?.nodes.find(n => n.id === targetNodeId);
        if (layoutNode && layoutNode.x !== undefined) this.diagramCanvas.zoomToNode(layoutNode);
      }
    );

    // Initialize Import Modal
    this.importModal = new ImportModal(this.modalContainer, (customPlanJson) => {
      const previousKey = this.currentTemplateKey;
      this.currentTemplateKey = 'custom';
      try {
        this.loadPlan(customPlanJson);
      } catch (err) {
        this.currentTemplateKey = previousKey;
        throw err; // the dialog shows the message inline and stays open
      }
    });

    this.bindCanvasControls();
  }

  bindCanvasControls() {
    const bind = (id, handler) => {
      const el = document.getElementById(id);
      if (!el) {
        // Auxiliary chrome: warn, but never take the diagram down with it.
        console.warn(`Canvas control #${id} is missing; skipping its binding.`);
        return;
      }
      el.addEventListener('click', handler);
    };

    bind('btn-zoom-in', () => this.diagramCanvas.zoom(1.2));
    bind('btn-zoom-out', () => this.diagramCanvas.zoom(0.8));
    bind('btn-fit-screen', () => this.diagramCanvas.animated(() => this.diagramCanvas.fitToScreen()));
    bind('btn-reset-view', () => this.diagramCanvas.animated(() => this.diagramCanvas.resetZoom()));
    bind('btn-toggle-labels', () => {
      const isVisible = this.diagramCanvas.toggleEdgeLabels();
      const btn = document.getElementById('btn-toggle-labels');
      if (btn) btn.classList.toggle('active', isVisible);
    });
  }

  loadPlan(planJson, title) {
    try {
      this.parsedPlan = parseTerraformPlan(planJson);
      this.layoutData = computeArchitectureLayout(this.parsedPlan);
      this.planTitle = title || SAMPLE_PLANS[this.currentTemplateKey]?.name || 'Terraform Architecture';

      // Render Navigation
      renderNavbar(this.navContainer, {
        stats: this.parsedPlan.stats,
        providers: this.parsedPlan.providers,
        currentTemplate: this.currentTemplateKey,
        onTemplateChange: (key) => {
          this.currentTemplateKey = key;
          if (SAMPLE_PLANS[key]) {
            this.loadPlan(SAMPLE_PLANS[key].data);
          }
        },
        onImportClick: () => {
          this.importModal.open();
        },
        onExportClick: () => {
          this.exportDiagram();
        },
        onToggleSidebar: () => {
          this.sidebarContainer.classList.toggle('collapsed');
        }
      });

      // Render Sidebar
      renderSidebar(this.sidebarContainer, {
        nodes: this.parsedPlan.nodes,
        providers: this.parsedPlan.providers,
        onSearch: (term) => {
          this.diagramCanvas.setSearchTerm(term);
        },
        onProviderFilter: (providerId) => {
          this.diagramCanvas.setFilterProvider(providerId);
        },
        onCategoryFilter: (cat) => {
          this.diagramCanvas.setFilterCategory(cat);
        },
        onActionFilter: (act) => {
          this.diagramCanvas.setFilterAction(act);
        },
        onResourceClick: (id) => {
          this.diagramCanvas.selectNode(id);
          const node = this.parsedPlan.nodes.find(n => n.id === id);
          if (node) this.inspector.show(node, this.layoutData?.edges, this.parsedPlan?.nodes);
          // Glide the canvas to the picked resource so the sidebar drives the view.
          const layoutNode = this.layoutData?.nodes.find(n => n.id === id);
          if (layoutNode && layoutNode.x !== undefined) this.diagramCanvas.zoomToNode(layoutNode);
        }
      });

      // Render Canvas
      this.diagramCanvas.render(this.layoutData);

      // Auto fit after render
      setTimeout(() => {
        this.diagramCanvas.fitToScreen();
      }, 50);

      return true;
    } catch (err) {
      console.error('Error parsing plan:', err);
      // The import dialog shows this inline and stays open; keep the previous
      // diagram on screen rather than tearing it down for a bad paste.
      throw new Error(`Could not load plan: ${err.message}`);
    }
  }

  exportDiagram() {
    if (!this.layoutData) return;

    const svg = renderStandaloneSvg(this.layoutData, { title: this.planTitle });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = String(this.planTitle || 'terraform-architecture')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'terraform-architecture';
    link.download = `${slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
