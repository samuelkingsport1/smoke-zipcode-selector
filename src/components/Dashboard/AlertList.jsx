import React from 'react';

const AlertList = ({ alerts, title, onExport, onAlertClick, onAlertToggle, selectedIds = new Set(), focusedId }) => {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="alert-list-empty">
                <h3>{title}</h3>
                <p>No active alerts found.</p>
                <button className="export-btn" disabled>Export Target List</button>
            </div>
        );
    }

    return (
        <div className="alert-list-container">
            <div className="alert-list-header">
                <h3>{title} <span className="badge">{alerts.length}</span></h3>
                <button className="export-btn" onClick={onExport}>
                    {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export All"}
                </button>
            </div>
            <div className="alert-list-scroll">
                {alerts.map((alert, index) => {
                    const props = alert.properties;
                    const id = props.id || index; // Fallback to index if no ID, but ID preferred
                    const sent = new Date(props.sent).toLocaleString();
                    const expires = new Date(props.expires).toLocaleString();
                    const isSelected = selectedIds.has(id);
                    const isFocused = focusedId === id;

                    return (
                        <div
                            key={id}
                            className={`alert-card ${isFocused ? 'focused' : ''}`}
                            onClick={() => onAlertClick && onAlertClick(alert)}
                            style={{
                                cursor: 'pointer',
                                borderLeft: isFocused ? '4px solid #00BFFF' : '1px solid #dee2e6',
                                backgroundColor: isSelected ? '#f0f9ff' : 'white'
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
                                <span className={`status-dot ${props.status === 'Actual' ? 'active' : 'test'}`}></span>
                            </div>
                            <div className="alert-card-body">
                                <p className="alert-area">{props.areaDesc}</p>
                                <div className="alert-meta">
                                    <small>Sent: {sent}</small>
                                    <small>Expires: {expires}</small>
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
