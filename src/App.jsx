import React, { useState } from 'react';
import TabNav from './components/Dashboard/TabNav';
import SmokeMode from './components/EventModes/SmokeMode';
import WinterMode from './components/EventModes/WinterMode';
import HeatMode from './components/EventModes/HeatMode';
import FloodMode from './components/EventModes/FloodMode';
import FluMode from './components/EventModes/FluMode';
import PlaceholderMode from './components/EventModes/PlaceholderMode';

const App = () => {
  // Simple version logging
  const APP_VERSION = "v1.2.0 - 2026-01-26 12:21 PM (WMS Fix)";
  console.log(`%c ODP Sales Utility ${APP_VERSION}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px; border-radius: 4px;');

  const [activeTab, setActiveTab] = useState('smoke');

  const renderContent = () => {
    switch (activeTab) {
      case 'smoke':
        return <SmokeMode />;
      case 'winter':
        return <WinterMode />;
      case 'heat':
        return <HeatMode />;
      case 'flood':
        return <FloodMode />;
      case 'flu':
        return <FluMode />;
      default:
        return <SmokeMode />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={{ flex: 1, position: 'relative' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
