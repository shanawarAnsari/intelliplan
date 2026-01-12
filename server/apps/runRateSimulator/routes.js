const express = require("express");
const router = express.Router();
const runRateController = require("./controller");
const verifyJwtToken = require("../common/oktaTokenVerifier/jwtTokenVerifier");

router.get("/getRunRateData", runRateController.getRunRateData);


module.exports = router;
