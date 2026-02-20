import React from 'react';

const SystemDocumentation = () => {
    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', height: '100%', overflowY: 'auto' }}>
            
            {/* PROMINENT CAVEAT */}
            <div style={{ 
                padding: '20px', 
                backgroundColor: '#fff3cd', 
                border: '2px solid #ffecb5', 
                borderRadius: '8px', 
                marginBottom: '30px',
                color: '#856404'
            }}>
                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>⚠️</span>
                    PROOF OF CONCEPT DISCLAIMER
                </h2>
                <p style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
                    This application is a <strong>Rapid Prototype</strong> designed to demonstrate business value.
                    It is <strong>NOT a production-ready system</strong>.
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li><strong>Customization Required:</strong> Business logic and field definitions need to be aligned with Organization specific requirements.</li>
                    <li><strong>Data Verification:</strong> All exported lists should be verified against the CRM source of truth before mass outreach.</li>
                </ul>
            </div>

            <h1>System Overview</h1>
            <p className="lead">Business Capabilities & Data Access</p>
            <hr />

            {/* DATA PRIVACY & SCOPE CLARIFICATION */}
            <div style={{ padding: '20px', backgroundColor: '#e7f5ff', borderLeft: '5px solid #339af0', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#1864ab' }}>ℹ️ Important: Data Scope</h3>
                <p>
                    <strong>This tool does NOT contain or store Account Data.</strong>
                </p>
                <p>
                    It is a <strong>Geospatial Filter</strong> only. Its purpose is to output:
                </p>
                <ul style={{ marginTop: '10px' }}>
                    <li><strong>Zip Code Lists:</strong> CSV files containing only Zip Codes affected by weather/hazards.</li>
                    <li><strong>SQL Queries:</strong> Pre-written code that you copy and run in your secure Data Warehouse (Snowflake) to retrieve actual customer PII.</li>
                </ul>
                <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: 0 }}>
                    * No customer names, emails, or revenue figures are present within this application.
                </p>
            </div>

            <section style={{ marginBottom: '30px' }}>
                <h2>1. Business Capabilities</h2>
                
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fd7e14' }}>🔥 Wildfire & Air Quality Response</h3>
                    <p><strong>Goal:</strong> Identify customers impacted by smoke plumes or active fires to offer air quality support.</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#d63384' }}>🌡️ Extreme Weather Outreach</h3>
                    <p><strong>Goal:</strong> Proactive service tailored to weather events (Winter Storms, Floods, Heat Waves).</p>
                </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <h2>2. Step-by-Step User Guide</h2>
                
                <div style={{ marginBottom: '30px' }}>
                    <h3>How to Generate a Customer List</h3>
                    
                    <div style={{ marginLeft: '20px', borderLeft: '2px solid #dee2e6', paddingLeft: '20px' }}>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <h4>Step 1: Select Hazard Mode</h4>
                            <p>Choose the relevant environmental hazard from the tabs (Smoke, Winter, Heat, Flood, Respiratory).</p>
                            <div style={{ height: '150px', backgroundColor: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #adb5bd', borderRadius: '4px', color: '#868e96' }}>
                                [SCREENSHOT: Tab Navigation showing modes]
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4>Step 2: Define Geographic Area</h4>
                            <p>For Smoke/Fire, use the drawing tools to circle the impact zone. For Weather, the system automatically selects Zip Codes under active NWS Warnings.</p>
                            <div style={{ height: '200px', backgroundColor: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #adb5bd', borderRadius: '4px', color: '#868e96' }}>
                                [SCREENSHOT: Map with drawn Polygon or NWS Warning Zones]
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4>Step 3: Export or Generate SQL</h4>
                            <p>Click <strong>"Export Zip List"</strong> for a CSV file, or use the <strong>"SQL Export"</strong> panel to generate a query for Snowflake.</p>
                            <div style={{ height: '150px', backgroundColor: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #adb5bd', borderRadius: '4px', color: '#868e96' }}>
                                [SCREENSHOT: Export Buttons & SQL Panel]
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>3. Ready-Made Snowflake SQL</h2>
                <p>Copy these queries to extract data directly from your Snowflake Data Warehouse.</p>

                <div style={{ marginBottom: '25px' }}>
                    <strong>A. Standard Site Extraction (By Zip Code)</strong>
                    <p style={{ fontSize: '12px', color: '#666' }}>Use this to get a list of Sites within a list of Zip Codes.</p>
                    <div style={{ position: 'relative', marginTop: '5px' }}>
                        <textarea 
                            readOnly 
                            style={{ 
                                width: '100%', 
                                height: '120px', 
                                padding: '10px', 
                                fontFamily: 'monospace', 
                                fontSize: '12px', 
                                backgroundColor: '#212529', 
                                color: '#f8f9fa',
                                borderRadius: '4px',
                                border: 'none'
                            }}
                            value={`SELECT 
  s.Id, 
  s.Name, 
  s.Zip__c, 
  s.Related_Account__c 
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT s
WHERE 
  s.Zip__c IN ('YOUR_ZIP_LIST_HERE') 
  AND s.RecordType = 'Site';`}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <strong>B. High-Value Customer Segmentation</strong>
                    <p style={{ fontSize: '12px', color: '#666' }}>Find Active customers with high sales volume in specific areas.</p>
                    <div style={{ position: 'relative', marginTop: '5px' }}>
                        <textarea 
                            readOnly 
                            style={{ 
                                width: '100%', 
                                height: '200px', 
                                padding: '10px', 
                                fontFamily: 'monospace', 
                                fontSize: '12px', 
                                backgroundColor: '#212529', 
                                color: '#f8f9fa',
                                borderRadius: '4px',
                                border: 'none'
                            }}
                            value={`SELECT 
  s.Id as Site_Id, 
  s.Name as Site_Name, 
  c.Id as Customer_Id,
  c.Total_Sales_LY__c
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT s
JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT c ON s.Related_Account__c = c.Id
WHERE 
  s.Zip__c IN ('YOUR_ZIP_LIST_HERE') 
  AND c.Status__c = 'Active'
  AND c.Total_Sales_LY__c > 50000;`}
                        />
                    </div>
                </div>

            </section>

        </div>
    );
};

export default SystemDocumentation;
