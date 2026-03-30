const fs = require('fs');
const path = require('path');

const logsDir = path.join('C:', 'Users', 'samue', '.gemini', 'antigravity', 'brain', '1fb3ce2d-5bcc-4593-82ed-0bb1c660f7b7', '.system_generated', 'logs');
const outputTsvPath = path.join(__dirname, '..', 'src', 'data', 'raw_naics.tsv');
const outputJsPath = path.join(__dirname, '..', 'src', 'data', 'naics_structure.js');

function extractTSV() {
    console.log("Reading logs directory from " + logsDir);
    const files = fs.readdirSync(logsDir);
    
    let tsvContent = null;
    
    // Sort by modified time descending to check latest first
    const sortedFiles = files
        .filter(f => f.endsWith('.json') || f.endsWith('.txt'))
        .map(f => ({ name: f, time: fs.statSync(path.join(logsDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
        
    for (const fileInfo of sortedFiles) {
        const filePath = path.join(logsDir, fileInfo.name);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find the start of the table
        const startIndex = content.indexOf('Seq. No.\\t2017- All NAICS Codes\\t2017 NAICS Title (USA)');
        const startIndexUnescaped = content.indexOf('Seq. No.\t2017- All NAICS Codes\t2017 NAICS Title (USA)');
        
        let start = -1;
        let isEscaped = false;
        
        if (startIndex !== -1) {
            start = startIndex;
            isEscaped = true;
        } else if (startIndexUnescaped !== -1) {
            start = startIndexUnescaped;
        }
        
        if (start !== -1) {
            console.log(`Found NAICS table in ${fileInfo.name}`);
            
            const endMarker = '2196\t928120\tInternational Affairs';
            const endMarkerEscaped = '2196\\t928120\\tInternational Affairs';
            
            const endIndex = content.indexOf(isEscaped ? endMarkerEscaped : endMarker, start);
            
            if (endIndex !== -1) {
                const len = isEscaped ? endMarkerEscaped.length : endMarker.length;
                let block = content.substring(start, endIndex + len);
                
                if (isEscaped) {
                    block = block.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
                }
                tsvContent = block;
                break;
            }
        }
    }
    
    if (!tsvContent) {
        console.error("Could not find NAICS table in logs.");
        process.exit(1);
    }
    
    fs.writeFileSync(outputTsvPath, tsvContent, 'utf8');
    console.log(`Wrote extracted TSV to ${outputTsvPath}`);
    return tsvContent;
}

function parseAndBuildHierarchy(tsvText) {
    console.log("Parsing TSV into Hierarchy...");
    const lines = tsvText.split(/\r?\n/);
    
    const hierarchy = [];
    const levelMap = {};
    let count = 0;
    
    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split('\t');
        if (parts.length < 3) continue;
        
        let code = parts[1].trim();
        let title = parts[2].trim();
        
        const node = {
            code: code,
            title: title
        };
        
        let level = code.length;
        if (code.includes('-')) {
            level = 2; // Treat ranges as root level 2
        }
        
        if (level === 2) {
            hierarchy.push(node);
            levelMap[2] = node;
        } else {
            let parentLevel = level - 1;
            let parent = levelMap[parentLevel];
            
            if (parent) {
                 if (!parent.children) parent.children = [];
                 parent.children.push(node);
                 levelMap[level] = node;
            } else {
                 console.warn(`Could not find parent for ${code} at level ${level}. Falling back to hierarchy root.`);
                 hierarchy.push(node);
                 levelMap[level] = node;
            }
        }
        count++;
    }
    
    console.log(`Parsed ${count} NAICS entries.`);
    
    const jsContent = `// Auto-generated full NAICS 2017 Hierarchy
export const NAICS_DATA = ${JSON.stringify(hierarchy, null, 2)};
`;

    fs.writeFileSync(outputJsPath, jsContent, 'utf8');
    console.log(`Successfully generated updated ${outputJsPath}`);
}

const tsvContent = extractTSV();
parseAndBuildHierarchy(tsvContent);
