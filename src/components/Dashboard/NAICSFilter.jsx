import React, { useState } from 'react';
import { NAICS_DATA } from '../../data/naics_structure';

const TreeNode = ({ node, selectedCodes, onToggle, forceExpand }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedCodes.has(node.code);

    React.useEffect(() => {
        if (forceExpand) {
            setExpanded(true);
        }
    }, [forceExpand]);

    const handleExpand = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleCheck = (e) => {
        e.stopPropagation();
        onToggle(node.code);
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}>
                <div 
                    onClick={hasChildren ? handleExpand : undefined}
                    style={{ 
                        width: '16px', 
                        cursor: hasChildren ? 'pointer' : 'default',
                        marginRight: '4px',
                        textAlign: 'center',
                        color: '#666',
                        fontWeight: 'bold'
                    }}
                >
                    {hasChildren ? (expanded ? '-' : '+') : '•'}
                </div>
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={handleCheck}
                    style={{ marginRight: '6px' }} 
                />
                <span style={{ fontSize: '12px', color: '#333' }}>
                    <strong>{node.code}</strong> - {node.title}
                </span>
            </div>
            {hasChildren && expanded && (
                <div>
                    {node.children.map(child => (
                        <TreeNode 
                            key={child.code} 
                            node={child} 
                            selectedCodes={selectedCodes} 
                            onToggle={onToggle}
                            forceExpand={forceExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DUTY_OF_CARE_SECTORS = [
    { code: '622', title: 'Hospitals', hazard: 'Air Quality / Pathogen Control', driver: 'CMS Safety Conditions', url: 'https://www.cms.gov/medicare/provider-enrollment-and-certification/certificationandcomplianc/hospitals' },
    { code: '623', title: 'Nursing Care Facilities', hazard: 'Infectious Disease / Safety', driver: 'OSHA Healthcare Standards', url: 'https://www.osha.gov/healthcare/infectious-diseases' },
    { code: '531110', title: 'Apartments / Residential Lessors', hazard: 'Habitability / Fire / Mold', driver: 'HUD Housing Quality (HQS)', url: 'https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/hqs' },
    { code: '531311', title: 'Residential Property Managers', hazard: 'Life Safety / Security', driver: 'NFPA 101 Life Safety Code', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=101' },
    { code: '6111', title: 'Elementary & Secondary Schools', hazard: 'Indoor Air / Student Safety', driver: 'EPA IAQ Tools for Schools', url: 'https://www.epa.gov/iaq-schools/indoor-air-quality-tools-schools-action-kit' },
    { code: '7211', title: 'Hotels & Motels', hazard: 'Fire Safety / Guest Security', driver: 'Federal Fire Safety Act', url: 'https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/fire-safe-hotels' },
    { code: '531130', title: 'Self-Storage', hazard: 'Environmental / Fire / Bailment', driver: 'NFPA 1 Fire Code', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=1' },
    { code: '48', title: 'Transportation (General)', hazard: 'Passenger Safety', driver: 'DOT Safety Obligations', url: 'https://www.transportation.gov/safety' },
    { code: '49', title: 'Transportation (Couriers)', hazard: 'Passenger Safety', driver: 'DOT Safety Obligations', url: 'https://www.transportation.gov/safety' }
];

// Filter Logic moved outside component
const filterNodes = (nodes, term) => {
    if (!term) return nodes;
    const lowerTerm = term.toLowerCase();
    
    return nodes.reduce((acc, node) => {
        const matches = node.code.toLowerCase().includes(lowerTerm) || 
                        node.title.toLowerCase().includes(lowerTerm);
        
        const filteredChildren = node.children ? filterNodes(node.children, term) : [];
        
        // Include if match OR children match
        if (matches || filteredChildren.length > 0) {
            acc.push({
                ...node,
                children: filteredChildren
            });
        }
        return acc;
    }, []);
};

const NAICSFilter = ({ selectedCodes, onSelectionChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Toggle a single code
    const handleToggle = (code) => {
        const newSelection = new Set(selectedCodes);
        if (newSelection.has(code)) {
            newSelection.delete(code);
        } else {
            newSelection.add(code);
        }
        onSelectionChange(newSelection);
    };

    const filteredData = React.useMemo(() => filterNodes(NAICS_DATA, searchTerm), [searchTerm]);

    return (
        <div style={{ border: '1px solid #ced4da', borderRadius: '4px', marginTop: '10px' }}>
            <div 
                style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderBottom: expanded ? '1px solid #ced4da' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <label style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                        NAICS Filter ({selectedCodes.size})
                    </label>
                    <span style={{fontSize: '10px'}}>{expanded ? '▲' : '▼'}</span>
                </div>
            </div>
            
            {expanded && (
                <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#fff' }}>
                    
                    {/* Search Bar */}
                    <input 
                        type="text" 
                        placeholder="Search NAICS codes or titles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px',
                            marginBottom: '10px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}
                    />

                    {/* Duty of Care Quick Select */}
                    <div style={{ marginBottom: '15px', border: '1px solid #ffeeba', backgroundColor: '#fff3cd', borderRadius: '4px', padding: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#856404', marginBottom: '6px' }}>
                            ⚠️ Quick Select: High-Risk Duty of Care
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {DUTY_OF_CARE_SECTORS.map(sector => (
                                <div key={sector.code} style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCodes.has(sector.code)}
                                        onChange={() => handleToggle(sector.code)}
                                        style={{ marginTop: '3px', marginRight: '6px' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                            {sector.title} <span style={{ fontWeight: 'normal' }}>({sector.code})</span>
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>
                                            Hazard: {sector.hazard}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                         <div style={{ marginBottom: '5px', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                            Full NAICS Hierarchy
                        </div>
                        {filteredData.length > 0 ? (
                            filteredData.map(node => (
                                <TreeNode 
                                    key={node.code} 
                                    node={node} 
                                    selectedCodes={selectedCodes} 
                                    onToggle={handleToggle} 
                                    forceExpand={!!searchTerm}
                                />
                            ))
                        ) : (
                            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                                No matching codes found.
                            </div>
                        )}
                    </div>

                    {selectedCodes.size > 0 && (
                        <button 
                            onClick={() => onSelectionChange(new Set())}
                            style={{ 
                                marginTop: '10px', 
                                width: '100%', 
                                fontSize: '11px', 
                                padding: '4px', 
                                background: '#f8d7da', 
                                border: '1px solid #f5c6cb', 
                                color: '#721c24',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NAICSFilter;
