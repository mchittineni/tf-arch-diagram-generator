import { getMergedCategories } from '../providers/index.js';
import { escapeXml } from '../canvas/svgRenderer.js';

/**
 * Sidebar: search, cloud-provider filter, service-category filter,
 * planned-action filter and the flat resource outline.
 */
export function renderSidebar(container, {
  nodes,
  providers = [],
  onSearch,
  onProviderFilter,
  onCategoryFilter,
  onActionFilter,
  onResourceClick
}) {
  const providerIds = providers.map(p => p.id);
  const categories = getMergedCategories(providerIds.length ? providerIds : undefined);

  const categoryCounts = {};
  nodes.forEach(n => {
    categoryCounts[n.icon.categoryKey] = (categoryCounts[n.icon.categoryKey] || 0) + 1;
  });

  const categoriesHtml = Object.entries(categories)
    .filter(([key]) => categoryCounts[key])
    .map(([key, cat]) => `
      <div class="category-filter-item" data-category="${escapeXml(key)}">
        <div style="display:flex; align-items:center;">
          <span class="category-dot" style="background:${escapeXml(cat.color)};"></span>
          <span>${escapeXml(cat.name)}</span>
        </div>
        <span style="font-size:11px; opacity:0.6;">${categoryCounts[key]}</span>
      </div>
    `).join('');

  const providerCounts = {};
  nodes.forEach(n => {
    providerCounts[n.providerId] = (providerCounts[n.providerId] || 0) + 1;
  });

  const providerChipsHtml = providers.length > 1 ? `
    <div class="sidebar-section">
      <h4>Cloud Providers</h4>
      <div class="provider-chip-row" id="provider-chip-row">
        <button class="provider-chip active" data-provider="all">All clouds <span style="opacity:0.6;">${nodes.length}</span></button>
        ${providers.map(p => `
          <button class="provider-chip" data-provider="${escapeXml(p.id)}" style="color:${escapeXml(p.accentColor)};">
            <span class="provider-dot" style="background:${escapeXml(p.accentColor)};"></span>
            ${escapeXml(p.shortName)} <span style="opacity:0.6;">${providerCounts[p.id] || 0}</span>
          </button>
        `).join('')}
      </div>
    </div>
  ` : '';

  const resourceTreeHtml = nodes.map(n => {
    const actionBadge = n.action === 'create' ? '+ add'
      : n.action === 'update' ? '~ mod'
      : n.action === 'delete' ? '- del'
      : '· none';
    return `
      <div class="resource-tree-item" data-id="${escapeXml(n.id)}">
        <div class="resource-tree-name">
          <span style="width:8px; height:8px; border-radius:50%; background:${escapeXml(n.icon.categoryColor)}; flex-shrink:0;"></span>
          <span title="${escapeXml(n.address)}">${escapeXml(n.name)}</span>
        </div>
        <span class="stat-pill ${escapeXml(n.action)}" style="font-size:10px; padding:2px 6px;">${actionBadge}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="sidebar-header">
      <h3>Infrastructure Navigator</h3>
      <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${nodes.length} Resources</span>
    </div>

    <div class="search-input-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="sidebar-search-input" placeholder="Search resources, types, addresses…" />
    </div>

    <div class="sidebar-content">
      ${providerChipsHtml}

      <div class="sidebar-section">
        <h4>Service Categories</h4>
        <div class="category-filter-list" id="category-filter-list">
          <div class="category-filter-item active" data-category="all">
            <div style="display:flex; align-items:center;">
              <span class="category-dot" style="background:var(--brand-light);"></span>
              <span>All Services</span>
            </div>
            <span style="font-size:11px; opacity:0.6;">${nodes.length}</span>
          </div>
          ${categoriesHtml}
        </div>
      </div>

      <div class="sidebar-section">
        <h4>Filter by Action</h4>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-secondary action-filter-btn active" data-action="all" style="padding:4px 8px; font-size:11px;">All</button>
          <button class="btn btn-secondary action-filter-btn" data-action="create" style="padding:4px 8px; font-size:11px; color:#10b981;">+ Create</button>
          <button class="btn btn-secondary action-filter-btn" data-action="update" style="padding:4px 8px; font-size:11px; color:#f59e0b;">~ Update</button>
          <button class="btn btn-secondary action-filter-btn" data-action="delete" style="padding:4px 8px; font-size:11px; color:#ef4444;">- Destroy</button>
        </div>
      </div>

      <div class="sidebar-section">
        <h4>Planned Resources</h4>
        <div class="resource-tree-list" id="resource-tree-container">
          ${resourceTreeHtml}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#sidebar-search-input')
    .addEventListener('input', (e) => onSearch(e.target.value));

  bindExclusiveGroup(container, '.provider-chip', 'data-provider', onProviderFilter);
  bindExclusiveGroup(container, '.category-filter-item', 'data-category', onCategoryFilter);
  bindExclusiveGroup(container, '.action-filter-btn', 'data-action', onActionFilter);

  const treeItems = container.querySelectorAll('.resource-tree-item');
  treeItems.forEach(item => {
    item.addEventListener('click', () => {
      treeItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      onResourceClick(item.getAttribute('data-id'));
    });
  });
}

function bindExclusiveGroup(container, selector, attribute, onSelect) {
  const items = container.querySelectorAll(selector);
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      if (onSelect) onSelect(item.getAttribute(attribute));
    });
  });
}
