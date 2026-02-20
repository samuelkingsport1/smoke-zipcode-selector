import React from 'react';
import QuerySelector from './QuerySelector';
import NAICSFilter from './NAICSFilter';



const SQLExportControls = ({ config, setConfig, selectedNAICS, setSelectedNAICS }) => {
    
    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };



    const handleQuerySelect = (newConfig) => {
        // 1. Update Export Config
        setConfig(prev => ({
            ...prev,
            recordType: newConfig.recordType,
            filters: {
                ...prev.filters,
                ...newConfig.filters
            }
        }));

        // 2. Update NAICS Selection
        if (newConfig.naics && newConfig.naics.length > 0) {
            setSelectedNAICS(new Set(newConfig.naics));
        } else {
            // If empty, do we clear? Or keep existing? 
            // Better to clear if it's a "preset" to avoid confusion.
             setSelectedNAICS(new Set());
        }
    };

    return (
        <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            marginBottom: '10px',
            fontSize: '12px'
        }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Export Settings</h4>
            
            {/* 1. Query Selector (Presets) */}
            <QuerySelector onSelect={handleQuerySelect} currentConfig={config} />

            <div style={{ margin: '10px 0', borderTop: '1px solid #eee' }}></div>

            <div>
                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Default Field Filters</label>

                 <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Contact(If Applicable) Number of Months Since Last Activity</label>
                    <input 
                        type="number" 
                        value={config.filters?.contactActivityMonths !== undefined ? config.filters.contactActivityMonths : 12}
                        onChange={(e) => handleChange('filters', { ...config.filters, contactActivityMonths: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                 </div>

                 <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={config.filters?.contactActive ?? true} 
                            onChange={(e) => handleChange('filters', { ...config.filters, contactActive: e.target.checked })}
                            style={{ marginRight: '6px' }}
                        />
                        Contact(If Applicable) Status: Active
                    </label>
                </div>

                 <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={config.filters?.siteActive ?? true} 
                            onChange={(e) => handleChange('filters', { ...config.filters, siteActive: e.target.checked })}
                            style={{ marginRight: '6px' }}
                        />
                        Site(If Applicable) Status: Active
                    </label>
                 </div>

                 <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={config.filters?.customerActive ?? true} 
                            onChange={(e) => handleChange('filters', { ...config.filters, customerActive: e.target.checked })}
                            style={{ marginRight: '6px' }}
                        />
                        Customer(If Applicable) Status: Active
                    </label>
                 </div>
            </div>

            {/* Relocated NAICS Filter */}
            <div style={{ marginTop: '15px' }}>
                <NAICSFilter 
                     selectedCodes={selectedNAICS} 
                     onSelectionChange={setSelectedNAICS} 
                />
            </div>
        </div>
    );
};

export default SQLExportControls;
