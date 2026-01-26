import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';

const FluMode = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [fluData, setFluData] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Flu Mode...");

    useEffect(() => {
        fetchStatesAndFlu();
    }, []);

    const fetchStatesAndFlu = async () => {
        setLoading(true);
        setStatus("Fetching State Boundaries & CDC Flu Data...");
        try {
            // 1. Fetch GeoJSON
            const geoUrl = `${import.meta.env.BASE_URL}us_states.json`;
            console.log(`[FluMode] Fetching States: ${geoUrl}`);
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            console.log(`[FluMode] States Loaded: ${geoData.features.length} features`);
            setGeoJsonData(geoData);

            // 2. Fetch Flu Data
            // Real API: https://gis.cdc.gov/grasp/fluview3/fluview3service/phase2/stateILINet
            // For this utility demo, we will simulate "High Activity" in randomized states
            // to demonstrate the "Remediation Logic" without relying on the complex CDC authentication/CORS.

            const simulatedData = {};
            geoData.features.forEach(f => {
                // Random activity level 1-10
                // Bias towards winter/high for demo
                const level = Math.floor(Math.random() * 10) + 1;
                simulatedData[f.properties.NAME] = level;
            });

            setFluData(simulatedData);
            setStatus("Loaded Flu Activity Data.");

        } catch (err) {
            console.error("Failed to load data", err);
            setStatus("Error loading Flu data.");
        } finally {
            setLoading(false);
        }
    };

    const styleState = (feature) => {
        const level = fluData[feature.properties.NAME] || 0;
        let color = '#ccc';
        if (level > 8) color = '#8B0000'; // Dark Red (High)
        else if (level > 5) color = '#FF4500'; // Orange (Mod)
        else if (level > 2) color = '#FFFF00'; // Yellow (Low)
        else color = '#00FF00'; // Green (Minimal)

        return {
            fillColor: color,
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature, layer) => {
        const level = fluData[feature.properties.NAME] || "N/A";
        const statusText = level > 8 ? "HIGH (Remediation Needed)" : "Normal";

        layer.bindTooltip(`
      <strong>${feature.properties.NAME}</strong><br/>
      Activity Level: ${level}<br/>
      Status: ${statusText}
    `, { sticky: true });
    };

    const getProducts = () => {
        return [
            { category: "Sanitation", skus: ["Bulk Hand Sanitizer", "Disinfectant Wipes (EPA List N)", "Touchless Dispensers"] },
            { category: "PPE", skus: ["Nitrile Gloves", "Face Masks"] }
        ];
    };

    const handleExport = () => {
        if (!geoJsonData) return;

        // Filter Logic: State Activity Level > 8
        const targets = [];
        geoJsonData.features.forEach(f => {
            const level = fluData[f.properties.NAME] || 0;
            if (level > 8) {
                targets.push({
                    event_id: `FLU-${new Date().getFullYear()}-${f.properties.NAME.toUpperCase().slice(0, 3)}`,
                    event_type: "FLU_OUTBREAK",
                    timestamp: new Date().toISOString(),
                    state: f.properties.NAME,
                    activity_level: level,
                    suggested_products: getProducts().map(p => p.category).join("; ")
                });
            }
        });

        if (targets.length === 0) {
            alert("No states with High Activity (>8) found.");
            return;
        }

        const exportObj = {
            generated_at: new Date().toISOString(),
            event_type: "FLU_OUTBREAK",
            targets: targets
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'flu_remediation_targets.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setStatus(`Exported ${targets.length} high-risk states.`);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div className="map-interaction-container">
                <div className="info-panel">
                    <strong>Status:</strong> {status} <br />
                    <small>(Simulated Live Data)</small>
                </div>

                <button className="export-btn" onClick={fetchStatesAndFlu} disabled={loading}>
                    Resimulate Data
                </button>

                <button className="export-btn" onClick={handleExport} disabled={loading || !geoJsonData}>
                    Export Target List
                </button>
            </div>

            <MapComponent>
                {geoJsonData && (
                    <GeoJSON
                        data={geoJsonData}
                        style={styleState}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapComponent>
        </div>
    );
};

export default FluMode;
