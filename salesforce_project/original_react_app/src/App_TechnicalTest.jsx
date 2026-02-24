import React from 'react';
import TechnicalMode from './components/EventModes/TechnicalMode';

const App_TechnicalTest = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', background: '#eee' }}>
                <strong>Technical Mode Isolation Test</strong>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <TechnicalMode />
            </div>
        </div>
    );
};

export default App_TechnicalTest;
