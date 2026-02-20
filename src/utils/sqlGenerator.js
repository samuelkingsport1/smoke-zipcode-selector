export const generateSQL = (exportConfig, zipList, selectedNAICS, isCountAction) => {
    const { recordType, filters } = exportConfig;
    const { contactActivityMonths = 12, contactActive = true, siteActive = true, customerActive = true } = filters || {};
    
    // Safety check for zipList
    if (!zipList || zipList.length === 0) return "-- No zipcodes provided";
    
    const zipString = zipList.map(z => `'${z.replace(/'/g, "''")}'`).join(",\n  ");

    // Naics logic
    const hasNaics = selectedNAICS && selectedNAICS.size > 0;
    const naicsWhere = hasNaics 
        ? `\n  AND (${Array.from(selectedNAICS).map(code => `o.NAICS_2017_CODE__C LIKE '${code}%'`).join(" OR ")})`
        : "";

    // Filters logic
    const siteStatusWhere = siteActive ? `\n  AND site.Status__c = 'Active'` : "";
    const customerStatusWhere = customerActive ? `\n  AND cust.Status__c = 'Active'` : "";
    const contactStatusWhere = contactActive ? `\n  AND c.Status__c = 'Active'` : "";
    const contactActivityWhere = (contactActivityMonths && !isNaN(contactActivityMonths)) 
        ? `\n  AND c.LastActivityDate IS NOT NULL\n  AND c.LastActivityDate >= DATEADD(month, -${contactActivityMonths}, CURRENT_DATE)`
        : "";

    const type = isCountAction ? 'Count' : recordType;

    if (type === 'Count') {
        return `/* Count Summary */
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
  ${zipString}
  )${naicsWhere}${siteStatusWhere}${customerStatusWhere}${contactStatusWhere}${contactActivityWhere};`;
    }

    if (type === 'Contact') {
        return `/* Contacts Export */
SELECT DISTINCT
    c.Id,
    c.FirstName,
    c.LastName,
    c.Email,
    c.Phone,
    c.Status__c,
    c.LastActivityDate,

    cust.Id              AS customer_account_id,
    site.Id              AS site_account_id,
    site.Zip__c          AS site_zip,

    o.NAICS_2017_CODE__C AS naics_code
FROM SFDC_DS.SFDC_ACCOUNT_OBJECT site
JOIN SFDC_DS.SFDC_ACCOUNT_OBJECT cust
  ON site.Related_Account__c = cust.Id
JOIN SFDC_DS.SFDC_CONTACT_OBJECT c
  ON c.AccountId = cust.Id
JOIN SFDC_DS.SFDC_ORG__C_OBJECT o
  ON cust.Org__c = o.Id
WHERE site.RECORDTYPE_NAME__C = 'Site'
  AND site.Zip__c IN (
  ${zipString}
  )${naicsWhere}${siteStatusWhere}${customerStatusWhere}${contactStatusWhere}${contactActivityWhere}
ORDER BY
    cust.Id,
    c.LastName,
    c.FirstName;`;
    }

    if (type === 'Customer') {
        return `/* Customer Export */
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
  ${zipString}
  )${naicsWhere}${siteStatusWhere}${customerStatusWhere}
ORDER BY
    cust.Id;`;
    }

    if (type === 'Site') {
        return `/* Site Export */
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
  ${zipString}
  )${naicsWhere}${siteStatusWhere}${customerStatusWhere}
ORDER BY
    site.Id;`;
    }

    return "-- Invalid query type.";
};
