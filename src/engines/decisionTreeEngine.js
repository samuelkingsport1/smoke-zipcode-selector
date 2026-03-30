/**
 * Decision Tree Engine — Evaluates MSAs against a configurable decision tree.
 * Replaces hardcoded boolean gate logic with a tree that guarantees
 * every MSA reaches exactly one leaf (archetype).
 */
import * as turf from '@turf/turf';

/**
 * Available fields for decision tree nodes.
 */
export const TREE_FIELDS = [
  { key: 'federationCount',     label: 'Federation Count (in range)', type: 'integer', description: 'Number of federation locations whose radius covers this MSA' },
  { key: 'nearestFederationMi', label: 'Nearest Federation (mi)',     type: 'decimal', description: 'Distance in miles to the closest federation partner' },
  { key: 'dcCount',             label: 'DC Count (in range)',         type: 'integer', description: 'Number of DCs whose coverage radius includes this MSA' },
  { key: 'nearestDcMi',         label: 'Nearest DC (mi)',             type: 'decimal', description: 'Distance in miles to the closest distribution center' },
  { key: 'projectedGdpGrowth',  label: 'GDP Growth (%)',              type: 'decimal', description: 'Projected GDP growth rate for the MSA' },
];

/**
 * Compute derived fields for a single MSA against infrastructure.
 * Returns an object with all 5 tree-evaluable fields.
 */
export function computeDerivedFields(msa, infrastructure, thresholds) {
  const { distributionCenters = [], federationLocations = [] } = infrastructure;
  const { defaultDcRadius = 240, defaultFedRadius = 100, defaultMsaRadius = 50 } = thresholds;
  const msaPoint = turf.point([msa.lon, msa.lat]);
  const msaRadius = msa.radius != null ? msa.radius : defaultMsaRadius;

  // Federation computations
  let federationCount = 0;
  let nearestFederationMi = Infinity;
  const matchedFederations = [];

  for (const fed of federationLocations) {
    const fedPoint = turf.point([fed.lon, fed.lat]);
    const dist = turf.distance(msaPoint, fedPoint, { units: 'miles' });
    const fedRadius = fed.radius != null ? fed.radius : defaultFedRadius;

    if (dist < nearestFederationMi) {
      nearestFederationMi = dist;
    }
    // Coverage = circles overlap (distance < sum of radii)
    if (dist <= fedRadius + msaRadius) {
      federationCount++;
      matchedFederations.push({ ...fed, distanceToMSA: Math.round(dist * 10) / 10 });
    }
  }

  // DC computations
  let dcCount = 0;
  let nearestDcMi = Infinity;
  let nearestDc = null;

  for (const dc of distributionCenters) {
    const dcPoint = turf.point([dc.lon, dc.lat]);
    const dist = turf.distance(msaPoint, dcPoint, { units: 'miles' });
    const dcRadius = dc.radius != null ? dc.radius : defaultDcRadius;

    if (dist < nearestDcMi) {
      nearestDcMi = dist;
      nearestDc = dc;
    }
    // Coverage = circles overlap (distance < sum of radii)
    if (dist <= dcRadius + msaRadius) {
      dcCount++;
    }
  }

  return {
    federationCount,
    nearestFederationMi: nearestFederationMi === Infinity ? null : Math.round(nearestFederationMi * 10) / 10,
    dcCount,
    nearestDcMi: nearestDcMi === Infinity ? null : Math.round(nearestDcMi * 10) / 10,
    projectedGdpGrowth: msa.projectedGdpGrowth,
    msaRadius,
    // Passthrough for display
    _nearestDc: nearestDc ? { distance: Math.round(nearestDcMi * 10) / 10, dc: nearestDc } : null,
    _matchedFederations: matchedFederations,
  };
}

/**
 * Check if a value satisfies a branch condition.
 */
