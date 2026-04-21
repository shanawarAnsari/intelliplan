const appService = require("./domain");

const runRateController = {
  getRunRateData: async (req, res, next) => {
    try {
      const data = await appService.getRunRateData();
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = runRateController;
