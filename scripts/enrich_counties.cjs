const fs = require('fs');
const path = require('path');

const ZIP_FILE = path.join(process.cwd(), 'public/zipcodes.csv');
const COUNTY_FILE = path.join(process.cwd(), 'temp_county_data.csv');
const OUTPUT_FILE = path.join(process.cwd(), 'public/zipcodes_updated.csv');

function parseLine(line) {
    // Simple CSV parser that handles basic quotes if needed, 
    // but for these files simple split is likely enough if no commas in values.
    // The zipcodes.csv matches: X,Y,OBJECTID,STD_ZIP5,...
    // The county file matches: state_fips,state,state_abbr,zipcode,county,city
    // County names might have commas? Unlikely for US counties usually, but "St. Clair" is fine.
    return line.split(',').map(s => s.trim());
}

try {
    console.log("Reading county data...");
    const countyData = fs.readFileSync(COUNTY_FILE, 'utf8');
    const countyLines = countyData.split('\n');
    
    // Map Zip -> County Name
    const countyMap = new Map();
    // Header: state_fips,state,state_abbr,zipcode,county,city
    // Index: 0          1     2          3       4      5
    
    countyLines.forEach((line, idx) => {
        if (idx === 0 || !line.trim()) return;
        const cols = parseLine(line);
        if (cols.length >= 5) {
            const zip = cols[3].replace(/^"|"$/g, '');
            const county = cols[4].replace(/^"|"$/g, '');
            countyMap.set(zip, county);
        }
    });
    console.log(`Loaded ${countyMap.size} county mappings.`);

    console.log("Reading existing zipcodes...");
    const zipData = fs.readFileSync(ZIP_FILE, 'utf8');
    const zipLines = zipData.split('\n');
    const header = zipLines[0].trim();
    
    // Check if county column already exists
    let newHeader = header;
    let countyColIndex = -1;
    const headerCols = header.split(',');
    
    // We want to add USPS_ZIP_COUNTY_NAME if missing
    if (!headerCols.includes('USPS_ZIP_COUNTY_NAME')) {
        newHeader += ',USPS_ZIP_COUNTY_NAME';
    } else {
        countyColIndex = headerCols.indexOf('USPS_ZIP_COUNTY_NAME');
    }

    const outputLines = [newHeader];
    let enrichedCount = 0;

    for (let i = 1; i < zipLines.length; i++) {
        const line = zipLines[i].trim();
        if (!line) continue;
        
        const cols = line.split(','); // Assuming no commas in values based on previous file view
        // zip is at index 3 based on: X,Y,OBJECTID,STD_ZIP5
        const zip = cols[3]; 
        
        let county = countyMap.get(zip) || '';
        if (county) {
            county = county.toUpperCase(); // Match UPPERCASE convention of other fields
            enrichedCount++;
        }

        if (countyColIndex === -1) {
            // Append
            outputLines.push(`${line},${county}`);
        } else {
            // Replace or Fill (unlikely case for now)
            cols[countyColIndex] = county;
            outputLines.push(cols.join(','));
        }
    }

    console.log(`Writing updated data... Enriched ${enrichedCount} rows.`);
    fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf8');
    console.log("Done.");

} catch (e) {
    console.error("Error:", e);
}
