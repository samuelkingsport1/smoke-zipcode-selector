import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';
import DashboardLayout from '../Dashboard/DashboardLayout';

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

    // Helper to get high risk states for the sidebar list
    const highRiskStates = geoJsonData ? geoJsonData.features
        .filter(f => (fluData[f.properties.NAME] || 0) > 8)
        .sort((a, b) => (fluData[b.properties.NAME] || 0) - (fluData[a.properties.NAME] || 0))
        : [];

    return (
        <DashboardLayout
            sidebarContent={
                <>
                    <div className="sidebar-header">
                        <h3>Flu Activity <span className="badge">{highRiskStates.length} High</span></h3>
                    </div>

                    <div className="sidebar-content">
                        {/* List High Risk States */}
                        {highRiskStates.length > 0 ? (
                            highRiskStates.map((f, i) => (
                                <div key={i} className="alert-card">
                                    <div className="alert-card-header">
                                        <strong>{f.properties.NAME}</strong>
                                        <span className="status-dot active"></span>
                                    </div>
                                    <div className="alert-card-body">
                                        <span style={{ fontWeight: 'bold' }}>Activity Level: {fluData[f.properties.NAME]}</span>
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#c92a2a' }}>REMEDIATION NEEDED</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="alert-list-empty">
                                <p>No high activity states found.</p>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-footer">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="export-btn" onClick={fetchStatesAndFlu} disabled={loading} style={{ width: '100%', backgroundColor: '#6c757d' }}>
                                Resimulate Data
                            </button>

                            <button className="export-btn" onClick={handleExport} disabled={loading || !geoJsonData} style={{ width: '100%' }}>
                                Export Target List
                            </button>
                            <small style={{ color: '#6c757d', textAlign: 'center', marginTop: '5px' }}>{status}</small>
                        </div>
                    </div>
                </>
            }
            mapContent={
                <MapComponent>
                    {geoJsonData && (
                        <GeoJSON
                            data={geoJsonData}
                            style={styleState}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapComponent>
            }
        />
    );
};

export default FluMode;
