import React from 'react';

const QueryHelpModal = ({ onClose, content }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Query Type Explainer</h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
                    {content ? (
                        <div>
                            <h4 style={{ color: '#007bff', marginBottom: '8px' }}>{content.label}</h4>
                            <p style={{ marginBottom: '16px' }}><strong>Description:</strong> {content.description}</p>
                            
                            {content.explanation && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h5 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>How it works</h5>
                                    <p style={{ margin: 0 }}>{content.explanation}</p>
                                </div>
                            )}

                            {content.sampleQuery && (
                                <div>
                                    <h5 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Example Query Structure</h5>
                                    <div style={{ position: 'relative' }}>
                                        <pre style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e9ecef',
                                            overflowX: 'auto',
                                            fontSize: '12px',
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: 'monospace, monospace'
                                        }}>
                                            <code>{content.sampleQuery}</code>
                                        </pre>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(content.sampleQuery)}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: '#fff',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                color: '#495057'
                                            }}
                                            title="Copy sample SQL"
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '6px' }}>
                                        <em>* Note: The final query will inject your specific Zip Codes, NAICS categories, and chosen boolean filters.</em>
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>Select a query type to see details.</p>
                    )}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QueryHelpModal;
