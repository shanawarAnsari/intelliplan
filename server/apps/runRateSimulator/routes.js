const express = require("express");
const router = express.Router();
const runRateController = require("./controller");

router.get("/getRunRateData", runRateController.getRunRateData);

module.exports = router;
