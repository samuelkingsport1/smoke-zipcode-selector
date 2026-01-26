import React, { useState, useEffect } from 'react';
import TabNav from './components/Dashboard/TabNav';
import SmokeMode from './components/EventModes/SmokeMode';
import WinterMode from './components/EventModes/WinterMode';
import HeatMode from './components/EventModes/HeatMode';
import FloodMode from './components/EventModes/FloodMode';
import FluMode from './components/EventModes/FluMode';
import PlaceholderMode from './components/EventModes/PlaceholderMode';
import Papa from 'papaparse';

const App = () => {
  // Simple version logging
  const APP_VERSION = "v1.2.2 - 2026-01-26 12:48 PM (Scroll Fix + Unified Dashboard)";
  console.log(`%c ODP Sales Utility ${APP_VERSION}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px; border-radius: 4px;');

  const [activeTab, setActiveTab] = useState('smoke');
  const [zipCodes, setZipCodes] = useState([]);
  const [zipLoading, setZipLoading] = useState(true);

  // Load Zip Codes Globally
  useEffect(() => {
    Papa.parse(`${import.meta.env.BASE_URL}zipcodes.csv`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const zips = [];
        results.data.forEach(r => {
          const lat = parseFloat(r.LATITUDE);
          const lng = parseFloat(r.LONGITUDE);
          if (!isNaN(lat) && !isNaN(lng)) {
            zips.push({
              zip: r.STD_ZIP5,
              lat: lat,
              lng: lng,
              city: r.USPS_ZIP_PREF_CITY_1221,
              state: r.USPS_ZIP_PREF_STATE_1221,
              county: r.USPS_ZIP_COUNTY_NAME // Assuming this field exists or similar
            });
          }
        });
        setZipCodes(zips);
        setZipLoading(false);
        console.log(`[App] Loaded ${zips.length} zipcodes globally.`);
      },
      error: (err) => {
        console.error("CSV Parse Error", err);
        setZipLoading(false);
      }
    });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'smoke':
        return <SmokeMode zipCodes={zipCodes} zipLoading={zipLoading} />;
      case 'winter':
        return <WinterMode zipCodes={zipCodes} zipLoading={zipLoading} />;
      case 'heat':
        return <HeatMode />;
      case 'flood':
        return <FloodMode />;
      case 'flu':
        return <FluMode />;
      default:
        return <SmokeMode zipCodes={zipCodes} zipLoading={zipLoading} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {/* minHeight: 0 is CRITICAL for flexbox scrolling to work in children */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
