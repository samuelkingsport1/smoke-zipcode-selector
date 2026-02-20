import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import NAICSFilter from '../Dashboard/NAICSFilter';
import { US_STATES } from '../../utils/constants';
import { NWSService } from '../../services/nwsService';
import { generateSQL } from '../../utils/sqlGenerator';
import * as turf from '@turf/turf';

const RegulationsModal = ({ onClose }) => (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <button className="modal-close" onClick={onClose}>&times;</button>
            <h3 style={{ marginBottom: '15px' }}>📋 State Heatwave Regulations Reference</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px', borderRight: '1px solid #eee' }}>State</th>
                            <th style={{ padding: '12px', borderRight: '1px solid #eee' }}>Applies To</th>
                            <th style={{ padding: '12px', borderRight: '1px solid #eee' }}>Temperature Triggers</th>
                            <th style={{ padding: '12px' }}>Required Employer Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>California</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Outdoor + Indoor (separate rules)</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Outdoor:</strong> 80°F (shade access), 95°F (high heat)<br/><br/><strong>Indoor:</strong> 82°F (control plan), 87°F (high heat)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Water (1 qt/hr), shade, cool-down rest, training, written prevention plan, observation during high heat, emergency response procedures</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Washington</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Outdoor</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>80°F (basic), 90°F (enhanced), 100°F (additional controls)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Drinking water, paid cool-down rest breaks, acclimatization, supervisor monitoring at higher temps, emergency planning</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Oregon</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Indoor + Outdoor</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>80°F (heat plan + water/rest), 90°F (mandatory rest schedule)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Heat illness prevention plan, shade/cooling area, 10-min rest every 2 hrs at 90°F+, training, acclimatization protocol</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Minnesota</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Indoor only</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>80–86°F (controls required), 87°F+ (mandatory controls)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Engineering controls or administrative controls, ventilation, rest breaks, exposure monitoring</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Colorado</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Agriculture only</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>80°F (basic protections), 95°F (high heat protections)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Drinking water, shade, rest breaks, increased monitoring at high heat, written procedures</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Maryland</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Indoor + Outdoor</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>80°F (prevention plan required), 90°F (high heat procedures)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Heat illness prevention plan, water access, rest breaks, acclimatization, training, supervisor monitoring</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}><strong>Nevada</strong></td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>Indoor + Outdoor</td>
                            <td style={{ padding: '12px', borderRight: '1px solid #eee', verticalAlign: 'top' }}>90°F (controls required), 105°F (high heat)</td>
                            <td style={{ padding: '12px', verticalAlign: 'top' }}>Written job hazard analysis, water, rest breaks, cooling areas, monitoring at 105°F+, emergency response procedures</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const HeatMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState({ type: "FeatureCollection", features: [] });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Heat Mode...");
    const [date, setDate] = useState(""); // Empty = Live
    const [showRegulations, setShowRegulations] = useState(false);
    
    // NAICS Filter State
    const [selectedNAICS, setSelectedNAICS] = useState(new Set());

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

    const fetchAlerts = React.useCallback(async () => {
        setLoading(true);
        setStatus(date ? `Searching Archive for ${date}...` : "Fetching NWS Heat Warnings...");

        try {
            // Updated to generic "Excessive Heat" events
            const events = "Excessive Heat Warning,Heat Advisory,Excessive Heat Watch";
            const data = await NWSService.fetchAlerts(date, events);

            console.log(`[HeatMode] Loaded ${data.features.length} heat alerts.`);

            if (data.features.length > 0) {
                setAlerts(data);
                setStatus(date
                    ? `Found ${data.features.length} Historical Alerts for ${date}.`
                    : `Active: ${data.features.length} Heat Alerts.`
                );
            } else {
                setAlerts({ type: "FeatureCollection", features: [] });
                setStatus(date ? `No Heat alerts found for ${date}.` : "No active Heat Alerts.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus(`Error: ${err.message}`);
            setAlerts({ type: "FeatureCollection", features: [] });
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const getProducts = () => {
        return [
            { category: "Cooling", skus: ["Portable AC", "Industrial Drum Fan", "Spot Cooler"] },
            { category: "Safety", skus: ["Electrolyte Powder", "Bulk Water", "Cooling Towels"] }
        ];
    };

    // Standardized Export Logic (Matches WinterMode)
    const handleExport = async (targetAlertsParam) => {
        const alertsToProcess = targetAlertsParam || alerts.features;

        if (!alertsToProcess || alertsToProcess.length === 0 || !zipCodes || zipCodes.length === 0) {
            alert("No data to export or zip codes not loaded.");
            return;
        }

        if (zipLoading) {
            alert("Zipcode database is still loading. Please wait 5 seconds and try again.");
            return;
        }

        setStatus("Fetching standard zone geometries...");
        setLoading(true);

        // 1. Enrich Alerts with Geometry if missing (Zone Fetching)
        const enrichedAlerts = [];
        const zoneCache = new Map();

        // Identify alerts needing geometry
        for (const alert of alertsToProcess) {
            if (!alert.geometry && alert.properties.affectedZones && alert.properties.affectedZones.length > 0) {
                // It's a zone-based alert (common for Heat Advisories)
                // We'll fetch the first zone's geometry as a proxy for the alert area
                const zoneUrl = alert.properties.affectedZones[0]; 
                
                try {
                    let geometry = zoneCache.get(zoneUrl);
                    if (!geometry) {
                        geometry = await NWSService.fetchZoneGeometry(zoneUrl);
                        if (geometry) zoneCache.set(zoneUrl, geometry);
                    }
                    
                    if (geometry) {
                        enrichedAlerts.push({
                            ...alert,
                            geometry: geometry // Polyfill the geometry
                        });
                        continue; // Done with this alert
                    }
                } catch (error) { // Renamed e to error and logged it
                    console.warn(`Failed to fetch zone geometry for ${zoneUrl}`, error);
                }
            }
            // Keep original if it had geometry or fetch failed
            enrichedAlerts.push(alert);
        }

        setStatus("Processing spatial match...");

        setTimeout(() => {
            const targets = [];
            const uniqueEntries = new Set();

            enrichedAlerts.forEach(alert => {
                const hasGeometry = !!alert.geometry;
                const areaDesc = (alert.properties.areaDesc || "").toUpperCase();
                const eventName = alert.properties.event || "Heat Warning";

                let bbox = null;
                if (hasGeometry) {
                    try {
                        bbox = turf.bbox(alert);
                    } catch (error) {
                         console.warn("Invalid geometry for bbox", error);
                    }
                }

                zipCodes.forEach(z => {
                    let isMatch = false;

                    // 1. Geometric Match
                    if (hasGeometry && bbox) {
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], alert)) {
                                isMatch = true;
                            }
                        }
                    }

                    // 2. Text Match Fallback
                    if (!isMatch) {
                        if (z.county && z.state) {
                            const searchStr = `${z.county}, ${z.state}`.toUpperCase();
                            if (areaDesc.includes(searchStr)) {
                                isMatch = true;
                            }
                        }
                    }

                    if (isMatch) {
                        const entryId = `${z.zip}-${eventName}`;
                        if (!uniqueEntries.has(entryId)) {
                            uniqueEntries.add(entryId);
                            targets.push({
                                zip: z.zip,
                                county: z.county,
                                state: z.state,
                                alert_name: eventName,
                                sent: alert.properties.sent,
                                expires: alert.properties.expires,
                                suggested_products: getProducts().map(p => p.category).join("; ")
                            });
                        }
                    }
                });
            });

            if (targets.length === 0) {
                alert("No matching targets found (checked geometry and county text).");
                setStatus("Ready");
                setLoading(false);
                return;
            }

            const exportObj = {
                generated_at: new Date().toISOString(),
                event_type: "HEATWAVE",
                targets: targets
            };

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'heat_targets.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus(`Exported ${targets.length} targets.`);
            setLoading(false);
        }, 100);
    };

    const handleCopy = () => {
         // Re-use logic or implement separate copy logic if needed
         // For now, simpler to just allow export actions on the list
         console.log("Copy not fully implemented for full spatial check yet.");
    };

    // Note: Heat Mode re-uses the general SQL export logic (it assumes State/Zip lists, not specific NWS Polygon matching for SQL generation yet).
    // For now, we will perform the same spatial check and then generate SQL for the resulting Zips.
    const handleSQLExport = async (actionType) => {
        if (!alerts || !alerts.features || !zipCodes || zipCodes.length === 0) {
            alert("No data to export.");
            return;
        }
        
        setStatus("Generating SQL...");
        setLoading(true);
        
         setTimeout(() => {
            const selectedZips = new Set();
            // Simplified check (no zone fetching for SQL preview to be fast)
            alerts.features.forEach(alert => {
                 const hasGeometry = !!alert.geometry;
                 const areaDesc = (alert.properties.areaDesc || "").toUpperCase();
                 let bbox = hasGeometry ? turf.bbox(alert) : null;

                 zipCodes.forEach(z => {
                    let isMatch = false;
                    if (hasGeometry && bbox) {
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], alert)) isMatch = true;
                        }
                    }
                    if (!isMatch) {
                        if (z.county && z.state && areaDesc.includes(`${z.county}, ${z.state}`.toUpperCase())) isMatch = true;
                    }
                    if (isMatch) selectedZips.add(z.zip);
                 });
            });
            
            if (selectedZips.size === 0) {
                alert("No targets found.");
                setStatus("Ready");
                setLoading(false);
                return;
            }
            
            const zipList = Array.from(selectedZips);
            const sqlContent = generateSQL(exportConfig, zipList, selectedNAICS, actionType === 'COUNT');

            if (actionType === 'COPY' || actionType === 'COUNT') {
                navigator.clipboard.writeText(sqlContent).then(() => {
                    alert(`${actionType} SQL copied to clipboard!`);
                    setStatus("SQL Copied.");
                });
            } else {
                const blob = new Blob([sqlContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'heat_targets.sql');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setStatus(`Exported SQL for ${selectedZips.size} zip codes.`);
            }
             
             setLoading(false);
         }, 100);
    };


    return (
        <>
            {showRegulations && <RegulationsModal onClose={() => setShowRegulations(false)} />}
            <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', 
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>☀️</span> Heat Mode
                        </h3>
                         <div className="sidebar-input-group">
                            <label className="sidebar-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Archive Date</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{ 
                                        padding: '8px', 
                                        borderRadius: '6px', 
                                        border: '1px solid rgba(255,255,255,0.2)', 
                                        width: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white' // 'white' text against orange background
                                    }}
                                />
                                {date && (
                                    <button 
                                        onClick={() => setDate("")}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                        title="Return to Live Data"
                                    >
                                        ↺
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="sidebar-section">
                            <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                DATA CONTROLS
                            </label>
                            <button 
                                className="export-btn" 
                                onClick={() => fetchAlerts()} 
                                disabled={loading} 
                                style={{ 
                                    width: '100%', 
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    fontWeight: '600'
                                }}
                            >
                                ↺ Refresh Feed
                            </button>
                        </div>

                        <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                             <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                ALERTS LIST ({alerts.features.length})
                            </label>
                            <div style={{ flex: 1, overflowY: 'auto', minHeight: '200px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <AlertList
                                    alerts={alerts.features}
                                    title="" // Standardized layout handles title
                                    onExport={handleExport}
                                    onCopy={handleCopy}
                                    loading={loading}
                                />
                            </div>
                        </div>

                        <div className="sidebar-section">
                             <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                EXPORT CONFIG
                            </label>
                            <SQLExportControls 
                                config={exportConfig}
                                setConfig={setExportConfig}
                                selectedNAICS={selectedNAICS}
                                setSelectedNAICS={setSelectedNAICS}
                            />
                            <ExportActionButtons 
                                onExport={handleSQLExport}
                                loading={loading}
                                zipLoading={zipLoading}
                            />
                        </div>
                    </div>

                    <div className="sidebar-footer" style={{ padding: '12px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
                        <small style={{ color: '#6c757d' }}>{status}</small>
                    </div>
                </>
            }
            mapContent={
                 <MapComponent>
                    {/* WMS Layer for Heat Warnings */}
                    <WMSTileLayer
                        url="https://mapservices.weather.noaa.gov/arcgis/rest/services/WWA/watch_warn_adv/MapServer/exts/WMSServer"
                        layers="0,1" // 0=Warnings, 1=Watches? Verification needed on layer IDs but 0 usually catches warnings
                        format="image/png"
                        transparent={true}
                        opacity={0.5}
                         // Only show Heat related
                        layerDefs={'{"0":"prod_type IN (\'Excessive Heat Warning\', \'Heat Advisory\')","1":"prod_type IN (\'Excessive Heat Watch\')"}'}
                    />
                    
                    {/* Render GeoJSON on top if available (for precise hover/click) */}
                    {alerts.features.length < 500 && (
                        <GeoJSON 
                            key={`heat-geo-${alerts.features.length}`}
                            data={alerts}
                            style={{
                                color: '#ff4500',
                                weight: 1,
                                opacity: 0.6,
                                fillOpacity: 0.1
                            }}
                            onEachFeature={(feature, layer) => {
                                layer.bindTooltip(`${feature.properties.event}: ${feature.properties.areaDesc}`);
                            }}
                        />
                    )}
                </MapComponent>
            }
            rightPanel={
                // Right panel can be used for charts or detailed legend in future. 
                // For now, keeping AlertList in Left Panel as per Winter Mode standard? 
                // Wait, Winter Mode has AlertList in RIGHT panel.
                // Standardizing: Let's move AlertList to Right Panel to match Winter Mode.
               <>
                     <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: '#f8f9fa', 
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                             Active Heat Alerts
                        </h3>
                        <button 
                            onClick={() => setShowRegulations(true)}
                            style={{ 
                                background: '#fff', 
                                border: '1px solid #ced4da', 
                                borderRadius: '6px', 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#495057',
                                fontWeight: '500',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <span>📋</span> Heat Regulations
                        </button>
                    </div>

                    <div className="sidebar-content" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                         <AlertList
                            alerts={alerts.features}
                            title=""
                            onExport={handleExport}
                            onCopy={handleCopy}
                            loading={loading}
                        />
                    </div>
               </>
            }
        />
        </>
    );
};

export default HeatMode;
