import React from 'react';

const MethodologyPanel = ({ onClose }) => {
  return (
    <div className="market-modal-overlay" onClick={onClose}>
      <div className="market-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '760px' }}>
        <div className="market-modal-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>ℹ️</span> How Market Categorization Works
          </h3>
          <button onClick={onClose} className="market-modal-close">&times;</button>
        </div>

        <div className="market-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '24px', lineHeight: 1.7 }}>
          {/* Overview */}
          <p style={{ fontSize: '14px', color: '#333', margin: '0 0 20px 0' }}>
            Every Top 50 MSA is assigned to one of <strong>three market archetypes</strong> based on
            two primary dimensions — <strong>Federation presence</strong> and <strong>DC coverage</strong> —
            with <strong>GDP growth</strong> as a tiebreaker for edge cases.
          </p>

          {/* Archetype Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="method-card" style={{ borderTopColor: '#007bff' }}>
              <div className="method-card-icon" style={{ background: '#007bff' }}>1</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#007bff', fontSize: '14px' }}>Dallas</h4>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>Clean / Scalable</div>
              <ul className="method-list">
                <li>No federation presence</li>
                <li>Strong DC &amp; operational footprint</li>
                <li>Ideal for rapid replication</li>
              </ul>
            </div>
            <div className="method-card" style={{ borderTopColor: '#28a745' }}>
              <div className="method-card-icon" style={{ background: '#28a745' }}>2</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#28a745', fontSize: '14px' }}>Atlanta</h4>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>Federated / Complex</div>
              <ul className="method-list">
                <li>Strong federation business</li>
                <li>DC overlap present</li>
                <li>Requires careful risk management</li>
              </ul>
            </div>
            <div className="method-card" style={{ borderTopColor: '#fd7e14' }}>
              <div className="method-card-icon" style={{ background: '#fd7e14' }}>3</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#fd7e14', fontSize: '14px' }}>Phoenix</h4>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>White Space / Incubation</div>
              <ul className="method-list">
                <li>Limited or fragmented presence</li>
                <li>High-growth metro potential</li>
                <li>Serves as incubation model</li>
              </ul>
            </div>
          </div>

          {/* Matrix */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Classification Matrix
          </h4>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
            An MSA&apos;s archetype is determined by the intersection of its federation and DC coverage levels.
            Where both are ambiguous, GDP growth acts as the tiebreaker.
          </p>
          <table className="method-matrix">
            <thead>
              <tr>
                <th></th>
                <th>No/Low DC <span className="method-dim">(0)</span></th>
                <th>Medium DC <span className="method-dim">(1)</span></th>
                <th>High DC <span className="method-dim">(≥2)</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="method-row-label">High Fed <span className="method-dim">(≥3)</span></td>
                <td><span className="method-badge" style={{ background: '#28a745' }}>Atlanta</span></td>
                <td><span className="method-badge" style={{ background: '#28a745' }}>Atlanta</span></td>
                <td><span className="method-badge" style={{ background: '#28a745' }}>Atlanta</span></td>
              </tr>
              <tr>
                <td className="method-row-label">Med Fed <span className="method-dim">(1-2)</span></td>
                <td><span className="method-badge" style={{ background: '#fd7e14' }}>Phoenix</span></td>
                <td><span className="method-badge method-gdp">GDP →</span></td>
                <td><span className="method-badge" style={{ background: '#28a745' }}>Atlanta</span></td>
              </tr>
              <tr>
                <td className="method-row-label">No Fed <span className="method-dim">(0)</span></td>
                <td><span className="method-badge method-gdp">GDP →</span></td>
                <td><span className="method-badge method-gdp">GDP →</span></td>
                <td><span className="method-badge" style={{ background: '#007bff' }}>Dallas</span></td>
              </tr>
            </tbody>
          </table>

          {/* GDP Explanation */}
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fff8f0', border: '1px solid #ffd8a8', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#e67700', marginBottom: '4px' }}>
              GDP → Tiebreaker Logic
            </div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
              When federation and DC coverage are both moderate or ambiguous, GDP growth determines the category:
              <br />
              <strong style={{ color: '#fd7e14' }}>≥ 3% GDP growth</strong> → Phoenix (high-growth market worth incubating)
              <br />
              <strong style={{ color: '#6c757d' }}>{'<'} 3% GDP growth</strong> → Falls to the stronger infrastructure signal (Atlanta or Dallas), or Uncategorized if neither is present
            </div>
          </div>

          {/* Inputs */}
          <h4 style={{ margin: '20px 0 8px 0', fontSize: '13px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Input Metrics
          </h4>
          <table className="method-inputs">
            <tbody>
              <tr>
                <td style={{ fontWeight: '600' }}>Federation Count</td>
                <td>Number of federation partners whose coverage radius includes the MSA</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>DC Count</td>
                <td>Number of distribution centers whose coverage radius includes the MSA</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>Nearest DC / Fed</td>
                <td>Distance in miles to closest infrastructure (uses per-location radii when set)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>GDP Growth (%)</td>
                <td>Projected GDP growth rate for the metropolitan area</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: '11px', color: '#999', marginTop: '16px', marginBottom: 0 }}>
            All thresholds are configurable via the Decision Tree editor. This matrix represents the default configuration.
          </p>
        </div>

        <div className="market-modal-footer">
          <button onClick={onClose} className="market-btn-primary">Got It</button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPanel;
