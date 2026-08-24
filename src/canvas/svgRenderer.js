/**
 * Pure SVG string builders shared by the interactive canvas and the headless
 * CLI renderer. Nothing here touches the DOM, so the same markup can be
 * produced in a browser or in Node.
 */

export const ACTION_COLORS = {
  create: '#10b981',
  update: '#f59e0b',
  delete: '#ef4444',
  noop: '#64748b'
};

const ACTION_SYMBOLS = { create: '+', update: '~', delete: '-', noop: '•' };

/** Rendered size of a service icon inside a node card, in user units. */
export const ICON_SIZE = 34;

const FONT_SANS = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Escapes text for safe inclusion in SVG/XML content and attributes. */
export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Embeds a provider icon into the diagram's SVG at an explicit size.
 *
 * The icon sets are standalone `<svg viewBox="0 0 64 64">` documents with no
 * width/height. Nested inside another SVG that means "100% of the current
 * viewport" — i.e. the entire canvas — so each icon must be given its own
 * viewport size here or it scales up to fill the diagram.
 */
export function embedIcon(svg, size = ICON_SIZE) {
  return String(svg).replace(/<svg\b([^>]*)>/, (_match, attrs) => {
    const cleaned = attrs.replace(/\s(?:width|height)="[^"]*"/g, '');
    return `<svg${cleaned} width="${size}" height="${size}">`;
  });
}

