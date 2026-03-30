const fs = require('fs');
const path = require('path');

const outputJsPath = path.join(__dirname, '..', 'src', 'data', 'naics_structure.js');

function buildHierarchy() {
    let combinedText = '';
    
    // Read the 3 parts
    for (let i = 1; i <= 3; i++) {
        const partPath = path.join(__dirname, '..', 'src', 'data', `raw_naics_${i}.tsv`);
        if (fs.existsSync(partPath)) {
            const content = fs.readFileSync(partPath, 'utf8');
            combinedText += content + '\n';
        } else {
            console.error(`Missing part ${i}: ${partPath}`);
            process.exit(1);
        }
    }
    
    console.log(`Read all parts. Total length: ${combinedText.length}`);
    const lines = combinedText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    const hierarchy = [];
    const levelMap = {};
    let count = 0;
    
    for (let i = 1; i < lines.length; i++) { // Skip header assuming it's on line 0
        const line = lines[i].trim();
        if (line.startsWith('Seq. No.')) continue;
        
        const parts = line.split('\t');
        if (parts.length < 3) continue;
        
        let code = parts[1].trim();
        let title = parts[2].trim();
        
        const node = {
            code: code,
            title: title
            // children will be added if it has any
        };
        
        // Root elements have a length of 2 (or contain a dash like 31-33)
        let level = code.length;
        if (code.includes('-')) {
            level = 2; // Treat ranges as root level 2
        }
        
        if (level === 2) {
            hierarchy.push(node);
            levelMap[2] = node;
        } else {
            // Find parent
            // Level 3's parent is Level 2. Level 4's parent is Level 3, etc.
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
    
    console.log(`Successfully parsed ${count} NAICS entries into hierarchical tree.`);
    
    const jsContent = `// Auto-generated full NAICS 2017 Hierarchy
export const NAICS_DATA = ${JSON.stringify(hierarchy, null, 2)};
`;

    fs.writeFileSync(outputJsPath, jsContent, 'utf8');
    console.log(`Successfully written to ${outputJsPath}`);
}

buildHierarchy();
