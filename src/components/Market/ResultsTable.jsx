import React, { useState } from 'react';
import Papa from 'papaparse';

const ResultsTable = ({ results, selectedMSA, onSelectMSA, archetypes }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [filterArchetype, setFilterArchetype] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = filterArchetype === 'all'
    ? results
    : results.filter(m => m.archetype === filterArchetype);

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'nearestDcMi') {
      aVal = a.nearestDcMi ?? 9999;
      bVal = b.nearestDcMi ?? 9999;
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleCSVExport = () => {
    const csvData = sorted.map(m => ({
      MSA: m.name,
      State: m.state,
      Category: m.archetype,
      'Decision Path': m.treePath?.map(p => `${p.field} ${p.condition}`).join(' → ') || '',
      'Federation Count': m.federationCount,
      'DC Count': m.dcCount,
      'Nearest DC (mi)': m.nearestDcMi ?? 'N/A',
      'Nearest Fed (mi)': m.nearestFederationMi ?? 'N/A',
      'GDP Growth (%)': m.projectedGdpGrowth,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `market_categorization_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const archetypeCounts = {};
  results.forEach(m => { archetypeCounts[m.archetype] = (archetypeCounts[m.archetype] || 0) + 1; });

  return (
    <>
      <div className="sidebar-header" style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#333' }}>Markets <span className="badge">{results.length}</span></h3>
        <button onClick={handleCSVExport} disabled={results.length === 0} style={{ background: '#fff', border: '1px solid #ced4da', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', color: '#495057', fontWeight: '500' }}>📥 CSV</button>
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', gap: '4px', flexWrap: 'wrap', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <button onClick={() => setFilterArchetype('all')} className={`market-chip ${filterArchetype === 'all' ? 'active' : ''}`}>All ({results.length})</button>
        {Object.entries(archetypes).map(([key, arch]) => (
          archetypeCounts[key] > 0 && (
            <button key={key} onClick={() => setFilterArchetype(key)}
              className={`market-chip ${filterArchetype === key ? 'active' : ''}`}
              style={filterArchetype === key ? { background: arch.color, borderColor: arch.color, color: '#fff' } : {}}
            >
              {key.split(' ')[0]} ({archetypeCounts[key]})
            </button>
          )
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
            Run the categorization to see results here.
          </div>
        ) : (
          <table className="market-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>MSA {sortIcon('name')}</th>
                <th onClick={() => handleSort('archetype')}>Category {sortIcon('archetype')}</th>
                <th onClick={() => handleSort('federationCount')}>Fed {sortIcon('federationCount')}</th>
                <th onClick={() => handleSort('dcCount')}>DCs {sortIcon('dcCount')}</th>
                <th onClick={() => handleSort('nearestDcMi')}>Nearest DC {sortIcon('nearestDcMi')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(msa => {
                const color = msa.archetypeColor || archetypes[msa.archetype]?.color || '#6c757d';
                const isSelected = selectedMSA?.msaId === msa.msaId;
                const isExpanded = expandedRow === msa.msaId;

                return (
                  <React.Fragment key={msa.msaId}>
                    <tr className={`market-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => { onSelectMSA(msa); setExpandedRow(prev => prev === msa.msaId ? null : msa.msaId); }}
                    >
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '12px', color: '#333' }}>{msa.name}</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>{msa.state}</div>
                      </td>
                      <td><span className="market-archetype-badge" style={{ background: color }}>{msa.archetype}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: msa.federationCount > 0 ? '#28a745' : '#999' }}>{msa.federationCount}</td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: msa.dcCount > 0 ? '#007bff' : '#999' }}>{msa.dcCount}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#333' }}>{msa.nearestDcMi ?? '—'} mi</td>
                    </tr>
                    {isExpanded && (
                      <tr className="market-row-expanded">
                        <td colSpan={5}>
                          <div style={{ padding: '12px 16px' }}>
                            {/* Decision Path */}
                            {msa.treePath && msa.treePath.length > 0 && (
                              <div style={{ marginBottom: '12px', padding: '10px', background: '#f0f4ff', border: '1px solid #c3d4ff', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '600', color: '#004085', marginBottom: '6px', textTransform: 'uppercase' }}>Decision Path</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11px' }}>
                                  {msa.treePath.map((step, i) => (
                                    <React.Fragment key={i}>
                                      {i > 0 && <span style={{ color: '#999' }}>→</span>}
                                      <span style={{ padding: '2px 6px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', color: '#333' }}>
                                        {step.field} <strong>{step.condition}</strong>
                                        <span style={{ color: '#999', marginLeft: '4px' }}>({step.value})</span>
                                      </span>
                                    </React.Fragment>
                                  ))}
                                  <span style={{ color: '#999' }}>→</span>
                                  <span className="market-archetype-badge" style={{ background: color }}>{msa.archetype}</span>
                                </div>
                              </div>
                            )}

                            <div className="market-detail-grid">
                              <div className="market-detail-section">
                                <div className="market-detail-title">Infrastructure</div>
                                <div className="market-detail-row"><span>Federation In Range</span><strong>{msa.federationCount}</strong></div>
                                <div className="market-detail-row"><span>Nearest Federation</span><strong>{msa.nearestFederationMi ?? '—'} mi</strong></div>
                                <div className="market-detail-row"><span>DCs In Range</span><strong>{msa.dcCount}</strong></div>
                                <div className="market-detail-row"><span>Nearest DC</span><strong>{msa.nearestDcMi ?? '—'} mi</strong></div>
                                <div className="market-detail-row"><span>Nearest DC City</span><strong>{msa.nearestDC?.dc?.city || '—'}, {msa.nearestDC?.dc?.state || ''}</strong></div>
                              </div>
                              <div className="market-detail-section">
                                <div className="market-detail-title">Market Metrics</div>
                                <div className="market-detail-row"><span>GDP Growth</span><strong>{msa.projectedGdpGrowth}%</strong></div>
                                <div className="market-detail-row"><span>ODP Revenue</span><strong>${(msa.odpCurrentRevenue / 1e6).toFixed(2)}M</strong></div>
                                <div className="market-detail-row"><span>Office Occupancy</span><strong>{msa.officeOccupancyRate}%</strong></div>
                              </div>
                            </div>

                            {msa.matchedFederations && msa.matchedFederations.length > 0 && (
                              <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f0fff4', border: '1px solid #c3e6cb', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '600', color: '#155724', marginBottom: '6px', textTransform: 'uppercase' }}>Matched Federation Partners</div>
                                {msa.matchedFederations.map((fed, i) => (
                                  <div key={i} style={{ fontSize: '11px', color: '#333', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                    <span>{fed.companyName} — {fed.city}, {fed.state}</span>
                                    <span style={{ color: '#666' }}>{fed.distanceToMSA} mi</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ResultsTable;
