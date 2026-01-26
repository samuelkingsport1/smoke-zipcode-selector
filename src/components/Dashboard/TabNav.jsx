import React from 'react';

const tabs = [
    { id: 'smoke', label: '💨 Smoke / AQI', color: '#888' },
    { id: 'winter', label: '❄️ Winter Storm', color: '#00BFFF' },
    { id: 'heat', label: '☀️ Heatwave', color: '#FF4500' },
    { id: 'flood', label: '🌊 Flood / Hurricane', color: '#0000FF' },
    { id: 'flu', label: '🦠 Flu Season', color: '#32CD32' },
];

const TabNav = ({ activeTab, onTabChange }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '5px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            overflowX: 'auto',
            position: 'relative',
            zIndex: 1100, // Ensure it sits on top if anything overlaps
            flexShrink: 0 // Prevent it from being squashed
        }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '20px',
                        backgroundColor: activeTab === tab.id ? tab.color : '#e9ecef',
                        color: activeTab === tab.id ? 'white' : '#495057',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNav;