function branchMatches(value, branch) {
  const { operator, value: threshold } = branch;
  switch (operator) {
    case 'gte': return value >= threshold;
    case 'gt':  return value > threshold;
    case 'lte': return value <= threshold;
    case 'lt':  return value < threshold;
    case 'eq':  return value === threshold;
    case 'between': return value >= threshold[0] && value <= threshold[1];
    default: return false;
  }
}

/**
 * Walk the tree for a single MSA, returning the leaf archetype and the path taken.
 */
export function evaluateTree(derivedFields, tree) {
  const path = [];

  let node = tree;
  while (node) {
    if (node.type === 'leaf') {
      return {
        archetype: node.archetype,
        color: node.color || '#6c757d',
        path,
      };
    }

    if (node.type !== 'decision' || !node.branches?.length) {
      // Invalid node — treat as uncategorized
      return { archetype: 'Uncategorized', color: '#6c757d', path };
    }

    const fieldValue = derivedFields[node.field];
    let matched = false;

    // Evaluate branches top-to-bottom
    for (let i = 0; i < node.branches.length; i++) {
      const branch = node.branches[i];
      const isLast = i === node.branches.length - 1;

      if (isLast || branchMatches(fieldValue, branch)) {
        const fieldLabel = TREE_FIELDS.find(f => f.key === node.field)?.label || node.field;
        path.push({
          field: fieldLabel,
          condition: branch.label,
          value: fieldValue,
        });
        node = branch.child;
        matched = true;
        break;
      }
    }

    if (!matched) {
      return { archetype: 'Uncategorized', color: '#6c757d', path };
    }
  }

  return { archetype: 'Uncategorized', color: '#6c757d', path };
}

/**
 * Categorize all MSAs using the decision tree.
 */
export function categorizeAllWithTree(msaRecords, infrastructure, thresholds, tree) {
  return msaRecords.map(msa => {
    const derived = computeDerivedFields(msa, infrastructure, thresholds);
    const result = evaluateTree(derived, tree);

    return {
      ...msa,
      archetype: result.archetype,
      archetypeColor: result.color,
      treePath: result.path,
      federationCount: derived.federationCount,
      nearestFederationMi: derived.nearestFederationMi,
      dcCount: derived.dcCount,
      nearestDcMi: derived.nearestDcMi,
      nearestDC: derived._nearestDc,
      matchedFederations: derived._matchedFederations,
    };
  });
}

/**
 * Validate a tree — ensure every path terminates at a leaf.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateTree(node, pathDesc = 'Root') {
  const errors = [];

  if (!node) {
    errors.push(`${pathDesc}: Node is null/undefined`);
    return { valid: false, errors };
  }

  if (node.type === 'leaf') {
    if (!node.archetype || node.archetype.trim() === '') {
      errors.push(`${pathDesc}: Leaf has no archetype label`);
    }
    return { valid: errors.length === 0, errors };
  }

  if (node.type === 'decision') {
    if (!node.field) {
      errors.push(`${pathDesc}: Decision node has no field`);
    }
    if (!node.branches || node.branches.length === 0) {
      errors.push(`${pathDesc}: Decision node has no branches`);
    } else {
      node.branches.forEach((branch, i) => {
        const branchPath = `${pathDesc} → ${node.field} ${branch.label || `[${i}]`}`;
        if (!branch.child) {
          errors.push(`${branchPath}: Branch has no child node`);
        } else {
          const childResult = validateTree(branch.child, branchPath);
          errors.push(...childResult.errors);
        }
      });
    }
    return { valid: errors.length === 0, errors };
  }

  errors.push(`${pathDesc}: Unknown node type "${node.type}"`);
  return { valid: false, errors };
}

/**
 * Collect all unique archetype names and colors from a tree.
 */
export function collectArchetypes(node) {
  const archetypes = {};
  function walk(n) {
    if (!n) return;
    if (n.type === 'leaf') {
      archetypes[n.archetype] = { label: n.archetype, color: n.color || '#6c757d' };
    } else if (n.type === 'decision' && n.branches) {
      n.branches.forEach(b => walk(b.child));
    }
  }
  walk(node);
  return archetypes;
}
