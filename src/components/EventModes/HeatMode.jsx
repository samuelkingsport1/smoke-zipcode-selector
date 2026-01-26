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
            // Let's try fetching all active alerts and filtering, or just use "Excessive Heat Warning" as the primary trigger.
            // Brief says "Heat Index > 100".

            const url = 'https://api.weather.gov/alerts?event=Excessive%20Heat%20Warning,Heat%20Advisory&limit=50';
            console.log(`[HeatMode] Fetching: ${url}`);

            const response = await fetch(url);
            console.log(`[HeatMode] Response Status: ${response.status}`);

            const data = await response.json();
            console.log("[HeatMode] Data received:", data);

            if (data.features && data.features.length > 0) {
                setAlerts(data);
                setStatus(`Loaded ${data.features.length} Heat Alerts.`);
            } else {
                setStatus("No Heat Alerts found.");
                console.warn("[HeatMode] features array is empty.");
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
