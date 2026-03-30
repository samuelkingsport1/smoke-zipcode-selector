/**
 * Banding Engine — Execution timing band assignment by percentile within archetype.
 */

/**
 * Assign execution timing bands within each archetype group.
 * Top 33% → 2026, Middle 33% → 2027, Bottom 33% → 2028+
 * 
 * @param {Array} msaRecords - MSA records with `totalScore` and `archetype`
 * @returns {Array} MSA records augmented with `executionBand` and `rank`
 */
export function assignBands(msaRecords) {
  // Group by archetype
  const groups = {};
  msaRecords.forEach(msa => {
    const arch = msa.archetype || 'Uncategorized';
    if (!groups[arch]) groups[arch] = [];
    groups[arch].push(msa);
  });

  const result = [];

  // Process each archetype group independently
  Object.keys(groups).forEach(archetype => {
    const group = groups[archetype]
      .slice() // copy
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)); // descending

    const total = group.length;
    const topCutoff = Math.ceil(total * 0.33);
    const midCutoff = Math.ceil(total * 0.66);

    group.forEach((msa, index) => {
      let executionBand;
      if (index < topCutoff) {
        executionBand = '2026';
      } else if (index < midCutoff) {
        executionBand = '2027';
      } else {
        executionBand = '2028+';
      }

      result.push({
        ...msa,
        executionBand,
        archetypeRank: index + 1,
        archetypeGroupSize: total,
      });
    });
  });

  // Global sort by totalScore for overall rank
  result.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  result.forEach((msa, idx) => {
    msa.globalRank = idx + 1;
  });

  return result;
}
