/**
 * Scoring Engine — Min-Max normalization and weighted score calculation.
 * Pure functions, no React dependencies.
 */
import { SCORING_FIELDS } from '../data/msaDefaults';

/**
 * Standard normalization (higher is better).
 * Formula: (x - min) / (max - min)
 */
export function normalizeStandard(value, min, max) {
  if (max === min) return 0.5; // avoid divide-by-zero
  return (value - min) / (max - min);
}

/**
 * Inverse normalization (lower is better).
 * Formula: 1 - (x - min) / (max - min)
 */
export function normalizeInverse(value, min, max) {
  if (max === min) return 0.5;
  return 1 - (value - min) / (max - min);
}

/**
 * Compute min and max for each scoring field from the dataset.
 * Returns { fieldKey: { min, max } }
 */
export function computeMinMax(msaRecords, fields = SCORING_FIELDS) {
  const result = {};
  fields.forEach(f => {
    const values = msaRecords.map(r => r[f.key]).filter(v => v != null && !isNaN(v));
    result[f.key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });
  return result;
}

/**
 * Validate that weights sum to 1.0 (within floating-point tolerance).
 * Returns { valid: boolean, sum: number, error: string|null }
 */
export function validateWeights(weights) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = Math.abs(sum - 1.0) < 0.001;
  return {
    valid,
    sum: Math.round(sum * 1000) / 1000,
    error: valid ? null : `Weights sum to ${(sum * 100).toFixed(1)}%, must equal 100%.`,
  };
}

/**
 * Calculate normalized sub-scores and total weighted score for a single MSA.
 * Returns the MSA record augmented with `scores` and `totalScore`.
 */
export function calculateScores(msaRecord, weights, minMax, fields = SCORING_FIELDS) {
  const scores = {};
  let totalScore = 0;

  fields.forEach(f => {
    const { min, max } = minMax[f.key];
    const raw = msaRecord[f.key];
    const norm = f.direction === 'inverse'
      ? normalizeInverse(raw, min, max)
      : normalizeStandard(raw, min, max);
    
    scores[f.key] = Math.round(norm * 10000) / 10000; // 4-decimal precision
    const weight = weights[f.key] || 0;
    totalScore += norm * weight;
  });

  return {
    ...msaRecord,
    scores,
    totalScore: Math.round(totalScore * 10000) / 10000,
  };
}

/**
 * Score all MSAs in the dataset.
 * Returns a new array of MSA records with scores and totalScore.
 */
export function scoreAllMSAs(msaRecords, weights, fields = SCORING_FIELDS) {
  const minMax = computeMinMax(msaRecords, fields);
  return msaRecords.map(msa => calculateScores(msa, weights, minMax, fields));
}
