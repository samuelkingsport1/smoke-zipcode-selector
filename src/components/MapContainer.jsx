import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, FeatureGroup, useMapEvents, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet default icon issues in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// AQITooltip moved to separate component

const MapComponent = ({ onCreated, onDeleted, onMounted, date, stateMode, selectedStates, onStateClick, children }) => {
  console.log("MapComponent rendered with date:", date);
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    if (stateMode && !geoJsonData) {
      console.log("Fetching US States GeoJSON...");
      fetch(`${import.meta.env.BASE_URL}us_states.json`)
        .then(res => res.json())
        .then(data => {
          console.log("States Loaded", data);
          setGeoJsonData(data);
        })
        .catch(err => console.error("Failed to load states:", err));
    }
  }, [stateMode, geoJsonData]);

  const styleState = (feature) => {
    const isSelected = selectedStates.has(feature.properties.NAME);
    return {
      fillColor: isSelected ? '#3388ff' : '#ccc',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: isSelected ? 0.6 : 0.2
    };
  };

  const onEachState = (feature, layer) => {
    layer.on({
      click: () => {
        onStateClick(feature.properties.NAME);
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 4,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.5
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        // Reset style is tricky with dynamic styles, but GeoJSON ref can handle it or just manual reset
        // For simplicity, we can rely on React re-render if we were fully reactive, but GeoJSON component is static-ish.
        // Better to just manually reset to "base" style based on selection.
        const isSelected = selectedStates.has(feature.properties.NAME);
        layer.setStyle({
          fillColor: isSelected ? '#3388ff' : '#ccc',
          weight: 2,
          color: 'white',
          dashArray: '3',
          fillOpacity: isSelected ? 0.6 : 0.2
        });
      }
    });
    // Add tooltip for state name
    layer.bindTooltip(feature.properties.NAME, { sticky: true });
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      ref={onMounted}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {children}

      {stateMode && geoJsonData && (
        <GeoJSON
          key={`states-${Array.from(selectedStates).join(',')}`} // Force re-render on selection change to apply styles
          data={geoJsonData}
          style={styleState}
          onEachFeature={onEachState}
        />
      )}

      {/* Hide Drawing Tools when in State Mode to avoid confusion */}
      {!stateMode && (
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              rectangle: { showArea: false },
              polygon: { showArea: false },
              circle: true,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
      )}

    </MapContainer>
  );
};

export default MapComponent;
