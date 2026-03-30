/**
 * Rule Validator — Gap detection, overlap detection, and catch-all validation.
 * Pure logic for the director-level rule configuration UI.
 */

/**
 * A rule shape:
 * {
 *   id: string,
 *   field: string,        // e.g. 'competitorHubs'
 *   operator: string,     // 'lt', 'lte', 'gt', 'gte', 'eq', 'between'
 *   value: number,        // primary value
 *   value2: number|null,  // second value for 'between'
 *   archetype: string,    // resulting archetype DeveloperName
 *   dataType: 'integer'|'decimal',
 * }
 */

/**
 * Convert a rule into a [min, max] range on the number line.
 * Returns { min, max, inclusive } (inclusive on both ends for simplicity).
 */
function ruleToRange(rule) {
  const LARGE = 1e12;
  switch (rule.operator) {
    case 'lt':
      return { min: -LARGE, max: rule.value - (rule.dataType === 'integer' ? 1 : 0.0001) };
    case 'lte':
      return { min: -LARGE, max: rule.value };
    case 'gt':
      return { min: rule.value + (rule.dataType === 'integer' ? 1 : 0.0001), max: LARGE };
    case 'gte':
      return { min: rule.value, max: LARGE };
    case 'eq':
      return { min: rule.value, max: rule.value };
    case 'between':
      return { min: rule.value, max: rule.value2 };
    default:
      return { min: -LARGE, max: LARGE };
  }
}

/**
 * Detect overlapping rules for the same field.
 * Returns array of { rule1, rule2, overlapRange, message }.
 */
export function detectOverlaps(rules) {
  const overlaps = [];
  
  // Group rules by field
  const byField = {};
  rules.forEach(r => {
    if (!byField[r.field]) byField[r.field] = [];
    byField[r.field].push(r);
  });

  Object.entries(byField).forEach(([field, fieldRules]) => {
    for (let i = 0; i < fieldRules.length; i++) {
      for (let j = i + 1; j < fieldRules.length; j++) {
        const r1 = ruleToRange(fieldRules[i]);
        const r2 = ruleToRange(fieldRules[j]);
        
        // Check overlap: ranges overlap if r1.min <= r2.max AND r2.min <= r1.max
        if (r1.min <= r2.max && r2.min <= r1.max) {
          const overlapMin = Math.max(r1.min, r2.min);
          const overlapMax = Math.min(r1.max, r2.max);
          overlaps.push({
            rule1: fieldRules[i],
            rule2: fieldRules[j],
            overlapRange: { min: overlapMin, max: overlapMax },
            message: `Overlap on "${field}": Rules "${fieldRules[i].archetype}" and "${fieldRules[j].archetype}" both cover range [${overlapMin}, ${overlapMax}].`,
          });
        }
      }
    }
  });

  return overlaps;
}

/**
 * Detect gaps in coverage for a given field within a specified range.
 * fieldRange = { min, max } — the expected full numeric spectrum.
 * Returns array of { gapMin, gapMax, message }.
 */
export function detectGaps(rules, field, fieldRange) {
  const fieldRules = rules.filter(r => r.field === field);
  if (fieldRules.length === 0) {
    return [{
      gapMin: fieldRange.min,
      gapMax: fieldRange.max,
      message: `No rules defined for "${field}". Entire range [${fieldRange.min}, ${fieldRange.max}] is uncovered.`,
    }];
  }

  // Convert all rules to ranges and sort by min
  const ranges = fieldRules.map(r => ruleToRange(r)).sort((a, b) => a.min - b.min);
  const gaps = [];
  let cursor = fieldRange.min;

  for (const range of ranges) {
    if (range.min > cursor) {
      gaps.push({
        gapMin: cursor,
        gapMax: range.min,
        message: `Gap on "${field}": No rule covers range [${cursor}, ${range.min}).`,
      });
    }
    cursor = Math.max(cursor, range.max);
  }

  // Check if the last range covers up to field max
  if (cursor < fieldRange.max) {
    gaps.push({
      gapMin: cursor,
      gapMax: fieldRange.max,
      message: `Gap on "${field}": No rule covers range (${cursor}, ${fieldRange.max}].`,
    });
  }

  return gaps;
}

/**
 * Full validation of a rule set.
 * Returns { valid: boolean, errors: string[], overlaps: [], gaps: [] }
 */
export function validateRuleSet(rules, fieldRanges = {}) {
  const errors = [];
  
  // Check for overlaps
  const overlaps = detectOverlaps(rules);
  overlaps.forEach(o => errors.push(o.message));

  // Check for gaps in each field that has a defined range
  const allGaps = [];
  Object.entries(fieldRanges).forEach(([field, range]) => {
    const gaps = detectGaps(rules, field, range);
    gaps.forEach(g => {
      errors.push(g.message);
      allGaps.push(g);
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    overlaps,
    gaps: allGaps,
  };
}
