const snowflake = require('snowflake-sdk');
const cacheManager = require('../common/cache/cacheManager')

let connectionPool;
function getConnectionPool() {
  if (connectionPool != null) return connectionPool;

  let {
    snowflakeURL,
    snowflakeUser,
    snowflakePassword,
    snowflakeRole } = cacheManager.getCache('key_vault_cache');

  let snowflakeConfig = {
    username: snowflakeUser,
    password: snowflakePassword,
    role: snowflakeRole,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    account: snowflakeURL,
    validate: async (connection) => {
      return await connection.isValidAsync();
    }
  };
  let poolConfig = {
    max: 10,
    min: 0,
    testOnBorrow: true,
    evictionRunIntervalMillis: 120000,
    idleTimeoutMillis: 120000
  }
  snowflake.configure({ logLevel: "WARN" });
  return snowflake.createPool({ ...snowflakeConfig }, poolConfig);
}

module.exports = {

  executeQuery: async (sqlText, bindParams, next) => {
    return new Promise(async (resolve, reject) => {
      let bindings = bindParams
      if (bindParams === undefined || bindParams?.length === 0) {
        bindings = [];
      }
      connectionPool = getConnectionPool();
      let connection = await connectionPool.acquire();
      connection.execute({
        sqlText: sqlText,
        binds: bindings,
        complete: (err, stmt, rows) => {
          connectionPool.release(connection);
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      });
    });
  },

  getSnowflakePool: () => {
    return connectionPool;
  }
}
