const appService = require("./domain");

const runRateController = {
  getRunRateData: async (req, res, next) => {
    try {
      const warehouseResposne = await appService.runActiveWarehouse()
      const responseDto = await appService.getRunRateData()
      res.status(200).send(responseDto);
    } catch (err) {
      next(err);
    }
  },
}

module.exports = runRateController;
