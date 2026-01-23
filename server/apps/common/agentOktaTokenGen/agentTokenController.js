const axios = require("axios");
const qs = require("qs");
require('dotenv').config();

const CLIENT_ID = process.env.UNIFI_CONSUMER_ID;
const CLIENT_SECRET = process.env.UNIFI_CONSUMER_SECRET;
const OKTA_BASE_URL = process.env.OKTA_BASE_URL;

const agentTokenController = {
  tokenGenerator: async (req, res) => {
    try {

      const metadataResponse = await axios.get(`${OKTA_BASE_URL}/.well-known/oauth-authorization-server`);
      const tokenEndpoint = metadataResponse.data.token_endpoint;

      if (!tokenEndpoint) {
        return res.status(500).json({ error: "Token endpoint not found in metadata" });
      }


      const tokenData = qs.stringify({
        grant_type: "client_credentials",
        scope: "groups"
      });

      const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");


      const tokenResponse = await axios.post(tokenEndpoint, tokenData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authHeader}`
        }
      });


      const { access_token, token_type, expires_in, scope } = tokenResponse.data;

      return res.json({
        access_token,
        token_type,
        expires_in,
        scope,
        issued_at: new Date().toISOString()
      });

    } catch (err) {
      console.error("Error generating Okta token:", err.response?.data || err.message);
      return res.status(500).json({
        error: "Failed to generate Okta token",
        details: err.response?.data || err.message
      });
    }
  }
};

module.exports = agentTokenController;