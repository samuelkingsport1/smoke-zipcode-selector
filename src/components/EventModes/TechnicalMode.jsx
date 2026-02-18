import React, { useState } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import DataDictionary from './DataDictionary';
import SystemDocumentation from './SystemDocumentation';

const TechnicalMode = () => {
    const [activeView, setActiveView] = useState('architecture'); // 'architecture', 'dictionary', 'docs'

    return (
        <DashboardLayout
            leftPanel={
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                    <h3>Technical Hub</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                        <button 
                            onClick={() => setActiveView('architecture')}
                            style={{
                                padding: '10px',
                                textAlign: 'left',
                                backgroundColor: activeView === 'architecture' ? '#e7f5ff' : 'transparent',
                                border: '1px solid',
                                borderColor: activeView === 'architecture' ? '#339af0' : '#dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: activeView === 'architecture' ? 'bold' : 'normal',
                                color: activeView === 'architecture' ? '#1971c2' : '#495057'
                            }}
                        >
                            🏗️ Architecture Guide
                        </button>
                        <button 
                            onClick={() => setActiveView('dictionary')}
                            style={{
                                padding: '10px',
                                textAlign: 'left',
                                backgroundColor: activeView === 'dictionary' ? '#e7f5ff' : 'transparent',
                                border: '1px solid',
                                borderColor: activeView === 'dictionary' ? '#339af0' : '#dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: activeView === 'dictionary' ? 'bold' : 'normal',
                                color: activeView === 'dictionary' ? '#1971c2' : '#495057'
                            }}
                        >
                            📚 Data Dictionary & SQL
                        </button>
                        <button 
                            onClick={() => setActiveView('docs')}
                            style={{
                                padding: '10px',
                                textAlign: 'left',
                                backgroundColor: activeView === 'docs' ? '#e7f5ff' : 'transparent',
                                border: '1px solid',
                                borderColor: activeView === 'docs' ? '#339af0' : '#dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: activeView === 'docs' ? 'bold' : 'normal',
                                color: activeView === 'docs' ? '#1971c2' : '#495057'
                            }}
                        >
                            📄 System Documentation
                        </button>
                    </div>

                    {activeView === 'architecture' && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }}>
                            <strong>⚠️ Critical Risk</strong>
                            <p style={{ fontSize: '11px', marginTop: '5px' }}>
                                CORS constraints in Salesforce will likely block direct client-side fetch calls initiated from LWC.
                            </p>
                        </div>
                    )}
                </div>
            }
            mapContent={
                 activeView === 'architecture' ? (
                    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', overflowY: 'auto', height: '100%', backgroundColor: '#fff' }}>
                        <h1>Technical Solution: End-to-End Business Case</h1>
                        <p><strong>[RISK-ANNOTATED VERSION FOR SCRATCH ORG DEVELOPMENT]</strong></p>
                        
                        <hr style={{ margin: '20px 0' }} />

                        <h2>1. Executive Summary</h2>
                        <p>The objective is to enable Sales Operations to identify and act upon high-value "Customer" accounts based on environmental or geographic triggers affecting 50 million "Site" locations. The solution utilizes a high-performance <strong>LWC Integration Service</strong> to aggregate external real-time data via the JavaScript <code>fetch</code> API, then triggers an asynchronous Snowflake/AWX pipeline to map those triggers to actionable CRM data.</p>
                        
                        <div style={{ padding: '15px', background: '#f8f9fa', borderLeft: '4px solid #0d6efd', margin: '15px 0' }}>
                            <strong>Technical Limitation Callout:</strong><br/>
                            The external API orchestration approach has been validated in a browser environment hosted via GitHub Pages and functions successfully in that context. However, it has <strong>not yet been deployed or tested within a Salesforce scratch org</strong>. Because Salesforce enforces additional security layers (CSP Trusted Sites, Lightning Web Security, and browser-origin CORS constraints), successful execution within Salesforce cannot be assumed until validated in a scratch org environment. APIs that function in GitHub-hosted JavaScript may still fail within Salesforce due to origin restrictions or preflight behavior differences.
                        </div>

                        <div style={{ padding: '15px', background: '#fff3cd', borderLeft: '4px solid #ffc107', margin: '15px 0' }}>
                            <strong>⚠️ RISK ALERT - ARCHITECTURAL VALIDITY:</strong><br/>
                            This entire approach assumes that external public APIs will accept requests from Salesforce Lightning origins (<code>*.lightning.force.com</code>, <code>*.my.salesforce.com</code>). <strong>You cannot control whether external APIs allow Salesforce origins in their CORS headers.</strong> If the target APIs (NOAA, EPA, etc.) do not explicitly whitelist Salesforce domains in their <code>Access-Control-Allow-Origin</code> response headers, all client-side <code>fetch</code> calls will fail with CORS errors, and the entire LWC integration layer becomes non-functional. Test this immediately in scratch org before proceeding with development.
                        </div>

                        <hr style={{ margin: '20px 0' }} />

                        <h2>2. Architecture: The External Trigger & Async Pipeline</h2>

                        <h3>Phase A: The LWC Integration Service (Client-Side Orchestration)</h3>
                        <p>The developer will build a sophisticated <strong>LWC Service Layer</strong> that handles external API orchestration using the JavaScript <code>fetch</code> API.</p>

                        <ol>
                            <li>
                                <strong>External Fetch:</strong> The LWC calls external REST APIs (e.g., NOAA, EPA) directly from the client browser. This offloads the networking overhead and prevents hitting Apex callout time limits.
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - CORS DEPENDENCY:</strong> Client-side <code>fetch</code> from LWC is subject to browser CORS policies. The external API server must return <code>Access-Control-Allow-Origin</code> headers that include your Salesforce domain. <strong>This is controlled by the API provider, not you.</strong> Many government/public APIs may not support Salesforce origins. Test each target API immediately.
                                </div>
                            </li>
                            <br/>
                            <li>
                                <strong>Security (CSP):</strong> The developer must whitelist the API domains in <strong>Setup &gt; Trusted URLs</strong> with the <code>connect-src</code> directive enabled to allow browser-level communication.
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - CSP CONFIGURATION:</strong> The correct Salesforce feature is <strong>Setup &gt; CSP Trusted Sites</strong> (not "Trusted URLs"). You must add each external API domain here. However, CSP configuration alone is insufficient—the external API must also cooperate with CORS headers. Both sides of the handshake must succeed.
                                </div>
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - LIGHTNING WEB SECURITY:</strong> Salesforce enforces Lightning Web Security (LWS), which creates a secure sandbox for LWC execution. Some JavaScript patterns that work in standard browsers may behave differently or be restricted under LWS. Test all <code>fetch</code> operations, JSON parsing, and async operations in the actual Lightning runtime.
                                </div>
                            </li>
                            <br/>
                            <li>
                                <strong>CORS Validation Requirement:</strong> Because Salesforce Lightning runs under domains such as <code>*.lightning.force.com</code> or <code>*.my.site.com</code>, the external APIs must explicitly permit those origins within their CORS configuration. Successful execution in GitHub Pages does not guarantee compatibility with Salesforce-hosted Lightning domains.
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - FUNDAMENTAL ASSUMPTION:</strong> Reiterating: <strong>You cannot make external APIs allow Salesforce origins.</strong> If NOAA/EPA/etc. do not already support Salesforce domains in their CORS policies (and most public APIs do not), this architecture requires fallback to an Apex proxy pattern, which reintroduces governor limits you're trying to avoid.
                                </div>
                            </li>
                            <br/>
                            <li>
                                <strong>The Hand-off:</strong> The LWC parses the JSON response into a list of affected Zip Codes and creates a <strong>Search_Request__c</strong> record.
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - DML OPERATIONS:</strong> Creating records from LWC requires calling an Apex method (LWC cannot directly perform DML). Ensure you've built an Apex controller with proper error handling. Each DML operation consumes governor limits (150 DML statements per transaction).
                                </div>
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - NAMED CREDENTIALS MISUNDERSTANDING:</strong> Named Credentials <strong>cannot be accessed directly from client-side LWC JavaScript</strong>. They only work within Apex code. If your external APIs require authentication (API keys, OAuth tokens), you <strong>must</strong> use an Apex proxy to retrieve credentials from Named Credentials and make the authenticated request. This contradicts the "client-side fetch" approach—if authentication is needed, you're back to server-side Apex callouts with all their governor limits.
                                </div>
                                <div style={{ padding: '10px', background: '#f8d7da', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - API KEY EXPOSURE:</strong> If you attempt to store API keys in Custom Metadata and retrieve them via JavaScript, <strong>those keys will be visible in browser DevTools and network traffic</strong>. This is a critical security vulnerability. Any API requiring authentication must use the Apex proxy pattern.
                                </div>
                            </li>
                        </ol>

                        <h3>Phase B: External Orchestration (AWX & Snowflake)</h3>
                        <ol>
                             <li>
                                <strong>Trigger:</strong> A Platform Event or Trigger signals <strong>AWX</strong> that a new <code>Search_Request__c</code> (containing the Zip list) is ready.
                                 <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - INTEGRATION MECHANISM UNDEFINED:</strong> Platform Events do not directly "signal" external systems. You need an explicit mechanism (Apex Trigger calling Webhook, or AWX Polling).
                                </div>
                            </li>
                            <li>
                                 <strong>Processing:</strong> AWX queries <strong>Snowflake</strong>, which maintains a high-performance replica of the 50M Sites.
                                 <div style={{ padding: '10px', background: '#e2e3e5', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ OUT OF SCOPE FOR SCRATCH ORG TESTING:</strong> Use mocked Apex responses for initial validation.
                                </div>
                            </li>
                            <li>
                                 <strong>Injection:</strong> AWX pushes the "Result Set" back into the Salesforce <strong>Search_Result__c</strong> junction object.
                                  <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - BULK API REQUIREMENTS:</strong> Use Bulk API 2.0 for large result sets to avoid API limit exhaustion.
                                </div>
                            </li>
                        </ol>

                         <h3>Phase C: Action & Export (Salesforce)</h3>
                        <ol>
                            <li>
                                <strong>Display:</strong> The LWC polls the request status and renders the <strong>Search_Result__c</strong> list.
                                <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - POLLING PATTERN:</strong> Ensure proper cleanup and exponential backoff.
                                </div>
                            </li>
                            <li>
                                <strong>Sales Action:</strong> User selects contacts and chooses an action (Sales Cadence or Campaign).
                                 <div style={{ padding: '10px', background: '#fff3cd', marginTop: '10px', fontSize: '0.9em' }}>
                                    <strong>⚠️ RISK - GOVERNOR LIMIT CASCADE:</strong> Bulk creating CampaignMembers usually hits DML limits if not batched correctly via Async Apex.
                                </div>
                            </li>
                        </ol>

                        <hr style={{ margin: '20px 0' }} />

                         <h2>3. Comparison of Data Retrieval Methods</h2>
                         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }} border="1">
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '8px' }}>Feature</th>
                                    <th style={{ padding: '8px' }}>Client-Side (`fetch`)</th>
                                    <th style={{ padding: '8px' }}>Server-Side (Apex Callout)</th>
                                </tr>
                            </thead>
                            <tbody>
                                 <tr>
                                    <td style={{ padding: '8px' }}><strong>Performance</strong></td>
                                    <td style={{ padding: '8px' }}>High (Direct from browser)</td>
                                    <td style={{ padding: '8px' }}>Moderate (SFDC as middleman)</td>
                                </tr>
                                 <tr>
                                    <td style={{ padding: '8px' }}><strong>Governor Limits</strong></td>
                                    <td style={{ padding: '8px' }}>None on Apex (Browser resources)</td>
                                    <td style={{ padding: '8px' }}>Strict (Timeout & Heap limits)</td>
                                </tr>
                                 <tr>
                                    <td style={{ padding: '8px' }}><strong>CORS/Security</strong></td>
                                    <td style={{ padding: '8px', background: '#f8d7da' }}><strong>Major Risk:</strong> Requires External API Whitelisting</td>
                                    <td style={{ padding: '8px' }}>Managed via Named Credentials (More Compatible)</td>
                                </tr>
                            </tbody>
                         </table>

                         <div style={{ padding: '15px', background: '#fff3cd', borderLeft: '4px solid #ffc107', margin: '15px 0' }}>
                            <strong>⚠️ RISK - SECURITY MISCONCEPTION:</strong><br/>
                            Client-side approaches <strong>expose all API URLs and request patterns</strong> in browser DevTools. Server-side approaches keep integration details opaque to end users.
                        </div>

                        <hr style={{ margin: '20px 0' }} />

                        <h2>CRITICAL RISKS SUMMARY</h2>
                        
                        <div style={{ padding: '15px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '10px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🔴 BLOCKER RISKS (Will prevent functionality)</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li><strong>CORS Non-Cooperation:</strong> External APIs may reject Salesforce origins entirely.</li>
                                <li><strong>Named Credentials Misuse:</strong> Cannot access from client-side LWC; requires Apex proxy.</li>
                                <li><strong>Missing Integration:</strong> Platform Events don't auto-trigger AWX; need explicit callout mechanism.</li>
                            </ul>
                        </div>

                        <div style={{ padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🟡 HIGH RISKS (Will require significant rework)</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Lightning Web Security Restrictions.</li>
                                <li>Governor Limits on Apex Callouts (if fallback needed).</li>
                                <li>API Authentication Requirements negate client-side approach.</li>
                                <li>Campaign Member Bulk Operations require complex Async Apex.</li>
                            </ul>
                        </div>

                    </div>
                ) : activeView === 'dictionary' ? (
                     <DataDictionary />
                ) : (
                    <SystemDocumentation />
                )
            }
            rightPanel={
                <div style={{ padding: '20px' }}>
                    <h3>Notes</h3>
                    <p>Use this document to guide scratch org validation planning.</p>
                </div>
            }
        />
    );
};

export default TechnicalMode;
