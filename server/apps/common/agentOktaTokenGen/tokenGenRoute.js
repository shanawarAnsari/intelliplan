const express = require("express");
const agentTokenController = require("./agentTokenController.js");
const router = express.Router();


router.get('/generate', agentTokenController.tokenGenerator);

module.exports = router;
