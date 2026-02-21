import React, { useState, useEffect } from 'react';
import { Marker, Circle, useMapEvents } from 'react-leaflet';
import Papa from 'papaparse';
import * as turf from '@turf/turf';
import MapComponent from '../MapContainer';
import DashboardLayout from '../Dashboard/DashboardLayout';
import AlertList from '../Dashboard/AlertList';
import ExportActionButtons from '../Dashboard/ExportActionButtons';
import SQLExportControls from '../Dashboard/SQLExportControls';
import { generateSQL } from '../../utils/sqlGenerator';
import L from 'leaflet';

// Inner component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

const RadiusMode = ({ zipCodes = [], zipLoading = false }) => {
    const [pinLocation, setPinLocation] = useState(null);
    const [radiusMiles, setRadiusMiles] = useState(100);
    const [selectedZips, setSelectedZips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Click the map to drop a pin.");

    // NAICS Filter State
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
        sortBy: '',
        uniqueEmails: false
    });

    // Calculate zip codes within radius whenever pin or radius changes
    useEffect(() => {
        if (!pinLocation || !zipCodes || zipCodes.length === 0) {
            setTimeout(() => setSelectedZips([]), 0);
            return;
        }

        setStatus("Calculating zip codes...");
        setLoading(true);

        // Small timeout to allow UI to show "Calculating..."
        const timer = setTimeout(() => {
            const pointOptions = { units: 'miles' };
            const centerPt = turf.point([pinLocation.lng, pinLocation.lat]);
            
            const matches = [];
            for (let i = 0; i < zipCodes.length; i++) {
                const z = zipCodes[i];
                if (!z.lat || !z.lng) continue;
                
                const targetPt = turf.point([z.lng, z.lat]);
                const dist = turf.distance(centerPt, targetPt, pointOptions);
                
                if (dist <= radiusMiles) {
                    matches.push({ ...z, distance: dist });
                }
            }
            
            // Sort by distance
            matches.sort((a, b) => a.distance - b.distance);
            
            setSelectedZips(matches);
            setStatus(`Found ${matches.length} zip codes within ${radiusMiles} miles.`);
            setLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [pinLocation, radiusMiles, zipCodes]);

    const handleCopy = () => {
         if (selectedZips.length === 0) return;
         const zipList = selectedZips.map(z => z.zip).join('\n');
         navigator.clipboard.writeText(zipList).then(() => {
             alert('Zip codes copied to clipboard!');
         });
    };

    const handleExport = (actionType) => {
        if (selectedZips.length === 0) {
            alert("No zip codes selected.");
            return;
        }

        setStatus(`Generating SQL for ${selectedZips.length} zips...`);
        setLoading(true);

        setTimeout(() => {
            const zipList = selectedZips.map(z => z.zip);
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
                link.setAttribute('download', `radius_targets_${radiusMiles}mi.sql`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setStatus(`Exported SQL for ${selectedZips.length} zip codes.`);
            }
            setLoading(false);
        }, 100);
    };

    const handleCSVExport = () => {
        if (selectedZips.length === 0) return;
        
        const csvData = selectedZips.map(z => ({
            ZIP: z.zip,
            CITY: z.city,
            STATE: z.state,
            DISTANCE_MILES: z.distance.toFixed(2),
            LAT: z.lat,
            LNG: z.lng
        }));
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `radius_zipcodes_${radiusMiles}mi.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <DashboardLayout
            leftPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)', 
                        color: '#333',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>📍</span> Radius Mode
                        </h3>
                         <div className="sidebar-input-group">
                            <label className="sidebar-label" style={{ color: '#333', fontWeight: 'bold' }}>Radius (Miles)</label>
                            <input
                                type="number"
                                min="1"
                                max="2000"
                                value={radiusMiles}
                                onChange={(e) => setRadiusMiles(Number(e.target.value) || 0)}
                                style={{ 
                                    padding: '8px', 
                                    borderRadius: '6px', 
                                    border: '1px solid rgba(0,0,0,0.2)', 
                                    width: '100%',
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    color: '#333',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                    </div>

                    <div className="sidebar-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div className="sidebar-section">
                             <label className="sidebar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>
                                EXPORT CONFIG
                            </label>
                            <SQLExportControls 
                                config={exportConfig}
                                setConfig={setExportConfig}
                                selectedNAICS={selectedNAICS}
                                setSelectedNAICS={setSelectedNAICS}
                            />
                            
                            <ExportActionButtons 
                                onExport={handleExport}
                                onCopy={handleCopy}
                                loading={loading}
                                zipLoading={zipLoading || selectedZips.length === 0}
                            />
                            
                            {selectedZips.length > 0 && (
                                <button
                                    onClick={handleCSVExport}
                                    style={{
                                        marginTop: '10px',
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #28a745',
                                        color: '#28a745',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    📥 Download CSV List
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-footer" style={{ padding: '12px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
                        <small style={{ color: '#6c757d' }}>{status}</small>
                    </div>
                </>
            }
            mapContent={
                <MapComponent>
                    <MapClickHandler onMapClick={setPinLocation} />
                    {pinLocation && (
                        <>
                            <Marker position={pinLocation} />
                            <Circle 
                                center={pinLocation} 
                                radius={radiusMiles * 1609.34} // Convert miles to meters
                                pathOptions={{ 
                                    color: '#1fa2ff', 
                                    fillColor: '#1fa2ff', 
                                    fillOpacity: 0.2,
                                    weight: 2
                                }} 
                            />
                        </>
                    )}
                </MapComponent>
            }
            rightPanel={
                <>
                    <div className="sidebar-header" style={{ 
                        padding: '16px', 
                        background: '#f8f9fa', 
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                             Selected Zip Codes ({selectedZips.length})
                        </h3>
                    </div>

                    <div className="sidebar-content" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
                         {selectedZips.length === 0 ? (
                             <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6c757d' }}>
                                 <div style={{ fontSize: '32px', marginBottom: '10px' }}>📍</div>
                                 Click anywhere on the map to drop a pin and find zip codes within {radiusMiles} miles.
                             </div>
                         ) : (
                             <div style={{ flex: 1, overflowY: 'auto' }}>
                                 {selectedZips.slice(0, 100).map((z, idx) => (
                                     <div key={idx} style={{ 
                                         padding: '12px 16px', 
                                         borderBottom: '1px solid #eee',
                                         display: 'flex',
                                         justifyContent: 'space-between',
                                         alignItems: 'center'
                                     }}>
                                         <div>
                                             <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{z.zip}</div>
                                             <div style={{ fontSize: '11px', color: '#666' }}>{z.city}, {z.state}</div>
                                         </div>
                                         <div style={{ fontSize: '12px', fontWeight: '500', color: '#0d6efd', background: '#f1f7ff', padding: '4px 8px', borderRadius: '12px' }}>
                                             {z.distance.toFixed(1)} mi
                                         </div>
                                     </div>
                                 ))}
                                 {selectedZips.length > 100 && (
                                     <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '12px', background: '#f8f9fa' }}>
                                         ... and {selectedZips.length - 100} more zips (export to see all).
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                </>
            }
        />
    );
};

export default RadiusMode;
