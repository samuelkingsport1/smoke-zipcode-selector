/**
 * Weather Alert Formatter for Sales Teams
 * Converts weather.gov API alert data into actionable Google search links
 */

/**
 * Formats a weather alert into a salesperson-ready object with Google search links
 * @param {Object} alertData - Raw weather alert data from weather.gov API
 * @returns {Object} Formatted alert with search links and key info
 */
export function formatWeatherAlert(alertData) {
  const props = alertData.properties || {}; // Safety check
  
  // Extract key information
  const event = props.event || 'Weather Alert';
  const areaDesc = props.areaDesc || 'Unknown Area';
  const severity = props.severity || 'Unknown';
  const headline = props.headline || '';
  const description = props.description || '';
  
  // Parse dates
  const onset = props.onset ? new Date(props.onset) : null;
  const ends = props.ends ? new Date(props.ends) : null;
  const effective = props.effective ? new Date(props.effective) : null;
  
  // Create search queries for different purposes
  const baseSearchTerms = `${event} ${areaDesc}`;
  
  const searchLinks = {
    // General news about the alert
    newsSearch: `https://www.google.com/search?q=${encodeURIComponent(baseSearchTerms + ' news')}`,
    
    // Current conditions and updates
    currentConditions: `https://www.google.com/search?q=${encodeURIComponent(baseSearchTerms + ' current conditions today')}`,
    
    // Local news outlets
    localNews: `https://www.google.com/search?q=${encodeURIComponent(baseSearchTerms + ' local news')}`,
    
    // Impact and damage reports (for after the event)
    impactReports: `https://www.google.com/search?q=${encodeURIComponent(baseSearchTerms + ' impact damage reports')}`,
    
    // Safety and preparation info
    safetyInfo: `https://www.google.com/search?q=${encodeURIComponent(event + ' safety tips preparation')}`,
  };
  
  // Create a human-readable summary
  const summary = {
    event: event,
    area: areaDesc,
    severity: severity,
    urgency: props.urgency,
    certainty: props.certainty,
    headline: headline,
    
    // Time information in readable format
    timing: {
      effective: effective ? effective.toLocaleString() : 'Unknown',
      starts: onset ? onset.toLocaleString() : 'Unknown',
      ends: ends ? ends.toLocaleString() : 'Unknown',
      isActive: onset && ends ? (Date.now() >= onset && Date.now() <= ends) : false,
    },
    
    // Key details from description
    description: description,
    instructions: props.instruction || 'No specific instructions provided',
    
    // Quick action items for sales reps
    quickActions: [
      `Check local news: ${searchLinks.localNews}`,
      `Current conditions: ${searchLinks.currentConditions}`,
      `General news: ${searchLinks.newsSearch}`,
    ],
  };
  
  return {
    summary,
    searchLinks,
    rawAlertId: props.id,
  };
}

/**
 * Formats multiple alerts for a sales dashboard or report
 * @param {Array} alerts - Array of alert data objects
 * @returns {Array} Array of formatted alerts
 */
export function formatMultipleAlerts(alerts) {
  return alerts.map(alert => formatWeatherAlert(alert));
}

/**
 * Creates a simple HTML snippet for embedding in sales tools
 * @param {Object} formattedAlert - Formatted alert from formatWeatherAlert()
 * @returns {String} HTML string
 */
export function createAlertHTML(formattedAlert) {
  const { summary, searchLinks } = formattedAlert;
  
  return `
    <div class="weather-alert ${summary.severity.toLowerCase()}">
      <h3>${summary.event}</h3>
      <p><strong>Area:</strong> ${summary.area}</p>
      <p><strong>Severity:</strong> ${summary.severity} | <strong>Status:</strong> ${summary.timing.isActive ? '🔴 ACTIVE' : '⚪ Upcoming/Ended'}</p>
      <p><strong>Timeframe:</strong> ${summary.timing.starts} → ${summary.timing.ends}</p>
      
      <div class="alert-description">
        <p>${summary.description.substring(0, 200)}...</p>
      </div>
      
      <div class="quick-links">
        <h4>Quick Research Links:</h4>
        <ul>
          <li><a href="${searchLinks.localNews}" target="_blank">📰 Local News Coverage</a></li>
          <li><a href="${searchLinks.currentConditions}" target="_blank">🌤️ Current Conditions</a></li>
          <li><a href="${searchLinks.newsSearch}" target="_blank">🔍 General News Search</a></li>
          <li><a href="${searchLinks.impactReports}" target="_blank">📊 Impact Reports</a></li>
        </ul>
      </div>
    </div>
  `;
}
