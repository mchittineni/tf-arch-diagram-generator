import {
  getIconForType,
  getProviderForType,
  getProvider,
  readFirstAttr
} from '../providers/index.js';

/**
 * Parses Terraform Plan JSON (`terraform show -json tfplan`) or planned-state
 * JSON into a provider-agnostic graph of nodes, containers and edges.
 *
 * Resources from AWS, Google Cloud and Azure can appear in the same plan; each
 * resource is resolved through its own provider definition, so multi-cloud
 * plans render as multiple network hierarchies in one diagram.
 */
export function parseTerraformPlan(planData) {
  let json = planData;
  if (typeof planData === 'string') {
    try {
      json = JSON.parse(planData);
    } catch (e) {
      throw new Error(`Invalid JSON format: ${e.message}`);
    }
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Plan JSON must be an object produced by `terraform show -json`.');
  }

  const stats = { create: 0, update: 0, delete: 0, noop: 0, total: 0 };
  const allNodes = [];

  const resourceChanges = Array.isArray(json.resource_changes) ? json.resource_changes : [];

  for (const rc of resourceChanges) {
    const actions = rc.change?.actions || ['no-op'];
    let action = 'noop';
    if (actions.includes('create')) action = 'create';
    else if (actions.includes('delete')) action = 'delete';
    else if (actions.includes('update')) action = 'update';

    allNodes.push(buildNode({
      address: rc.address,
      name: rc.name,
      type: rc.type,
      providerNameRaw: rc.provider_name,
      action,
      before: rc.change?.before || {},
      after: rc.change?.after || {},
      module: rc.module_address || null
    }));
    stats[action] += 1;
    stats.total += 1;
  }

  // Fall back to planned/prior state when the plan carries no resource_changes.
  if (allNodes.length === 0) {
    for (const r of collectStateResources(json)) {
      allNodes.push(buildNode({
        address: r.address,
        name: r.name,
        type: r.type,
        providerNameRaw: r.provider_name,
        action: 'create',
        before: {},
        after: r.values || {},
        module: r.module_address || null
      }));
      stats.create += 1;
      stats.total += 1;
    }
  }

  const networkNodes = [];
  const subnetNodes = [];
  const otherNodes = [];

  allNodes.forEach(node => {
    const { hierarchy } = node.provider;
    if (hierarchy.networkTypes.includes(node.type)) networkNodes.push(node);
    else if (hierarchy.subnetTypes.includes(node.type)) subnetNodes.push(node);
    else otherNodes.push(node);
  });

  resolveSubnetParents(subnetNodes, networkNodes);
  resolveResourceParents(otherNodes, subnetNodes, networkNodes);

  const nodes = [...networkNodes, ...subnetNodes, ...otherNodes];
  const edges = inferEdges(nodes);

  const providerIds = Array.from(new Set(nodes.map(n => n.providerId)));

  return {
    nodes,
    networkNodes,
    subnetNodes,
    edges,
    stats,
    providerIds,
    providers: providerIds.map(id => {
      const p = getProvider(id);
      return { id: p.id, name: p.name, shortName: p.shortName, accentColor: p.accentColor };
    }),
    raw: json
  };
}

/** Walks `planned_values` / `prior_state` root and child modules for resources. */
function collectStateResources(json) {
  const roots = [
    json.planned_values?.root_module,
    json.prior_state?.values?.root_module,
    json.values?.root_module
  ].filter(Boolean);

  const out = [];
  const walk = (module) => {
    (module.resources || []).forEach(r => out.push(r));
    (module.child_modules || []).forEach(walk);
  };
  roots.forEach(walk);
  return out;
}

