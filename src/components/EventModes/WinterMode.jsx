import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import CountyLayer from '../MapOverlays/CountyLayer';
import Papa from 'papaparse'; // For CSV Export if needed, or we construct manually

const WinterMode = () => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Winter Mode...");
    const [filterExpired, setFilterExpired] = useState(false); // Brief says "Expired", but for dev we might want to see active

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus("Fetching NWS Winter Storm Warnings...");
        try {
            // Fetching both active and recent could be tricky. 
            // /alerts/active only shows active. 
            // /alerts shows history but might be heavy.
            // Fetch all active alerts without parameters to avoid 400 Bad Request
            const url = 'https://api.weather.gov/alerts/active';
            console.log(`[WinterMode] Fetching: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': '(myweatherapp.com, contact@myweatherapp.com)',
                    'Accept': 'application/geo+json' // Explicitly ask for GeoJSON
                }
            });
            console.log(`[WinterMode] Response Status: ${response.status}`);

            const rawData = await response.json();

            if (!rawData.features) {
                console.error("[WinterMode] Invalid response (no features):", rawData);
                setStatus(`Error: NWS API returned ${rawData.title || "unexpected format"}`);
                return;
            }

            // Filter client-side
            const targetEvents = ["Winter Storm Warning", "Winter Weather Advisory"];
            const features = rawData.features.filter(f => targetEvents.includes(f.properties.event));

            const data = { ...rawData, features: features }; // Construct filtered object

            console.log(`[WinterMode] Filtered ${rawData.features.length} total alerts to ${features.length} Winter events.`);

            if (features.length > 0) {
                const withGeometry = features.filter(f => f.geometry !== null).length;
                console.log(`[WinterMode] Features with geometry: ${withGeometry} / ${features.length}`);

                setAlerts(data);
                setStatus(`Loaded ${features.length} Winter Alerts (${withGeometry} visible).`);
            } else {
                setStatus("No active Winter Storm Warnings found.");
                console.warn("[WinterMode] 0 matched events found.");
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

        // Filter: If items selected, export ONLY those. Else export ALL matching general logic.
        // User requested: "make the selected counties now part of the export" -> implies explicit selection overrides.

        let targets = [];

        if (selectedIds.size > 0) {
            // Export Selected Only
            targets = alerts.features.filter(f => selectedIds.has(f.properties.id)).map(formatTarget);
        } else {
            // Fallback: Export All (or filtered by expiry logic if we kept it)
            // For now, let's export all visible to keep it simple unless filtered
            targets = alerts.features.map(formatTarget);
        }

        if (targets.length === 0) {
            alert("No targets found.");
            return;
        }

        // Generate JSON for Marketing Team
        const exportObj = {
            generated_at: new Date().toISOString(),
            event_type: "WINTER_STORM",
            targets: targets
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'winter_remediation_targets.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setStatus(`Exported ${targets.length} targets.`);
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
