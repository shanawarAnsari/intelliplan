const express = require("express");
const agentTokenController = require("./agentTokenController.js");
const router = express.Router();

//router.get("/generate", agentTokenController.tokenGenerator);
router.get("/generate", () => {
  return "some random agent api code";
});

module.exports = router;
