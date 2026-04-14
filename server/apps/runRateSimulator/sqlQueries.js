const sqlQueries = {
    getRunRateQuery: () => {
        return (`
         
WITH
-- unify the two SKU selections once
sku_unified AS (
    -- BU (AFC, BCC, FAM), Category and sub category 
    SELECT
        SELLING_SKU,
        BUSINESS_UNIT              AS BUSINESS_UNIT,     
        EPH_CDC                    AS Category,          
        PAM_APO_GROUP_A            AS Sub_Category       
    FROM SC_MD.PROD_DATASHARE.V_REPORTING_SC_MD__V_MD_NA_SC_PLN_SELLING_SKU_RPT
    WHERE BUSINESS_UNIT IN ('AFC','BCC','FAM')

    UNION ALL

    -- For K-C PROFESSIONAL
    SELECT
        SELLING_SKU,
        EPH_SEGMENT_L1             AS BUSINESS_UNIT,     
        EPH_PLATFORM_L2            AS Category,          
        EPH_BUSINESS_SUBGROUP_L4   AS Sub_Category       
    FROM SC_MD.PROD_DATASHARE.V_REPORTING_SC_MD__V_MD_NA_SC_PLN_SELLING_SKU_RPT
    WHERE EPH_SEGMENT_L1 = 'K-C PROFESSIONAL'
),

forecast_data_eph AS (
    SELECT
        sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, forecast.Country,
        SUM(forecast.CONSTRAINED_DC_GROSS_SALES_$) AS TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH
    FROM
        sku_unified sku
    JOIN (
        SELECT *
        FROM SC_PLN.PROD_DATASHARE.V_REPORTING_DP__V_TD_NA_MONTHLY_SNAP_FORECAST_RPT
        WHERE DATE_FCS_LOAD = (
            SELECT MAX(DATE_FCS_LOAD)
            FROM SC_PLN.PROD_DATASHARE.V_REPORTING_DP__V_TD_NA_MONTHLY_SNAP_FORECAST_RPT
        )
        AND EXTRACT(MONTH FROM FORECAST_TECHNICAL_WEEK) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM FORECAST_TECHNICAL_WEEK) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND COUNTRY IN ('US','CA')
    ) forecast
    ON sku.SELLING_SKU = forecast.SELLING_SKU
    GROUP BY sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, forecast.Country
),

actuals_data_eph_13wks AS (
    SELECT
        sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, Country,
        (SUM(CASE WHEN EXTRACT(DOW FROM actuals.DATE) IN (0, 6) THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END))/26 AS AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS,
        (SUM(CASE WHEN EXTRACT(DOW FROM actuals.DATE) BETWEEN 1 AND 5 THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END))/65 AS AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS,
        SUM(CASE WHEN EXTRACT(MONTH FROM actuals.DATE) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM actuals.DATE) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END) AS TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH
    FROM
        sku_unified sku
    JOIN SC_PLN.PROD_DATASHARE.V_REPORTING_DP__V_TD_NA_ACTUALS_RPT actuals
      ON sku.SELLING_SKU = actuals.SELLING_SKU
    WHERE actuals.DATE >= DATEADD(WEEK, -13, CURRENT_DATE)
      AND COUNTRY IN ('US','CA')
    GROUP BY sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, Country
),

actuals_data_eph_8wks AS (
    SELECT
        sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, Country,
        (SUM(CASE WHEN EXTRACT(DOW FROM actuals.DATE) IN (0, 6) THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END))/16 AS AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS,
        (SUM(CASE WHEN EXTRACT(DOW FROM actuals.DATE) BETWEEN 1 AND 5 THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END))/40 AS AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS,
        SUM(CASE WHEN EXTRACT(MONTH FROM actuals.DATE) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM actuals.DATE) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN actuals.ACTUALS_SHIP_GROSS_SALES_$ END) AS TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH
    FROM
        sku_unified sku
    JOIN SC_PLN.PROD_DATASHARE.V_REPORTING_DP__V_TD_NA_ACTUALS_RPT actuals
      ON sku.SELLING_SKU = actuals.SELLING_SKU
    WHERE actuals.DATE >= DATEADD(WEEK, -8, CURRENT_DATE)
      AND COUNTRY IN ('US','CA')
    GROUP BY sku.BUSINESS_UNIT, sku.Category, sku.Sub_Category, Country
)

-- Final Combined Output (unchanged)
SELECT sf.*, sa.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS,
       sa.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS
FROM (
    SELECT
        f.Business_Unit, f.Category, f.Sub_Category, f.Country,
        f.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH,
        a.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS,
        a.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS,
        a.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH,
        'North America' AS Region
    FROM forecast_data_eph f
    LEFT JOIN actuals_data_eph_13wks a
      ON  f.Business_Unit = a.Business_Unit
      AND f.Category = a.Category
      AND f.Sub_Category = a.Sub_Category
      AND f.Country = a.Country
) sf
LEFT JOIN actuals_data_eph_8wks sa
  ON  sf.Business_Unit = sa.Business_Unit
  AND sf.Category = sa.Category
  AND sf.Sub_Category = sa.Sub_Category
  AND sf.Country = sa.Country

            `);
    }
};

module.exports = sqlQueries;
