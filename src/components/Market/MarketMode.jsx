import React, { useState, useEffect, useCallback } from 'react';
import { Marker, CircleMarker, Circle, Tooltip } from 'react-leaflet';
import MapComponent from '../MapContainer';
import DashboardLayout from '../Dashboard/DashboardLayout';
import ConfigPanel from './ConfigPanel';
import ResultsTable from './ResultsTable';
import TreeEditor from './TreeEditor';
import ScenarioManager from './ScenarioManager';
import MethodologyPanel from './MethodologyPanel';
import { categorizeAllWithTree, collectArchetypes } from '../../engines/decisionTreeEngine';
import { DEFAULT_THRESHOLDS } from '../../data/msaDefaults';
import DEFAULT_TREE from '../../data/defaultTree';
import L from 'leaflet';

const MarketMode = () => {
  const [msaData, setMsaData] = useState([]);
  const [infrastructure, setInfrastructure] = useState({ distributionCenters: [], federationLocations: [] });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading MSA data...');

  const [thresholds, setThresholds] = useState({ ...DEFAULT_THRESHOLDS });
  const [tree, setTree] = useState(JSON.parse(JSON.stringify(DEFAULT_TREE)));

  const [results, setResults] = useState([]);
  const [selectedMSA, setSelectedMSA] = useState(null);

  const [showTreeEditor, setShowTreeEditor] = useState(false);
  const [showScenarioManager, setShowScenarioManager] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const [showRadii, setShowRadii] = useState(true);

  // Derive archetypes from tree for consistent colors
  const archetypes = collectArchetypes(tree);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}msa_data.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}infrastructure.json`).then(r => r.json()),
    ]).then(([msas, infra]) => {
      setMsaData(msas);
      setInfrastructure(infra);
      setLoading(false);
      setStatus(`Loaded ${msas.length} MSAs, ${infra.distributionCenters.length} DCs, ${infra.federationLocations.length} Federation sites.`);
    }).catch(err => {
      console.error('Failed to load data:', err);
      setStatus(`Error loading data: ${err.message}`);
      setLoading(false);
    });
  }, []);

  const runEngine = useCallback(() => {
    if (msaData.length === 0) return;

    setStatus('Running decision tree categorization...');
    setLoading(true);

    setTimeout(() => {
      try {
        const categorized = categorizeAllWithTree(msaData, infrastructure, thresholds, tree);
        setResults(categorized);

        const counts = {};
        categorized.forEach(m => {
          counts[m.archetype] = (counts[m.archetype] || 0) + 1;
        });
        const summary = Object.entries(counts)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ');

        setStatus(`Categorization complete — ${categorized.length} MSAs. ${summary}`);
      } catch (err) {
        console.error('Engine error:', err);
        setStatus(`Engine error: ${err.message}`);
      }
      setLoading(false);
    }, 50);
  }, [msaData, infrastructure, thresholds, tree]);

  useEffect(() => {
    if (msaData.length > 0 && infrastructure.distributionCenters.length > 0) {
      runEngine();
    }
  }, [msaData, infrastructure]);

  const handleInfraUpload = (data) => {
    setInfrastructure(data);
    setStatus(`Infrastructure updated: ${data.distributionCenters?.length || 0} DCs, ${data.federationLocations?.length || 0} Federation sites.`);
  };

  const handleScenarioLoad = (scenario) => {
    if (scenario.thresholds) setThresholds(scenario.thresholds);
    if (scenario.tree) setTree(scenario.tree);
    setShowScenarioManager(false);
    setStatus(`Loaded scenario: "${scenario.name}"`);
  };

  const handleTreeSave = (newTree) => {
    setTree(newTree);
  };

  const dcIcon = L.divIcon({
    html: '<div style="background:#dc3545;color:white;width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.3);">DC</div>',
    iconSize: [24, 24], iconAnchor: [12, 12], className: '',
  });

  const fedIcon = L.divIcon({
    html: '<div style="background:#6610f2;color:white;width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.3);">FD</div>',
    iconSize: [24, 24], iconAnchor: [12, 12], className: '',
  });

  return (
    <>
      {showTreeEditor && (
        <TreeEditor
          tree={tree}
          onSave={handleTreeSave}
          onClose={() => setShowTreeEditor(false)}
        />
      )}
      {showScenarioManager && (
        <ScenarioManager
          onClose={() => setShowScenarioManager(false)}
          onLoad={handleScenarioLoad}
          currentConfig={{ thresholds, tree, results }}
        />
      )}
      {showMethodology && (
        <MethodologyPanel onClose={() => setShowMethodology(false)} />
      )}
      <DashboardLayout
        leftPanel={
          <ConfigPanel
            thresholds={thresholds}
            setThresholds={setThresholds}
            onRun={runEngine}
            onOpenTree={() => setShowTreeEditor(true)}
            onOpenScenarios={() => setShowScenarioManager(true)}
            onOpenMethodology={() => setShowMethodology(true)}
            onInfraUpload={handleInfraUpload}
            loading={loading}
            status={status}
            infrastructure={infrastructure}
            setInfrastructure={setInfrastructure}
            msaData={msaData}
            setMsaData={setMsaData}
            showRadii={showRadii}
            setShowRadii={setShowRadii}
            archetypes={archetypes}
          />
        }
        mapContent={
          <MapComponent>
            {showRadii && infrastructure.distributionCenters.map((dc, i) => {
              const radiusMiles = dc.radius != null ? dc.radius : thresholds.defaultDcRadius;
              return (
                <Circle key={`dc-r-${i}`} center={[dc.lat, dc.lon]} radius={radiusMiles * 1609.34}
                  pathOptions={{ color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.04, weight: 1, dashArray: '6 4' }} />
              );
            })}
            {showRadii && infrastructure.federationLocations.map((fed, i) => {
              const radiusMiles = fed.radius != null ? fed.radius : thresholds.defaultFedRadius;
              return (
                <Circle key={`fed-r-${i}`} center={[fed.lat, fed.lon]} radius={radiusMiles * 1609.34}
                  pathOptions={{ color: '#6610f2', fillColor: '#6610f2', fillOpacity: 0.04, weight: 1, dashArray: '6 4' }} />
              );
            })}

            {showRadii && results.map((msa, i) => {
              const radiusMiles = msa.radius != null ? msa.radius : thresholds.defaultMsaRadius;
              const color = msa.archetypeColor || archetypes[msa.archetype]?.color || '#6c757d';
              return (
                <Circle key={`msa-r-${i}`} center={[msa.lat, msa.lon]} radius={radiusMiles * 1609.34}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.03, weight: 1, dashArray: '4 6' }} />
              );
            })}

            {results.map(msa => {
              const color = msa.archetypeColor || archetypes[msa.archetype]?.color || '#6c757d';
              const isSelected = selectedMSA?.msaId === msa.msaId;
              return (
                <CircleMarker key={msa.msaId} center={[msa.lat, msa.lon]}
                  radius={isSelected ? 12 : 8}
                  pathOptions={{ color: isSelected ? '#333' : color, fillColor: color, fillOpacity: isSelected ? 0.9 : 0.7, weight: isSelected ? 3 : 2 }}
                  eventHandlers={{ click: () => setSelectedMSA(msa) }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                      <strong>{msa.name}</strong><br />
                      <span style={{ color }}>■</span> {msa.archetype}<br />
                      Fed: {msa.federationCount} · DCs: {msa.dcCount} · Nearest DC: {msa.nearestDcMi ?? '—'} mi
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

            {infrastructure.distributionCenters.map((dc, i) => (
              <Marker key={`dc-${i}`} position={[dc.lat, dc.lon]} icon={dcIcon}>
                <Tooltip>
                  <strong>DC: {dc.city}, {dc.state}</strong><br />
                  Site ID: {dc.siteId} · Capacity: {dc.capacityScore}/10<br />
                  Radius: {dc.radius != null ? dc.radius : thresholds.defaultDcRadius} mi{dc.radius != null ? ' (custom)' : ' (default)'}
                </Tooltip>
              </Marker>
            ))}

            {infrastructure.federationLocations.map((fed, i) => (
              <Marker key={`fed-${i}`} position={[fed.lat, fed.lon]} icon={fedIcon}>
                <Tooltip>
                  <strong>{fed.companyName}</strong><br />
                  {fed.city}, {fed.state}<br />
                  Radius: {fed.radius != null ? fed.radius : thresholds.defaultFedRadius} mi{fed.radius != null ? ' (custom)' : ' (default)'}
                </Tooltip>
              </Marker>
            ))}
          </MapComponent>
        }
        rightPanel={
          <ResultsTable
            results={results}
            selectedMSA={selectedMSA}
            onSelectMSA={setSelectedMSA}
            archetypes={archetypes}
          />
        }
      />
    </>
  );
};

export default MarketMode;
