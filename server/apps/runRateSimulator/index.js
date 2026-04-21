const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const router = express.Router();

router.use(cors());
router.use("/api/runRate", routes);

module.exports = router;
