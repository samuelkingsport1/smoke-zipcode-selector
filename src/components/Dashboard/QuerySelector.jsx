import React, { useState } from 'react';
import QueryHelpModal from './QueryHelpModal';

const QUERY_TYPES = [
    { 
        id: 'count_summary', 
        label: '1. Site / Customer / Contact Count', 
        description: 'Get a summary count of all records.',
        config: { recordType: 'Count', filters: {}, naics: [] } 
    },
    { 
        id: 'site_export', 
        label: '2. Site Export', 
        description: 'Export Site records.',
        config: { recordType: 'Site', filters: { activeStatus: true }, naics: [] } 
    },
    { 
        id: 'customer_export', 
        label: '3. Customer Export', 
        description: 'Export Customer records.',
        config: { recordType: 'Customer', filters: { activeStatus: true, minTotalSales: '5000' }, naics: [] } 
    },
    { 
        id: 'contact_export', 
        label: '4. Contact Export', 
        description: 'Export Contact records.',
        config: { recordType: 'Contact', filters: { activeStatus: true }, naics: [] } 
    }
];

const QuerySelector = ({ onSelect, currentConfig }) => {
    const [showHelp, setShowHelp] = useState(false);
    const [selectedId, setSelectedId] = useState('count_summary');
    const [helpContent, setHelpContent] = useState(null);

    const handleSelect = (type) => {
        setSelectedId(type.id);
        onSelect(type.config);
    };

    const handleHelp = (e, type) => {
        e.stopPropagation();
        setHelpContent(type);
        setShowHelp(true);
    };

    return (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>QUERY TYPE</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {QUERY_TYPES.map(type => (
                    <div 
                        key={type.id}
                        onClick={() => handleSelect(type)}
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: selectedId === type.id ? '1px solid #007bff' : '1px solid #ced4da',
                            backgroundColor: selectedId === type.id ? '#e7f1ff' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '12px', fontWeight: selectedId === type.id ? 'bold' : 'normal', color: '#333' }}>
                            {type.label}
                        </span>
                        
                        <button
                            onClick={(e) => handleHelp(e, type)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                            title="More Info"
                        >
                            ?
                        </button>
                    </div>
                ))}
            </div>

            {showHelp && (
                <QueryHelpModal 
                    onClose={() => setShowHelp(false)} 
                    content={helpContent}
                />
            )}
        </div>
    );
};

export default QuerySelector;
