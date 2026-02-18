import React from 'react';
import Papa from 'papaparse';

const FIELD_SCHEMA = [
    // SITE OBJECT
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'id', label: 'Record ID', type: 'String', key: true, description: 'Unique Record ID' },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Name', label: 'Account Name', type: 'String', key: false, description: 'Display Name' },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Zip__c', label: 'Zip Code', type: 'String', key: true, description: '5-digit Zip Code (Geographic Link)' },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'ParentId', label: 'Parent ID', type: 'String', key: true, description: 'Parent Account ID (Join Key)' },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'RECORDTYPE_NAME__C', label: 'Record Type', type: 'String', key: false, description: "Filter Value (e.g., 'Site', 'Customer')" },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Last_Order_Date__C', label: 'Last Order Date', type: 'Date', key: false, description: 'Sales Metric (Optional Display)' },
    { object: 'Site', alias: 'Site', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Total_LY_Sales__C', label: 'Total LY Sales', type: 'Currency', key: false, description: 'Sales Metric (Optional Display)' },
    
    // PARENT OBJECT
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Id', label: 'Record ID', type: 'String', key: true, description: 'Unique Record ID (Join Target)' },
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Status__c', label: 'Status', type: 'String', key: false, description: "Account Status (e.g., 'Active')" },
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Org__c', label: 'Org ID', type: 'String', key: true, description: 'Organization ID (Join Key to NAICS)' },
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'LastActivityDate', label: 'Last Activity', type: 'Date', key: false, description: 'Activity Metric' },
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'LastOrderDate__c', label: 'Last Order Date', type: 'Date', key: false, description: 'Sales Metric' },
    { object: 'Customer', alias: 'Customer', snowflakeTable: 'SFDC_DS.SFDC_ACCOUNT_OBJECT', apiName: 'Total_Sales_LY__c', label: 'Total LY Sales', type: 'Currency', key: false, description: 'Annual Sales' },

    // ORG OBJECT
    { object: 'Org', alias: 'Org', snowflakeTable: 'SFDC_DS.SFDC_ORG_OBJECT', apiName: 'Id', label: 'Record ID', type: 'String', key: true, description: 'Unique Record ID (Join Target)' },
    { object: 'Org', alias: 'Org', snowflakeTable: 'SFDC_DS.SFDC_ORG_OBJECT', apiName: 'NAICS___c', label: 'NAICS Code', type: 'String', key: false, description: 'Industry Code' },
    { object: 'Org', alias: 'Org', snowflakeTable: 'SFDC_DS.SFDC_ORG_OBJECT', apiName: 'NAICS_Description__c', label: 'Industry Name', type: 'String', key: false, description: 'Industry Description' },

    // SALES DATA OBJECT
    { object: 'Sales Data', alias: 'Sales', snowflakeTable: 'SFDC_DS.SFDC_SALES_DATA_OBJECT', apiName: 'Id', label: 'Record ID', type: 'String', key: true, description: 'Unique Record ID' },
    { object: 'Sales Data', alias: 'Sales', snowflakeTable: 'SFDC_DS.SFDC_SALES_DATA_OBJECT', apiName: 'Account__c', label: 'Account ID', type: 'String', key: true, description: 'Foreign Key (Joins to Site/Customer)' },

    // CONTACT OBJECT
    { object: 'Contact', alias: 'Contact', snowflakeTable: 'SFDC_DS.SFDC_CONTACT_OBJECT', apiName: 'Id', label: 'Record ID', type: 'String', key: true, description: 'Unique Record ID' },
    { object: 'Contact', alias: 'Contact', snowflakeTable: 'SFDC_DS.SFDC_CONTACT_OBJECT', apiName: 'AccountId', label: 'Account ID', type: 'String', key: true, description: 'Foreign Key (Joins to Site/Customer)' },
    { object: 'Contact', alias: 'Contact', snowflakeTable: 'SFDC_DS.SFDC_CONTACT_OBJECT', apiName: 'Status__c', label: 'Status', type: 'String', key: false, description: "Contact Status (e.g., 'Active', 'No Longer There')" },
    { object: 'Contact', alias: 'Contact', snowflakeTable: 'SFDC_DS.SFDC_CONTACT_OBJECT', apiName: 'LastActivityDate', label: 'Last Activity', type: 'Date', key: false, description: 'Last Interaction Date' }
];

const DataDictionary = () => {

    const handleExport = () => {
        const csv = Papa.unparse(FIELD_SCHEMA);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data_dictionary_schema.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Data Dictionary & SQL Reference</h2>
                <button 
                    onClick={handleExport}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#228be6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    📥 Export Dictionary (CSV)
                </button>
            </div>
            
            <p>Summary of objects, fields, and logic used in the SQL Export tool.</p>
            
            <hr />

            <h3>1. Object Schema</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Object / Alias</th>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Snowflake Table</th>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Field Name (API)</th>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Label</th>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Type</th>
                        <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {FIELD_SCHEMA.map((field, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: field.key ? 'bold' : 'normal' }}>
                                {field.object} <span style={{fontSize: '10px', color: '#666'}}>({field.alias})</span>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6', fontSize: '11px', fontFamily: 'monospace' }}>
                                {field.snowflakeTable}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                                {field.apiName} {field.key && '🔑'}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{field.label}</td>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{field.type}</td>
                            <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{field.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>2. SQL Logic Explanation</h3>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #eee' }}>
                <p>The query is constructed in three parts based on your selections:</p>
                <ol>
                    <li>
                        <strong>Base Selection (The "Site"):</strong>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                            We start by selecting records from the <span style={{ fontWeight: 'bold' }}>Site</span> table where the <code>Zip__c</code> matches your map selection and the <code>RecordType</code> is 'Site'.
                        </p>
                    </li>
                    <li>
                        <strong>Enrichment & Filtering (The "Parent" & "NAICS"):</strong>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                            If you apply any filters (Active Status, Sales, Dates) or NAICS codes, we <span style={{ color: '#228be6', fontWeight: 'bold' }}>LEFT JOIN</span> the <span style={{ fontWeight: 'bold' }}>Parent Account</span> table. This allows us to check the parent's status or sales figures without losing the Site record.
                        </p>
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                            If NAICS filters are active, we further <span style={{ color: '#8e44ad', fontWeight: 'bold' }}>LEFT JOIN</span> the <span style={{ fontWeight: 'bold' }}>Organization</span> table to match the <code>NAICS___c</code> code.
                        </p>
                    </li>
                    <li>
                        <strong>Final Output:</strong>
                        <p style={{ fontSize: '13px', color: '#555' }}>
                            The result is a list of Site IDs (and optional details) that meet ALL criteria: located in the drawn area AND belonging to a Parent Account that matches your business rules.
                        </p>
                    </li>
                </ol>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3>3. Notes & Discussion</h3>
                <div style={{ padding: '15px', backgroundColor: '#FFF3CD', borderRadius: '4px', border: '1px solid #FFEEBA', color: '#856404' }}>
                    <strong>Salesforce Team Note:</strong>
                    <p style={{ margin: '10px 0 0 0' }}>
                        Suggest adding a field to the Contact record that counts the <strong>Number of Opportunities</strong> a Contact has been added to in their lifetime (e.g., <code>Opportunity_Count__c</code>). 
                        This would be a valuable metric for scoring "High Value" contacts and estimating our likelihood of engagement.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataDictionary;