function buildNode({ address, name, type, providerNameRaw, action, before, after, module }) {
  const provider = getProviderForType(type);
  const { hierarchy } = provider;
  const values = [after, before];

  return {
    id: address,
    address,
    name: name || address,
    type,
    providerId: provider.id,
    provider,
    providerName: providerNameRaw || provider.id,
    module,
    action,
    icon: getIconForType(type),
    before: before || {},
    after: after || {},
    parentNetworkId: null,
    parentSubnetId: null,
    zone: stringifyRef(readFirstAttr(values, hierarchy.zoneKeys)),
    region: stringifyRef(readFirstAttr(values, hierarchy.regionKeys)),
    cidr: stringifyRef(readFirstAttr(values, hierarchy.cidrKeys)),
    group: stringifyRef(readFirstAttr(values, hierarchy.groupKeys)),
    tags: readFirstAttr(values, hierarchy.tagKeys) || {},
    dependencies: []
  };
}

function stringifyRef(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
}

/**
 * Matches a reference value (which in a plan is often an unresolved address,
 * a self-link, or an Azure resource id) against a candidate container node.
 */
function referenceMatches(ref, candidate) {
  if (!ref) return false;
  const value = String(ref);
  const haystack = value.toLowerCase();
  const candidates = [candidate.id, candidate.name, candidate.after?.name, candidate.before?.name]
    .filter(Boolean)
    .map(String);

  return candidates.some(c => {
    const needle = c.toLowerCase();
    // Terraform ids and self-links are path-like; compare the last segment too.
    const lastSegment = haystack.split('/').pop();
    return haystack.includes(needle) || needle.includes(haystack) || lastSegment === needle;
  });
}

function resolveSubnetParents(subnetNodes, networkNodes) {
  subnetNodes.forEach(subnet => {
    const sameProviderNetworks = networkNodes.filter(n => n.providerId === subnet.providerId);
    const ref = readFirstAttr([subnet.after, subnet.before], subnet.provider.hierarchy.networkRefKeys);

    if (ref) {
      const match = sameProviderNetworks.find(n => referenceMatches(ref, n));
      if (match) subnet.parentNetworkId = match.id;
    }
    if (!subnet.parentNetworkId && sameProviderNetworks.length > 0) {
      subnet.parentNetworkId = sameProviderNetworks[0].id;
    }
  });
}

function resolveResourceParents(otherNodes, subnetNodes, networkNodes) {
  otherNodes.forEach(node => {
    const { hierarchy } = node.provider;
    const values = [node.after, node.before];
    const sameProviderSubnets = subnetNodes.filter(n => n.providerId === node.providerId);
    const sameProviderNetworks = networkNodes.filter(n => n.providerId === node.providerId);

    const subnetRef = readFirstAttr(values, hierarchy.subnetRefKeys);
    if (subnetRef) {
      const match = sameProviderSubnets.find(s => referenceMatches(subnetRef, s));
      if (match) {
        node.parentSubnetId = match.id;
        node.parentNetworkId = match.parentNetworkId;
      }
    }

    if (!node.parentNetworkId) {
      const networkRef = readFirstAttr(values, hierarchy.networkRefKeys);
      if (networkRef) {
        const match = sameProviderNetworks.find(n => referenceMatches(networkRef, n));
        if (match) node.parentNetworkId = match.id;
      }
    }
  });
}

/**
 * Builds architecture edges by delegating to each provider present in the plan.
 * Providers only see their own resources, so a multi-cloud plan gets one
 * coherent flow per cloud instead of cross-wired guesses.
 */
function inferEdges(nodes) {
  const edges = [];
  const edgeSet = new Set();

  const addEdge = (sourceId, targetId, label = '', type = 'solid') => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const key = `${sourceId}->${targetId}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ id: `edge-${edges.length + 1}`, source: sourceId, target: targetId, label, type });
  };

  const byProvider = new Map();
  nodes.forEach(n => {
    if (!byProvider.has(n.providerId)) byProvider.set(n.providerId, []);
    byProvider.get(n.providerId).push(n);
  });

  byProvider.forEach((providerNodes, providerId) => {
    getProvider(providerId).inferEdges(providerNodes, addEdge);
  });

  return edges;
}
