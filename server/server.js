const express = require('express');
const runRateSimulatorApi = require('./apps/runRateSimulator');
const helmet = require("helmet");
const getKeysAndSecrets = require('./apps/common/keysAndSecretsManager');
const cacheManager = require('./apps/common/cache/cacheManager');
const askIntelliplanApi = require('./apps/askIntelliplan');
require('dotenv').config();

const PORT = 80;

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

async function startApp() {
  try {
    const secrets = await getKeysAndSecrets();
    cacheManager.setCache('key_vault_cache', secrets);
    console.log(`Key Vault secrets cached successfully | Time: ${new Date().toISOString()}`);
  } catch (err) {
    console.error('Failed to initialize Key Vault cache:', err);
    throw err;
  }

  app.use(runRateSimulatorApi)
  app.use(askIntelliplanApi)
  app.listen(PORT, () => {
    console.log(`🚀 IntelliPlan API Server Started on Port: ${PORT} | Time: ${new Date().toISOString()}`);
  });
}
startApp();
