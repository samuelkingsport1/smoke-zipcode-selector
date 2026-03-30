import React, { useState, useEffect } from 'react';

/**
 * Client-side password gate for GitHub Pages.
 * Not a fortress — just keeps casual visitors out.
 * 
 * Password hash is stored in code (SHA-256).
 * Session persists via sessionStorage so you don't re-enter per page refresh.
 * 
 * To change the password:
 * 1. Open browser console
 * 2. Run: crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_NEW_PASSWORD')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
 * 3. Replace PASSWORD_HASH below with the output
 */

// SHA-256 hash of "odp2026"
const PASSWORD_HASH = 'e8fd4a1b83242314390c00ee87e4ac8f2aa2536aa918dcf33879cb9bbc9fc917';

const SESSION_KEY = 'odp_market_auth';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const PasswordGate = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hash = await hashPassword(password);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  if (checking) return null;
  if (authenticated) return children;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '360px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '22px', fontWeight: '600' }}>
          Market Categorization Engine
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 28px 0', fontSize: '13px' }}>
          ODP Internal Tool — Authorization Required
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            border: error ? '1px solid #dc3545' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
        />

        {error && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
            {error}
          </div>
        )}

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          marginTop: '16px',
          background: 'linear-gradient(135deg, #e83e8c 0%, #6f42c1 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          transition: 'opacity 0.2s',
        }}>
          Access Tool
        </button>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '20px', marginBottom: 0 }}>
          Contact your ODP administrator for access
        </p>
      </form>
    </div>
  );
};

export default PasswordGate;
