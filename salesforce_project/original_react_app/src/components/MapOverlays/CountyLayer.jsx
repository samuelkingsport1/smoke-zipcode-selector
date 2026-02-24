import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import * as topojson from 'topojson-client';

const CountyLayer = ({ activeFips = [], activeStateNames = [], style = { color: '#3388ff', weight: 1, fillOpacity: 0.2 } }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        // Load the TopoJSON file from public directory
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}counties-10m.json`);
                if (!response.ok) throw new Error("Failed to load county topology");
                const topology = await response.json();

                // Convert TopoJSON to GeoJSON
                // "counties" is the object name in the us-atlas file
                const geojson = topojson.feature(topology, topology.objects.counties);
                setGeoJsonData(geojson);
            } catch (err) {
                console.error("Error loading county data:", err);
            }
        };

        fetchData();
    }, []);

    const countyStyle = (feature) => {
        // Match logic:
        // 1. FIPS check (feature.id is usually the FIPS code in us-atlas)
        // 2. State check involves lookup, but for now we focus on FIPS

        const isSelected = activeFips.includes(feature.id);

        // Default style for non-active counties (invisible or very faint)
        if (!isSelected) {
            return {
                fillColor: 'transparent',
                color: 'rgba(0,0,0,0.1)', // Very faint border for context, or 0 for invisible
                weight: 0.5,
                opacity: 0.2,
                fillOpacity: 0,
                interactive: false // Disable events for invisible counties to prevent ghost tooltips
            };
        }

        // Active style
        return {
            ...style,
            fillColor: style.color || '#ff0000',
            fillOpacity: style.fillOpacity || 0.5,
            weight: 1,
            opacity: 1,
            interactive: true
        };
    };

    const onEachFeature = (feature, layer) => {
        // Tooltip for basic info
        // Removed sticky: true to prevent "stuck" artifacts. defaulting to hover.
        layer.bindTooltip(`${feature.properties.name} County`, { direction: 'top', opacity: 0.9 });
    };

    if (!geoJsonData) return null;

    return (
        <GeoJSON
            data={geoJsonData}
            style={countyStyle}
            onEachFeature={onEachFeature}
        />
    );
};

export default CountyLayer;
