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
import * as turf from '@turf/turf';

const FloodMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState({ type: "FeatureCollection", features: [] });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Flood Mode...");
    const [date, setDate] = useState(""); // Empty = Live
    
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
        setStatus(date ? `Searching Archive for ${date}...` : "Fetching NWS Flood Warnings...");

        try {
            const events = "Flood Warning,Flash Flood Warning,Coastal Flood Warning";
            const data = await NWSService.fetchAlerts(date, events);

            console.log(`[FloodMode] Loaded ${data.features.length} flood alerts.`);

            if (data.features.length > 0) {
                setAlerts(data);
                setStatus(date
                    ? `Found ${data.features.length} Historical Alerts for ${date}.`
                    : `Active: ${data.features.length} Flood Alerts.`
                );
            } else {
                setAlerts({ type: "FeatureCollection", features: [] });
                setStatus(date ? `No Flood alerts found for ${date}.` : "No active Flood Warnings.");
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
            { category: "Cleanup", skus: ["Sump Pump", "Wet/Dry Vac", "Dehumidifier"] },
            { category: "Protection", skus: ["Sandbags", "Tarps", "Generators"] }
        ];
    };

    // Standardized Export Logic with Zone Fetching
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
                // It's a zone-based alert
                const zoneUrl = alert.properties.affectedZones[0]; 
                
                try {
                    let geometry = zoneCache.get(zoneUrl);
                    if (!geometry) {
                        geometry = await nwsService.fetchZoneGeometry(zoneUrl);
                        if (geometry) zoneCache.set(zoneUrl, geometry);
                    }
                    
                    if (geometry) {
                        enrichedAlerts.push({
                            ...alert,
                            geometry: geometry // Polyfill the geometry
                        });
                        continue; // Done with this alert
                    }
                } catch (error) {
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
                const eventName = alert.properties.event || "Flood Warning";

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
                event_type: "FLOOD",
                targets: targets
            };

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'flood_targets.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus(`Exported ${targets.length} targets.`);
            setLoading(false);
        }, 100);
    };

    const handleCopy = () => {
         console.log("Copy not fully implemented for full spatial check yet.");
    };

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
            const zipString = zipList.map(z => `'${z}'`).join(", ");
            const { filters, recordType, fields, sortBy } = exportConfig;
            
             // Construct Filter Clauses
             let filterClauses = "";
             if (filters.activeStatus) filterClauses += "\\nAND c.Status__c = 'Active'";
             if (filters.lastActivityMonths) filterClauses += `\\nAND c.LastActivityDate >= DATEADD(month, -${filters.lastActivityMonths}, GETDATE())`;
             if (filters.lastOrderMonths) filterClauses += `\\nAND c.LastOrderDate__c >= DATEADD(month, -${filters.lastOrderMonths}, GETDATE())`;
             if (filters.minTotalSales) filterClauses += `\\nAND c.Total_Sales_LY__c >= ${filters.minTotalSales}`;
             
             const naicsFields = selectedNAICS.size > 0 ? ", org.NAICS___c, org.NAICS_Description__c" : "";
             const orderByClause = sortBy ? `\\nORDER BY s.${sortBy} DESC NULLS LAST` : "";

             let sqlContent = "";
             
             if (actionType === 'COUNT') {
                sqlContent = `Select count(s.id)
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.ParentId = c.Id\\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}`;
             } else {
                 const baseFields = ["id", "Name", "CUST_ID__C"];
                 const additionalFields = Object.keys(fields).filter(key => fields[key]);
                 const allFields = [...baseFields, ...additionalFields].join(", ");
                 
                 sqlContent = `Select ${allFields.map(f => `s.${f}`).join(", ")}${naicsFields}
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.ParentId = c.Id\\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}${orderByClause}`;
             }
             
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
                 link.setAttribute('download', 'flood_targets.sql');
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 setStatus(`Exported SQL for ${selectedZips.size} zip codes.`);
             }
             
             setLoading(false);
         }, 100);
    };

    return (
        <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue water theme
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>💧</span> Flood Mode
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
                                        color: 'white'
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
                    {/* WMS Layer for Flood Warnings */}
                    <WMSTileLayer
                        url="https://mapservices.weather.noaa.gov/arcgis/rest/services/WWA/watch_warn_adv/MapServer/exts/WMSServer"
                        layers="0"
                        format="image/png"
                        transparent={true}
                        opacity={0.5}
                        layerDefs={'{"0":"prod_type IN (\'Flood Warning\', \'Flash Flood Warning\', \'Coastal Flood Warning\')"}'}
                    />
                    
                    {/* Render GeoJSON on top if available (for precise hover/click) */}
                    {alerts.features.length < 500 && (
                        <GeoJSON 
                            key={`flood-geo-${alerts.features.length}`}
                            data={alerts}
                            style={{
                                color: '#00BFFF',
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
               <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: '#f8f9fa', 
                        borderBottom: '1px solid #eee' 
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                             Active Flood Alerts
                        </h3>
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
    );
};

export default FloodMode;
