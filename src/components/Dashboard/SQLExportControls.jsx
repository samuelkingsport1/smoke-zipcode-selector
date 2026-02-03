import React from 'react';

const RECORD_TYPES = [
    'Customer',
    'Site',
    'Parent',
    'Grandparent',
    'Great Grandparent',
    'DML'
];

const OPTIONAL_FIELDS = [
    { key: 'Last_Order_Date__C', label: 'Last Order Date' },
    { key: 'Total_LY_Sales__C', label: 'Total LY Sales' },
    { key: 'Total_ty_Sales_to_Date__c', label: 'Total TY Sales to Date' }
];

const SQLExportControls = ({ config, setConfig }) => {
    
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
            
            {/* Record Type Selector */}
            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Record Type</label>
                <select 
                    value={config.recordType} 
                    onChange={(e) => handleChange('recordType', e.target.value)}
                    style={{ width: '100%', padding: '4px' }}
                >
                    {RECORD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

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
        </div>
    );
};

export default SQLExportControls;
