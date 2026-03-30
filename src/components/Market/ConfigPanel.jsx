import React, { useRef, useState } from 'react';

const ConfigPanel = ({
  thresholds,
  setThresholds,
  onRun,
  onOpenTree,
  onOpenScenarios,
  onOpenMethodology,
  onInfraUpload,
  loading,
  status,
  infrastructure,
  setInfrastructure,
  msaData,
  setMsaData,
  showRadii,
  setShowRadii,
  archetypes,
}) => {
  const fileInputRef = useRef(null);
  const [showDcList, setShowDcList] = useState(false);
  const [showFedList, setShowFedList] = useState(false);
  const [showMsaList, setShowMsaList] = useState(false);

  const handleThresholdChange = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.distributionCenters && data.federationLocations) {
          onInfraUpload(data);
        } else {
          alert('Invalid JSON: expected "distributionCenters" and "federationLocations" arrays.');
        }
      } catch (err) {
        alert('Failed to parse JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDcRadiusChange = (index, value) => {
    setInfrastructure(prev => {
      const updated = { ...prev, distributionCenters: [...prev.distributionCenters] };
      updated.distributionCenters[index] = { ...updated.distributionCenters[index], radius: value === '' ? null : parseFloat(value) || 0 };
      return updated;
    });
  };

  const handleFedRadiusChange = (index, value) => {
    setInfrastructure(prev => {
      const updated = { ...prev, federationLocations: [...prev.federationLocations] };
      updated.federationLocations[index] = { ...updated.federationLocations[index], radius: value === '' ? null : parseFloat(value) || 0 };
      return updated;
    });
  };

  const resetAllDcRadii = () => {
    setInfrastructure(prev => ({ ...prev, distributionCenters: prev.distributionCenters.map(dc => ({ ...dc, radius: null })) }));
  };

  const resetAllFedRadii = () => {
    setInfrastructure(prev => ({ ...prev, federationLocations: prev.federationLocations.map(fed => ({ ...fed, radius: null })) }));
  };

  const handleMsaRadiusChange = (index, value) => {
    setMsaData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], radius: value === '' ? null : parseFloat(value) || 0 };
      return updated;
    });
  };

  const resetAllMsaRadii = () => {
    setMsaData(prev => prev.map(msa => ({ ...msa, radius: null })));
  };

  return (
    <>
      <div className="sidebar-header" style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #e83e8c 0%, #6f42c1 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📊</span> Market Categorization Engine
        </h3>
        <div style={{ fontSize: '11px', opacity: 0.85 }}>ODP Local Market Design</div>
      </div>

      <div className="sidebar-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Infrastructure */}
        <div className="sidebar-section">
          <label className="sidebar-label" style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>INFRASTRUCTURE DATA</label>
          <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced4da', fontSize: '12px', color: '#495057' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>🏭 DCs: <strong>{infrastructure.distributionCenters.length}</strong></span>
              <span>🤝 Federation: <strong>{infrastructure.federationLocations.length}</strong></span>
            </div>
            <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '8px', background: 'white', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#495057', marginBottom: '6px' }}>
              📁 Upload New Infrastructure JSON
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: '#666' }}>
              <input type="checkbox" checked={showRadii} onChange={(e) => setShowRadii(e.target.checked)} style={{ margin: 0 }} />
              Show coverage radii on map
            </label>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Default Radii */}
        <div className="sidebar-section">
          <label className="sidebar-label" style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>DEFAULT COVERAGE RADII</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '3px' }}>🏭 DC (mi)</label>
              <input type="number" min="0" value={thresholds.defaultDcRadius} onChange={(e) => handleThresholdChange('defaultDcRadius', e.target.value)} className="market-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '3px' }}>🤝 Fed (mi)</label>
              <input type="number" min="0" value={thresholds.defaultFedRadius} onChange={(e) => handleThresholdChange('defaultFedRadius', e.target.value)} className="market-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '3px' }}>📍 MSA (mi)</label>
              <input type="number" min="0" value={thresholds.defaultMsaRadius} onChange={(e) => handleThresholdChange('defaultMsaRadius', e.target.value)} className="market-input" />
            </div>
          </div>
        </div>

        {/* DC Radii */}
        <div className="sidebar-section">
          <button onClick={() => setShowDcList(prev => !prev)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc3545' }}>
            <span>🏭 DC Radii ({infrastructure.distributionCenters.length})</span>
            <span>{showDcList ? '▲' : '▼'}</span>
          </button>
          {showDcList && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button onClick={resetAllDcRadii} style={{ fontSize: '10px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline' }}>Reset all to default</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {infrastructure.distributionCenters.map((dc, idx) => {
                  const isCustom = dc.radius != null;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: isCustom ? '#fff5f5' : '#f8f9fa', borderRadius: '4px', border: isCustom ? '1px solid #f5c6cb' : '1px solid #e9ecef', fontSize: '11px' }}>
                      <span style={{ flex: 1, color: '#333', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dc.city}, {dc.state}</span>
                      <input type="number" min="0" placeholder={thresholds.defaultDcRadius} value={dc.radius != null ? dc.radius : ''} onChange={(e) => handleDcRadiusChange(idx, e.target.value)} style={{ width: '60px', padding: '3px 5px', border: '1px solid #ced4da', borderRadius: '3px', fontSize: '11px', textAlign: 'right' }} />
                      <span style={{ fontSize: '10px', color: '#999', minWidth: '18px' }}>mi</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fed Radii */}
        <div className="sidebar-section">
          <button onClick={() => setShowFedList(prev => !prev)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f3f0ff', border: '1px solid #d6ccff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#6610f2' }}>
            <span>🤝 Federation Radii ({infrastructure.federationLocations.length})</span>
            <span>{showFedList ? '▲' : '▼'}</span>
          </button>
          {showFedList && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button onClick={resetAllFedRadii} style={{ fontSize: '10px', background: 'none', border: 'none', color: '#6610f2', cursor: 'pointer', textDecoration: 'underline' }}>Reset all to default</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {infrastructure.federationLocations.map((fed, idx) => {
                  const isCustom = fed.radius != null;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: isCustom ? '#f3f0ff' : '#f8f9fa', borderRadius: '4px', border: isCustom ? '1px solid #d6ccff' : '1px solid #e9ecef', fontSize: '11px' }}>
                      <span style={{ flex: 1, color: '#333', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fed.companyName}</span>
                      <input type="number" min="0" placeholder={thresholds.defaultFedRadius} value={fed.radius != null ? fed.radius : ''} onChange={(e) => handleFedRadiusChange(idx, e.target.value)} style={{ width: '60px', padding: '3px 5px', border: '1px solid #ced4da', borderRadius: '3px', fontSize: '11px', textAlign: 'right' }} />
                      <span style={{ fontSize: '10px', color: '#999', minWidth: '18px' }}>mi</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MSA Radii */}
        <div className="sidebar-section">
          <button onClick={() => setShowMsaList(prev => !prev)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
            <span>📍 MSA Radii ({msaData.length})</span>
            <span>{showMsaList ? '▲' : '▼'}</span>
          </button>
          {showMsaList && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button onClick={resetAllMsaRadii} style={{ fontSize: '10px', background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', textDecoration: 'underline' }}>Reset all to default</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {msaData.map((msa, idx) => {
                  const isCustom = msa.radius != null;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: isCustom ? '#f0fdf4' : '#f8f9fa', borderRadius: '4px', border: isCustom ? '1px solid #bbf7d0' : '1px solid #e9ecef', fontSize: '11px' }}>
                      <span style={{ flex: 1, color: '#333', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msa.name}</span>
                      <input type="number" min="0" placeholder={thresholds.defaultMsaRadius} value={msa.radius != null ? msa.radius : ''} onChange={(e) => handleMsaRadiusChange(idx, e.target.value)} style={{ width: '60px', padding: '3px 5px', border: '1px solid #ced4da', borderRadius: '3px', fontSize: '11px', textAlign: 'right' }} />
                      <span style={{ fontSize: '10px', color: '#999', minWidth: '18px' }}>mi</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Archetype Legend (dynamic from tree) */}
        <div className="sidebar-section">
          <label className="sidebar-label" style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>CATEGORY LEGEND</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(archetypes).map(([key, arch]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#495057' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: arch.color, display: 'inline-block', flexShrink: 0 }} />
                <strong>{arch.label}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={onRun} disabled={loading} className="market-btn-primary">
            {loading ? '⏳ Running...' : '▶ Run Categorization'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onOpenTree} className="market-btn-secondary" style={{ flex: 1 }}>🌳 Decision Tree</button>
            <button onClick={onOpenScenarios} className="market-btn-secondary" style={{ flex: 1 }}>💾 Scenarios</button>
          </div>
          <button onClick={onOpenMethodology} className="market-btn-secondary" style={{ width: '100%', fontSize: '11px', color: '#6f42c1' }}>ℹ️ How It Works</button>
        </div>
      </div>

      <div className="sidebar-footer" style={{ padding: '12px', borderTop: '1px solid #eee', background: '#f8f9fa', flexShrink: 0 }}>
        <small style={{ color: '#6c757d', fontSize: '11px' }}>{status}</small>
      </div>
    </>
  );
};

export default ConfigPanel;
