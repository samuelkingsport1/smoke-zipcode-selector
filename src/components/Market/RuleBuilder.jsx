import React, { useState } from 'react';
import { validateRuleSet, detectOverlaps, detectGaps } from '../../engines/ruleValidator';
import { ARCHETYPES, SCORING_FIELDS } from '../../data/msaDefaults';

const OPERATORS = [
  { value: 'lt', label: '< Less Than' },
  { value: 'lte', label: '≤ Less or Equal' },
  { value: 'gt', label: '> Greater Than' },
  { value: 'gte', label: '≥ Greater or Equal' },
  { value: 'eq', label: '= Equal To' },
  { value: 'between', label: '↔ Between' },
];

const DATA_TYPES = [
  { value: 'integer', label: 'Integer (whole #)' },
  { value: 'decimal', label: 'Decimal (continuous)' },
];

const emptyRule = () => ({
  id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  field: SCORING_FIELDS[0].key,
  operator: 'gte',
  value: 0,
  value2: 100,
  archetype: 'Atlanta_Type',
  dataType: 'integer',
});

const RuleBuilder = ({ onClose, thresholds, setThresholds }) => {
  const [rules, setRules] = useState([emptyRule()]);
  const [validation, setValidation] = useState(null);

  const addRule = () => setRules(prev => [...prev, emptyRule()]);

  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const updateRule = (id, field, value) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setValidation(null); // clear validation on change
  };

  const handleValidate = () => {
    // Build field ranges from current data context
    const fieldRanges = {};
    SCORING_FIELDS.forEach(f => {
      if (f.format === 'integer') {
        fieldRanges[f.key] = { min: 0, max: 100 };
      } else {
        fieldRanges[f.key] = { min: 0, max: 100 };
      }
    });

    const result = validateRuleSet(rules, fieldRanges);
    setValidation(result);
  };

  const handleSave = () => {
    handleValidate();
    // Re-validate after setting
    const fieldRanges = {};
    SCORING_FIELDS.forEach(f => {
      fieldRanges[f.key] = { min: 0, max: 100 };
    });
    const result = validateRuleSet(rules, fieldRanges);
    if (!result.valid) {
      return; // Block save — validation errors shown
    }
    // Save rules (in a full implementation, this would write to custom metadata)
    alert('Rules validated and saved successfully!');
    onClose();
  };

  return (
    <div className="market-modal-overlay" onClick={onClose}>
      <div className="market-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="market-modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔧</span> Rule Configuration Engine
          </h3>
          <button onClick={onClose} className="market-modal-close">&times;</button>
        </div>

        <div className="market-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Rules List */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>Categorization Rules ({rules.length})</h4>
              <button onClick={addRule} className="market-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                + Add Rule
              </button>
            </div>

            {rules.map((rule, idx) => (
              <div key={rule.id} className="market-rule-card">
                <div className="market-rule-header">
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Rule #{idx + 1}</span>
                  <button
                    onClick={() => removeRule(rule.id)}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ✕
                  </button>
                </div>
                <div className="market-rule-body">
                  {/* Row 1: Field + Data Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>TARGET FIELD</label>
                      <select
                        value={rule.field}
                        onChange={e => updateRule(rule.id, 'field', e.target.value)}
                        className="market-input"
                      >
                        {SCORING_FIELDS.map(f => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>DATA TYPE</label>
                      <select
                        value={rule.dataType}
                        onChange={e => updateRule(rule.id, 'dataType', e.target.value)}
                        className="market-input"
                      >
                        {DATA_TYPES.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Operator + Value(s) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>OPERATOR</label>
                      <select
                        value={rule.operator}
                        onChange={e => updateRule(rule.id, 'operator', e.target.value)}
                        className="market-input"
                      >
                        {OPERATORS.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>VALUE</label>
                      <input
                        type="number"
                        value={rule.value}
                        onChange={e => updateRule(rule.id, 'value', parseFloat(e.target.value) || 0)}
                        className="market-input"
                      />
                    </div>
                    {rule.operator === 'between' && (
                      <div>
                        <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>VALUE 2</label>
                        <input
                          type="number"
                          value={rule.value2}
                          onChange={e => updateRule(rule.id, 'value2', parseFloat(e.target.value) || 0)}
                          className="market-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 3: Archetype Assignment */}
                  <div>
                    <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>ASSIGNS ARCHETYPE</label>
                    <select
                      value={rule.archetype}
                      onChange={e => updateRule(rule.id, 'archetype', e.target.value)}
                      className="market-input"
                    >
                      {Object.entries(ARCHETYPES).map(([key, arch]) => (
                        <option key={key} value={key}>{arch.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Results */}
          {validation && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: validation.valid ? '#28a745' : '#dc3545' }}>
                {validation.valid ? '✅ Validation Passed' : '❌ Validation Failed'}
              </h4>
              {validation.errors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {validation.errors.map((err, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#856404',
                    }}>
                      ⚠️ {err}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="market-modal-footer">
          <button onClick={handleValidate} className="market-btn-secondary">
            🔍 Validate Rules
          </button>
          <button onClick={handleSave} className="market-btn-primary">
            💾 Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
