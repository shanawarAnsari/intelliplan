const express = require("express");
const router = express.Router();
const agentController = require("./controller");

router.post("/ask", agentController.askAgent);
router.post("/feedback", agentController.feedback); // Removed verifyJwtToken to match /ask and use agentToken

module.exports = router;
