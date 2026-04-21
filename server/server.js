require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const runRateSimulatorApi = require("./apps/runRateSimulator");

const PORT = 80;
const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(runRateSimulatorApi);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
