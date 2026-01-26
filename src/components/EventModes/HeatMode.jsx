import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';

const HeatMode = () => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Heat Mode...");

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus("Fetching NWS Heat Warnings...");
        try {
            // Fetch Excessive Heat Warning and Heat Advisory
            // API allows comma separated events? No, usually one by one or all.
            // We can fetch all and filter client side for better coverage or make two requests.
            // Fetch all active alerts without parameters to avoid 400 Bad Request
            const url = 'https://api.weather.gov/alerts/active';
            console.log(`[HeatMode] Fetching: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': '(myweatherapp.com, contact@myweatherapp.com)',
                    'Accept': 'application/geo+json'
                }
            });
            console.log(`[HeatMode] Response Status: ${response.status}`);

            const rawData = await response.json();

            if (!rawData.features) {
                console.error("[HeatMode] Invalid response (no features):", rawData);
                setStatus(`Error: NWS API returned ${rawData.title || "unexpected format"}`);
                return;
            }

            // Filter client-side
            const targetEvents = ["Excessive Heat Warning", "Heat Advisory"];
            const features = rawData.features.filter(f => targetEvents.includes(f.properties.event));

            const data = { ...rawData, features: features };

            console.log(`[HeatMode] Filtered ${rawData.features.length} total alerts to ${features.length} Heat events.`);

            if (features.length > 0) {
                const withGeometry = features.filter(f => f.geometry !== null).length;
                console.log(`[HeatMode] Features with geometry: ${withGeometry} / ${features.length}`);

                setAlerts(data);
                setStatus(`Loaded ${features.length} Heat Alerts (${withGeometry} visible).`);
            } else {
                setStatus("No active Heat Alerts found.");
                console.warn("[HeatMode] 0 matched events found.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus("Error fetching NWS data.");
        } finally {
            setLoading(false);
        }
    };

    const parseHeatIndex = (description) => {
        // Regex to find "heat index values up to X" or "X degrees"
        const tempRegex = /heat index.*?(\d+)/i;
        const match = description.match(tempRegex);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 0;
    };

    const onEachFeature = (feature, layer) => {
        const props = feature.properties;
        const heatIndex = parseHeatIndex(props.description || "");
        const isWarning = props.event === "Excessive Heat Warning";

        layer.bindPopup(`
      <strong>${props.event}</strong><br/>
      Expires: ${new Date(props.expires).toLocaleString()}<br/>
      Est. Heat Index: ${heatIndex > 0 ? heatIndex + "°F" : "High"}<br/>
      Area: ${props.areaDesc}
    `);

        layer.setStyle({
            fillColor: isWarning ? '#FF0000' : '#FF4500', // Red (Warning) vs Orange (Advisory)
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.5
        });
    };

    const getProducts = () => {
        return [
            { category: "Cooling", skus: ["Portable AC", "Industrial Drum Fan", "Spot Cooler"] },
            { category: "Safety", skus: ["Electrolyte Powder", "Bulk Water", "Cooling Towels"] }
        ];
    };

    const handleExport = () => {
        if (!alerts || !alerts.features.length) {
            alert("No data to export.");
            return;
        }

        const targets = alerts.features.map(f => ({
            event_id: f.properties.id,
            event_type: "HEATWAVE",
            timestamp: f.properties.sent,
            expires: f.properties.expires,
            area: f.properties.areaDesc,
            heat_index: parseHeatIndex(f.properties.description || ""),
            alert_type: f.properties.event,
            suggested_products: getProducts().map(p => p.category).join("; ")
        }));

        if (targets.length === 0) {
            alert("No matching targets found.");
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
        link.setAttribute('download', 'heatwave_targets.json');
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

export default HeatMode;
