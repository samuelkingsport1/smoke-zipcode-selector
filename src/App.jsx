import React from 'react';
import MarketMode from './components/Market/MarketMode';
import PasswordGate from './components/PasswordGate';

const App = () => {
  const APP_VERSION = "v2.1.0 - 2026-03-27 (Market Engine + Decision Tree)";
  console.log(`%c ODP Market Engine ${APP_VERSION}`, 'background: #222; color: #e83e8c; font-size: 14px; padding: 4px; border-radius: 4px;');

  return (
    <PasswordGate>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <MarketMode />
      </div>
    </PasswordGate>
  );
};

export default App;
