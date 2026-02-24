import React, { useState, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';

const SmokeAQITooltip = ({ date }) => {
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

            if (date === today) {
                const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`;
                console.log(`[AQI] Fetching Current: ${url}`);
                const res = await fetch(url);
                const data = await res.json();
                console.log("[AQI] Current Data:", data);

                if (data.current && data.current.us_aqi !== undefined) {
                    setAqi(data.current.us_aqi);
                }
            } else {
                // Historical data
                const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&hourly=us_aqi_pm2_5`;
                console.log(`[AQI] Fetching History: ${url}`);
                const res = await fetch(url);
                const data = await res.json();
                console.log("[AQI] History Data:", data);

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

export default SmokeAQITooltip;
