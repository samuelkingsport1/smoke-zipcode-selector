import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import * as turf from '@turf/turf';
import L from 'leaflet';
import MapComponent from '../MapContainer';
import SmokeAQITooltip from './SmokeAQITooltip';
import { WMSTileLayer } from 'react-leaflet';

const SmokeMode = () => {
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
        <div className="dashboard-layout">
            <div className="sidebar-section">
                <div className="sidebar-header">
                    <h3>Smoke / AQI</h3>
                    <div className="sidebar-input-group">
                        <label className="sidebar-label">Data Date</label>
                        <input
                            type="date"
                            value={date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', width: '100%' }}
                        />
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-input-group">
                        <label className="sidebar-label">Controls</label>
                        <button
                            onClick={() => setStateMode(!stateMode)}
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ced4da',
                                backgroundColor: stateMode ? '#0d6efd' : 'white',
                                color: stateMode ? 'white' : '#495057',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                width: '100%',
                                transition: 'all 0.2s'
                            }}
                        >
                            {stateMode ? "State Selection: ON" : "Enable State Selection"}
                        </button>
                    </div>

                    <div className="sidebar-input-group">
                        <label className="sidebar-label">Export Data</label>
                        <button
                            className="export-btn"
                            onClick={handleExport}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Processing...' : 'Export Selected Zips'}
                        </button>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold' }}>Instructions:</p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
                            <li>Use the Shape Tools (top right of map) to draw a box or polygon.</li>
                            <li>Or toggle "State Selection" to click states.</li>
                            <li>Click "Export" to download CSV of zip codes in those areas.</li>
                        </ul>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <small style={{ color: '#6c757d' }}>{status}</small>
                </div>
            </div>

            <div className="map-section">
                {/* Map Interaction Container removed as controls are now in sidebar */}
                <MapComponent
                    onCreated={handleCreated}
                    onDeleted={handleDeleted}
                    date={date}
                    stateMode={stateMode}
                    selectedStates={selectedStates}
                    onStateClick={handleStateClick}
                >
                    <WMSTileLayer
                        key={`wms-${date}`}
                        url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
                        layers="MODIS_Combined_Value_Added_AOD"
                        format="image/png"
                        transparent={true}
                        opacity={0.6}
                        attribution="NASA GIBS Combined Modis AOD"
                        params={{
                            TIME: date
                        }}
                    />
                    <SmokeAQITooltip date={date} />
                </MapComponent>
            </div>
        </div>
    );
};

export default SmokeMode;
