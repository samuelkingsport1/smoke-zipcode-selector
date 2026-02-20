import { US_STATES } from '../utils/constants';

const BASE_URL = "https://api.delphi.cmu.edu/epidata/fluview/";

/**
 * Helper to get the current epiweek and a past epiweek range.
 * Returns string format "YYYYWW-YYYYWW"
 */
const getEpiweekRange = () => {
    const today = new Date();
    const curYear = today.getFullYear();
    
    // Safety Net: If system time is 2026 but API only has 2025, we need a wide range.
    // Let's ask for the large range ending in the current system calculated week.
    // The API will just return what matches.
    
    // Start 52 weeks ago to be safe.
    // To minimize complexity, we'll just construct a crude range.
    const startYear = curYear - 1;
    const endYear = curYear;
    
    // "202501-202652" covers everything recently.
    // This is lazy but robust for "Latest Available" logic.
    return `${startYear}01-${endYear}53`;
};

export const fetchFluData = async () => {
    try {
        const range = getEpiweekRange();
        // Construct detailed list of states to ensure we get state data, not national
        // Using all lower case 2-letter codes.
        const regions = Object.values(US_STATES).map(s => s.toLowerCase()).join(",");
        
        const url = `${BASE_URL}?regions=${regions}&epiweeks=${range}`;
        
        console.log(`[DelphiService] Fetching Flu Data: ${url}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.result !== 1) {
            console.warn("Delphi API returned non-success result (or no data for range):", data);
            // If result is -2 (no results), we might be too far in future?
            // But with 52 week range, we should get *something*.
            return { processedData: {}, rawData: data };
        }
        
        // Data is in data.epidata
        // Process to get the *latest* entry for each state.
        
        const latestByState = {};
        
        data.epidata.forEach(entry => {
            const stateAbbr = entry.region.toUpperCase(); // 'al' -> 'AL'
            
            // Map 'AL' -> 'Alabama' using US_STATES
            const fullStateName = Object.keys(US_STATES).find(key => US_STATES[key] === stateAbbr);
            
            if (fullStateName) {
                // Check if this entry is newer than what we have
                if (!latestByState[fullStateName] || entry.epiweek > latestByState[fullStateName].epiweek) {
                    latestByState[fullStateName] = entry;
                }
            }
        });
        
        // Now map to the 1-10 intensity scale.
        // wili (Weighted ILI %) usually ranges 1-10+.
        const processedData = {};
        Object.keys(latestByState).forEach(state => {
            const entry = latestByState[state];
            // Simple mapping: 
            // 0-2% -> 1-3 (Low)
            // 2-5% -> 4-7 (Mod)
            // >5% -> 8-10 (High)
            const val = entry.wili;
            let level = 1;
            if (val < 1.5) level = 1;
            else if (val < 2.0) level = 2;
            else if (val < 2.5) level = 3;
            else if (val < 3.0) level = 4;
            else if (val < 3.5) level = 5;
            else if (val < 4.0) level = 6;
            else if (val < 5.0) level = 7;
            else if (val < 6.0) level = 8;
            else if (val < 8.0) level = 9;
            else level = 10;
            
            processedData[state] = {
                level: level,
                details: {
                    wili: entry.wili,
                    num_providers: entry.num_providers,
                    total_patients: entry.total_patients,
                    ili_total: entry.ili,
                    epiweek: entry.epiweek
                }
            };
        });
        
        return { processedData, rawData: data.epidata, sourceUrl: url };

    } catch (error) {
        console.error("Error fetching Delphi Flu Data:", error);
        return { processedData: null, rawData: null, sourceUrl: null, error: error.message };
    }
};

export const fetchCovidData = async () => {
    try {
        const url = "https://data.cdc.gov/api/views/7dk4-g6vg/rows.json?accessType=DOWNLOAD";
        console.log(`[DelphiService] Fetching COVID-19 Data: ${url}`);
        
        const response = await fetch(url);
        const json = await response.json();
        
        // Dynamic Column Mapping
        const cols = json.meta.view.columns;
        const getIdx = (namePattern) => cols.findIndex(c => c.fieldName && c.fieldName.match(new RegExp(namePattern, 'i')));
        
        const dateIdx = getIdx('week_ending_date');
        const stateIdx = getIdx('state');
        // Look for '100k' or fallback to specific name if regex is too broad
        const metricIdx = cols.findIndex(c => c.fieldName === 'total_adm_all_covid_confirmed_1' || c.name.includes('per_100k'));

        if (dateIdx === -1 || stateIdx === -1 || metricIdx === -1) {
            console.error("Could not find required columns in CDC data", { dateIdx, stateIdx, metricIdx });
            return { processedData: {}, rawData: json };
        }

        const latestByState = {};
        
        json.data.forEach(row => {
            const stateAbbr = row[stateIdx]; // e.g., 'AL'
            const dateStr = row[dateIdx];
            const val = parseFloat(row[metricIdx]);
            
            if (!stateAbbr || isNaN(val)) return;

            // Map abbreviation to full name
            const fullStateName = Object.keys(US_STATES).find(key => US_STATES[key] === stateAbbr);
            
            if (fullStateName) {
                // Keep only the latest date
                if (!latestByState[fullStateName] || new Date(dateStr) > new Date(latestByState[fullStateName].date)) {
                    latestByState[fullStateName] = { date: dateStr, val: val, row: row };
                }
            }
        });

        // Map to 1-10 Scale
        // CDC Levels (approx): Low (<10), Medium (10-19.9), High (>=20) - actually these change.
        // Let's use a granular scale for 1-10 visualization.
        // 0-2: 1-2 (Minimal)
        // 2-5: 3-5 (Low)
        // 5-10: 6-8 (Moderate)
        // 10+: 9-10 (High)
        
        const processedData = {};
        Object.keys(latestByState).forEach(state => {
            const { val } = latestByState[state];
            let level = 1;
            
            if (val < 1.0) level = 1;
            else if (val < 2.0) level = 2;
            else if (val < 3.0) level = 3;
            else if (val < 4.0) level = 4;
            else if (val < 5.0) level = 5;
            else if (val < 7.5) level = 6;
            else if (val < 10.0) level = 7;
            else if (val < 15.0) level = 8;
            else if (val < 20.0) level = 9;
            else level = 10;
            
            processedData[state] = {
                level: level,
                details: {
                    val: val,
                    date: latestByState[state].date
                }
            };
        });

        return { processedData, rawData: json, sourceUrl: url };

    } catch (error) {
        console.error("Error fetching COVID Data:", error);
         return { processedData: null, rawData: null, sourceUrl: null, error: error.message };
    }
};

export const fetchRSVData = async () => {
    try {
        // CDC NSSP Emergency Department Visit Trajectories
        // Socrata ID: 7mra-9cq9
        const url = "https://data.cdc.gov/resource/7mra-9cq9.json?pathogen=RSV&$limit=5000&$order=week_end DESC";
        console.log(`[DelphiService] Fetching RSV Data: ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();

        if (!json || json.length === 0) {
            console.warn("No RSV data found");
            return { processedData: {}, rawData: [] };
        }

        // 1. Find the most recent date in the dataset
        // Since we ordered by week_end DESC, the first entry should be the latest, 
        // but let's be safe and check the first few or filter.
        const latestDate = json[0].week_end;
        console.log(`[DelphiService] Latest RSV Date: ${latestDate}`);

        // 2. Filter for only the latest week
        const latestData = json.filter(row => row.week_end === latestDate);

        const processedData = {};

        latestData.forEach(row => {
            const stateName = row.geography;
            const val = parseFloat(row.percent_visits);

            if (!stateName || isNaN(val)) return;

            // Map to 1-10 Scale
            // RSV ED Visit % typically ranges 0.1% to 5.0%+ during peaks.
            // Scale:
            // < 0.5% -> 1
            // 0.5 - 4.5% -> 2-9
            // > 5.0% -> 10
            
            let level = 1;
            if (val < 0.5) level = 1;
            else if (val < 1.0) level = 2;
            else if (val < 1.5) level = 3;
            else if (val < 2.0) level = 4;
            else if (val < 2.5) level = 5;
            else if (val < 3.0) level = 6;
            else if (val < 3.5) level = 7;
            else if (val < 4.0) level = 8;
            else if (val < 4.5) level = 9;
            else level = 10;

            processedData[stateName] = {
                level: level,
                details: {
                    percent_visits: val,
                    week_end: row.week_end,
                    status: row.status,
                    trend: row.recent_trend
                }
            };
        });

        return { processedData, rawData: json, sourceUrl: url };

    } catch (error) {
        console.error("Error fetching RSV Data:", error);
        return { processedData: null, rawData: null, sourceUrl: null, error: error.message };
    }
};
