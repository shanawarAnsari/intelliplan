const express = require("express");
const router = express.Router();
const agentController = require("./controller");

router.post("/ask", agentController.askAgent);
router.post("/feedback", agentController.feedback);

module.exports = router;
