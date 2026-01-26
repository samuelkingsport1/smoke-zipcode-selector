import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';

const FloodMode = () => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Flood/Hurricane Mode...");

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus("Fetching NWS Flood & Hurricane Warnings...");
        try {
            // Fetch Flash Flood Warning and Hurricane Warning via /alerts/active
            const url = 'https://api.weather.gov/alerts/active?event=Flash%20Flood%20Warning,Hurricane%20Warning&limit=50';
            console.log(`[FloodMode] Fetching: ${url}`);

            const response = await fetch(url);
            console.log(`[FloodMode] Response Status: ${response.status}`);

            const data = await response.json();
            console.log("[FloodMode] Data received:", data);

            if (data.features && data.features.length > 0) {
                const withGeometry = data.features.filter(f => f.geometry !== null).length;
                console.log(`[FloodMode] Features with geometry: ${withGeometry} / ${data.features.length}`);

                setAlerts(data);
                setStatus(`Loaded ${data.features.length} Flood/Hurricane Alerts (${withGeometry} visible).`);
            } else {
                setStatus("No Flood/Hurricane Alerts found.");
                console.warn("[FloodMode] features array is empty.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus("Error fetching NWS data.");
        } finally {
            setLoading(false);
        }
    };

    const onEachFeature = (feature, layer) => {
        const props = feature.properties;
        const isHurricane = props.event === "Hurricane Warning";

        layer.bindPopup(`
      <strong>${props.event}</strong><br/>
      Expires: ${new Date(props.expires).toLocaleString()}<br/>
      Severity: ${props.severity}<br/>
      Area: ${props.areaDesc}
    `);

        layer.setStyle({
            fillColor: isHurricane ? '#800080' : '#0000FF', // Purple (Hurricane) vs Blue (Flood)
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.5
        });
    };

    const getProducts = (eventType) => {
        if (eventType === "Hurricane Warning") {
            return [
                { category: "Restoration", skus: ["Dehumidifier", "Air Mover", "Mold Inhibitor"] },
                { category: "Power", skus: ["Gas Generator", "Extension Cord", "Surge Protector"] }
            ];
        } else {
            // Flood
            return [
                { category: "Restoration", skus: ["Dehumidifier", "Air Mover", "Sump Pump"] },
                { category: "Cleanup", skus: ["Wet/Dry Vac", "Disinfectant"] }
            ];
        }
    };

    const handleExport = () => {
        if (!alerts || !alerts.features.length) {
            alert("No data to export.");
            return;
        }

        const targets = alerts.features.map(f => ({
            event_id: f.properties.id,
            event_type: f.properties.event.toUpperCase().replace(/\s/g, '_'),
            timestamp: f.properties.sent,
            expires: f.properties.expires,
            area: f.properties.areaDesc,
            summary: f.properties.headline,
            suggested_products: getProducts(f.properties.event).flatMap(g => g.skus).join("; ")
        }));

        if (targets.length === 0) {
            alert("No matching targets found.");
            return;
        }

        const exportObj = {
            generated_at: new Date().toISOString(),
            event_type: "FLOOD_HURRICANE",
            targets: targets
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'flood_hurricane_targets.json');
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

export default FloodMode;