export function truncate(str, maxLen) {
  if (!str) return '';
  const s = String(str);
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

export const SVG_DEFS = `
  <defs>
    <filter id="node-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#38bdf8" flood-opacity="0.6"/>
    </filter>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
    </marker>
  </defs>
`;

export function renderContainers(containers = []) {
  return containers.map(c => {
    if (c.type === 'cloud') return renderCloudBand(c);
    if (c.type === 'network') return renderNetwork(c);
    if (c.type === 'zone') return renderZone(c);
    if (c.type === 'subnet') return renderSubnet(c);
    return '';
  }).join('');
}

function renderCloudBand(c) {
  const accent = c.accentColor || '#64748b';
  return `
    <g class="container-cloud" data-id="${escapeXml(c.id)}">
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="14"
        fill="${hexToRgba(accent, 0.03)}" stroke="${hexToRgba(accent, 0.45)}" stroke-width="1.5" />
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="30" rx="14" fill="${hexToRgba(accent, 0.16)}" />
      <text x="${c.x + 18}" y="${c.y + 20}" fill="${accent}" font-size="13" font-weight="800" font-family="${FONT_SANS}">
        ${escapeXml(c.title)}<tspan fill="#94a3b8" font-weight="400" font-size="11"> · ${escapeXml(c.subtitle || '')}</tspan>
      </text>
    </g>
  `;
}

function renderNetwork(c) {
  const accent = c.accentColor || '#8c4fff';
  const actionColor = ACTION_COLORS[c.action] || accent;
  return `
    <g class="container-network" data-id="${escapeXml(c.id)}">
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="12"
        fill="${hexToRgba(accent, 0.04)}" stroke="${actionColor}" stroke-width="2" stroke-dasharray="6 3" />
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="32" rx="12" fill="${hexToRgba(accent, 0.15)}" />
      <text x="${c.x + 16}" y="${c.y + 20}" fill="#e2e8f0" font-size="12" font-weight="700" font-family="${FONT_SANS}">
        ${escapeXml(c.title)}${c.subtitle ? `<tspan fill="#94a3b8" font-weight="400"> (${escapeXml(c.subtitle)})</tspan>` : ''}
      </text>
    </g>
  `;
}

function renderZone(c) {
  return `
    <g class="container-zone" data-id="${escapeXml(c.id)}">
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="8"
        fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="4 2" />
      <text x="${c.x + 12}" y="${c.y + 18}" fill="#94a3b8" font-size="10" font-weight="600" font-family="${FONT_SANS}">
        ${escapeXml(c.title)}
      </text>
    </g>
  `;
}

function renderSubnet(c) {
  const isPublic = c.tier === 'public';
  const stroke = isPublic ? 'rgba(56, 189, 248, 0.4)' : 'rgba(148, 163, 184, 0.3)';
  const fill = isPublic ? 'rgba(56, 189, 248, 0.04)' : 'rgba(255, 255, 255, 0.02)';
  return `
    <g class="container-subnet" data-id="${escapeXml(c.id)}">
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" rx="6"
        fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
      <text x="${c.x + 10}" y="${c.y + 16}" fill="${isPublic ? '#38bdf8' : '#94a3b8'}" font-size="10" font-weight="600" font-family="${FONT_SANS}">
        ${isPublic ? 'public' : 'private'} · ${escapeXml(truncate(c.title, 30))}
      </text>
      ${c.subtitle ? `<text x="${c.x + 10}" y="${c.y + 30}" fill="#64748b" font-size="9" font-family="${FONT_MONO}">${escapeXml(c.subtitle)}</text>` : ''}
    </g>
  `;
}

export function renderEdges(edges = []) {
  return edges.map(edge => {
    const { srcPos, tgtPos, label } = edge;
    const dx = tgtPos.x - srcPos.x;
    const dy = tgtPos.y - srcPos.y;
    const path = `M ${srcPos.x} ${srcPos.y} C ${srcPos.x + dx * 0.25} ${srcPos.y + dy * 0.1}, ${srcPos.x + dx * 0.75} ${tgtPos.y - dy * 0.1}, ${tgtPos.x} ${tgtPos.y}`;
    const midX = (srcPos.x + tgtPos.x) / 2;
    const midY = (srcPos.y + tgtPos.y) / 2;
    const labelWidth = Math.max(46, String(label || '').length * 5.6 + 12);

    return `
      <g class="diagram-edge" data-source="${escapeXml(edge.source)}" data-target="${escapeXml(edge.target)}">
        <path d="${path}" fill="none" stroke="rgba(148, 163, 184, 0.35)" stroke-width="1.8" marker-end="url(#arrowhead)"/>
        ${label ? `
          <rect x="${midX - labelWidth / 2}" y="${midY - 9}" width="${labelWidth}" height="18" rx="4" fill="rgba(15, 23, 42, 0.88)" stroke="rgba(255,255,255,0.1)"/>
          <text x="${midX}" y="${midY + 3}" text-anchor="middle" fill="#cbd5e1" font-size="9" font-family="${FONT_MONO}">${escapeXml(label)}</text>
        ` : ''}
      </g>
    `;
  }).join('');
}

/**
 * Renders resource nodes. `state` optionally carries interactive-canvas state
 * (selection + filters); the CLI renderer passes nothing.
 */
export function renderNodes(nodes = [], state = {}) {
  const { selectedNodeId = null, filterCategory = 'all', filterAction = 'all', filterProvider = 'all', searchTerm = '' } = state;
  const needle = searchTerm.trim().toLowerCase();

  return nodes.map(node => {
    if (node.renderedAsContainer) return '';
    if (node.x === undefined || node.y === undefined) return '';

    const matchesCategory = filterCategory === 'all' || node.icon.categoryKey === filterCategory;
    const matchesAction = filterAction === 'all' || node.action === filterAction;
    const matchesProvider = filterProvider === 'all' || node.providerId === filterProvider;
    const matchesSearch = !needle ||
      node.name.toLowerCase().includes(needle) ||
      node.type.toLowerCase().includes(needle) ||
      node.address.toLowerCase().includes(needle);

    const isDimmed = !(matchesCategory && matchesAction && matchesProvider && matchesSearch);
    const isSelected = selectedNodeId === node.id;
    const actionColor = ACTION_COLORS[node.action] || ACTION_COLORS.noop;
    const actionSymbol = ACTION_SYMBOLS[node.action] || '•';

    return `
      <g class="diagram-node${isSelected ? ' selected' : ''}"
         data-id="${escapeXml(node.id)}"
         transform="translate(${node.x}, ${node.y})"
         opacity="${isDimmed ? '0.2' : '1'}"
         style="cursor: pointer;">
        <rect width="${node.width}" height="${node.height}" rx="10"
              fill="#111827"
              stroke="${isSelected ? '#38bdf8' : hexToRgba(actionColor, 0.5)}"
              stroke-width="${isSelected ? 2.5 : 1.5}"
              filter="${isSelected ? 'url(#node-glow)' : 'url(#node-shadow)'}"/>
        <circle cx="${node.width - 14}" cy="14" r="7" fill="${actionColor}" />
        <text x="${node.width - 14}" y="17.5" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">${actionSymbol}</text>
        <g transform="translate(12, ${(node.height - ICON_SIZE) / 2})">${embedIcon(node.icon.svg)}</g>
        <g transform="translate(56, 26)">
          <text fill="#f8fafc" font-size="12" font-weight="700" font-family="${FONT_SANS}">${escapeXml(truncate(node.name, 14))}</text>
          <text y="16" fill="#94a3b8" font-size="9.5" font-family="${FONT_MONO}">${escapeXml(truncate(stripProviderPrefix(node.type), 16))}</text>
          <text y="30" fill="${node.icon.categoryColor}" font-size="8.5" font-weight="600" font-family="${FONT_SANS}">${escapeXml(truncate(node.icon.name, 18))}</text>
        </g>
      </g>
    `;
  }).join('');
}

function stripProviderPrefix(type) {
  return String(type).replace(/^(aws_|google_|azurerm_|azuread_)/, '');
}

/**
 * Builds a complete, standalone SVG document for a computed layout — used by
 * `tf-arch render` and by the in-app export.
 */
export function renderStandaloneSvg(layout, { title = 'Terraform Architecture', background = '#0b1120', legend = true } = {}) {
  const { bounds, containers, edges, nodes } = layout;
  const padding = 40;
  const width = bounds.width;
  const height = bounds.height + (legend ? 70 : 0);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  ${SVG_DEFS}
  <rect width="${width}" height="${height}" fill="${background}"/>
  <text x="${padding}" y="36" fill="#f8fafc" font-size="18" font-weight="800" font-family="${FONT_SANS}">${escapeXml(title)}</text>
  <g transform="translate(0, 26)">
    <g class="containers-layer">${renderContainers(containers)}</g>
    <g class="edges-layer">${renderEdges(edges)}</g>
    <g class="nodes-layer">${renderNodes(nodes)}</g>
  </g>
  ${legend ? renderLegend(padding, height - 34) : ''}
</svg>`;
}

function renderLegend(x, y) {
  const items = [
    ['create', 'Create (+)'],
    ['update', 'Modify (~)'],
    ['delete', 'Destroy (-)'],
    ['noop', 'Unchanged']
  ];
  const parts = items.map(([action, label], i) => {
    const itemX = x + i * 130;
    return `
      <circle cx="${itemX + 6}" cy="${y}" r="5" fill="${ACTION_COLORS[action]}"/>
      <text x="${itemX + 18}" y="${y + 4}" fill="#94a3b8" font-size="11" font-family="${FONT_SANS}">${label}</text>
    `;
  }).join('');
  return `<g class="legend">${parts}</g>`;
}

function hexToRgba(hex, alpha) {
  const normalized = String(hex).replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
