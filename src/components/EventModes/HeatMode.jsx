import React, { useEffect, useState } from 'react';
import { GeoJSON, WMSTileLayer } from 'react-leaflet';
import MapComponent from '../MapContainer';
import AlertList from '../Dashboard/AlertList';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { US_STATES, STATE_ABBREVIATIONS } from '../../utils/constants';
import { NWSService } from '../../services/nwsService';

const HeatMode = ({ zipCodes = [], zipLoading = false }) => {
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Initializing Heat Mode...");
    const [date, setDate] = useState(""); // Empty = Live

    useEffect(() => {
        fetchAlerts();
    }, [date]);

    const fetchAlerts = async () => {
        setLoading(true);
        setStatus(date ? `Searching Archive for ${date}...` : "Fetching NWS Heat Warnings...");

        try {
            const events = "Excessive Heat Warning,Heat Advisory";
            const data = await NWSService.fetchAlerts(date, events);

            console.log(`[HeatMode] Loaded ${data.features.length} heat alerts.`);

            if (data.features.length > 0) {
                setAlerts(data);
                setStatus(date
                    ? `Found ${data.features.length} Historical Alerts for ${date}.`
                    : `Active: ${data.features.length} Heat Alerts.`
                );
            } else {
                setAlerts({ type: "FeatureCollection", features: [] });
                setStatus(date ? `No Heat alerts found for ${date}.` : "No active Heat Alerts.");
            }
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setStatus(`Error: ${err.message}`);
            setAlerts(null);
        } finally {
            setLoading(false);
        }
    };

    const parseHeatIndex = (description) => {
        const tempRegex = /heat index.*?(\d+)/i;
        const match = description.match(tempRegex);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 0;
    };

    const getProducts = () => {
        return [
            { category: "Cooling", skus: ["Portable AC", "Industrial Drum Fan", "Spot Cooler"] },
            { category: "Safety", skus: ["Electrolyte Powder", "Bulk Water", "Cooling Towels"] }
        ];
    };

    const handleExport = () => {
        if (!alerts || !alerts.features || !zipCodes || zipCodes.length === 0) {
            alert("No data to export or zip codes not loaded.");
            return;
        }

        setStatus("Processing export...");

        setTimeout(() => {
            const targets = [];
            const uniqueEntries = new Set();

            alerts.features.forEach(alert => {
                const hasGeometry = !!alert.geometry;
                const areaDesc = (alert.properties.areaDesc || "").toUpperCase();
                const eventName = alert.properties.event || "Heat Warning";

                let bbox = null;
                if (hasGeometry) {
                    bbox = turf.bbox(alert);
                }

                zipCodes.forEach(z => {
                    let isMatch = false;

                    // 1. Geometric Match
                    if (hasGeometry && bbox) {
                        if (z.lng >= bbox[0] && z.lng <= bbox[2] && z.lat >= bbox[1] && z.lat <= bbox[3]) {
                            if (turf.booleanPointInPolygon([z.lng, z.lat], alert)) {
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
                        const entryId = `${z.zip}-${eventName}`;
                        if (!uniqueEntries.has(entryId)) {
                            uniqueEntries.add(entryId);
                            targets.push({
                                zip: z.zip,
                                county: z.county,
                                state: z.state,
                                alert_name: eventName,
                                sent: alert.properties.sent,
                                expires: alert.properties.expires,
                                suggested_products: getProducts().map(p => p.category).join("; ")
                            });
                        }
                    }
                });
            });

            if (targets.length === 0) {
                alert("No matching targets found (checked geometry and county text).");
                setStatus("Ready");
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
        }, 100);
    };

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
                        title={date ? `Archive: ${date}` : "Heat Warnings"}
                        onExport={handleExport}
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
                        <WMSTileLayer
                            url="https://mapservices.weather.noaa.gov/arcgis/rest/services/WWA/watch_warn_adv/MapServer/exts/WMSServer"
                            layers="0"
                            format="image/png"
                            transparent={true}
                            opacity={0.6}
                            layerDefs={'{"0":"prod_type=\'Excessive Heat Warning\' OR prod_type=\'Heat Advisory\'"}'}
                        />
                    </MapComponent>
                </>
            }
        />
    );
};

export default HeatMode;
