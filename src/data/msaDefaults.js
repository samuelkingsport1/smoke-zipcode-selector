/**
 * Default configuration for the Market Categorization Engine.
 * Weights, thresholds, and field metadata.
 */

// Scoring fields with normalization direction
export const SCORING_FIELDS = [
  { key: 'midMarketDensity',     label: 'Mid-Market Density',     direction: 'standard', format: 'integer' },
  { key: 'officeOccupancyRate',  label: 'Office Occupancy Rate',  direction: 'standard', format: 'percent' },
  { key: 'projectedGdpGrowth',  label: 'Projected GDP Growth',   direction: 'standard', format: 'percent' },
  { key: 'competitorHubs',      label: 'Competitor Density',      direction: 'inverse',  format: 'integer' },
];

// Default weights (must sum to 1.0)
export const DEFAULT_WEIGHTS = {
  midMarketDensity:    0.30,
  officeOccupancyRate: 0.25,
  projectedGdpGrowth:  0.25,
  competitorHubs:      0.20,
};

// Categorization thresholds
export const DEFAULT_THRESHOLDS = {
  dcDistanceMiles: 240,       // ~4 hours driving proxy
  revenueFloor:    1200000,   // Phoenix_Type revenue threshold
  federationProximityMiles: 100, // MSA-to-Federation proximity radius (global default)
  defaultDcRadius: 240,       // Default per-DC coverage radius (miles)
  defaultFedRadius: 100,      // Default per-Federation coverage radius (miles)
  defaultMsaRadius: 50,       // Default per-MSA metro area radius (miles)
};

// Archetype definitions
export const ARCHETYPES = {
  Atlanta_Type: {
    label: 'Atlanta Type',
    color: '#28a745',
    description: 'Federation presence within MSA proximity',
  },
  Dallas_Type: {
    label: 'Dallas Type',
    color: '#007bff',
    description: 'No federation, DC within reach (≤240mi)',
  },
  Phoenix_Type: {
    label: 'Phoenix Type',
    color: '#fd7e14',
    description: 'No federation, distant DC, low revenue',
  },
  Uncategorized: {
    label: 'Uncategorized',
    color: '#6c757d',
    description: 'Does not match any defined archetype',
  },
};

// Execution timing bands
export const EXECUTION_BANDS = [
  { label: '2026', percentile: [0, 33], color: '#28a745' },
  { label: '2027', percentile: [33, 66], color: '#ffc107' },
  { label: '2028+', percentile: [66, 100], color: '#dc3545' },
];
