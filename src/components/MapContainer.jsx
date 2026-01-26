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

const AQITooltip = ({ date }) => {
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const debounceRef = useRef(null);

  useMapEvents({
    mousemove(e) {
      setPos(e.containerPoint);
      setVisible(true);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchAQI(e.latlng.lat, e.latlng.lng);
      }, 600); // 600ms debounce
    },
    mouseout() {
      setVisible(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  });

  const fetchAQI = async (lat, lng) => {
    setLoading(true);
    setAqi(null);
    console.log("Fetching AQI for:", lat, lng, "Date:", date);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Simple check: if date string matches today, use forecast/current API
      // Otherwise use archive API

      if (date === today) {
        const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`);
        const data = await res.json();
        if (data.current && data.current.us_aqi !== undefined) {
          setAqi(data.current.us_aqi);
        }
      } else {
        // Historical data
        const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&hourly=us_aqi_pm2_5`);
        const data = await res.json();
        if (data.hourly && data.hourly.us_aqi_pm2_5) {
          // Find max for the day to represent "how bad it got"
          const valid = data.hourly.us_aqi_pm2_5.filter(v => v !== null);
          if (valid.length > 0) {
            setAqi(Math.max(...valid));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch AQI", err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  let color = '#ccc';
  let text = 'Loading...';

  if (!loading && aqi !== null) {
    text = `AQI: ${aqi}`;
    if (aqi <= 50) color = '#00e400';
    else if (aqi <= 100) color = '#ffff00';
    else if (aqi <= 150) color = '#ff7e00';
    else if (aqi <= 200) color = '#ff0000';
    else if (aqi <= 300) color = '#8f3f97';
    else color = '#7e0023';
  }

  return (
    <div style={{
      position: 'absolute',
      left: pos.x + 15,
      top: pos.y + 15,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '6px 12px',
      borderRadius: '6px',
      border: `3px solid ${color}`,
      fontWeight: 'bold',
      zIndex: 10000,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      fontSize: '14px',
      fontFamily: 'sans-serif'
    }}>
      {text}
    </div>
  );
};

const MapComponent = ({ onCreated, onDeleted, onMounted, date, stateMode, selectedStates, onStateClick }) => {
  console.log("MapComponent rendered with date:", date);
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    if (stateMode && !geoJsonData) {
      console.log("Fetching US States GeoJSON...");
      fetch('/us_states.json')
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
      style={{ height: '100vh', width: '100%' }}
      ref={onMounted}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <WMSTileLayer
        key={`wms-${date}`}
        url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
        layers="MODIS_Combined_Value_Added_AOD"
        format="image/png"
        transparent={true}
        opacity={0.6}
        attribution="NASA GIBS Combined Modis AOD"
        params={{
          TIME: date
        }}
      />

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
      <AQITooltip date={date} />
    </MapContainer>
  );
};

export default MapComponent;
