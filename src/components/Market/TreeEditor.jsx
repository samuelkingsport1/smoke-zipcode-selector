import React, { useState, useCallback } from 'react';
import { TREE_FIELDS, validateTree, collectArchetypes } from '../../engines/decisionTreeEngine';

const COLORS = ['#28a745', '#007bff', '#fd7e14', '#6c757d', '#e83e8c', '#6610f2', '#20c997', '#dc3545', '#ffc107', '#17a2b8'];

const getFieldLabel = (key) => TREE_FIELDS.find(f => f.key === key)?.label || key;
const getOpLabel = (op) => {
  const ops = { gte: '≥', gt: '>', lte: '≤', lt: '<', eq: '=', between: '–' };
  return ops[op] || op;
};

/* ──────────────────────────────────────
   TREE ↔ TABLE CONVERSION UTILITIES
   ────────────────────────────────────── */

/**
 * Flatten tree into table rows.
 * Each row = { federation, dc, gdp, archetype, color, path }
 * federation/dc/gdp = { operator, value, label }
 */
function treeToRows(node, path = []) {
  if (!node) return [];
  if (node.type === 'leaf') {
    // Build row from accumulated path
    const row = { archetype: node.archetype, color: node.color || '#6c757d', id: node.id };
    const fieldMap = {};
    path.forEach(p => { fieldMap[p.field] = p; });
    row.federation = fieldMap.federationCount || null;
    row.dc = fieldMap.dcCount || null;
    row.gdp = fieldMap.projectedGdpGrowth || null;
    return [row];
  }
  if (node.type !== 'decision' || !node.branches) return [];

  const rows = [];
  for (const branch of node.branches) {
    const condition = {
      field: node.field,
      operator: branch.operator,
      value: branch.value,
      label: branch.label || '',
    };
    rows.push(...treeToRows(branch.child, [...path, condition]));
  }
  return rows;
}

/** Format a condition cell for display */
function formatCondition(cond) {
  if (!cond) return { text: 'Any', style: 'muted' };
  if (cond.operator === 'between') {
    const vals = Array.isArray(cond.value) ? cond.value : [0, 0];
    return { text: `${vals[0]}–${vals[1]}`, style: 'range' };
  }
  return { text: `${getOpLabel(cond.operator)} ${cond.value}`, style: 'normal' };
}

/**
 * Rebuild tree from table rows.
 * Strategy: group by federation first, then dc, then gdp.
 */
