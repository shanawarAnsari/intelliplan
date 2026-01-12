const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
require('dotenv').config();

const vaultName = process.env.KEY_VAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;

async function getkeysAndSecrets() {
    const credential = new DefaultAzureCredential();
    // const client = new SecretClient(url, credential);
    try {
        const secretKey = await client.getSecret('jwt-encryption-key');
        const sqlServer = await client.getSecret('Server-Name');
        const sqlDb = await client.getSecret('SQL-DB-NAME');
        const subscriptionId = process.env.SUBSCRIPTION_ID;
        const resourceGroup = process.env.RESOURCE_GROUP;
        const factoryName = process.env.DATAFACTORY_NAME;
        const pipeGeneratePrediction = process.env.GENERATE_PREDICTION_AFD_PIPELINE;
        const pipeArchiveRates = process.env.ARCHIVE_RATE_ADF_PIPELINE;

        let keysAndSecrets = {
            secretKey: secretKey?.value,
            sqlServer: sqlServer?.value,
            sqlDb: sqlDb?.value,
            subscriptionId: subscriptionId,
            resourceGroup: resourceGroup,
            factoryName: factoryName,
            pipeGeneratePrediction: pipeGeneratePrediction,
            pipeArchiveRates: pipeArchiveRates
        };
        return keysAndSecrets;
    } catch (err) {
        throw err;
    }
}

module.exports = getkeysAndSecrets;
