import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as turf from '@turf/turf';
import L from 'leaflet';
import MapComponent from '../MapContainer';
import SmokeAQITooltip from './SmokeAQITooltip';
import { WMSTileLayer } from 'react-leaflet';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import { US_STATES } from '../../utils/constants';

const SmokeMode = ({ zipCodes = [], zipLoading = false }) => {
    const [loading, setLoading] = useState(false); // Local processing state (e.g. Export calculation)
    const [status, setStatus] = useState("Initializing...");
    // Default to yesterday's date as it is safer for satellite data availability
    const [date, setDate] = useState(() => new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    console.log("Active Date:", date);

    // SQL Export Config State
    // SQL Export Config State
    const [exportConfig, setExportConfig] = useState({
        recordType: 'Site',
        fields: {
            'Last_Order_Date__C': true,
            'Total_LY_Sales__C': true,
            'Total_ty_Sales_to_Date__c': true
        },
        filters: {
            activeStatus: true,
            lastActivityMonths: '',
            lastOrderMonths: '',
            minTotalSales: ''
        },
        sortBy: ''
    });

    // State Selection Mode States
    const [stateMode, setStateMode] = useState(false);
    const [selectedStates, setSelectedStates] = useState(new Set());
    
    // NAICS Filter State
    const [selectedNAICS, setSelectedNAICS] = useState(new Set());

    const drawnItemsRef = useRef({});

    // Zip codes are now passed as props from App.jsx
    // Legacy local parsing removed to fix ReferenceError


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
        if (zipLoading) {
            alert("Zipcode database is still loading. Please wait a moment.");
            return;
        }

        const shapeIds = Object.keys(drawnItemsRef.current);
        if (!stateMode && shapeIds.length === 0) {
            alert("No areas selected. Please draw a box, polygon, or circle first.");
            return;
        }

        setStatus("Calculating intersecting zip codes...");

        // setTimeout removed to fix clipboard/user-gesture issues.
        // If calculation is slow, we should use a Web Worker, but for <50k items it's fine.
        
        try {
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

                // Use shared US_STATES constant
                const stateNameMap = US_STATES;

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
        } catch (e) {
            console.error(e);
            setStatus("Export failed.");
        }
    };

    const handleSQLExport = (actionType) => {
        if (loading) return;
        if (zipLoading) {
            alert("Zipcode database is still loading. Please wait a moment.");
            return;
        }

        const shapeIds = Object.keys(drawnItemsRef.current);
        if (!stateMode && shapeIds.length === 0) {
            alert("No areas selected. Please draw a box, polygon, or circle first.");
            return;
        }

        setStatus("Generating SQL...");

        // setTimeout removed to fix clipboard API "transient user activation" requirement
        try {
            const selectedZips = new Set();

            // 1. Check drawn shapes
            if (!stateMode) {
                shapeIds.forEach(id => {
                    const shape = drawnItemsRef.current[id];
                    const poly = turf.polygon(shape.geometry.coordinates);
                    const bbox = turf.bbox(poly);

                    zipCodes.forEach(z => {
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], poly)) {
                                selectedZips.add(z.zip); 
                            }
                        }
                    });
                });
            } else {
                // 2. State Mode
                 if (selectedStates.size === 0) {
                    alert("No states selected.");
                    setStatus("No states selected.");
                    return;
                }
                const stateNameMap = US_STATES;
                const selectedAbbrevs = new Set();
                selectedStates.forEach(name => {
                    if (stateNameMap[name]) selectedAbbrevs.add(stateNameMap[name]);
                });

                zipCodes.forEach(z => {
                    if (selectedAbbrevs.has(z.state)) {
                        selectedZips.add(z.zip);
                    }
                });
            }

            if (selectedZips.size === 0) {
                alert("No zip codes found in selected areas.");
                setStatus("No zip codes found.");
                return;
            }

            const zipList = Array.from(selectedZips);
            const zipString = zipList.map(z => `'${z}'`).join(", ");

            if (actionType === 'COUNT') {
                // Construct Filter Clauses
                const { filters, recordType } = exportConfig;
                let filterClauses = "";
                if (filters.activeStatus) filterClauses += "\nAND c.Status__c = 'Active'";
                if (filters.lastActivityMonths) filterClauses += `\nAND c.LastActivityDate >= DATEADD(month, -${filters.lastActivityMonths}, GETDATE())`;
                if (filters.lastOrderMonths) filterClauses += `\nAND c.LastOrderDate__c >= DATEADD(month, -${filters.lastOrderMonths}, GETDATE())`;
                if (filters.minTotalSales) filterClauses += `\nAND c.Total_Sales_LY__c >= ${filters.minTotalSales}`;

                const countSql = `Select count(s.id)
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.ParentId = c.Id\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}`;

                navigator.clipboard.writeText(countSql).then(() => {
                    alert("Count SQL copied to clipboard!");
                    setStatus("Count SQL copied.");
                });

            } else {
                 // Dynamic Field Selection
                 const { filters, recordType, fields } = exportConfig;
                 const baseFields = ["id", "Name", "CUST_ID__C"];
                 const additionalFields = Object.keys(fields).filter(key => fields[key]);
                 const allFields = [...baseFields, ...additionalFields].join(", ");

                 // Sorting
                 const orderByClause = exportConfig.sortBy ? `\nORDER BY s.${exportConfig.sortBy} DESC NULLS LAST` : "";

                 // Filter Clauses (Same as COUNT)
                let filterClauses = "";
                if (filters.activeStatus) filterClauses += "\nAND c.Status__c = 'Active'";
                if (filters.lastActivityMonths) filterClauses += `\nAND c.LastActivityDate >= DATEADD(month, -${filters.lastActivityMonths}, GETDATE())`;
                if (filters.lastOrderMonths) filterClauses += `\nAND c.LastOrderDate__c >= DATEADD(month, -${filters.lastOrderMonths}, GETDATE())`;
                if (filters.minTotalSales) filterClauses += `\nAND c.Total_Sales_LY__c >= ${filters.minTotalSales}`;

                // Standard Select Query
                const naicsFields = selectedNAICS.size > 0 ? ", org.NAICS___c, org.NAICS_Description__c" : "";
                
                const sqlContent = `Select ${allFields.map(f => `s.${f}`).join(", ")}${naicsFields}
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.ParentId = c.Id\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}${orderByClause}`;

                if (actionType === 'COPY') {
                    navigator.clipboard.writeText(sqlContent).then(() => {
                        alert("SQL Query copied to clipboard!");
                        setStatus("SQL Query copied.");
                    });
                } else {
                    // DOWNLOAD
                    const blob = new Blob([sqlContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'smoke_targets.sql');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setStatus(`Exported SQL for ${selectedZips.size} zip codes.`);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Export failed: " + e.message);
            setStatus("Export failed.");
        }
    };

    return (
        <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>💨</span> Smoke / AQI
                        </h3>
                        <div className="sidebar-input-group">
                            <label className="sidebar-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Data Date</label>
                            <input
                                type="date"
                                value={date}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ 
                                    padding: '8px', 
                                    borderRadius: '6px', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    width: '100%',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>
                    </div>

                    <div className="sidebar-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="sidebar-section">
                            <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                SELECTION TOOLS
                            </label>
                            <button
                                onClick={() => setStateMode(!stateMode)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ced4da',
                                    backgroundColor: stateMode ? '#0d6efd' : 'white',
                                    color: stateMode ? 'white' : '#495057',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    width: '100%',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                {stateMode ? "✓ State Selection Active" : "Enable State Selection"}
                            </button>
                        </div>

                        <div className="sidebar-section">
                            <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                EXPORT DATA
                            </label>
                            
                            {/* CSV Export */}
                            <div style={{ marginBottom: '16px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>
                                    1. Export Zip Code List (CSV)
                                </div>
                                <button
                                    className="export-btn"
                                    onClick={handleExport}
                                    disabled={loading || zipLoading}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px',
                                        backgroundColor: '#28a745', 
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    {zipLoading ? 'Loading DB...' : (loading ? 'Processing...' : 'Download CSV')}
                                </button>
                            </div>

                            {/* SQL Export */}
                            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>
                                    2. Generate SQL Query
                                </div>
                                
                                <SQLExportControls 
                                    config={exportConfig}
                                    setConfig={setExportConfig}
                                    selectedNAICS={selectedNAICS}
                                    setSelectedNAICS={setSelectedNAICS}
                                />
                                
                                <div style={{ marginTop: '10px' }}>
                                    <ExportActionButtons 
                                        onExport={handleSQLExport}
                                        loading={loading}
                                        zipLoading={zipLoading}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="sidebar-footer" style={{ padding: '12px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
                        <small style={{ color: '#6c757d' }}>{status}</small>
                    </div>
                </>
            }
            mapContent={
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
            }
            rightPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Legend & Info</h3>
                    </div>
                    <div className="sidebar-content" style={{ padding: '16px' }}>
                        <div style={{ 
                            padding: '16px', 
                            backgroundColor: 'white', 
                            borderRadius: '8px', 
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>ℹ️</span> How to Use
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                                <li>Use the <strong>Shape Tools</strong> (top right of map) to draw a box or polygon around smoke areas.</li>
                                <li style={{ marginTop: '8px' }}>Toggle <strong>State Selection</strong> to quickly select entire states.</li>
                                <li style={{ marginTop: '8px' }}>Use the <strong>Export Data</strong> section to download Zip Codes (CSV) or generate a SQL query.</li>
                            </ul>
                        </div>
                        {/* Placeholder for future detailed stats or Legend component */}
                    </div>
                </>
            }
        />
    );
};

export default SmokeMode;
