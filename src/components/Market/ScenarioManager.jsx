import React, { useState, useEffect } from 'react';
import { SCORING_FIELDS } from '../../data/msaDefaults';

const STORAGE_KEY = 'odp_market_scenarios';

const ScenarioManager = ({ onClose, onLoad, currentConfig }) => {
  const [scenarios, setScenarios] = useState([]);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState('save'); // 'save' | 'load'

  // Load scenarios from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setScenarios(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
  }, []);

  const saveScenarios = (updated) => {
    setScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      alert('Please enter a scenario name.');
      return;
    }

    const scenario = {
      id: `sc-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      weights: { ...currentConfig.weights },
      thresholds: { ...currentConfig.thresholds },
      resultsSummary: {
        totalMSAs: currentConfig.results?.length || 0,
        archetypes: {},
        bands: {},
      },
    };

    // Summarize results
    if (currentConfig.results) {
      currentConfig.results.forEach(m => {
        scenario.resultsSummary.archetypes[m.archetype] = (scenario.resultsSummary.archetypes[m.archetype] || 0) + 1;
        scenario.resultsSummary.bands[m.executionBand] = (scenario.resultsSummary.bands[m.executionBand] || 0) + 1;
      });
    }

    const updated = [scenario, ...scenarios];
    saveScenarios(updated);
    setNewName('');
    alert(`Scenario "${name}" saved!`);
  };

  const handleDelete = (id) => {
    const updated = scenarios.filter(s => s.id !== id);
    saveScenarios(updated);
  };

  const handleExportJSON = (scenario) => {
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenario_${scenario.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="market-modal-overlay" onClick={onClose}>
      <div className="market-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="market-modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💾</span> Scenario Manager
          </h3>
          <button onClick={onClose} className="market-modal-close">&times;</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {['save', 'load'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === tab ? '#fff' : '#f8f9fa',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #e83e8c' : '2px solid transparent',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                fontSize: '13px',
                color: activeTab === tab ? '#e83e8c' : '#666',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'save' ? '📝 Save Current' : '📂 Load Scenario'}
            </button>
          ))}
        </div>

        <div className="market-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'save' ? (
            <div>
              {/* Save UI */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>
                  SCENARIO NAME
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Q3 Aggressive Growth"
                  className="market-input"
                  style={{ width: '100%', marginBottom: '8px' }}
                />
                <button onClick={handleSave} className="market-btn-primary" style={{ width: '100%' }}>
                  💾 Save Scenario
                </button>
              </div>

              {/* Current Config Preview */}
              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Current Configuration</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {SCORING_FIELDS.map(f => (
                    <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>{f.label}:</span>
                      <strong>{(currentConfig.weights[f.key] * 100).toFixed(0)}%</strong>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                  <span style={{ color: '#666' }}>DC Distance: </span><strong>{currentConfig.thresholds.dcDistanceMiles} mi</strong>
                  <span style={{ color: '#666', marginLeft: '16px' }}>Revenue Floor: </span><strong>${(currentConfig.thresholds.revenueFloor / 1e6).toFixed(2)}M</strong>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {scenarios.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6c757d' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>💾</div>
                  No saved scenarios yet. Save one to get started.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scenarios.map(sc => (
                    <div key={sc.id} className="market-scenario-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{sc.name}</div>
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                            Saved {new Date(sc.createdAt).toLocaleDateString()} · {sc.resultsSummary.totalMSAs} MSAs
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onLoad(sc)}
                            className="market-btn-primary"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleExportJSON(sc)}
                            className="market-btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            📥
                          </button>
                          <button
                            onClick={() => handleDelete(sc.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #dc3545',
                              color: '#dc3545',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '4px 8px',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {/* Weight summary */}
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {SCORING_FIELDS.map(f => (
                          <span key={f.key}>{f.label.split(' ')[0]}: {(sc.weights[f.key] * 100).toFixed(0)}%</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="market-modal-footer">
          <button onClick={onClose} className="market-btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioManager;
