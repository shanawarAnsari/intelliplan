const fetch = require("node-fetch");
require('dotenv').config();
const agentUrl = process.env.AGENT_API_URL
const agentController = {
  askAgent: async (req, res, next) => {
    try {
      const agentToken = req.headers.authorization;
      const sessionId = req.headers['x-session-id'];
      if (!agentToken) {
        return res.status(401).json({ message: "Missing agent token" });
      }

      const response = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": agentToken,
          "x-session-id": sessionId
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ message: text });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      console.log(err)
      next(err);
    }
  },
};

module.exports = agentController;