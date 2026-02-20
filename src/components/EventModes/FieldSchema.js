export const FIELD_SCHEMA = [
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "id",
        "label": "Record ID",
        "type": "String",
        "key": true,
        "description\r": "Unique Record ID"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Name",
        "label": "Account Name",
        "type": "String",
        "key": false,
        "description\r": "Display Name"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Zip__c",
        "label": "Zip Code",
        "type": "String",
        "key": true,
        "description\r": "5-digit Zip Code (Geographic Link)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "ParentId",
        "label": "Parent ID",
        "type": "String",
        "key": true,
        "description\r": "Parent Account ID (Join Key)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "RECORDTYPE_NAME__C",
        "label": "Record Type",
        "type": "String",
        "key": false,
        "description\r": "Filter Value (e.g., 'Site', 'Customer')"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Last_Order_Date__C",
        "label": "Last Order Date",
        "type": "Date",
        "key": false,
        "description\r": "Sales Metric (Optional Display)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Total_LY_Sales__C",
        "label": "Total LY Sales",
        "type": "Currency",
        "key": false,
        "description\r": "Sales Metric (Optional Display)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Id",
        "label": "Record ID",
        "type": "String",
        "key": true,
        "description\r": "Unique Record ID (Join Target)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Status__c",
        "label": "Status",
        "type": "String",
        "key": false,
        "description\r": "Account Status (e.g., 'Active')"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Org__c",
        "label": "Org ID",
        "type": "String",
        "key": true,
        "description\r": "Organization ID (Join Key to NAICS)"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "LastActivityDate",
        "label": "Last Activity",
        "type": "Date",
        "key": false,
        "description\r": "Activity Metric"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "LastOrderDate__c",
        "label": "Last Order Date",
        "type": "Date",
        "key": false,
        "description\r": "Sales Metric"
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Total_Sales_LY__c",
        "label": "Total LY Sales",
        "type": "Currency",
        "key": false,
        "description\r": "Annual Sales"
    },
    {
        "object": "Org",
        "alias": "Org",
        "snowflakeTable": "SFDC_DS.SFDC_ORG__C_OBJECT",
        "apiName": "Id",
        "label": "Record ID",
        "type": "String",
        "key": true,
        "description\r": "Unique Record ID (Join Target)"
    },
    {
        "object": "Org",
        "alias": "Org",
        "snowflakeTable": "SFDC_DS.SFDC_ORG__C_OBJECT",
        "apiName": "NAICS_2017_CODE__C",
        "label": "NAICS 2017 Code",
        "type": "String",
        "key": false,
        "description\r": "Industry Code"
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "Id",
        "label": "Record ID",
        "type": "String",
        "key": true,
        "description\r": "Unique Record ID"
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "Account__c",
        "label": "Account ID",
        "type": "String",
        "key": true,
        "description\r": "Foreign Key (Joins to Site/Customer)"
    },
    {
        "object": "Contact",
        "alias": "Contact",
        "snowflakeTable": "SFDC_DS.SFDC_CONTACT_OBJECT",
        "apiName": "Id",
        "label": "Record ID",
        "type": "String",
        "key": true,
        "description\r": "Unique Record ID"
    },
    {
        "object": "Contact",
        "alias": "Contact",
        "snowflakeTable": "SFDC_DS.SFDC_CONTACT_OBJECT",
        "apiName": "AccountId",
        "label": "Account ID",
        "type": "String",
        "key": true,
        "description\r": "Foreign Key (Joins to Site/Customer)"
    },
    {
        "object": "Contact",
        "alias": "Contact",
        "snowflakeTable": "SFDC_DS.SFDC_CONTACT_OBJECT",
        "apiName": "Status__c",
        "label": "Status",
        "type": "String",
        "key": false,
        "description\r": "Contact Status (e.g., 'Active', 'No Longer There')"
    },
    {
        "object": "Contact",
        "alias": "Contact",
        "snowflakeTable": "SFDC_DS.SFDC_CONTACT_OBJECT",
        "apiName": "LastActivityDate",
        "label": "Last Activity",
        "type": "Date",
        "key": false,
        "description\r": "Last Interaction Date"
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QUARTER_LY_IMU__C",
        "label": "Quarter LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QUARTER_LY__C",
        "label": "Quarter LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "RANKING__C",
        "label": "Ranking",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ROLLING_12_MONTH_SALES__C",
        "label": "Rolling 12 Month Sales",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ROLLING_3_MONTH_SALES__C",
        "label": "Rolling 3 Month Sales",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ROLLING_6_MONTH_SALES__C",
        "label": "Rolling 6 Month Sales",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ROLLING_9_MONTH_SALES__C",
        "label": "Rolling 9 Month Sales",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SALES_AMT_FLG__C",
        "label": "Sales Amount Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SALES_DIFF__C",
        "label": "Sales DIFF",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SALES__C",
        "label": "Sales",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SITE_COUNT__C",
        "label": "SITE Count",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SOURCE_SYSTEM__C",
        "label": "Source System",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "SYSTEMMODSTAMP",
        "label": "Systemmodstamp",
        "type": "Timestamp",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_IMU_LY__C",
        "label": "TECH IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_IMU_TY__C",
        "label": "TECH IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_LAST_ORDER_AMT__C",
        "label": "TECH LAST Order Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_LAST_ORDER_DT_TXT__C",
        "label": "TECH LAST Order Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_LY__C",
        "label": "TECH LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_POT__C",
        "label": "TECH POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_TOTAL_LY__C",
        "label": "TECH Total LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TECH_TY__C",
        "label": "TECH TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_IMU_LY__C",
        "label": "Textiles Amenities IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_IMU_TY__C",
        "label": "Textiles Amenities IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_LAST_ORDER_AMT__C",
        "label": "Textiles Amenities LAST Order Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_LAST_ORDER__C",
        "label": "Textiles Amenities LAST Order",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_LY__C",
        "label": "Textiles Amenities LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_POT__C",
        "label": "Textiles Amenities POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TEXTILES_AMENITIES_TY__C",
        "label": "Textiles Amenities TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "TOTAL_ORDER__C",
        "label": "Total Order",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "UNIQUE_KEY__C",
        "label": "Unique KEY",
        "type": "String",
        "key": true,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WEEKLY_ORDER_FLG__C",
        "label": "Weekly Order Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WEEKLY_SALES_FLG__C",
        "label": "Weekly Sales Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WEEKS_SINCE_1ST_ORDER__C",
        "label": "Weeks Since First Order",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WEEKS_SINCE_LAST_ORDER__C",
        "label": "Weeks Since LAST Order",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_IMU_LY__C",
        "label": "Writing Drafting IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_IMU_TY__C",
        "label": "Writing Drafting IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_LAST_ORDER_AMT__C",
        "label": "Writing Drafting LAST Order Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_LY__C",
        "label": "Writing Drafting LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_POT__C",
        "label": "Writing Drafting POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_TOTAL_LY__C",
        "label": "Writing Drafting Total LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_DRAFTING_TY__C",
        "label": "Writing Drafting TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "WRITING_LAST_ORDER_DT_TXT__C",
        "label": "Writing LAST Order Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YEAR_GOAL__C",
        "label": "YEAR GOAL",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YEAR_LY_IMU__C",
        "label": "YEAR LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YEAR_LY__C",
        "label": "YEAR LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YTD_SALES_LY_IMU__C",
        "label": "YTD Sales LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YTD_SALES_LY__C",
        "label": "YTD Sales LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YTD_SALES_TY_IMU__C",
        "label": "YTD Sales TY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "YTD_SALES_TY__C",
        "label": "YTD Sales TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ACCOUNT_TYPE__C",
        "label": "Account TYPE",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ACCOUNT__C",
        "label": "Account",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_CURRENT_MONTH__C",
        "label": "ADS Current MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_CURRENT_QTR__C",
        "label": "ADS Current QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_CURRENT_YR__C",
        "label": "ADS Current YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_LAST_MONTH__C",
        "label": "ADS LAST MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_LAST_QTR__C",
        "label": "ADS LAST QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ADS_LAST_YR__C",
        "label": "ADS LAST YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOPS_ID__C",
        "label": "AOPS ID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_CURRENT_MONTH__C",
        "label": "AOV Current MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_CURRENT_QTR__C",
        "label": "AOV Current QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_CURRENT_YR__C",
        "label": "AOV Current YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_LAST_MONTH__C",
        "label": "AOV LAST MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_LAST_QTR__C",
        "label": "AOV LAST QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "AOV_LAST_YR__C",
        "label": "AOV LAST YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "BATCHPROCESSED__C",
        "label": "Batchprocessed",
        "type": "Boolean",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CADENCE_CALL_DATE_OVERRIDE_VALUE__C",
        "label": "Cadence CALL DATE Override VALUE",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CATEGORY_COUNT_FLG__C",
        "label": "Category COUNT Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CATEGORY_COUNT__C",
        "label": "Category COUNT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_IMU_LY__C",
        "label": "CBS IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_IMU_TY__C",
        "label": "CBS IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_LAST_ORDER_AMT__C",
        "label": "CBS LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_LAST_ORDER_DT_TXT__C",
        "label": "CBS LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_LY__C",
        "label": "CBS LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_POT__C",
        "label": "CBS POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_TOTAL_LY__C",
        "label": "CBS TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CBS_TY__C",
        "label": "CBS TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CDH_PARTY_ID__C",
        "label": "CDH PARTY ID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CDH_PARTY_SITE_ID__C",
        "label": "CDH PARTY SITE ID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONNECTIONRECEIVEDID",
        "label": "Connectionreceivedid",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONNECTIONSENTID",
        "label": "Connectionsentid",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_IMU_LY__C",
        "label": "Contract Furniture IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_IMU_TY__C",
        "label": "Contract Furniture IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_LAST_ORDER_AMT__C",
        "label": "Contract Furniture LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_LY__C",
        "label": "Contract Furniture LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_POT__C",
        "label": "Contract Furniture POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CONTRACT_FURNITURE_TY__C",
        "label": "Contract Furniture TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "COPIERSTEXT__C",
        "label": "Copierstext",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "COPIERS__C",
        "label": "Copiers",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_IMU_LY__C",
        "label": "CPD IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_IMU_TY__C",
        "label": "CPD IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_LAST_ORDER_AMT__C",
        "label": "CPD LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_LAST_ORDER_DT_TXT__C",
        "label": "CPD LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_LY__C",
        "label": "CPD LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_POT__C",
        "label": "CPD POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_TOTAL_LY__C",
        "label": "CPD TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CPD_TY__C",
        "label": "CPD TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CREATEDBYID",
        "label": "Createdbyid",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CREATEDDATE",
        "label": "Createddate",
        "type": "Timestamp",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "CUSTOMER_CREATE_DT_TXT__C",
        "label": "Customer Create Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "DNBI_FSS_SCORE__C",
        "label": "DNBI FSS SCORE",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "DNBI_MATCHSCORE__C",
        "label": "DNBI Matchscore",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "DNB_WCW_HERE__C",
        "label": "DNB WCW HERE",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "DNB_WCW_TOTAL__C",
        "label": "DNB WCW TOTAL",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "EST_SPEND_CAD__C",
        "label": "EST SPEND CAD",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "EST_SPEND__C",
        "label": "EST SPEND",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "EXTERNAL_ACCOUNT_ID__C",
        "label": "External Account ID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_IMU_LY__C",
        "label": "Filing Binding IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_IMU_TY__C",
        "label": "Filing Binding IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_LAST_ORDER_AMT__C",
        "label": "Filing Binding LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_LY__C",
        "label": "Filing Binding LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_POT__C",
        "label": "Filing Binding POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_TOTAL_LY__C",
        "label": "Filing Binding TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_BINDING_TY__C",
        "label": "Filing Binding TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FILING_LAST_ORDER_DT_TXT__C",
        "label": "Filing LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FIRST_ORDER_DT_TXT__C",
        "label": "FIRST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_IMU_LY__C",
        "label": "Furniture IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_IMU_TY__C",
        "label": "Furniture IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_LAST_ORDER_AMT__C",
        "label": "Furniture LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_LY__C",
        "label": "Furniture LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_POT__C",
        "label": "Furniture POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_TOTAL_LY__C",
        "label": "Furniture TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURNITURE_TY__C",
        "label": "Furniture TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "FURN_LAST_ORDER_DT_TXT__C",
        "label": "FURN LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "GPARENT_GPID__C",
        "label": "Gparent GPID",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ID",
        "label": "ID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_LAST_ORDER_DT_TXT__C",
        "label": "INK LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_IMU_LY__C",
        "label": "INK TONER IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_IMU_TY__C",
        "label": "INK TONER IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_LAST_ORDER_AMT__C",
        "label": "INK TONER LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_LY__C",
        "label": "INK TONER LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_POT__C",
        "label": "INK TONER POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_TOTAL_LY__C",
        "label": "INK TONER TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "INK_TONER_TY__C",
        "label": "INK TONER TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ISDELETED",
        "label": "Isdeleted",
        "type": "Boolean",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_IMU_LY__C",
        "label": "Labels FORMS IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_IMU_TY__C",
        "label": "Labels FORMS IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_LAST_ORDER_AMT__C",
        "label": "Labels FORMS LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_LY__C",
        "label": "Labels FORMS LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_POT__C",
        "label": "Labels FORMS POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_TOTAL_LY__C",
        "label": "Labels FORMS TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_FORMS_TY__C",
        "label": "Labels FORMS TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LABELS_LAST_ORDER_DT_TXT__C",
        "label": "Labels LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LASTMODIFIEDBYID",
        "label": "Lastmodifiedbyid",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LASTMODIFIEDDATE",
        "label": "Lastmodifieddate",
        "type": "Timestamp",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LASTREFERENCEDDATE",
        "label": "Lastreferenceddate",
        "type": "Timestamp",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LASTVIEWEDDATE",
        "label": "Lastvieweddate",
        "type": "Timestamp",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LAST_180_DAYS_SALES_AMT__C",
        "label": "LAST 180 DAYS SALES Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LAST_270_DAYS_SALES_AMT__C",
        "label": "LAST 270 DAYS SALES Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LAST_365_DAYS_SALES_AMT__C",
        "label": "LAST 365 DAYS SALES Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LAST_90_DAYS_SALES_AMT__C",
        "label": "LAST 90 DAYS SALES Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LAST_ORDER_DT_TXT__C",
        "label": "LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "LIKELY_TO_PURCHASE_FLG__C",
        "label": "Likely TO Purchase Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MAX_ORDER_LIMIT__C",
        "label": "MAX ORDER LIMIT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_IMU_LY__C",
        "label": "Miscellaneous IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_IMU_TY__C",
        "label": "Miscellaneous IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_LAST_ORDER_AMT__C",
        "label": "Miscellaneous LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_LY__C",
        "label": "Miscellaneous LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_POT__C",
        "label": "Miscellaneous POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_TOTAL_LY__C",
        "label": "Miscellaneous TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISCELLANEOUS_TY__C",
        "label": "Miscellaneous TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MISC_LAST_ORDER_DT_TXT__C",
        "label": "MISC LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MONTHLY_LY_IMU__C",
        "label": "Monthly LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MONTHLY_LY__C",
        "label": "Monthly LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MONTH_GOAL__C",
        "label": "MONTH GOAL",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MONTH_SALES_FLG__C",
        "label": "MONTH SALES Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_IMU_LY__C",
        "label": "MPS IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_IMU_TY__C",
        "label": "MPS IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_LAST_ORDER_AMT__C",
        "label": "MPS LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_LAST_ORDER_DT_TXT__C",
        "label": "MPS LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_LY__C",
        "label": "MPS LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_POT__C",
        "label": "MPS POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_TOTAL_LY__C",
        "label": "MPS TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MPS_TY__C",
        "label": "MPS TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MTD_SALES_LY_IMU__C",
        "label": "MTD SALES LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MTD_SALES_LY__C",
        "label": "MTD SALES LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MTD_SALES_TY_IMU__C",
        "label": "MTD SALES TY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "MTD_SALES_TY__C",
        "label": "MTD SALES TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "NAME",
        "label": "NAME",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "NUM_OF_CATEGORIES__C",
        "label": "NUM OF Categories",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "NUM_OF_ORDERS_SINCE_START__C",
        "label": "NUM OF Orders SINCE START",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_IMU_LY__C",
        "label": "Office Essentials IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_IMU_TY__C",
        "label": "Office Essentials IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_LAST_ORDER_AMT__C",
        "label": "Office Essentials LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_LY__C",
        "label": "Office Essentials LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_POT__C",
        "label": "Office Essentials POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_TOTAL_LY__C",
        "label": "Office Essentials TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_ESSENTIALS_TY__C",
        "label": "Office Essentials TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OFFICE_LAST_ORDER_DT_TXT__C",
        "label": "Office LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OMAXPROSPECTSER_BATCH_PROCESSED__C",
        "label": "Omaxprospectser BATCH Processed",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OPPORTUNITY_AMT__C",
        "label": "Opportunity Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_CURRENT_MONTH__C",
        "label": "Orders Current MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_CURRENT_QTR__C",
        "label": "Orders Current QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_CURRENT_YR__C",
        "label": "Orders Current YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_LAST_MONTH__C",
        "label": "Orders LAST MONTH",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_LAST_QTR__C",
        "label": "Orders LAST QTR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_LAST_YR__C",
        "label": "Orders LAST YR",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_SINCE_START_COUNT__C",
        "label": "Orders SINCE START COUNT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDERS_SINCE_START_FLG__C",
        "label": "Orders SINCE START Flag",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORDER_DT_TXT__C",
        "label": "ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORGID__C",
        "label": "ORGID",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORG_ID_ROLLUP__C",
        "label": "ORG ID Rollup",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORG_NUMBER_OF_LOCATIONS__C",
        "label": "ORG Number OF Locations",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORG_WCW_COUNT_DB__C",
        "label": "ORG WCW COUNT DB",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORG_WCW_COUNT_REP__C",
        "label": "ORG WCW COUNT REP",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "ORG__C",
        "label": "ORG",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "OWNERID",
        "label": "Ownerid",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_IMU_LY__C",
        "label": "PAPER IMU LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_IMU_TY__C",
        "label": "PAPER IMU TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_LAST_ORDER_AMT__C",
        "label": "PAPER LAST ORDER Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_LAST_ORDER_DT_TXT__C",
        "label": "PAPER LAST ORDER Date TXT",
        "type": "Date",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_LY__C",
        "label": "PAPER LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_POT__C",
        "label": "PAPER POT",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_TOTAL_LY__C",
        "label": "PAPER TOTAL LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PAPER_TY__C",
        "label": "PAPER TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PARENT_ORG__C",
        "label": "Parent ORG",
        "type": "String",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PARTNER_LY_HARDWARE_SALES__C",
        "label": "Partner LY Hardware SALES",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PARTNER_LY_SERVICES_SALES__C",
        "label": "Partner LY Services SALES",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "PID_NUMERIC__C",
        "label": "PID Numeric",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "POTENTIAL_AMOUNT__C",
        "label": "Potential Amount",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "POTENTIAL_PRINTERS__C",
        "label": "Potential Printers",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QTD_SALES_LY_IMU__C",
        "label": "QTD SALES LY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QTD_SALES_LY__C",
        "label": "QTD SALES LY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QTD_SALES_TY_IMU__C",
        "label": "QTD SALES TY IMU",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QTD_SALES_TY__C",
        "label": "QTD SALES TY",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Sales Data",
        "alias": "Sales",
        "snowflakeTable": "SFDC_DS.SFDC_SALES_DATA_OBJECT",
        "apiName": "QUARTER_GOAL__C",
        "label": "Quarter GOAL",
        "type": "Number",
        "key": false,
        "description\r": ""
    },
    {
        "object": "Account",
        "alias": "Account",
        "snowflakeTable": "SFDC_DS.SFDC_ACCOUNT_OBJECT",
        "apiName": "Related_Account__c",
        "label": "Related Account",
        "type": "Lookup",
        "key": false,
        "description\r": "Lookup to Account (Customer) used by Site records to reference parent Customer"
    }
];
