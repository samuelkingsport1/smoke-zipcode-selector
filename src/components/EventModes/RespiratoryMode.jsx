import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import MapComponent from '../MapContainer';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import { US_STATES } from '../../utils/constants';
import { fetchFluData, fetchCovidData, fetchRSVData } from '../../services/delphiService';

const RespiratoryMode = ({ zipCodes = [], zipLoading = false }) => {
    // Data State
    const [fluData, setFluData] = useState({});
    const [covidData, setCovidData] = useState({});
    const [rsvData, setRsvData] = useState({});
    const [usGeoJSON, setUsGeoJSON] = useState(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("Initializing Respiratory Mode...");
    const [selectedState, setSelectedState] = useState(null); // Full State Name (e.g. 'Texas')

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
                setCovidData(covid.processedData || {});
                setRsvData(rsv.processedData || {});
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

    // Helper: Get Combined Level for a State
    const getRiskLevel = (stateName) => {
        const f = fluData[stateName]?.level || 0;
        const c = covidData[stateName]?.level || 0;
        const r = rsvData[stateName]?.level || 0;
        return Math.max(f, c, r);
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

        const isSelected = selectedState === stateName;

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
                setSelectedState(stateName);
                setStatus(`Selected: ${stateName}`);
            }
        });
    };

    // Export Logic
    const handleExport = (actionType) => {
        if (!selectedState) {
            alert("Please select a state on the map first.");
            return;
        }

        const stateAbbr = US_STATES[selectedState]; // Get 'TX' from 'Texas'
        if (!stateAbbr) {
            alert("State abbreviation mapping failed.");
            return;
        }

        setStatus(`Exporting data for ${selectedState} (${stateAbbr})...`);

        setTimeout(() => {
            // Filter ZipCodes for this state
            const targetZips = zipCodes.filter(z => z.state === stateAbbr);
            
            if (targetZips.length === 0) {
                alert(`No zip codes found for ${selectedState} in database.`);
                setStatus("Ready");
                return;
            }

            const zipString = targetZips.map(z => `'${z.zip}'`).join(", ");
            const { filters, recordType, fields, sortBy } = exportConfig;

            // ... (Reusable SQL Logic from other modes) ...
            // Simplified for brevity, same structure as other modes
             let filterClauses = "";
             if (filters.activeStatus) filterClauses += "\\nAND c.Status__c = 'Active'";
             if (filters.lastActivityMonths) filterClauses += `\\nAND c.LastActivityDate >= DATEADD(month, -${filters.lastActivityMonths}, GETDATE())`;
             if (filters.lastOrderMonths) filterClauses += `\\nAND c.LastOrderDate__c >= DATEADD(month, -${filters.lastOrderMonths}, GETDATE())`;
             if (filters.minTotalSales) filterClauses += `\\nAND c.Total_Sales_LY__c >= ${filters.minTotalSales}`;
             
             const naicsFields = selectedNAICS.size > 0 ? ", org.NAICS___c, org.NAICS_Description__c" : "";
             const orderByClause = sortBy ? `\\nORDER BY s.${sortBy} DESC NULLS LAST` : "";

             let sqlContent = "";

             if (actionType === 'COUNT') {
                sqlContent = `Select count(s.id)
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.Related_Account__c = c.Id\\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}`;
                
                navigator.clipboard.writeText(sqlContent).then(() => {
                     alert("Count SQL copied!");
                     setStatus("SQL Copied.");
                });

             } else {
                 const baseFields = ["id", "Name", "CUST_ID__C"];
                 const additionalFields = Object.keys(fields).filter(key => fields[key]);
                 const allFields = [...baseFields, ...additionalFields].join(", ");

                 sqlContent = `Select ${allFields.map(f => `s.${f}`).join(", ")}${naicsFields}
From SFDC_DS.SFDC_ACCOUNT_OBJECT s
${(selectedNAICS.size > 0 || filters.activeStatus || filters.lastActivityMonths || filters.lastOrderMonths || filters.minTotalSales) ? "LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.Related_Account__c = c.Id\\nLEFT JOIN SFDC_DS.SFDC_ORG_OBJECT org ON c.Org__c = org.Id" : ""}
Where s.RECORDTYPE_NAME__C = '${recordType}'
AND s.Zip__c IN (${zipString})${
    selectedNAICS.size > 0 
    ? `\\nAND (${Array.from(selectedNAICS).map(code => `org.NAICS___c LIKE '${code}%'`).join(" OR ")})` 
    : ""
}${filterClauses}${orderByClause}`;

                 if (actionType === 'COPY') {
                     navigator.clipboard.writeText(sqlContent).then(() => {
                         alert("SQL Query copied!");
                         setStatus("SQL Copied.");
                     });
                 } else {
                     const blob = new Blob([sqlContent], { type: 'text/plain' });
                     const url = URL.createObjectURL(blob);
                     const link = document.createElement('a');
                     link.href = url;
                     link.setAttribute('download', `respiratory_targets_${stateAbbr}.sql`);
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                     setStatus(`Exported SQL for ${stateAbbr}.`);
                 }
             }
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
                             <label className="sidebar-label">Export Controls</label>
                             {!selectedState ? (
                                 <div style={{ padding: '10px', background: '#fff3cd', fontSize: '12px', borderRadius: '4px' }}>
                                     👆 Select a state on the map to enable export options.
                                 </div>
                             ) : (
                                 <>
                                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#0d6efd' }}>
                                        Target: {selectedState}
                                    </div>
                                    
                                    <SQLExportControls 
                                        config={exportConfig}
                                        setConfig={setExportConfig}
                                        selectedNAICS={selectedNAICS}
                                        setSelectedNAICS={setSelectedNAICS}
                                    />
                                    
                                    <ExportActionButtons 
                                        onExport={handleExport}
                                        loading={loading}
                                        zipLoading={zipLoading}
                                    />
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
                        {selectedState ? (
                            <h2 style={{ margin: 0, color: '#0d6efd' }}>{selectedState}</h2>
                        ) : (
                            <p style={{ color: '#666' }}>Select a state...</p>
                        )}
                    </div>

                    {selectedState && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* FLU */}
                            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #20c997' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>Flu Activity</strong>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{fluData[selectedState]?.level || 'N/A'}</span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>/ 10</span>
                                </div>
                                {fluData[selectedState]?.details && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                        wILI: {fluData[selectedState].details.wili?.toFixed(2)}%<br/>
                                        Updated: {fluData[selectedState].details.epiweek}
                                    </div>
                                )}
                            </div>

                            {/* COVID */}
                            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #0dcaf0' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>COVID-19 Hosp.</strong>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{covidData[selectedState]?.level || 'N/A'}</span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>/ 10</span>
                                </div>
                                {covidData[selectedState]?.details && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                        Adm/100k: {covidData[selectedState].details.val?.toFixed(1)}<br/>
                                        Date: {covidData[selectedState].details.date.split('T')[0]}
                                    </div>
                                )}
                            </div>

                            {/* RSV */}
                            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #fd7e14' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>RSV ED Visits</strong>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{rsvData[selectedState]?.level || 'N/A'}</span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>/ 10</span>
                                </div>
                                {rsvData[selectedState]?.details && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                        % Visits: {rsvData[selectedState].details.percent_visits?.toFixed(1)}%<br/>
                                        Date: {rsvData[selectedState].details.week_end.split('T')[0]}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            }
        />
    );
};

export default RespiratoryMode;
