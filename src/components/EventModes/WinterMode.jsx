import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import CountyLayer from '../MapOverlays/CountyLayer';
import Papa from 'papaparse'; // For CSV Export if needed, or we construct manually
import * as turf from '@turf/turf';

import { US_STATES, STATE_ABBREVIATIONS } from '../../utils/constants';
import { NWSService } from '../../services/nwsService';

const WinterMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Winter Mode...");
    const [date, setDate] = useState(""); // Empty = Live

    useEffect(() => {
        fetchAlerts();
    }, [date]);

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

    const parseSnowAccumulation = (description) => {
        // Regex to find "X inches" or "X to Y inches"
        // This is naive but a good start
        const inchRegex = /(\d+)(\s+to\s+\d+)?\s+inches/;
        const match = description.match(inchRegex);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 0;
    };

    const onEachFeature = (feature, layer) => {
        const props = feature.properties;
        const snow = parseSnowAccumulation(props.description || "");
        const isExpired = new Date(props.expires) < new Date();

        // Bind popup
        layer.bindPopup(`
      <strong>${props.event}</strong><br/>
      Expires: ${new Date(props.expires).toLocaleString()}<br/>
      Status: ${isExpired ? "EXPIRED (Remediation Ready)" : "ACTIVE"}<br/>
      Est. Snow: ${snow} inches<br/>
      Area: ${props.areaDesc}
    `);

        // Style
        layer.setStyle({
            fillColor: isExpired ? '#00BFFF' : '#00008B', // Light Blue (Remediation) vs Dark Blue (Active)
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.5
        });
    };

    // Product Mapping
    const getProducts = () => {
        return [
            { category: "Chemicals", skus: ["Floor Neutralizer", "Salt Dissolver"] },
            { category: "Hardware", skus: ["Wet/Dry Vac", "Mop Bucket", "Scraper Mat"] }
        ];
    };

    const handleExport = () => {
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

        setStatus("Calculating affected zip codes...");

        // 2. Perform Spatial Intersection (Polygon vs Zip Points)
        // This is strictly client-side. Turf is fast enough for <100 polygons vs 40k points.
        setTimeout(() => {
            const selectedZips = new Set();
            let processedCount = 0;

            targetAlerts.forEach(alertFeature => {
                const hasGeometry = !!alertFeature.geometry;
                const areaDesc = (alertFeature.properties.areaDesc || "").toUpperCase();

                // Pre-calc bbox if geometry exists
                let bbox = null;
                if (hasGeometry) {
                    bbox = turf.bbox(alertFeature);
                }

                zipCodes.forEach(z => {
                    let isMatch = false;

                    // 1. Geometric Match (High Precision)
                    if (hasGeometry && bbox) {
                        // Fast BBox filter
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], alertFeature)) {
                                isMatch = true;
                            }
                        }
                    }

                    // 2. Text Match Fallback (If geometry missing or to catch edge cases)
                    // If no geometry, we MUST use text match.
                    // Risk: "Clay" matches "Clayton". 
                    // Mitigation: Check for county + state if possible, or just county strict check if we can.
                    // For now: Simple inclusion check, but verify State if available in Zip
                    if (!isMatch && !hasGeometry) {
                        // NWS areaDesc usually: "Cook, IL; Lake, IL"
                        // Zip: county="COOK", state="IL"
                        if (z.county && z.state) {
                            const searchStr = `${z.county}, ${z.state}`.toUpperCase(); // "COOK, IL"
                            if (areaDesc.includes(searchStr)) {
                                isMatch = true;
                            }
                            // Fallback: Just County Name if "State" is not in areaDesc (unlikely for NWS, but possible)
                            // else if (areaDesc.includes(z.county.toUpperCase())) { ... }
                        }
                    }

                    if (isMatch) {
                        selectedZips.add(JSON.stringify(z));
                    }
                });
                processedCount++;
            });

            if (selectedZips.size === 0) {
                alert("No zip codes found within the selected alert areas.");
                setStatus("No zip codes found.");
                return;
            }

            // 3. Generate CSV
            const csvData = Array.from(selectedZips).map(json => {
                const z = JSON.parse(json);
                return {
                    ZIP: z.zip,
                    CITY: z.city,
                    COUNTY: z.county || "N/A", // Ensure county is populated if available
                    STATE: z.state,
                    // We could add Alert ID if one zip maps to multiple, but usually users want a distinct mailing list
                };
            });

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'winter_storm_zipcodes.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus(`Exported ${selectedZips.size} unique zip codes from ${targetAlerts.length} alerts.`);
        }, 100);
    };

    const formatTarget = (f) => ({
        event_id: f.properties.id,
        event_type: "WINTER_STORM",
        timestamp: f.properties.sent,
        expires: f.properties.expires,
        remediation_start: f.properties.expires,
        area: f.properties.areaDesc,
        snow_inches: parseSnowAccumulation(f.properties.description || ""),
        status: new Date(f.properties.expires) < new Date() ? "EXPIRED" : "ACTIVE",
        suggested_products: getProducts().map(p => p.category).join("; ")
    });

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
            sidebarContent={
                <>
                    <div className="sidebar-header" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
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

                    <AlertList
                        alerts={alerts ? alerts.features : []}
                        title={date ? `Archive: ${date}` : "Winter Warnings"}
                        onExport={handleExport}
                        onAlertClick={handleAlertClick}
                        onAlertToggle={handleAlertToggle}
                        selectedIds={selectedIds}
                        focusedId={focusedId}
                    />
                    <div style={{ padding: '10px', fontSize: '11px', color: '#999', borderTop: '1px solid #eee' }}>
                        {status}
                    </div>
                </>
            }
            mapContent={
                <>
                    <div className="map-interaction-container">
                        <button className="export-btn" onClick={fetchAlerts} disabled={loading}>
                            Refresh Data
                        </button>
                    </div>

                    <MapComponent>
                        {/* 
                            Use WMS Layer for visual rendering because API often returns null geometry for zones.
                            Layer 0 = Current Warnings
                            Filter: prod_type needs to match "Winter Storm Warning" etc.
                        */}
                        <WMSTileLayer
                            url="https://mapservices.weather.noaa.gov/arcgis/rest/services/WWA/watch_warn_adv/MapServer/exts/WMSServer"
                            layers="0"
                            format="image/png"
                            transparent={true}
                            opacity={0.6}
                            // ArcGIS WMS specific filter
                            layerDefs={'{"0":"prod_type=\'Winter Storm Warning\' OR prod_type=\'Winter Weather Advisory\'"}'}
                        />

                        {/* 
                             County Overlay for specific, sharp highlighting of affect counties
                        */}
                        <CountyLayer
                            activeFips={activeFips}
                            focusedFips={focusedFips}
                            selectedFips={selectedFips}
                            style={{ color: '#00BFFF', weight: 1, fillOpacity: 0.2 }}
                        />
                    </MapComponent>
                </>
            }
        />
    );
};

export default WinterMode;
