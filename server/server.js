const express = require('express');
const runRateSimulatorApi = require('./apps/runRateSimulator');
const helmet = require("helmet");
const getkeysAndSecrets = require('./apps/common/keysAndSecretsManager');
const cacheManager = require('./apps/common/cache/cacheManager');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

async function startApp() {
  // try {
  //   const secrets = await getkeysAndSecrets();
  //   cacheManager.setCache('key_vault_cache', secrets);
  //   console.log('Key Vault secrets cached successfully.');
  // } catch (err) {
  //   console.error('Failed to initialize Key Vault cache:', err);
  //   throw err;
  // }

  app.use(runRateSimulatorApi)

  app.listen(PORT, () => {
    console.log(`
      🚀 IntelliPlan API Server Started
      ================================
      Port: ${PORT}
      Environment: ${process.env.NODE_ENV || "DEV"}
      Time: ${new Date().toISOString()}
      ================================
    `);
  });
}
startApp();
