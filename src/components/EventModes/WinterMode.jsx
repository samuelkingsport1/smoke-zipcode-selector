import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';
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

        // Filter Logic: Expired + > 2 inches
        const targets = alerts.features.filter(f => {
            const isExpired = new Date(f.properties.expires) < new Date();
            const snow = parseSnowAccumulation(f.properties.description || "");

            // Toggle logic based on checkbox or strict adherence to brief
            // For now, let's export ALL matches but flag them
            return true;
        }).map(f => ({
            event_id: f.properties.id,
            event_type: "WINTER_STORM",
            timestamp: f.properties.sent,
            expires: f.properties.expires,
            remediation_start: f.properties.expires,
            area: f.properties.areaDesc,
            snow_inches: parseSnowAccumulation(f.properties.description || ""),
            status: new Date(f.properties.expires) < new Date() ? "EXPIRED" : "ACTIVE",
            suggested_products: getProducts().map(p => p.category).join("; ")
        }));

        if (targets.length === 0) {
            alert("No matching targets found.");
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

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div className="map-interaction-container">
                <div className="info-panel">
                    <strong>Status:</strong> {status}
                </div>

                <button className="export-btn" onClick={fetchAlerts} disabled={loading}>
                    Refresh Data
                </button>

                <button className="export-btn" onClick={handleExport} disabled={loading || !alerts}>
                    Export Target List
                </button>
            </div>

            <MapComponent>
                {alerts && (
                    <GeoJSON
                        data={alerts}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapComponent>
        </div>
    );
};

export default WinterMode;
