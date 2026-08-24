import { escapeXml } from '../canvas/svgRenderer.js';
import { SAMPLE_PLANS, SAMPLE_GROUPS } from '../data/samplePlans.js';

/**
 * Header bar: brand, plan change statistics, detected cloud providers,
 * template switcher, import and export actions.
 */
export function renderNavbar(container, {
  stats,
  providers = [],
  currentTemplate,
  onTemplateChange,
  onImportClick,
  onExportClick,
  onToggleSidebar
}) {
  const providerBadges = providers.map(p => `
    <span class="nav-provider-badge" style="color:${escapeXml(p.accentColor)};">
      <span class="provider-dot" style="width:8px;height:8px;border-radius:50%;background:${escapeXml(p.accentColor)};"></span>
      ${escapeXml(p.shortName)}
    </span>
  `).join('');

  const templateOptions = SAMPLE_GROUPS
    .filter(group => group.keys.length > 0)
    .map(group => `
      <optgroup label="${escapeXml(group.label)}">
        ${group.keys.map(key => `
          <option value="${escapeXml(key)}" ${currentTemplate === key ? 'selected' : ''}>
            ${escapeXml(SAMPLE_PLANS[key].name)}
          </option>
        `).join('')}
      </optgroup>
    `).join('');

  const customOption = currentTemplate === 'custom'
    ? '<option value="custom" selected>Imported plan</option>'
    : '';

  container.innerHTML = `
    <header class="navbar">
      <div class="brand-section">
        <button id="btn-toggle-sidebar" class="control-btn" title="Toggle Sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div class="brand-title">
          <h1>Terraform Architecture Visualizer</h1>
          <span>AWS · Google Cloud · Azure</span>
        </div>
      </div>

      <div class="nav-stats-bar" id="plan-stats-bar">
        <div class="stat-pill create" title="Resources to create">
          <span>+</span> <span id="stat-create">${stats?.create || 0} to add</span>
        </div>
        <div class="stat-pill update" title="Resources to update">
          <span>~</span> <span id="stat-update">${stats?.update || 0} to change</span>
        </div>
        <div class="stat-pill delete" title="Resources to destroy">
          <span>-</span> <span id="stat-delete">${stats?.delete || 0} to destroy</span>
        </div>
        <div class="nav-provider-badges" title="Cloud providers detected in this plan">${providerBadges}</div>
      </div>

      <div class="nav-actions">
        <select id="template-select" class="template-selector" title="Load a built-in example plan">
          ${templateOptions}
          ${customOption}
        </select>

        <button id="btn-import-plan" class="btn btn-secondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import Plan
        </button>

        <button id="btn-export-diagram" class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export SVG
        </button>
      </div>
    </header>
  `;

  const select = container.querySelector('#template-select');
  select.addEventListener('change', (e) => onTemplateChange(e.target.value));
  container.querySelector('#btn-import-plan').addEventListener('click', () => onImportClick());
  container.querySelector('#btn-export-diagram').addEventListener('click', () => onExportClick());
  container.querySelector('#btn-toggle-sidebar').addEventListener('click', () => onToggleSidebar());
}
