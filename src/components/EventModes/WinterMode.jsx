import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import CountyLayer from '../MapOverlays/CountyLayer';
import Papa from 'papaparse'; 
import * as turf from '@turf/turf';

import { US_STATES, STATE_ABBREVIATIONS } from '../../utils/constants';
import { NWSService } from '../../services/nwsService';
import { formatWeatherAlert } from '../../services/weatherFormatter';

const WinterMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Winter Mode...");
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

    useEffect(() => {
        fetchAlerts();
    }, [date]);

    useEffect(() => {
        window._debug_alerts = alerts;
        window._debug_zipCodes = zipCodes;
        window._debug_turf = turf;
        console.log("Debug vars exposed on window");
    }, [alerts, zipCodes]);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus(date ? `Searching Archive for ${date}...` : "Fetching NWS Winter Storm Warnings...");

        try {
            const events = "Winter Storm Warning,Winter Weather Advisory";
            const data = await NWSService.fetchAlerts(date, events);

            console.log(`[WinterMode] Loaded ${data.features.length} alerts.`);

            if (data.features.length > 0) {
                const withGeometry = data.features.filter(f => f.geometry !== null).length;
                setAlerts(data);
                setStatus(date
                    ? `Found ${data.features.length} Historical Alerts for ${date} (${withGeometry} visible).`
                    : `Active: ${data.features.length} Winter Alerts (${withGeometry} visible).`
                );
            } else {
                setAlerts({ type: "FeatureCollection", features: [] });
                setStatus(date ? `No Winter alerts found for ${date}.` : "No active Winter Storm Warnings.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus(`Error: ${err.message}`);
            setAlerts(null);
        } finally {
            setLoading(false);
        }
    };

    // State for interactive selection
    const [focusedId, setFocusedId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // parseSnowAccumulation removed as it was unused

    // onEachFeature removed as it was unused

    // getProducts removed as it was unused

    const handleExport = async (mode = 'DOWNLOAD') => {
        if (!alerts || !alerts.features.length) {
            alert("No data to export.");
            return;
        }

        if (zipLoading) {
            alert("Zipcode database is still loading. Please wait 5 seconds and try again.");
            return;
        }

        // 1. Identify Target Alerts
        const targetAlerts = (selectedIds.size > 0)
            ? alerts.features.filter(f => selectedIds.has(f.properties.id))
            : alerts.features;

        if (targetAlerts.length === 0) {
            alert("No targets selected.");
            return;
        }

        setStatus("Checking alert geometries...");

        // 2. Fetch missing Zone Geometries (New Step)
        const enrichedAlerts = await Promise.all(targetAlerts.map(async (feature) => {
            if (feature.geometry) return feature;
            const zones = feature.properties.affectedZones || [];
            if (zones.length === 0) return feature;

            console.log(`[WinterMode] Fetching geometries for ${zones.length} zones...`);
            setStatus(`Fetching geometries for ${zones.length} affected zones...`);
            
            const zoneGeoms = [];
            for (const zoneUrl of zones) {
                const geom = await NWSService.fetchZoneGeometry(zoneUrl);
                if (geom) zoneGeoms.push(geom);
            }

            if (zoneGeoms.length === 0) return feature;

            return {
                ...feature,
                _fetchedGeometries: zoneGeoms
            };
        }));

        setStatus("Calculating affected zip codes...");

        // 3. Perform Spatial Intersection
        setTimeout(() => {
            // Map<ZipCode, {zipData, alertData}> to ensure unique zips but keep context
            const selectedZips = new Map();
            
            console.log(`[WinterMode] Exporting... ZipCodes: ${zipCodes.length}, Targets: ${enrichedAlerts.length}`);

            let bboxCount = 0;
            let polyCount = 0;
            let textCount = 0;

            enrichedAlerts.forEach(alertFeature => {
                const hasInlineGeometry = !!alertFeature.geometry;
                const fetchedGeometries = alertFeature._fetchedGeometries || [];
                const hasGeometry = hasInlineGeometry || fetchedGeometries.length > 0;
                
                const areaDesc = (alertFeature.properties.areaDesc || "").toUpperCase();

                // Pre-calc bboxes
                const activePolygons = [];
                if (hasInlineGeometry) activePolygons.push(alertFeature.geometry);
                if (fetchedGeometries.length > 0) activePolygons.push(...fetchedGeometries);

                const bboxes = activePolygons.map(geom => {
                    try { return turf.bbox(geom); } catch (e) { return null; }
                }).filter(b => b !== null);

                zipCodes.forEach(z => {
                    let isMatch = false;

                    // A. Geometric Match
                    if (hasGeometry) {
                        for (let i = 0; i < bboxes.length; i++) {
                            const bbox = bboxes[i];
                            const poly = activePolygons[i];
                            
                            if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                                bboxCount++;
                                if (turf.booleanPointInPolygon([z.lng, z.lat], poly)) {
                                    isMatch = true;
                                    polyCount++;
                                    break; 
                                }
                            }
                        }
                    }

                    // B. Text Match Fallback
                    if (!isMatch) {
                        if (z.usps_zip_county_name && z.state) {
                             const county = z.usps_zip_county_name || z.county;
                             if(county) {
                                 const searchStr = `${county}, ${z.state}`.toUpperCase();
                                 if (areaDesc.includes(searchStr)) {
                                     isMatch = true;
                                     textCount++;
                                 }
                             }
                        }
                    }

                    if (isMatch) {
                        // Only add if not already present (First alert wins for attribution)
                        if (!selectedZips.has(z.zip)) {
                            selectedZips.set(z.zip, {
                                zipData: z,
                                alertData: alertFeature.properties,
                                alertId: alertFeature.id
                            });
                        }
                    }
                });
            });

            if (selectedZips.size === 0) {
                setStatus(`Debug: BBoxPass=${bboxCount}, PolyPass=${polyCount}, TextPass=${textCount}, Targets=${enrichedAlerts.length}`);
                alert("No zip codes found within the selected alert areas.");
                return;
            }

            // 4. Generate CSV
            const csvData = Array.from(selectedZips.values()).map(item => {
                const z = item.zipData;
                const a = item.alertData;
                
                // Format the alert using our new service
                // Use a mock object structure if 'a' is just properties, or pass full object if available
                // formatWeatherAlert expects { properties: a } if 'a' is just properties
                const formatted = formatWeatherAlert({ properties: a });
                const links = formatted.searchLinks;

                return {
                    ZIP: z.zip,
                    CITY: z.city,
                    COUNTY: z.usps_zip_county_name || z.county || "N/A",
                    STATE: z.state,
                    EVENT_TYPE: a.event || "N/A",
                    DETAILS: (a.headline || a.description || a.areaDesc || "").substring(0, 500).replace(/(\r\n|\n|\r)/gm, " "), 
                    URL: item.alertId || "N/A",
                    // New Columns
                    NEWS_SEARCH: links.newsSearch,
                    LOCAL_NEWS: links.localNews,
                    CONDITIONS_URL: links.currentConditions,
                    IMPACT_URL: links.impactReports,
                    SAFETY_URL: links.safetyInfo
                };
            });

            const csv = Papa.unparse(csvData);

            if (mode === 'COPY') {
                navigator.clipboard.writeText(csv).then(() => {
                    alert(`Copied ${selectedZips.size} zip codes to clipboard!`);
                    setStatus(`Copied ${selectedZips.size} zip codes from ${enrichedAlerts.length} alerts.`);
                }).catch(err => {
                    console.error("Copy failed", err);
                    alert("Failed to copy to clipboard. See console.");
                });
            } else {
                // DOWNLOAD
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const filename = `winter_storm_zipcodes_${new Date().toISOString().slice(0,10)}.csv`;
                link.setAttribute('download', filename);
                link.download = filename; 
                document.body.appendChild(link);
                link.click();
                
                // Increased delay for reliability
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 2000);

                setStatus(`Exported ${selectedZips.size} unique zip codes from ${enrichedAlerts.length} alerts.`);
            }
        }, 100);
    };

    const handleSQLExport = (actionType) => {
        if (!alerts || !alerts.features.length) {
            alert("No data to export.");
            return;
        }

        if (zipLoading) {
            alert("Zipcode database is still loading. Please wait 5 seconds and try again.");
            return;
        }

        // 1. Identify Target Alerts
        const targetAlerts = (selectedIds.size > 0)
            ? alerts.features.filter(f => selectedIds.has(f.properties.id))
            : alerts.features;

        if (targetAlerts.length === 0) {
            alert("No targets selected.");
            return;
        }

        setStatus("Generating SQL...");

        setTimeout(() => {
            const selectedZips = new Set();

            targetAlerts.forEach(alertFeature => {
                const hasGeometry = !!alertFeature.geometry;
                const areaDesc = (alertFeature.properties.areaDesc || "").toUpperCase();

                let bbox = null;
                if (hasGeometry) {
                    bbox = turf.bbox(alertFeature);
                }

                zipCodes.forEach(z => {
                    let isMatch = false;
                    // 1. Geometric Match
                    if (hasGeometry && bbox) {
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], alertFeature)) {
                                isMatch = true;
                            }
                        }
                    }
                    // 2. Text Match Fallback
                    if (!isMatch && !hasGeometry) {
                         if (z.county && z.state) {
                             const searchStr = `${z.county}, ${z.state}`.toUpperCase();
                             if (areaDesc.includes(searchStr)) {
                                 isMatch = true;
                             }
                         }
                    }

                    if (isMatch) {
                        selectedZips.add(z.zip); // Store zip string only
                    }
                });
            });

            if (selectedZips.size === 0) {
                alert("No target zip codes found.");
                setStatus("Ready");
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
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.Related_Account__c = c.Id\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
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

                const naicsFields = selectedNAICS.size > 0 ? ", org.NAICS___c, org.NAICS_Description__c" : "";
                
                const sqlContent = `Select ${allFields.map(f => `s.${f}`).join(", ")}${naicsFields}
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.Related_Account__c = c.Id\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
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
                    const blob = new Blob([sqlContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'winter_targets.sql');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setStatus(`Exported SQL for ${selectedZips.size} zip codes.`);
                }
            }
        }, 100);
    };

    // formatTarget removed as it was unused

    // Interaction Handlers
    const handleAlertClick = (alert) => {
        setFocusedId(alert.properties.id);
    };

    const handleAlertToggle = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Helper to get FIPS from an alert feature
    const getFips = (feature) => {
        const geocode = feature.properties.geocode;
        if (geocode && geocode.SAME) {
            return geocode.SAME.map(code => code.slice(1));
        }
        return [];
    };

    // Calculate FIPS lists for layers
    // 1. Focused
    const focusedFeature = alerts?.features.find(f => f.properties.id === focusedId);
    const focusedFips = focusedFeature ? getFips(focusedFeature) : [];

    // 2. Selected
    const selectedFips = alerts?.features
        .filter(f => selectedIds.has(f.properties.id))
        .flatMap(getFips) || [];

    // 3. Active (All visible, for background context)
    const activeFips = alerts?.features.flatMap(getFips) || [];


    return (
        <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <h3>Winter Mode</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                <strong>Date Range</strong>
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                }}
                            />
                            {!date && <small style={{ color: '#00cc00', fontSize: '10px' }}>● Live Data</small>}
                            {date && <button onClick={() => setDate("")} style={{ marginTop: '5px', fontSize: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#0066cc', textDecoration: 'underline' }}>Return to Live</button>}
                        </div>
                    </div>

                    <div className="sidebar-content">
                         <div className="sidebar-input-group">
                            <label className="sidebar-label">Controls</label>
                            <button className="export-btn" onClick={fetchAlerts} disabled={loading} style={{ width: '100%', marginBottom: '10px' }}>
                                Refresh Data
                            </button>
                        </div>
                        
                        <div className="sidebar-input-group">
                            <label className="sidebar-label">Export Data</label>
                            <div style={{ marginTop: '10px' }}>
                                <SQLExportControls 
                                    config={exportConfig}
                                    setConfig={setExportConfig}
                                    selectedNAICS={selectedNAICS}
                                    setSelectedNAICS={setSelectedNAICS}
                                />
                            </div>

                            <ExportActionButtons 
                                onExport={handleSQLExport}
                                loading={loading}
                                zipLoading={zipLoading}
                            />
                            
                        </div>
                        
                        <div style={{ padding: '10px', fontSize: '11px', color: '#999', borderTop: '1px solid #eee' }}>
                            {status}
                        </div>
                    </div>
                </>
            }
            mapContent={
                <MapComponent>
                    <WMSTileLayer
                        url="https://mapservices.weather.noaa.gov/arcgis/rest/services/WWA/watch_warn_adv/MapServer/exts/WMSServer"
                        layers="0"
                        format="image/png"
                        transparent={true}
                        opacity={0.6}
                        layerDefs={'{"0":"prod_type=\'Winter Storm Warning\' OR prod_type=\'Winter Weather Advisory\'"}'}
                    />
                    <CountyLayer
                        activeFips={activeFips}
                        focusedFips={focusedFips}
                        selectedFips={selectedFips}
                        style={{ color: '#00BFFF', weight: 1, fillOpacity: 0.2 }}
                    />
                </MapComponent>
            }
            rightPanel={
                <AlertList
                    alerts={alerts ? alerts.features : []}
                    title={date ? `Archive: ${date}` : "Winter Warnings"}
                    onExport={() => handleExport('DOWNLOAD')}
                    onCopy={() => handleExport('COPY')}
                    onAlertClick={handleAlertClick}
                    onAlertToggle={handleAlertToggle}
                    selectedIds={selectedIds}
                    focusedId={focusedId}
                />
            }
        />
    );
};

export default WinterMode;
