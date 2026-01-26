import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import * as turf from '@turf/turf';
import L from 'leaflet';
import MapComponent from './components/MapContainer';

const App = () => {
  const [zipCodes, setZipCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing...");
  // Default to yesterday's date as it is safer for satellite data availability
  const [date, setDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);

  // State Selection Mode States
  const [stateMode, setStateMode] = useState(false);
  const [selectedStates, setSelectedStates] = useState(new Set());

  const drawnItemsRef = useRef({});

  useEffect(() => {
    setStatus("Loading Zipcodes...");
    Papa.parse(`${import.meta.env.BASE_URL}zipcodes.csv`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setStatus(`Processing ${results.data.length} zipcodes...`);
        // Optimize: convert to simpler array of objects
        const zips = [];
        results.data.forEach(r => {
          const lat = parseFloat(r.LATITUDE);
          const lng = parseFloat(r.LONGITUDE);
          if (!isNaN(lat) && !isNaN(lng)) {
            zips.push({
              zip: r.STD_ZIP5,
              lat: lat,
              lng: lng,
              city: r.USPS_ZIP_PREF_CITY_1221, // Optional: useful for CSV
              state: r.USPS_ZIP_PREF_STATE_1221
            });
          }
        });
        setZipCodes(zips);
        setLoading(false);
        if (zips.length > 0) {
          console.log("First loaded zip:", zips[0]);
        }
        setStatus(`Loaded ${zips.length} zipcodes.`);
      },
      error: (err) => {
        console.error("CSV Parse Error", err);
        setStatus("Error loading zipcodes.");
        setLoading(false);
      }
    });
  }, []);

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    const id = L.Util.stamp(layer);

    let shapeData;

    if (layerType === 'circle') {
      const center = layer.getLatLng();
      const radius = layer.getRadius(); // in meters
      // Convert to Turf circle (polygon)
      const options = { steps: 64, units: 'meters' };
      const turfCircle = turf.circle([center.lng, center.lat], radius, options);
      shapeData = {
        type: 'circle',
        geometry: turfCircle.geometry,
        rawLayer: layer
      };
    } else {
      // Rectangle or Polygon
      const geoJson = layer.toGeoJSON();
      shapeData = {
        type: 'polygon',
        geometry: geoJson.geometry,
        rawLayer: layer
      };
    }

    drawnItemsRef.current[id] = shapeData;
    setStatus(`Area added. Total areas: ${Object.keys(drawnItemsRef.current).length}`);
  };

  const handleDeleted = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const id = L.Util.stamp(layer);
      delete drawnItemsRef.current[id];
    });
    setStatus(`Area removed. Total areas: ${Object.keys(drawnItemsRef.current).length}`);
  };

  const handleStateClick = (stateName) => {
    const newSelectedStates = new Set(selectedStates);
    if (newSelectedStates.has(stateName)) {
      newSelectedStates.delete(stateName);
    } else {
      newSelectedStates.add(stateName);
    }
    setSelectedStates(newSelectedStates);
    setStatus(`${newSelectedStates.size} states selected.`);
  };

  const handleExport = () => {
    if (loading) return;

    const shapeIds = Object.keys(drawnItemsRef.current);
    if (!stateMode && shapeIds.length === 0) {
      alert("No areas selected. Please draw a box, polygon, or circle first.");
      return;
    }

    setStatus("Calculating intersecting zip codes...");

    setTimeout(() => {
      // Use setTimeout to allow UI to update with "Calculating..."
      const selectedZips = new Set();

      // For each shape
      if (!stateMode) {
        shapeIds.forEach(id => {
          const shape = drawnItemsRef.current[id];
          const poly = turf.polygon(shape.geometry.coordinates); // geometry.coordinates for polygon

          // Naive iteration over 40k points is fast enough for modern JS engines (~10-50ms)
          // If slowness occurs, we can use a bounding box check first.

          // Pre-calc bbox for the shape
          const bbox = turf.bbox(poly); // [minX, minY, maxX, maxY]

          zipCodes.forEach(z => {
            // BBox check
            if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
              // Point search
              if (turf.booleanPointInPolygon([z.lng, z.lat], poly)) {
                selectedZips.add(z);
              }
            }
          });
        });
      } else {
        // State Mode Export
        if (selectedStates.size === 0) {
          alert("No states selected.");
          setStatus("No states selected.");
          return;
        }

        // Map of Full State Name to Abbreviation (or check against what CSV has)
        // The CSV uses 2-letter codes (e.g., 'MA', 'CA').
        // The GeoJSON uses Full Names (e.g., 'Massachusetts', 'California').
        // We need a mapping or strict comparison.

        // Let's assume user wants to build a mapping dynamically or we use a static map.
        // For robustness, I'll create a mapping here.
        const stateNameMap = {
          "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
          "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
          "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
          "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
          "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
          "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
          "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
          "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
          "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
          "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
          "District of Columbia": "DC", "Puerto Rico": "PR"
        };

        const selectedAbbrevs = new Set();
        selectedStates.forEach(name => {
          if (stateNameMap[name]) {
            selectedAbbrevs.add(stateNameMap[name]);
          } else {
            console.warn(`State name not found in map: "${name}"`);
          }
        });

        console.log("Selected States:", Array.from(selectedStates));
        console.log("Mapped Abbrevs:", Array.from(selectedAbbrevs));

        zipCodes.forEach(z => {
          if (selectedAbbrevs.has(z.state)) {
            selectedZips.add(z);
          }
        });
      }

      if (selectedZips.size === 0) {
        alert("No zip codes found in selected areas.");
        setStatus("No zip codes found.");
        return;
      }

      // Generate CSV
      const csvData = Array.from(selectedZips).map(z => ({
        ZIP: z.zip,
        CITY: z.city,
        STATE: z.state,
        LAT: z.lat,
        LNG: z.lng
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'selected_zipcodes.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus(`Exported ${selectedZips.size} zipcodes.`);
    }, 100);
  };

  return (
    <div>
      <div className="map-interaction-container">
        <div className="info-panel">
          <strong>Status:</strong> {status}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Data Date:</label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button
            onClick={() => setStateMode(!stateMode)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: stateMode ? '#3388ff' : 'white',
              color: stateMode ? 'white' : 'black',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {stateMode ? "State Mode Active" : "Enable State Mode"}
          </button>
        </div>

        <button
          className="export-btn"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Loading Data...' : 'Export Selected Zips'}
        </button>
      </div>
      <MapComponent
        onCreated={handleCreated}
        onDeleted={handleDeleted}
        date={date}
        stateMode={stateMode}
        selectedStates={selectedStates}
        onStateClick={handleStateClick}
      />
    </div>
  );
};

export default App;
