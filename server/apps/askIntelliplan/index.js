const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const genAgentToken = require('../common/agentOktaTokenGen/tokenGenRoute')
const agentRoutes = require('./routes')
const errorhandler = require('../common/errorHandler');

const askIntelliplanApi = express();

askIntelliplanApi.use(bodyParser.urlencoded({ extended: true }));
askIntelliplanApi.use(bodyParser.json());
askIntelliplanApi.use(cors({
    origin: ['http://localhost:3000',
        'http://localhost:8080',
        'https://dev1.intelliplan.kcc.com',
        'https://dev1.intelliplan.azure-kcc.com',
        'https://qa1.intelliplan.kcc.com',
        'https://qa1.intelliplan.azure-kcc.com',
        'https://stage1.intelliplan.kcc.com',
        'https://stage1.intelliplan.azure-kcc.com',
        'https://www.intelliplan.kcc.com'
    ]
}));
askIntelliplanApi.use('/api/genAgentToken', genAgentToken);
askIntelliplanApi.use('/api/agent', agentRoutes);
// askIntelliplanApi.use('/api/runRate', routes);
askIntelliplanApi.use(errorhandler);

module.exports = askIntelliplanApi;
