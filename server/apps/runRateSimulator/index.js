const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

const errorhandler = require('../common/errorHandler');

const runRateSimulatorApi = express();

runRateSimulatorApi.use(bodyParser.urlencoded({ extended: true }));
runRateSimulatorApi.use(bodyParser.json());
runRateSimulatorApi.use(cors({
    origin: ['http://localhost:3000',
        'http://localhost:8080',
        'https://dev1.intelliplan.kcc.com'
    ]
}));

runRateSimulatorApi.use('/api/runRate', routes);
runRateSimulatorApi.use(errorhandler);

module.exports = runRateSimulatorApi;
