import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import CountyLayer from '../MapOverlays/CountyLayer';
import Papa from 'papaparse'; // For CSV Export if needed, or we construct manually
import * as turf from '@turf/turf';

import { US_STATES, STATE_ABBREVIATIONS } from '../../utils/constants';

const WinterMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Winter Mode...");
    const [filterExpired, setFilterExpired] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus("Fetching NWS Winter Storm Warnings...");
        try {
            const url = 'https://api.weather.gov/alerts/active';
            console.log(`[WinterMode] Fetching: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': '(myweatherapp.com, contact@myweatherapp.com)',
                    'Accept': 'application/geo+json'
                }
            });
            const rawData = await response.json();

            if (!rawData.features) {
                setStatus(`Error: NWS API returned ${rawData.title || "unexpected format"}`);
                return;
            }

            // Filter 1: correct event types
            const targetEvents = ["Winter Storm Warning", "Winter Weather Advisory"];

            // Filter 2: Must be in a US State (exclude Canada/Marine if NWS leaks them)
            // Strategy: Check if areaDesc contains a valid State Name or Abbreviation
            const features = rawData.features.filter(f => {
                if (!targetEvents.includes(f.properties.event)) return false;

                const areaDesc = f.properties.areaDesc || "";

                // Simple check: does the string contain a state abbreviation?
                // NWS format: "Miami-Dade, FL; Broward, FL"
                return STATE_ABBREVIATIONS.some(abbr => areaDesc.includes(`, ${abbr}`) || areaDesc.includes(` ${abbr} `));
            });

            const data = { ...rawData, features: features };

            console.log(`[WinterMode] Filtered to ${features.length} valid US Winter events.`);

            if (features.length > 0) {
                const withGeometry = features.filter(f => f.geometry !== null).length;
                setAlerts(data);
                setStatus(`Loaded ${features.length} Winter Alerts (${withGeometry} visible).`);
            } else {
                setStatus("No active Winter Storm Warnings found.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus("Error fetching NWS data.");
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
                if (!alertFeature.geometry) return; // Skip alerts without shapes

                // NWS sometimes returns MultiPolygon or Polygon
                // Turf handles GeoJSON input natively

                // Optimization: Bounding Box Check first
                const bbox = turf.bbox(alertFeature); // [minX, minY, maxX, maxY]

                zipCodes.forEach(z => {
                    // Fast BBox filter
                    if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                        // Precise Point-In-Polygon check
                        // booleanPointInPolygon verifies if the zip centroid is inside the warning area
                        if (turf.booleanPointInPolygon([z.lng, z.lat], alertFeature)) {
                            // Add Alert Type to the match so we can list why it was selected?
                            // User requirement: "Export standard list of counties and zip codes"
                            // Just unique zip/county rows for now.
                            selectedZips.add(JSON.stringify(z)); // Use string for Set uniqueness
                        }
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
                    <AlertList
                        alerts={alerts ? alerts.features : []}
                        title="Winter Warnings"
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
