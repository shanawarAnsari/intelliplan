const snowflakeManager = require("../common/snowflakeManager")
const { getRunRateQuery } = require('./sqlQueries')

const appService = {
    getRunRateData: async () => {
        // const warehouseSql = `use warehouse CORE_BI_WH`;
        // await snowflakeManager.executeQuery(warehouseSql, []);
        // const schemaSql = `use schema reporting`;
        // await snowflakeManager.executeQuery(schemaSql, []);
        let sql = getRunRateQuery();
        return await snowflakeManager.executeQuery(sql, []);
    },

    runActiveWarehouse: async () => {
        let sql = `use warehouse ${process.env.SNOWFLAKE_WAREHOUSE}`
        await snowflakeManager.executeQuery(sql, []);
    }
};

module.exports = appService;
