import { getProvider } from '../providers/index.js';
import { escapeXml } from '../canvas/svgRenderer.js';

/**
 * Resource Inspector Drawer.
 * Shows the selected resource's plan action, placement in its cloud's
 * network hierarchy, tags/labels and the attribute-level planned diff.
 * All labels come from the owning provider, so a GCP resource reads
 * "VPC Network / Subnetwork / Zone" and an Azure one "Virtual Network /
 * Subnet / Location".
 */

export class ResourceInspector {
  constructor(containerElement, onClose, onNodeNavigate) {
    this.container = containerElement;
    this.onClose = onClose;
    this.onNodeNavigate = onNodeNavigate;
    this.currentNode = null;
    this.edges = [];
    this.allNodes = [];
  }

  show(node, edges = [], allNodes = []) {
    this.currentNode = node;
    this.edges = edges || [];
    this.allNodes = allNodes || [];
    this.container.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.currentNode = null;
    this.container.classList.add('hidden');
  }

  render() {
    if (!this.currentNode) return;
    const n = this.currentNode;

    const provider = getProvider(n.providerId);
    const terms = provider.terms;

    const actionLabels = {
      create: 'Create (+)',
      update: 'Update (~)',
      delete: 'Destroy (-)',
      noop: 'No change'
    };
    const actionLabel = actionLabels[n.action] || actionLabels.noop;
    const actionBadgeClass = n.action;

    const beforeAttrs = n.before || {};
    const afterAttrs = n.after || {};
    const allKeys = Array.from(new Set([...Object.keys(beforeAttrs), ...Object.keys(afterAttrs)]));

    let diffRows = '';
    allKeys.forEach(k => {
      if (k === 'tags' || k === 'tags_all') return;
      const bVal = beforeAttrs[k];
      const aVal = afterAttrs[k];

      if (bVal !== undefined && aVal !== undefined && JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        diffRows += `
          <tr class="diff-changed">
            <td class="attr-name">${escapeXml(k)}</td>
            <td class="attr-val">
              <span class="diff-removed">${this.formatValue(bVal)}</span> ➔ 
              <span class="diff-added">${this.formatValue(aVal)}</span>
            </td>
          </tr>
        `;
      } else if (aVal !== undefined && bVal === undefined) {
        diffRows += `
          <tr class="diff-added">
            <td class="attr-name">${escapeXml(k)}</td>
            <td class="attr-val">${this.formatValue(aVal)}</td>
          </tr>
        `;
      } else if (bVal !== undefined && aVal === undefined) {
        diffRows += `
          <tr class="diff-removed">
            <td class="attr-name">${escapeXml(k)}</td>
            <td class="attr-val">${this.formatValue(bVal)}</td>
          </tr>
        `;
      } else if (aVal !== undefined) {
        diffRows += `
          <tr>
            <td class="attr-name">${escapeXml(k)}</td>
            <td class="attr-val">${this.formatValue(aVal)}</td>
          </tr>
        `;
      }
    });

    // Tags list
    const tags = n.tags && typeof n.tags === 'object' ? n.tags : {};
    let tagsHtml = '';
    if (Object.keys(tags).length > 0) {
      tagsHtml = Object.entries(tags).map(([k, v]) => `
        <div style="display:flex; justify-content:space-between; font-size:11px; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
          <span style="color:#94a3b8; font-family:var(--font-mono);">${escapeXml(k)}:</span>
          <span style="color:#f8fafc; font-weight:500;">${escapeXml(typeof v === 'object' ? JSON.stringify(v) : v)}</span>
        </div>
      `).join('');
    } else {
      tagsHtml = `<span style="font-size:11px; color:var(--text-muted); font-style:italic;">No ${terms.tags.toLowerCase()} defined</span>`;
    }

    // Architecture Links
    const nodeId = n.id;
    const incomingEdges = (this.edges || []).filter(e => e.target === nodeId);
    const outgoingEdges = (this.edges || []).filter(e => e.source === nodeId);
    const totalLinks = incomingEdges.length + outgoingEdges.length;

    const nodeMap = new Map((this.allNodes || []).map(nodeItem => [nodeItem.id, nodeItem]));
    const renderLinkRow = (edge, isIncoming) => {
      const peerId = isIncoming ? edge.source : edge.target;
      const peerNode = nodeMap.get(peerId);
      const peerName = peerNode?.name || peerId;
      const peerType = peerNode?.type || '';
      const peerIconSvg = peerNode?.icon?.svg || '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="8" fill="#94a3b8"/></svg>';
      const relation = edge.relation || 'dependency';
      const relationColor = relation === 'security' ? '#f59e0b' : relation === 'traffic' ? '#38bdf8' : relation === 'peering' ? '#10b981' : '#c084fc';

      return `
        <div class="connected-link-item" data-peer-id="${escapeXml(peerId)}" title="Navigate to ${escapeXml(peerName)}">
          <div class="connected-link-icon">${peerIconSvg}</div>
          <div class="connected-link-details">
            <div class="connected-link-name">
              <span class="connected-link-arrow" style="color:${isIncoming ? '#38bdf8' : '#c084fc'};">${isIncoming ? '←' : '→'}</span>
              <span>${escapeXml(peerName)}</span>
            </div>
            <div class="connected-link-sub">${escapeXml(peerType)}</div>
          </div>
          <span class="relation-badge" style="border-color:${relationColor}40; background:${relationColor}18; color:${relationColor};">
            ${escapeXml(edge.label || relation)}
          </span>
        </div>
      `;
    };

    let linksCardHtml = '';
    if (totalLinks > 0) {
      linksCardHtml = `
        <div class="inspector-card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div class="inspector-card-title" style="margin-bottom:0;">Connected Links</div>
            <span class="stat-pill noop" style="font-size:10px; padding:2px 7px;">${totalLinks}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${incomingEdges.length > 0 ? `
              <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-top:2px; letter-spacing:0.04em;">
                Inbound (${incomingEdges.length})
              </div>
              ${incomingEdges.map(e => renderLinkRow(e, true)).join('')}
            ` : ''}
            ${outgoingEdges.length > 0 ? `
              <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-top:4px; letter-spacing:0.04em;">
                Outbound (${outgoingEdges.length})
              </div>
              ${outgoingEdges.map(e => renderLinkRow(e, false)).join('')}
            ` : ''}
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-header-info">
          <div class="inspector-icon">
            <div style="width:28px; height:28px;">${n.icon.svg}</div>
          </div>
          <div>
            <h3 style="font-size:14px; font-weight:700; color:#fff;">${escapeXml(n.name)}</h3>
            <div style="font-size:11px; color:${n.icon.categoryColor}; font-weight:600;">
              ${escapeXml(n.icon.name)} <span style="color:var(--text-muted); font-weight:500;">· ${escapeXml(provider.shortName)}</span>
            </div>
          </div>
        </div>
        <button id="btn-close-inspector" class="control-btn" title="Close">✕</button>
      </div>

      <div class="inspector-content">
        <!-- Action & Address Card -->
        <div class="inspector-card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Plan Action</span>
            <span class="stat-pill ${actionBadgeClass}" style="font-size:11px;">${actionLabel}</span>
          </div>
          <div style="font-size:11px; font-family:var(--font-mono); color:#38bdf8; word-break:break-all;">
            ${escapeXml(n.address)}
          </div>
        </div>

        <!-- Scope & Placement Card -->
        <div class="inspector-card">
          <div class="inspector-card-title">Placement & Scope</div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
            ${this.row('Cloud', provider.name, '#fff')}
            ${this.row('Provider', n.providerName, '#fff')}
            ${n.module ? this.row('Module', n.module, '#c4b5fd') : ''}
            ${n.group ? this.row(terms.group, n.group, '#fbbf24') : ''}
            ${n.parentNetworkId ? this.row(terms.network, n.parentNetworkId, '#c084fc') : ''}
            ${n.parentSubnetId ? this.row(terms.subnet, n.parentSubnetId, '#38bdf8') : ''}
            ${n.zone ? this.row(terms.zone, n.zone, '#10b981') : ''}
            ${n.region ? this.row(terms.region, n.region, '#10b981') : ''}
            ${n.cidr ? this.row('CIDR', n.cidr, '#f8fafc') : ''}
          </div>
        </div>

        ${linksCardHtml}

        <!-- Resource Tags Card -->
        <div class="inspector-card">
          <div class="inspector-card-title">${escapeXml(terms.tags)}</div>
          <div>${tagsHtml}</div>
        </div>

        <!-- Planned Configuration Diff Card -->
        <div class="inspector-card">
          <div class="inspector-card-title">Planned Attributes</div>
          <div style="max-height:260px; overflow-y:auto;">
            <table class="diff-table">
              <tbody>
                ${diffRows || '<tr><td colspan="2" style="color:var(--text-muted); font-style:italic;">No explicit attributes</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-inspector').addEventListener('click', () => {
      this.hide();
      if (this.onClose) this.onClose();
    });

    this.container.querySelectorAll('.connected-link-item').forEach(item => {
      item.addEventListener('click', () => {
        const peerId = item.getAttribute('data-peer-id');
        if (peerId && this.onNodeNavigate) {
          this.onNodeNavigate(peerId);
        }
      });
    });
  }

  /** Renders one label/value line in the placement card. */
  row(label, value, color) {
    return `
      <div style="display:flex; justify-content:space-between; gap:12px;">
        <span style="color:var(--text-secondary); white-space:nowrap;">${escapeXml(label)}:</span>
        <span style="font-family:var(--font-mono); color:${color}; text-align:right; word-break:break-all;">${escapeXml(value)}</span>
      </div>
    `;
  }

  formatValue(val) {
    if (val === null || val === undefined) return '<span style="color:#64748b;">null</span>';
    if (typeof val === 'boolean') return `<span style="color:#f59e0b;">${val}</span>`;
    if (typeof val === 'number') return `<span style="color:#38bdf8;">${val}</span>`;
    if (typeof val === 'object') return escapeXml(JSON.stringify(val));
    return escapeXml(String(val));
  }
}
