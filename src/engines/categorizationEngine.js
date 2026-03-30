/**
 * Categorization Engine — Boolean gate logic for market archetype assignment.
 * Uses turf.js distance for proximity calculations.
 * Supports per-location radius overrides (falls back to global defaults).
 */
import * as turf from '@turf/turf';
import { DEFAULT_THRESHOLDS } from '../data/msaDefaults';

/**
 * Find the count of federation locations within proximity of an MSA centroid.
 * Each federation location can have its own `radius` override; null uses the global default.
 */
function countFederationsNearMSA(msa, federationLocations, defaultProximityMiles) {
  const msaPoint = turf.point([msa.lon, msa.lat]);
  let count = 0;
  const matchedFeds = [];
  for (const fed of federationLocations) {
    const fedRadius = fed.radius != null ? fed.radius : defaultProximityMiles;
    const fedPoint = turf.point([fed.lon, fed.lat]);
    const dist = turf.distance(msaPoint, fedPoint, { units: 'miles' });
    if (dist <= fedRadius) {
      count++;
      matchedFeds.push({ ...fed, distanceToMSA: Math.round(dist * 10) / 10 });
    }
  }
  return { count, matchedFeds };
}

/**
 * Find the nearest DC and check if MSA falls within any DC's radius.
 * Each DC can have its own `radius` override; null uses the global default.
 * Returns { nearestDC: { distance, dc }, withinDcRadius: boolean }
 */
function evaluateDCs(msa, distributionCenters, defaultDcRadius) {
  const msaPoint = turf.point([msa.lon, msa.lat]);
  let nearest = null;
  let minDist = Infinity;
  let withinAnyDcRadius = false;

  for (const dc of distributionCenters) {
    const dcPoint = turf.point([dc.lon, dc.lat]);
    const dist = turf.distance(msaPoint, dcPoint, { units: 'miles' });
    const dcRadius = dc.radius != null ? dc.radius : defaultDcRadius;

    if (dist < minDist) {
      minDist = dist;
      nearest = dc;
    }
    if (dist <= dcRadius) {
      withinAnyDcRadius = true;
    }
  }

  return {
    nearestDC: nearest ? { distance: Math.round(minDist * 10) / 10, dc: nearest } : null,
    withinDcRadius: withinAnyDcRadius,
  };
}

/**
 * Assign a market archetype to a single MSA based on boolean gate logic.
 * 
 * Atlanta_Type: Federation count > 0 within proximity (per-fed radius)
 * Dallas_Type:  Federation count = 0, MSA within any DC radius
 * Phoenix_Type: Federation count = 0, not within DC radius, revenue < floor
 * Uncategorized: Catch-all fallback
 * 
 * Returns the msa augmented with `archetype`, `nearestDC`, `federationCount`, `matchedFederations`.
 */
export function assignArchetype(msa, infrastructure, thresholds = DEFAULT_THRESHOLDS) {
  const { distributionCenters = [], federationLocations = [] } = infrastructure;
  const {
    dcDistanceMiles = 240,
    revenueFloor = 1200000,
    federationProximityMiles = 100,
    defaultDcRadius = 240,
    defaultFedRadius = 100,
  } = thresholds;

  // Use per-location radii, falling back to the default
  const fedResult = countFederationsNearMSA(msa, federationLocations, defaultFedRadius);
  const dcResult = evaluateDCs(msa, distributionCenters, defaultDcRadius);

  let archetype = 'Uncategorized';

  // Gate 1: Federation presence (using per-fed radii)
  if (fedResult.count > 0) {
    archetype = 'Atlanta_Type';
  }
  // Gate 2: No federation, within any DC radius
  else if (dcResult.withinDcRadius) {
    archetype = 'Dallas_Type';
  }
  // Gate 3: No federation, not within DC radius, low revenue
  else if (msa.odpCurrentRevenue < revenueFloor) {
    archetype = 'Phoenix_Type';
  }
  // else: Uncategorized (catch-all)

  return {
    ...msa,
    archetype,
    federationCount: fedResult.count,
    matchedFederations: fedResult.matchedFeds,
    nearestDC: dcResult.nearestDC,
  };
}

/**
 * Categorize all MSAs in the dataset.
 */
export function categorizeAllMSAs(msaRecords, infrastructure, thresholds = DEFAULT_THRESHOLDS) {
  return msaRecords.map(msa => assignArchetype(msa, infrastructure, thresholds));
}
