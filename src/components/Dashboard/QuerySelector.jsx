import React, { useState } from 'react';
import QueryHelpModal from './QueryHelpModal';

const QUERY_TYPES = [
    { 
        id: 'count_summary', 
        label: '1. Site / Customer / Contact Count', 
        description: 'Get a summary count of all records.',
        explanation: 'This query executes a simple tally. It counts the TOTAL number of unique Sites, unique Customers (Accounts), and unique Contacts associated with the selected zip codes and Active statuses.',
        sampleQuery: `/* Count Summary */
SELECT 
    COUNT(DISTINCT site.Id) as Site_Count,
    COUNT(DISTINCT cust.Id) as Customer_Count,
    COUNT(DISTINCT c.Id) as Contact_Count
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT site
LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT cust ON site.Related_Account__c = cust.Id
LEFT JOIN SFDC_DS.SFDC_CONTACT_OBJECT c ON c.AccountId = cust.Id
LEFT JOIN SFDC_DS.SFDC_ORG__C_OBJECT o ON cust.Org__c = o.Id
WHERE site.RECORDTYPE_NAME__C = 'Site'
  AND site.Zip__c IN (
  '90210'
  )
  AND site.Status__c = 'Active'
  AND cust.Status__c = 'Active'
  AND c.Status__c = 'Active'
  AND c.LastActivityDate IS NOT NULL
  AND c.LastActivityDate >= DATEADD(month, -12, CURRENT_DATE);`,
        config: { recordType: 'Count', filters: { contactUniqueEmails: true, contactActivityMonths: 12, contactActive: true, siteActive: true, customerActive: true }, naics: [] } 
    },
    { 
        id: 'site_export', 
        label: '2. Site Export', 
        description: 'Export Site records.',
        explanation: 'This query extracts raw Site locations. It filters down to Account records with the "Site" record type located within the selected zip codes, pulling in exactly one row per Site.',
        sampleQuery: `/* Site Export */
SELECT DISTINCT
    site.Id,
    site.Name,
    site.Zip__c,
    site.Status__c,
    cust.Id              AS customer_account_id,
    o.NAICS_2017_CODE__C AS naics_code
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT site
LEFT JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT cust
  ON site.Related_Account__c = cust.Id
LEFT JOIN SFDC_DS.SFDC_ORG__C_OBJECT o
  ON cust.Org__c = o.Id
WHERE site.RECORDTYPE_NAME__C = 'Site'
  AND site.Zip__c IN (
  '90210'
  )
  AND site.Status__c = 'Active'
  AND cust.Status__c = 'Active'
ORDER BY
    site.Id;`,
        config: { recordType: 'Site', filters: { contactUniqueEmails: true, contactActivityMonths: 12, contactActive: true, siteActive: true, customerActive: true }, naics: [] } 
    },
    { 
        id: 'customer_export', 
        label: '3. Customer Export', 
        description: 'Export Customer records.',
        explanation: 'This query extracts Customer Accounts. It identifies Active Sites within the target zip codes, traces them up to their parent Customer Account, and returns the unique Customers along with their Sales and Order metrics.',
        sampleQuery: `/* Customer Export */
SELECT DISTINCT
    cust.Id,
    cust.Name,
    cust.Status__c,
    cust.Total_Sales_LY__c,
    cust.LastOrderDate__c,
    site.Zip__c          AS site_zip,
    o.NAICS_2017_CODE__C AS naics_code
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT site
JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT cust
  ON site.Related_Account__c = cust.Id
LEFT JOIN SFDC_DS.SFDC_ORG__C_OBJECT o
  ON cust.Org__c = o.Id
WHERE site.RECORDTYPE_NAME__C = 'Site'
  AND site.Zip__c IN (
  '90210'
  )
  AND site.Status__c = 'Active'
  AND cust.Status__c = 'Active'
ORDER BY
    cust.Id;`,
        config: { recordType: 'Customer', filters: { contactUniqueEmails: true, contactActivityMonths: 12, contactActive: true, siteActive: true, customerActive: true }, naics: [] } 
    },
    { 
        id: 'contact_export', 
        label: '4. Contact Export', 
        description: 'Export Contact records.',
        explanation: 'This complex query extracts actionable people to email or call. First, it identifies Active targets by traversing from Site -> Customer -> Contact. If the "Unique Emails Only" filter is checked, it wraps this list in a Window Function over the Contact Email, ordering them by LastActivityDate descending, and plucks only the freshest record per email (WHERE rn = 1).',
        sampleQuery: `/* Contacts Export (Unique Emails Only) */
WITH RankedContacts AS (
    SELECT DISTINCT
        c.Id,
        c.FirstName,
        c.LastName,
        c.Email,
        c.Phone,
        c.Status__c,
        c.LastActivityDate,
        cust.Id              AS customer_account_id,
        cust.Name            AS account_name,
        cust.CUST_ID__C      AS account_cust_id,
        o.NAICS_2017_CODE__C AS naics_code,
        ROW_NUMBER() OVER (PARTITION BY c.Email ORDER BY c.LastActivityDate DESC) as rn
    FROM SFDC_DS.SFDC_ACCOUNT_OBJECT site
    JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT cust
      ON site.Related_Account__c = cust.Id
    JOIN SFDC_DS.SFDC_CONTACT_OBJECT c
      ON c.AccountId = cust.Id
    JOIN SFDC_DS.SFDC_ORG__C_OBJECT o
      ON cust.Org__c = o.Id
    WHERE site.RECORDTYPE_NAME__C = 'Site'
      AND site.Zip__c IN (
      '90210'
      )
      AND site.Status__c = 'Active'
      AND cust.Status__c = 'Active'
      AND c.Status__c = 'Active'
      AND c.LastActivityDate IS NOT NULL
      AND c.LastActivityDate >= DATEADD(month, -12, CURRENT_DATE)
)
SELECT 
    Id, FirstName, LastName, Email, Phone, Status__c,
    LastActivityDate, customer_account_id, account_name,
    account_cust_id, naics_code
FROM RankedContacts
WHERE rn = 1
ORDER BY customer_account_id, LastName, FirstName;`,
        config: { recordType: 'Contact', filters: { contactUniqueEmails: true, contactActivityMonths: 12, contactActive: true, siteActive: true, customerActive: true }, naics: [] } 
    }
];

const QuerySelector = ({ onSelect }) => {
    const [showHelp, setShowHelp] = useState(false);
    const [selectedId, setSelectedId] = useState('count_summary');
    const [helpContent, setHelpContent] = useState(null);

    const handleSelect = (type) => {
        setSelectedId(type.id);
        onSelect(type.config);
    };

    const handleHelp = (e, type) => {
        e.stopPropagation();
        setHelpContent(type);
        setShowHelp(true);
    };

    return (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px', display: 'block' }}>QUERY TYPE</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {QUERY_TYPES.map(type => (
                    <div 
                        key={type.id}
                        onClick={() => handleSelect(type)}
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: selectedId === type.id ? '1px solid #007bff' : '1px solid #ced4da',
                            backgroundColor: selectedId === type.id ? '#e7f1ff' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '12px', fontWeight: selectedId === type.id ? 'bold' : 'normal', color: '#333' }}>
                            {type.label}
                        </span>
                        
                        <button
                            onClick={(e) => handleHelp(e, type)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                            title="More Info"
                        >
                            ?
                        </button>
                    </div>
                ))}
            </div>

            {showHelp && (
                <QueryHelpModal 
                    onClose={() => setShowHelp(false)} 
                    content={helpContent}
                />
            )}
        </div>
    );
};

export default QuerySelector;
