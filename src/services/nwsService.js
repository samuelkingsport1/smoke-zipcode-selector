import { STATE_ABBREVIATIONS } from '../utils/constants';

/**
 * Service to interact with National Weather Service API
 */
export const NWSService = {
    /**
     * Fetch alerts from NWS.
     * @param {string} date - Optional date string (YYYY-MM-DD). If empty, fetches active alerts.
     * @param {string} eventTypes - Comma separated string of event types (e.g. "Winter Storm Warning,Winter Weather Advisory")
     * @returns {Promise<Object>} GeoJSON FeatureCollection
     */
    async fetchAlerts(date, eventTypes) {
        console.log(`[NWSService] Fetching for date: ${date || 'LIVE'} types: ${eventTypes}`);

        try {
            let url;
            if (date) {
                // Archive Mode
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                const params = new URLSearchParams({
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    event: eventTypes,
                    limit: 500 // Safety cap, NWS allows 500 max usually
                });
                url = `https://api.weather.gov/alerts?${params.toString()}`;
            } else {
                // Live Mode
                url = 'https://api.weather.gov/alerts/active';
            }

            const response = await fetch(url, {
                headers: {
                    'User-Agent': '(myweatherapp.com, contact@myweatherapp.com)',
                    'Accept': 'application/geo+json'
                }
            });

            if (!response.ok) {
                throw new Error(`NWS API Error: ${response.status}`);
            }

            const rawData = await response.json();

            // Handle NWS Edge Cases (sometimes no features, just title)
            if (!rawData.features && !rawData.title) {
                throw new Error("Invalid API Response format");
            }

            let features = rawData.features || [];
            const targetList = eventTypes.split(',');

            // Global Filter: Must match requested event types
            // (Active endpoint returns ALL active alerts, so we must filter client side)
            features = features.filter(f => targetList.includes(f.properties.event));

            // Note: We previously had a US State filter here but removed it to support border/marine zones.
            // We just rely on the event type now.

            return { type: "FeatureCollection", features: features };

        } catch (error) {
            console.error("[NWSService] Error:", error);
            throw error;
        }
    }
};
