const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const authRoutes = require('../common/oktaTokenVerifier/authRoutes')
const errorhandler = require('../common/errorHandler');

const runRateSimulatorApi = express();

runRateSimulatorApi.use(bodyParser.urlencoded({ extended: true }));
runRateSimulatorApi.use(bodyParser.json());
runRateSimulatorApi.use(cors({
    origin: ['http://localhost:3000',
        'http://localhost:8080',
        'https://dev1.intelliplan.kcc.com',
        'https://dev1.intelliplan.azure-kcc.com',
        'https://qa1.intelliplan.kcc.com',
        'https://qa1.intelliplan.azure-kcc.com',
        'https://stage1.intelliplan.kcc.com',
        'https://stage.intelliplan.kcc.com',
        'https://stage1.intelliplan.azure-kcc.com',
        'https://www.intelliplan.kcc.com',
        'https://intelliplan.kcc.com'
    ]
}));
runRateSimulatorApi.use('/api/auth', authRoutes);
runRateSimulatorApi.use('/api/runRate', routes);
runRateSimulatorApi.use(errorhandler);

module.exports = runRateSimulatorApi;
