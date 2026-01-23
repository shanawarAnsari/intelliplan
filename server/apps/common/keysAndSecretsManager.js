const { ClientSecretCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
require('dotenv').config();

const vaultName = process.env.KEY_VAULT_NAME;
const keyVaultUrl = `https://${vaultName}.vault.azure.net`;

async function getKeysAndSecrets() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret || !vaultName) {
    throw new Error('Missing required Azure Service Principal credentials or Key Vault name.');
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const client = new SecretClient(keyVaultUrl, credential);

  try {
    const snowflakePassword = await client.getSecret('SNOWFLAKE-CONNECTION-PASSWORD');
    const snowflakeRole = await client.getSecret('SNOWFLAKE-CONNECTION-ROLE');
    const snowflakeURL = await client.getSecret('SNOWFLAKE-CONNECTION-URL');
    const snowflakeUser = await client.getSecret('SNOWFLAKE-CONNECTION-USER');
    return {
      snowflakePassword: snowflakePassword?.value,
      snowflakeRole: snowflakeRole?.value,
      snowflakeURL: snowflakeURL?.value,
      snowflakeUser: snowflakeUser?.value,
      snowflakeWarehouse: process.env.SNOWFLAKE_WAREHOUSE,
      snowflakeDatabase: process.env.SNOWFLAKE_DATABASE,
      secretKey: process.env.ENCRYPTION_KEY,
    };
  } catch (err) {
    console.error('Error retrieving secrets from Key Vault:', err.message);
    throw err;
  }
}

module.exports = getKeysAndSecrets;