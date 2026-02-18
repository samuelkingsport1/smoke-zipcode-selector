import React from 'react';

const ExportActionButtons = ({ onExport, loading, zipLoading }) => {
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '10px' }}>
                <button
                    className="export-btn"
                    onClick={() => onExport('DOWNLOAD')}
                    disabled={loading || zipLoading}
                    style={{ backgroundColor: '#4a90e2', fontSize: '11px' }}
                >
                    Download SQL
                </button>
                <button
                    className="export-btn"
                    onClick={() => onExport('COPY')}
                    disabled={loading || zipLoading}
                    style={{ backgroundColor: '#6c757d', fontSize: '11px' }}
                >
                    Copy SQL
                </button>
            </div>
            <button
                className="export-btn"
                onClick={() => onExport('COUNT')}
                disabled={loading || zipLoading}
                style={{ width: '100%', marginTop: '5px', backgroundColor: '#28a745', fontSize: '11px' }}
            >
                Copy Count SQL
            </button>
        </>
    );
};

export default ExportActionButtons;
