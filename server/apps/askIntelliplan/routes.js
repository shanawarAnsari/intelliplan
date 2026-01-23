const express = require("express");
const router = express.Router();
const agentController = require("./controller");
const verifyJwtToken = require("../common/oktaTokenVerifier/jwtTokenVerifier");

router.post("/ask", agentController.askAgent);


module.exports = router;
