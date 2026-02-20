import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import { US_STATES } from '../../utils/constants';
import { fetchFluData, fetchCovidData, fetchRSVData } from '../../services/delphiService';
import { generateSQL } from '../../utils/sqlGenerator';

const RespiratoryMode = ({ zipCodes = [], zipLoading = false }) => {
    // Data State
    const [fluData, setFluData] = useState({});
    const [apiSources, setApiSources] = useState({ flu: null, covid: null, rsv: null });
    const [usGeoJSON, setUsGeoJSON] = useState(null);
    
    // Helper to format YYYYWW into a human readable date
    const formatEpiweek = (epiweek) => {
        if (!epiweek) return "Unknown";
        const str = String(epiweek);
        if (str.length !== 6) return str;
        
        const year = parseInt(str.substring(0, 4), 10);
        const week = parseInt(str.substring(4, 6), 10);
        
        // Epiweek 1 always contains Jan 4th.
        const jan4 = new Date(year, 0, 4);
        // Find Sunday of week 1
        const startOfWeek1 = new Date(jan4);
        startOfWeek1.setDate(jan4.getDate() - jan4.getDay());
        
        // Add elapsed weeks
        const targetWeekStart = new Date(startOfWeek1);
        targetWeekStart.setDate(startOfWeek1.getDate() + ((week - 1) * 7));
        
        return `Week of ${targetWeekStart.toLocaleDateString()}`;
    };
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("Initializing Respiratory Mode...");
    const [selectedStates, setSelectedStates] = useState(new Set()); // Set of State Names
    const [selectedTracker, setSelectedTracker] = useState('all'); // 'all', 'flu', 'covid', 'rsv'

    // Export Config
    const [selectedNAICS, setSelectedNAICS] = useState(new Set());
    const [exportConfig, setExportConfig] = useState({
        recordType: 'Site',
        fields: {
            'Last_Order_Date__C': true,
            'Total_LY_Sales__C': true,
            'Total_ty_Sales_to_Date__c': true
        },
        filters: {
            activeStatus: true,
            lastActivityMonths: '',
            lastOrderMonths: '',
            minTotalSales: ''
        },
        sortBy: ''
    });

    // 1. Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setStatus("Fetching Disease Data (CDC/Delphi)...");
            
            try {
                // Parallel Fetch
                const [flu, covid, rsv, geo] = await Promise.all([
                    fetchFluData(),
                    fetchCovidData(),
                    fetchRSVData(),
                    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(r => r.json())
                ]);

                setFluData(flu.processedData || {});
                setApiSources({
                    flu: flu.sourceUrl,
                    covid: covid.sourceUrl,
                    rsv: rsv.sourceUrl
                });
                setUsGeoJSON(geo);
                
                setStatus("Data Loaded. Select a state for details.");
            } catch (err) {
                console.error("Failed to load respiratory data", err);
                setStatus("Error loading data. See console.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getRiskLevel = (stateName) => {
        const f = fluData[stateName]?.level || 0;
        // COVID and RSV are temporarily disabled for calculation due to stale API data
        return f;
    };

    // Helper: Style Function for GeoJSON
    const styleState = (feature) => {
        const stateName = feature.properties.name;
        const level = getRiskLevel(stateName);
        
        let color = '#ccc'; // No Data
        if (level >= 9) color = '#d63384'; // Critical (Pink/Red)
        else if (level >= 7) color = '#fd7e14'; // High (Orange)
        else if (level >= 4) color = '#ffc107'; // Moderate (Yellow)
        else if (level >= 1) color = '#20c997'; // Low (Green)

        const isSelected = selectedStates.has(stateName);

        return {
            fillColor: color,
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#333' : 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    // Interaction
    const onEachState = (feature, layer) => {
        const stateName = feature.properties.name;
        const level = getRiskLevel(stateName);
        
        layer.bindTooltip(`${stateName}: Level ${level}/10`, { sticky: true });
        
        layer.on({
            click: () => {
                setSelectedStates(prev => {
                    const newSelection = new Set(prev);
                    if (newSelection.has(stateName)) {
                        newSelection.delete(stateName);
                    } else {
                        newSelection.add(stateName);
                    }
                    setTimeout(() => setStatus(`${newSelection.size} states selected.`), 10);
                    return newSelection;
                });
            }
        });
    };

    // Export Logic
    const handleExport = (actionType) => {
        if (selectedStates.size === 0) {
            alert("Please select at least one state on the map first.");
            return;
        }

        const stateAbbrs = new Set();
        selectedStates.forEach(name => {
            if (US_STATES[name]) stateAbbrs.add(US_STATES[name]);
        });

        if (stateAbbrs.size === 0) {
            alert("State abbreviation mapping failed.");
            return;
        }

        const selectionName = selectedStates.size === 1 ? Array.from(selectedStates)[0] : `${selectedStates.size} States`;
        const fileNameBase = selectedStates.size === 1 ? US_STATES[Array.from(selectedStates)[0]] : 'multiple_states';

        setStatus(`Exporting data for ${selectionName}...`);

        setTimeout(() => {
            // Filter ZipCodes for these states
            const targetZips = zipCodes.filter(z => stateAbbrs.has(z.state));
            
            if (targetZips.length === 0) {
                alert(`No zip codes found for ${selectionName} in database.`);
                setStatus("Ready");
                return;
            }

            const zipList = targetZips.map(z => z.zip);
            const sqlContent = generateSQL(exportConfig, zipList, selectedNAICS, actionType === 'COUNT');

             if (actionType === 'COPY' || actionType === 'COUNT') {
                 navigator.clipboard.writeText(sqlContent).then(() => {
                     alert(`${actionType} SQL copied!`);
                     setStatus("SQL Copied.");
                 });
             } else {
                 const blob = new Blob([sqlContent], { type: 'text/plain' });
                 const url = URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.setAttribute('download', `respiratory_targets_${fileNameBase}.sql`);
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 setStatus(`Exported SQL for ${selectionName}.`);
             }
        }, 100);
    };

    const handleCSVExport = () => {
        if (selectedStates.size === 0) {
            alert("Please select at least one state on the map first.");
            return;
        }

        const stateAbbrs = new Set();
        selectedStates.forEach(name => {
            if (US_STATES[name]) stateAbbrs.add(US_STATES[name]);
        });

        if (stateAbbrs.size === 0) return;

        setStatus("Exporting CSV...");
        
        setTimeout(() => {
            const targetZips = zipCodes.filter(z => stateAbbrs.has(z.state));
            
            if (targetZips.length === 0) {
                alert("No zip codes found for selection.");
                setStatus("Ready");
                return;
            }

            const csvData = targetZips.map(z => ({
                ZIP: z.zip,
                CITY: z.city,
                STATE: z.state,
                LAT: z.lat,
                LNG: z.lng
            }));
            
            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'respiratory_zipcodes.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus(`Exported ${targetZips.length} zipcodes.`);
        }, 100);
    };

    return (
        <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ padding: '16px', background: '#e9ecef', borderBottom: '1px solid #ddd' }}>
                        <h3>🦠 Respiratory Mode</h3>
                        <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                            Combined Flu, COVID-19, and RSV tracking.
                        </p>
                    </div>
                    
                    <div className="sidebar-content" style={{ padding: '16px' }}>
                        
                        {/* Tracker Filter */}
                        <div style={{ marginBottom: '20px' }}>
                            <label className="sidebar-label">Select Tracker</label>
                            <select 
                                value={selectedTracker}
                                onChange={(e) => setSelectedTracker(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #ced4da',
                                    backgroundColor: 'white',
                                    color: '#495057',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.075)'
                                }}
                            >
                                <option value="all">🛡️ All Tracked Illnesses (Combined Risk)</option>
                                <option value="flu">🤧 Flu (Influenza)</option>
                                <option value="covid">🦠 COVID-19 (Pending replacement source)</option>
                                <option value="rsv">👶 RSV (Pending replacement source)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="sidebar-label">Risk Legend (1-10)</label>
                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                <div style={{ flex: 1,  background: '#20c997', height: '8px', borderRadius: '4px' }} title="Low (1-3)"></div>
                                <div style={{ flex: 1,  background: '#ffc107', height: '8px', borderRadius: '4px' }} title="Moderate (4-6)"></div>
                                <div style={{ flex: 1,  background: '#fd7e14', height: '8px', borderRadius: '4px' }} title="High (7-8)"></div>
                                <div style={{ flex: 1,  background: '#d63384', height: '8px', borderRadius: '4px' }} title="Critical (9-10)"></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                <span>Low</span>
                                <span>Critical</span>
                            </div>
                        </div>

                        <div className="sidebar-section">
                             <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                 EXPORT DATA
                             </label>
                             {selectedStates.size === 0 ? (
                                 <div style={{ padding: '10px', background: '#fff3cd', fontSize: '12px', borderRadius: '4px' }}>
                                     👆 Select one or more states on the map to enable export options.
                                 </div>
                             ) : (
                                 <>
                                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#0d6efd', fontSize: '12px' }}>
                                        Target: {selectedStates.size === 1 ? Array.from(selectedStates)[0] : `${selectedStates.size} States Selected`}
                                    </div>
                                    
                                    {/* CSV Export */}
                                    <div style={{ marginBottom: '16px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>
                                            1. Export Zip Code List (CSV)
                                        </div>
                                        <button
                                            className="export-btn"
                                            onClick={handleCSVExport}
                                            disabled={loading || zipLoading}
                                            style={{ 
                                                width: '100%', 
                                                padding: '10px',
                                                backgroundColor: '#28a745', 
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {zipLoading ? 'Loading DB...' : (loading ? 'Processing...' : 'Download CSV of Zip Codes')}
                                        </button>
                                    </div>

                                    {/* SQL Export */}
                                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>
                                            2. Generate SQL Query
                                        </div>
                                        <SQLExportControls 
                                            config={exportConfig}
                                            setConfig={setExportConfig}
                                            selectedNAICS={selectedNAICS}
                                            setSelectedNAICS={setSelectedNAICS}
                                        />
                                        <div style={{ marginTop: '10px' }}>
                                            <ExportActionButtons 
                                                onExport={handleExport}
                                                loading={loading}
                                                zipLoading={zipLoading}
                                            />
                                        </div>
                                    </div>
                                 </>
                             )}
                        </div>

                        <div style={{ padding: '10px', fontSize: '11px', color: '#999', borderTop: '1px solid #eee', marginTop: '20px' }}>
                            {status}
                        </div>
                    </div>
                </>
            }
            mapContent={
                <MapComponent>
                    {usGeoJSON && (
                        <GeoJSON 
                            key={`states-${Array.from(selectedStates).join(',')}-${selectedTracker}`}
                            data={usGeoJSON} 
                            style={styleState} 
                            onEachFeature={onEachState} 
                        />
                    )}
                </MapComponent>
            }
            rightPanel={
                <div style={{ padding: '20px' }}>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h3>State Details</h3>
                        {selectedStates.size === 0 ? (
                            <p style={{ color: '#666' }}>Select a state...</p>
                        ) : selectedStates.size === 1 ? (
                            <h2 style={{ margin: 0, color: '#0d6efd' }}>{Array.from(selectedStates)[0]}</h2>
                        ) : (
                            <h2 style={{ margin: 0, color: '#20c997' }}>{selectedStates.size} States Selected</h2>
                        )}
                    </div>

                    {selectedStates.size === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* FLU */}
                            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #20c997' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>Flu Activity</strong>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{fluData[Array.from(selectedStates)[0]]?.level || 'N/A'}</span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>/ 10</span>
                                </div>
                                {fluData[Array.from(selectedStates)[0]]?.details && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                        wILI: {fluData[Array.from(selectedStates)[0]].details.wili?.toFixed(2)}%<br/>
                                        Updated: {formatEpiweek(fluData[Array.from(selectedStates)[0]].details.epiweek)}
                                    </div>
                                )}
                            </div>

                            {/* Raw Data Layout */}
                            <div style={{ 
                                marginTop: '10px', 
                                padding: '12px', 
                                backgroundColor: '#f8f9fa', 
                                border: '1px solid #e9ecef', 
                                borderRadius: '6px' 
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#495057' }}>🔍 Raw Data Sources</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '11px' }}>
                                    <li style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <a href={apiSources.flu} target="_blank" rel="noreferrer" style={{ color: '#0d6efd', textDecoration: 'none' }}>🤧 Flu (Delphi API) ↗</a>
                                        <span style={{ color: '#6c757d' }}>{fluData[Array.from(selectedStates)[0]]?.details ? `Updated: ${formatEpiweek(fluData[Array.from(selectedStates)[0]].details.epiweek)}` : 'No Data'}</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    )}

                    {selectedStates.size > 1 && (
                        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
                            <p style={{ margin: '0 0 10px 0' }}>Metrics are combined across <strong>{selectedStates.size}</strong> selected states.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {Array.from(selectedStates).map(s => (
                                    <span key={s} style={{ background: '#e9ecef', padding: '3px 8px', borderRadius: '12px', fontSize: '11px' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cadence Email Template */}
                    <div style={{ 
                        marginTop: '20px',
                        padding: '16px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px', 
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✉️</span> Sample Cadence Email
                        </h4>
                        <div style={{ fontSize: '12px', color: '#495057', lineHeight: '1.5' }}>
                            <p style={{ margin: '0 0 8px 0' }}><strong>Subject Line:</strong> Helping Your Workplace Navigate This Flu Season</p>
                            <p style={{ margin: '0 0 8px 0' }}>Hi {'{{FirstName}}'},</p>
                            <p style={{ margin: '0 0 8px 0' }}>I hope you and your team are doing well. With higher flu activity being reported in your area, many of our customers are taking simple steps to support employee wellness and keep their workplaces running smoothly.</p>
                            <p style={{ margin: '0 0 8px 0' }}>Here are a few ODP Business Solutions items that organizations in your region are finding especially useful:</p>
                            <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '4px' }}><strong>Hand Sanitizer & Dispensers</strong> – For entrances, conference rooms, and common areas to encourage frequent hand hygiene.</li>
                                <li style={{ marginBottom: '4px' }}><strong>Disinfecting Wipes & Sprays</strong> – For regularly touched surfaces like desks, door handles, phones, and shared equipment.</li>
                                <li style={{ marginBottom: '4px' }}><strong>Facial Tissues & Trash Liners</strong> – To help maintain a cleaner, more comfortable environment in offices and break areas.</li>
                                <li style={{ marginBottom: '4px' }}><strong>PPE & Wellness Essentials</strong> – Masks, thermometers, and other wellness items to support your onsite team.</li>
                            </ul>
                            <p style={{ margin: '0 0 12px 0' }}>If you’d like, I can pull together a tailored list of recommended products and pricing based on your locations and headcount.</p>
                            <p style={{ margin: 0 }}>Best regards,<br/>
                            {'{{YourName}}'}<br/>
                            {'{{YourTitle}}'}<br/>
                            <strong>ODP Business Solutions</strong><br/>
                            {'{{YourEmail}} | {{YourPhone}}'}</p>
                        </div>
                        <button 
                            onClick={() => {
                                const text = `Subject Line: Helping Your Workplace Navigate This Flu Season\n\nHi {{FirstName}},\n\nI hope you and your team are doing well. With higher flu activity being reported in your area, many of our customers are taking simple steps to support employee wellness and keep their workplaces running smoothly.\n\nHere are a few ODP Business Solutions items that organizations in your region are finding especially useful:\n• Hand Sanitizer & Dispensers – For entrances, conference rooms, and common areas to encourage frequent hand hygiene.\n• Disinfecting Wipes & Sprays – For regularly touched surfaces like desks, door handles, phones, and shared equipment.\n• Facial Tissues & Trash Liners – To help maintain a cleaner, more comfortable environment in offices and break areas.\n• PPE & Wellness Essentials – Masks, thermometers, and other wellness items to support your onsite team.\n\nIf you’d like, I can pull together a tailored list of recommended products and pricing based on your locations and headcount.\n\nBest regards,\n{{YourName}}\n{{YourTitle}}\nODP Business Solutions\n{{YourEmail}} | {{YourPhone}}`;
                                navigator.clipboard.writeText(text);
                                alert('Email template copied to clipboard!');
                            }}
                            style={{
                                marginTop: '12px',
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#fff',
                                border: '1px solid #0d6efd',
                                color: '#0d6efd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#f1f7ff'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                        >
                            📋 Copy Template
                        </button>
                    </div>
                </div>
            }
        />
    );
};

export default RespiratoryMode;
