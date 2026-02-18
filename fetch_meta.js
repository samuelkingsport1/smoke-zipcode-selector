
import fs from 'fs';

const url = 'https://data.cdc.gov/api/views/7dk4-g6vg/rows.json?accessType=DOWNLOAD';

async function fetchMeta() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    
    const columns = json.meta.view.columns.map(c => ({
      position: c.position,
      fieldName: c.fieldName,
      name: c.name
    }));
    
    fs.writeFileSync('rows_meta_node.json', JSON.stringify(columns, null, 2));
    console.log('Successfully wrote rows_meta_node.json');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

fetchMeta();