function rowsToTree(rows) {
  // Group by federation condition
  const fedGroups = {};
  rows.forEach(row => {
    const fedKey = row.federation ? `${row.federation.operator}|${JSON.stringify(row.federation.value)}` : 'any';
    if (!fedGroups[fedKey]) fedGroups[fedKey] = { condition: row.federation, rows: [] };
    fedGroups[fedKey].rows.push(row);
  });

  const fedBranches = Object.values(fedGroups).map(group => {
    const branch = {
      operator: group.condition?.operator || 'gte',
      value: group.condition?.value ?? 0,
      label: group.condition?.label || '',
    };

    // If only one row in this group, check if we need DC sub-branching
    if (group.rows.length === 1 && !group.rows[0].dc && !group.rows[0].gdp) {
      branch.child = {
        id: group.rows[0].id || `leaf-${Date.now()}`,
        type: 'leaf',
        archetype: group.rows[0].archetype,
        color: group.rows[0].color,
      };
      return branch;
    }

    // Group by DC
    const dcGroups = {};
    group.rows.forEach(row => {
      const dcKey = row.dc ? `${row.dc.operator}|${JSON.stringify(row.dc.value)}` : 'any';
      if (!dcGroups[dcKey]) dcGroups[dcKey] = { condition: row.dc, rows: [] };
      dcGroups[dcKey].rows.push(row);
    });

    const dcBranches = Object.values(dcGroups).map(dcGroup => {
      const dcBranch = {
        operator: dcGroup.condition?.operator || 'gte',
        value: dcGroup.condition?.value ?? 0,
        label: dcGroup.condition?.label || '',
      };

      if (dcGroup.rows.length === 1) {
        if (!dcGroup.rows[0].gdp) {
          dcBranch.child = {
            id: dcGroup.rows[0].id || `leaf-${Date.now()}`,
            type: 'leaf',
            archetype: dcGroup.rows[0].archetype,
            color: dcGroup.rows[0].color,
          };
          return dcBranch;
        }
      }

      // Group by GDP
      const gdpBranches = dcGroup.rows.map(row => ({
        operator: row.gdp?.operator || 'gte',
        value: row.gdp?.value ?? 0,
        label: row.gdp?.label || '',
        child: {
          id: row.id || `leaf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'leaf',
          archetype: row.archetype,
          color: row.color,
        },
      }));

      dcBranch.child = {
        id: `gdp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'decision',
        field: 'projectedGdpGrowth',
        label: 'GDP Growth',
        branches: gdpBranches,
      };
      return dcBranch;
    });

    if (dcBranches.length === 1 && dcBranches[0].child?.type === 'leaf' && !group.rows[0].dc) {
      branch.child = dcBranches[0].child;
    } else {
      branch.child = {
        id: `dc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'decision',
        field: 'dcCount',
        label: 'DC Coverage',
        branches: dcBranches,
      };
    }
    return branch;
  });

  return {
    id: 'root',
    type: 'decision',
    field: 'federationCount',
    label: 'Federation Presence',
    branches: fedBranches,
  };
}

/* ──────────────────────────────────────
   DECISION TABLE VIEW (Editable Grid)
   ────────────────────────────────────── */
const DecisionTable = ({ tree, onUpdate }) => {
  const rows = treeToRows(tree);
  const allArchetypes = [...new Set(rows.map(r => r.archetype))];

  const updateRow = (idx, field, value) => {
    const newRows = rows.map((r, i) => {
      if (i !== idx) return r;
      return { ...r, [field]: value };
    });
    onUpdate(rowsToTree(newRows));
  };

  const updateCondition = (idx, dimension, key, val) => {
    const newRows = rows.map((r, i) => {
      if (i !== idx) return r;
      const existing = r[dimension] || { operator: 'gte', value: 0, label: '' };
      const updated = { ...existing, [key]: val };
      updated.label = `${getOpLabel(updated.operator)} ${updated.value}`;
      return { ...r, [dimension]: updated };
    });
    onUpdate(rowsToTree(newRows));
  };

  const addRow = () => {
    const newRow = {
      federation: { operator: 'eq', value: 0, label: '= 0' },
      dc: { operator: 'eq', value: 0, label: '= 0' },
      gdp: null,
      archetype: 'Uncategorized',
      color: '#6c757d',
      id: `leaf-${Date.now()}`,
    };
    onUpdate(rowsToTree([...rows, newRow]));
  };

  const removeRow = (idx) => {
    if (rows.length <= 1) return;
    onUpdate(rowsToTree(rows.filter((_, i) => i !== idx)));
  };

  const opOptions = [
    { value: 'gte', label: '≥' },
    { value: 'gt', label: '>' },
    { value: 'lte', label: '≤' },
    { value: 'lt', label: '<' },
    { value: 'eq', label: '=' },
    { value: 'between', label: 'between' },
  ];

  return (
    <div className="dt-container">
      <p className="dt-hint">Each row is a rule. The engine evaluates top-to-bottom, first match wins.</p>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              <th className="dt-th dt-th-num">#</th>
              <th className="dt-th">🤝 Federation Count</th>
              <th className="dt-th">🏭 DC Count</th>
              <th className="dt-th">📈 GDP Growth (%)</th>
              <th className="dt-th dt-th-arrow">→</th>
              <th className="dt-th">Archetype</th>
              <th className="dt-th dt-th-action"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="dt-row">
                <td className="dt-cell dt-cell-num">{idx + 1}</td>

                {/* Federation */}
                <td className="dt-cell">
                  {row.federation ? (
                    <div className="dt-condition">
                      <select value={row.federation.operator} onChange={e => updateCondition(idx, 'federation', 'operator', e.target.value)} className="dt-op-select">
                        {opOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {row.federation.operator === 'between' ? (
                        <span className="dt-between">
                          <input type="number" value={Array.isArray(row.federation.value) ? row.federation.value[0] : 0} onChange={e => updateCondition(idx, 'federation', 'value', [parseFloat(e.target.value) || 0, Array.isArray(row.federation.value) ? row.federation.value[1] : 10])} className="dt-num-input" />
                          <span>–</span>
                          <input type="number" value={Array.isArray(row.federation.value) ? row.federation.value[1] : 10} onChange={e => updateCondition(idx, 'federation', 'value', [Array.isArray(row.federation.value) ? row.federation.value[0] : 0, parseFloat(e.target.value) || 0])} className="dt-num-input" />
                        </span>
                      ) : (
                        <input type="number" value={row.federation.value ?? 0} onChange={e => updateCondition(idx, 'federation', 'value', parseFloat(e.target.value) || 0)} className="dt-num-input" />
                      )}
                    </div>
                  ) : (
                    <span className="dt-any" onClick={() => updateCondition(idx, 'federation', 'operator', 'gte')}>Any</span>
                  )}
                </td>

                {/* DC Count */}
                <td className="dt-cell">
                  {row.dc ? (
                    <div className="dt-condition">
                      <select value={row.dc.operator} onChange={e => updateCondition(idx, 'dc', 'operator', e.target.value)} className="dt-op-select">
                        {opOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {row.dc.operator === 'between' ? (
                        <span className="dt-between">
                          <input type="number" value={Array.isArray(row.dc.value) ? row.dc.value[0] : 0} onChange={e => updateCondition(idx, 'dc', 'value', [parseFloat(e.target.value) || 0, Array.isArray(row.dc.value) ? row.dc.value[1] : 10])} className="dt-num-input" />
                          <span>–</span>
                          <input type="number" value={Array.isArray(row.dc.value) ? row.dc.value[1] : 10} onChange={e => updateCondition(idx, 'dc', 'value', [Array.isArray(row.dc.value) ? row.dc.value[0] : 0, parseFloat(e.target.value) || 0])} className="dt-num-input" />
                        </span>
                      ) : (
                        <input type="number" value={row.dc.value ?? 0} onChange={e => updateCondition(idx, 'dc', 'value', parseFloat(e.target.value) || 0)} className="dt-num-input" />
                      )}
                    </div>
                  ) : (
                    <span className="dt-any" onClick={() => updateCondition(idx, 'dc', 'operator', 'gte')}>Any</span>
                  )}
                </td>

                {/* GDP */}
                <td className="dt-cell">
                  {row.gdp ? (
                    <div className="dt-condition">
                      <select value={row.gdp.operator} onChange={e => updateCondition(idx, 'gdp', 'operator', e.target.value)} className="dt-op-select">
                        {opOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input type="number" step="0.1" value={row.gdp.value ?? 0} onChange={e => updateCondition(idx, 'gdp', 'value', parseFloat(e.target.value) || 0)} className="dt-num-input" />
                    </div>
                  ) : (
                    <span className="dt-any" onClick={() => updateCondition(idx, 'gdp', 'operator', 'gte')}>Any</span>
                  )}
                </td>

                <td className="dt-cell dt-cell-arrow">→</td>

                {/* Archetype */}
                <td className="dt-cell">
                  <div className="dt-archetype">
                    <input type="color" value={row.color} onChange={e => updateRow(idx, 'color', e.target.value)} className="dt-color-swatch" />
                    <input type="text" value={row.archetype} onChange={e => updateRow(idx, 'archetype', e.target.value)} className="dt-name-input" />
                  </div>
                </td>

                <td className="dt-cell dt-cell-action">
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(idx)} className="dt-remove" title="Remove rule">✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="dt-add-row">+ Add Rule</button>
    </div>
  );
};

/* ──────────────────────────────────────
   INTERACTIVE MATRIX HEATMAP (Visual)
   ────────────────────────────────────── */
const MatrixHeatmap = ({ tree, onUpdate }) => {
  const rows = treeToRows(tree);
  const allArchetypes = collectArchetypes(tree);
  const archetypeNames = Object.keys(allArchetypes);

  // Build the 3×3 matrix from rows
  const fedLevels = [
    { key: 'high', label: 'High Fed (≥3)', match: r => r.federation && ((r.federation.operator === 'gte' && r.federation.value >= 3)) },
    { key: 'med', label: 'Med Fed (1-2)', match: r => r.federation && r.federation.operator === 'between' },
    { key: 'none', label: 'No Fed (0)', match: r => r.federation && r.federation.operator === 'eq' && r.federation.value === 0 },
  ];
  const dcLevels = [
    { key: 'none', label: 'No DC (0)', match: r => r.dc && r.dc.operator === 'eq' && r.dc.value === 0 },
    { key: 'med', label: 'Med DC (1)', match: r => r.dc && r.dc.operator === 'eq' && r.dc.value === 1 },
    { key: 'high', label: 'High DC (≥2)', match: r => (r.dc && r.dc.operator === 'gte' && r.dc.value >= 2) || (!r.dc) },
  ];

  /** Find which archetype a cell maps to */
  const getCellInfo = (fedLevel, dcLevel) => {
    const matching = rows.filter(r => fedLevel.match(r) && dcLevel.match(r));
    if (matching.length === 0) {
      // Check if the fed level has no DC branching (e.g., "High Fed → always Atlanta")
      const fedOnly = rows.filter(r => fedLevel.match(r) && !r.dc);
      if (fedOnly.length > 0) return { archetype: fedOnly[0].archetype, color: fedOnly[0].color, isGdp: false };
      return { archetype: '—', color: '#f0f0f0', isGdp: false };
    }
    if (matching.length === 1) {
      return { archetype: matching[0].archetype, color: matching[0].color, isGdp: false };
    }
    // Multiple matches = GDP tiebreaker
    return { archetype: 'GDP→', color: '#ffeeba', isGdp: true, rows: matching };
  };

  const cycleArchetype = (fedLevel, dcLevel) => {
    const cell = getCellInfo(fedLevel, dcLevel);
    if (cell.isGdp) return; // Don't cycle GDP tiebreaker cells
    const currentIdx = archetypeNames.indexOf(cell.archetype);
    const nextIdx = (currentIdx + 1) % archetypeNames.length;
    const nextName = archetypeNames[nextIdx];
    const nextColor = allArchetypes[nextName]?.color || '#6c757d';

    // Update all matching rows
    const newRows = rows.map(r => {
      if (fedLevel.match(r) && (dcLevel.match(r) || (!r.dc))) {
        return { ...r, archetype: nextName, color: nextColor };
      }
      return r;
    });
    onUpdate(rowsToTree(newRows));
  };

  return (
    <div className="matrix-heatmap">
      <p className="dt-hint">Click any cell to cycle its archetype. <span className="matrix-gdp-badge">GDP→</span> cells are GDP tiebreakers (edit in Decision Table).</p>
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner"></th>
            {dcLevels.map(dc => (
              <th key={dc.key} className="matrix-col-header">{dc.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fedLevels.map(fed => (
            <tr key={fed.key}>
              <th className="matrix-row-header">{fed.label}</th>
              {dcLevels.map(dc => {
                const cell = getCellInfo(fed, dc);
                return (
                  <td
                    key={dc.key}
                    className={`matrix-cell ${cell.isGdp ? 'matrix-cell-gdp' : ''}`}
                    style={{ '--cell-color': cell.isGdp ? '#ffeeba' : cell.color }}
                    onClick={() => cycleArchetype(fed, dc)}
                    title={cell.isGdp ? 'GDP tiebreaker — edit thresholds in Decision Table' : `Click to change (current: ${cell.archetype})`}
                  >
                    <span className="matrix-cell-label" style={{ color: cell.isGdp ? '#856404' : '#fff' }}>
                      {cell.archetype}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="matrix-legend">
        {Object.entries(allArchetypes).map(([name, arch]) => (
          <div key={name} className="matrix-legend-item">
            <span className="matrix-legend-swatch" style={{ background: arch.color }} />
            {name}
          </div>
        ))}
        <div className="matrix-legend-item">
          <span className="matrix-legend-swatch" style={{ background: '#ffeeba', border: '1px solid #ffc107' }} />
          GDP Tiebreaker
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────
   FLOWCHART VIEW (Read-Only)
   Top-down visual flowchart rendering
   ────────────────────────────────────── */
const FlowchartNode = ({ node }) => {
  if (!node) return null;

  if (node.type === 'leaf') {
    return (
      <div className="flow-leaf" style={{ borderColor: node.color || '#6c757d' }}>
        <span className="flow-leaf-dot" style={{ background: node.color || '#6c757d' }} />
        {node.archetype}
      </div>
    );
  }

  if (node.type !== 'decision') return null;

  return (
    <div className="flow-group">
      <div className="flow-diamond">
        <div className="flow-diamond-inner">
          {node.label || getFieldLabel(node.field)}
        </div>
      </div>
      <div className="flow-branches">
        {node.branches.map((branch, idx) => (
          <div key={idx} className="flow-branch">
            <div className="flow-connector" />
            <div className="flow-branch-label">
              {branch.operator === 'between'
                ? `${Array.isArray(branch.value) ? branch.value.join('–') : branch.value}`
                : `${getOpLabel(branch.operator)} ${branch.value}`}
            </div>
            <div className="flow-connector" />
            <FlowchartNode node={branch.child} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────
   TREE EDITOR MODAL (Triple View)
   ────────────────────────────────────── */
const TreeEditor = ({ tree, onSave, onClose }) => {
  const [editTree, setEditTree] = useState(JSON.parse(JSON.stringify(tree)));
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'matrix', or 'flow'
  const [validation, setValidation] = useState(null);

  const handleValidate = useCallback(() => {
    const result = validateTree(editTree);
    setValidation(result);
    return result;
  }, [editTree]);

  const handleSave = () => {
    const result = handleValidate();
    if (!result.valid) return;
    onSave(editTree);
    onClose();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(editTree, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decision_tree_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.type === 'decision' || imported.type === 'leaf') {
          setEditTree(imported);
          setValidation(null);
        } else {
          alert('Invalid tree JSON.');
        }
      } catch (err) {
        alert('Failed to parse JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const archetypes = collectArchetypes(editTree);

  return (
    <div className="market-modal-overlay" onClick={onClose}>
      <div className="market-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="market-modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌳</span> Categorization Rules
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setActiveTab('table')} className={`tree-tab ${activeTab === 'table' ? 'active' : ''}`}>
              📋 Decision Table
            </button>
            <button onClick={() => setActiveTab('matrix')} className={`tree-tab ${activeTab === 'matrix' ? 'active' : ''}`}>
              🔲 Matrix
            </button>
            <button onClick={() => setActiveTab('flow')} className={`tree-tab ${activeTab === 'flow' ? 'active' : ''}`}>
              📊 Flowchart
            </button>
            <button onClick={onClose} className="market-modal-close" style={{ marginLeft: '12px' }}>&times;</button>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#666' }}>CATEGORIES:</span>
          {Object.entries(archetypes).map(([name, arch]) => (
            <span key={name} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', borderRadius: '12px',
              background: arch.color, color: '#fff', fontSize: '11px', fontWeight: '600',
            }}>
              {name}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="market-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'table' && (
            <DecisionTable tree={editTree} onUpdate={setEditTree} />
          )}
          {activeTab === 'matrix' && (
            <MatrixHeatmap tree={editTree} onUpdate={setEditTree} />
          )}
          {activeTab === 'flow' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <FlowchartNode node={editTree} />
            </div>
          )}

          {validation && (
            <div style={{ marginTop: '16px' }}>
              {validation.valid ? (
                <div style={{ padding: '10px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px', fontSize: '12px', color: '#155724' }}>
                  ✅ Tree is valid — every branch terminates at a category.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {validation.errors.map((err, i) => (
                    <div key={i} style={{ padding: '8px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px', fontSize: '11px', color: '#721c24' }}>
                      ❌ {err}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="market-modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleExport} className="market-btn-secondary" style={{ fontSize: '11px' }}>📥 Export JSON</button>
            <label className="market-btn-secondary" style={{ fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '8px 14px' }}>
              📤 Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleValidate} className="market-btn-secondary">🔍 Validate</button>
            <button onClick={handleSave} className="market-btn-primary">💾 Save Rules</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeEditor;
