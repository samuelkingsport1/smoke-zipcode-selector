import React, { useState } from 'react';
import { formatWeatherAlert } from '../../services/weatherFormatter';

const InstructionsModal = ({ onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>&times;</button>
            <h3>How to Use the Alert Dashboard</h3>
            
            <h4>1. Severity Formatting</h4>
            <p>Alerts are color-coded to help you prioritize:</p>
            <ul>
                <li><span className="badge" style={{ backgroundColor: '#dc3545' }}>Red</span> <strong>Severe/Extreme:</strong> Immediate action required. Life-threatening conditions.</li>
                <li><span className="badge" style={{ backgroundColor: '#fd7e14' }}>Orange</span> <strong>Moderate:</strong> Action recommended. Hazardous conditions.</li>
                <li><span className="badge" style={{ backgroundColor: '#ffc107' }}>Yellow</span> <strong>Minor/Unknown:</strong> Be aware. Potential inconvenience.</li>
            </ul>

            <h4>2. Filtering</h4>
            <p>Use the dropdown at the top right to filter by severity (e.g., "Severe Only").</p>

            <h4>3. Research & Verification</h4>
            <p>Before exporting, use the buttons on each card:</p>
            <ul>
                <li><strong>Local News:</strong> Searches Google for local coverage to verify impact.</li>
                <li><strong>Impact:</strong> Looks for damage reports.</li>
                <li><strong>Conds:</strong> Checks current weather conditions.</li>
            </ul>

            <h4>4. Exporting</h4>
            <p>Select specific alerts using the checkboxes, or click "Download All" to get a CSV of the target zip codes. The <strong>Copy</strong> button puts the CSV directly into your clipboard for pasting into Excel/Sheets.</p>
        </div>
    </div>
);

const AlertList = ({ alerts, title, onExport, onCopy, onAlertClick, onAlertToggle, selectedIds = new Set(), focusedId }) => {
    const [severityFilter, setSeverityFilter] = useState('All');
    const [showInstructions, setShowInstructions] = useState(false);
    const [expandedAlerts, setExpandedAlerts] = useState(new Set());

    const toggleAlertDetails = (id, e) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedAlerts);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedAlerts(newExpanded);
    };

    if (!alerts || alerts.length === 0) {
        return (
            <div className="alert-list-empty">
                <h3>{title}</h3>
                <p>No active alerts found.</p>
                <button className="export-btn" disabled>Export Target List</button>
            </div>
        );
    }

    // Filter Logic
    const filteredAlerts = alerts.filter(alert => {
        if (severityFilter === 'All') return true;
        
        const severity = alert.properties.severity;
        if (severityFilter === 'Severe+') {
            return severity === 'Severe' || severity === 'Extreme';
        }
        if (severityFilter === 'Moderate+') {
            return severity === 'Severe' || severity === 'Extreme' || severity === 'Moderate';
        }
        return true;
    });

    return (
        <div className="alert-list-container">
            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
            
            <div style={{ padding: '10px 15px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#666', fontStyle: 'italic' }}>
                        <strong>Quick Start:</strong> Select active alerts to export target zip codes.
                        Use "Severe Only" filter to prioritize.
                    </small>
                    <button 
                        onClick={() => setShowInstructions(true)}
                        style={{ 
                            background: 'none', 
                            border: '1px solid #ccc', 
                            borderRadius: '12px', 
                            padding: '2px 8px', 
                            fontSize: '10px', 
                            cursor: 'pointer',
                            color: '#0d6efd'
                        }}
                    >
                        More Info
                    </button>
                </div>
            </div>

            <div className="alert-list-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0 }}>{title} <span className="badge">{filteredAlerts.length}</span></h3>
                    
                    <select 
                        value={severityFilter} 
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        style={{
                            padding: '4px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            border: '1px solid #ced4da',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Severity</option>
                        <option value="Moderate+">Moderate & up</option>
                        <option value="Severe+">Severe Only</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="export-btn" onClick={() => onExport && onExport(filteredAlerts)} style={{ flex: 1 }}>
                        {selectedIds.size > 0 ? `Download (${selectedIds.size})` : "Download All"}
                    </button>
                    {onCopy && (
                        <button className="export-btn" onClick={() => onCopy && onCopy(filteredAlerts)} style={{ backgroundColor: '#6c757d', color: 'white' }}>
                            Copy
                        </button>
                    )}
                </div>
            </div>
            <div className="alert-list-scroll">
                {filteredAlerts.map((alert, index) => {
                    const props = alert.properties;
                    const id = props.id || index; // Fallback to index if no ID, but ID preferred
                    const sent = new Date(props.sent).toLocaleString();
                    const expires = new Date(props.expires).toLocaleString();
                    const isSelected = selectedIds.has(id);
                    const isFocused = focusedId === id;
                    const isExpanded = expandedAlerts.has(id);

                    return (
                        <div
                            key={id}
                            className={`alert-card ${isFocused ? 'focused' : ''}`}
                            onClick={() => onAlertClick && onAlertClick(alert)}
                            style={{
                                cursor: 'pointer',
                                borderLeft: isFocused ? '4px solid #00BFFF' : '1px solid #dee2e6',
                                backgroundColor: isSelected ? '#f0f9ff' : 'white',
                                marginBottom: '10px' // Increased spacing
                            }}
                        >
                            <div className="alert-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            onAlertToggle(id);
                                        }}
                                        onChange={() => { }} // Controlled by onClick
                                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                    />
                                    <strong>{props.event}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        color: 'white',
                                        backgroundColor: props.severity === 'Severe' || props.severity === 'Extreme' ? '#dc3545' : 
                                                         props.severity === 'Moderate' ? '#fd7e14' : 
                                                         '#ffc107',
                                        fontWeight: 'bold'
                                    }}>
                                        {props.severity || 'Unknown'}
                                    </span>
                                    <span className={`status-dot ${props.status === 'Actual' ? 'active' : 'test'}`}></span>
                                </div>
                            </div>
                            <div className="alert-card-body">
                                <p className="alert-area">{props.areaDesc}</p>
                                <div className="alert-meta">
                                    <small>Sent: {sent}</small>
                                    <small>Expires: {expires}</small>
                                </div>

                                <button 
                                    className="alert-expand-btn"
                                    onClick={(e) => toggleAlertDetails(id, e)}
                                >
                                    {isExpanded ? "Hide Full Description" : "Show Full Description"}
                                </button>
                                
                                {isExpanded && (
                                    <div className="alert-details-expanded">
                                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                            {props.description || "No description available."}
                                        </p>
                                        {props.instruction && (
                                            <div style={{ marginTop: '10px', fontStyle: 'italic', borderTop: '1px solid #ddd', paddingTop: '5px' }}>
                                                <strong>Instruction:</strong> {props.instruction}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div style={{ marginTop: '10px', fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                                    Click for a pre-populated search result page:
                                </div>
                                <div style={{ marginTop: '4px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                    {(() => {
                                        const formatted = formatWeatherAlert({ properties: props });
                                        return (
                                            <>
                                                <a 
                                                    href={formatted.searchLinks.localNews} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="action-link-btn"
                                                    style={{ 
                                                        fontSize: '10px', 
                                                        padding: '4px 8px', 
                                                        background: '#e9ecef', 
                                                        border: '1px solid #ced4da', 
                                                        borderRadius: '4px',
                                                        textDecoration: 'none',
                                                        color: '#495057'
                                                    }}
                                                >
                                                    📰 Local News
                                                </a>
                                                <a 
                                                    href={formatted.searchLinks.impactReports} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="action-link-btn"
                                                    style={{ 
                                                        fontSize: '10px', 
                                                        padding: '4px 8px', 
                                                        background: '#e9ecef', 
                                                        border: '1px solid #ced4da', 
                                                        borderRadius: '4px',
                                                        textDecoration: 'none',
                                                        color: '#495057'
                                                    }}
                                                >
                                                    💥 Impact
                                                </a>
                                                 <a 
                                                    href={formatted.searchLinks.currentConditions} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="action-link-btn"
                                                    style={{ 
                                                        fontSize: '10px', 
                                                        padding: '4px 8px', 
                                                        background: '#e9ecef', 
                                                        border: '1px solid #ced4da', 
                                                        borderRadius: '4px',
                                                        textDecoration: 'none',
                                                        color: '#495057'
                                                    }}
                                                >
                                                    🌤️ Conds
                                                </a>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlertList;
