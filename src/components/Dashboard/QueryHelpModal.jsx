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
                            <p><strong>Description:</strong> {content.description}</p>
                            <p><em>(Placeholder for detailed SQL logic explanation based on selected query type.)</em></p>
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
