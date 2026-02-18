import React from 'react';
import QuerySelector from './QuerySelector';
import NAICSFilter from './NAICSFilter';


const OPTIONAL_FIELDS = [
    { key: 'Last_Order_Date__C', label: 'Last Order Date' },
    { key: 'Total_LY_Sales__C', label: 'Total LY Sales' },
    { key: 'Total_ty_Sales_to_Date__c', label: 'Total TY Sales to Date' }
];

const SQLExportControls = ({ config, setConfig, selectedNAICS, setSelectedNAICS }) => {
    
    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleFieldToggle = (fieldKey) => {
        setConfig(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldKey]: !prev.fields[fieldKey]
            }
        }));
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


            {/* Field Selection */}
            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Include Fields</label>
                {OPTIONAL_FIELDS.map(field => (
                    <div key={field.key} style={{ marginBottom: '2px' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="checkbox" 
                                checked={config.fields[field.key]} 
                                onChange={() => handleFieldToggle(field.key)}
                                style={{ marginRight: '6px' }}
                            />
                            {field.label}
                        </label>
                    </div>
                ))}
            </div>

            {/* Sorting */}
            <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Sort By</label>
                <select 
                    value={config.sortBy} 
                    onChange={(e) => handleChange('sortBy', e.target.value)}
                    style={{ width: '100%', padding: '4px' }}
                >
                    <option value="">No Sorting</option>
                    {OPTIONAL_FIELDS.map(field => (
                        <option key={field.key} value={field.key}>{field.label}</option>
                    ))}
                </select>
            </div>

            {/* NEW: SQL Filters */}
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Filters</label>
                 
                 <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={config.filters?.activeStatus ?? true} 
                            onChange={(e) => handleChange('filters', { ...config.filters, activeStatus: e.target.checked })}
                            style={{ marginRight: '6px' }}
                        />
                        Parent Status: <strong>Active</strong>
                    </label>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Last Activity (Months)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 12"
                        value={config.filters?.lastActivityMonths || ''}
                        onChange={(e) => handleChange('filters', { ...config.filters, lastActivityMonths: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Last Order (Months)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 6"
                        value={config.filters?.lastOrderMonths || ''}
                        onChange={(e) => handleChange('filters', { ...config.filters, lastOrderMonths: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Min Total Sales LY ($)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 5000"
                        value={config.filters?.minTotalSales || ''}
                        onChange={(e) => handleChange('filters', { ...config.filters, minTotalSales: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
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
