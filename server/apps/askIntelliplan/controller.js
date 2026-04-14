const fetch = require("node-fetch");
require("dotenv").config();

const createError = require("../common/errorHandler/createError"); // adjust path
const { sanitizeJsonDeep } = require("../common/security/sanitizeJson"); // adjust path

const agentUrl = process.env.AGENT_API_URL;
const agentFeedbackUrl = process.env.AGENT_FEEDBACK_API_URL;

async function readUpstream(resp) {
  const text = await resp.text().catch(() => "");
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

const agentController = {
  askAgent: async (req, res, next) => {
    try {
      const agentToken = req.headers.authorization;
      const sessionId = req.headers["x-session-id"] || "";

      if (!agentToken) {
        return next(
          createError(401, "Missing agent token", {
            code: "ERR_AUTH",
            publicResponse: { message: "Missing agent token" },
            exposeMessage: true,
          })
        );
      }

      if (!agentUrl) {
        return next(
          createError(500, "Agent URL not configured", {
            code: "ERR_CONFIG",
            publicResponse: { message: "Agent URL not configured" },
            exposeMessage: true,
          })
        );
      }

      let response;
      try {
        response = await fetch(agentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": agentToken,
            "x-session-id": sessionId,
          },
          body: JSON.stringify(req.body),
        });
      } catch (e) {
        return next(
          createError(502, "Unable to reach agent service", {
            code: "ERR_UPSTREAM_NETWORK",
            details: { message: e.message },
          })
        );
      }

      const { json, text } = await readUpstream(response);

      if (!response.ok) {
        return next(
          createError(response.status, "Agent service returned an error", {
            code: "ERR_AGENT",
            details: {
              upstreamStatus: response.status,
              upstreamStatusText: response.statusText,
              upstreamBody: text,
            },
            publicResponse: { message: "Agent service returned an error" },
            exposeMessage: true,
          })
        );
      }

      if (!json) {
        return next(
          createError(502, "Invalid response from agent service", {
            code: "ERR_UPSTREAM_INVALID_JSON",
            details: { upstreamBody: text },
            publicResponse: { message: "Invalid response from agent service" },
            exposeMessage: true,
          })
        );
      }

      // ✅ IMPORTANT: sanitize BEFORE output to break Checkmarx taint flow
      const safeJson = sanitizeJsonDeep(json);
      return res.status(200).json(safeJson);
    } catch (err) {
      return next(err);
    }
  },

  feedback: async (req, res, next) => {
    try {
      const {
        id,
        sessionId,
        messageId,
        score,
        categoriesText,
        comment,
        message,
        requestTime,
        user_email,
        ADGroup,
      } = req.body;

      const agentToken = req.headers.authorization;
      const headerSessionId = req.headers["x-session-id"];

      if (!sessionId || !messageId || typeof score !== "string") {
        return next(
          createError(400, "Missing or invalid required fields (sessionId, messageId, score:string)", {
            code: "ERR_VALIDATION",
            publicResponse: { error: "Missing or invalid required fields (sessionId, messageId, score:string)" },
            exposeMessage: true,
          })
        );
      }

      if (!["0", "1"].includes(score)) {
        return next(
          createError(400, "Invalid score; expected '0' or '1' as string", {
            code: "ERR_VALIDATION",
            publicResponse: { error: "Invalid score; expected '0' or '1' as string" },
            exposeMessage: true,
          })
        );
      }

      if (!agentToken) {
        return next(
          createError(401, "Missing agent token", {
            code: "ERR_AUTH",
            publicResponse: { error: "Missing agent token" },
            exposeMessage: true,
          })
        );
      }

      if (!agentFeedbackUrl) {
        return next(
          createError(500, "Agent feedback URL not configured", {
            code: "ERR_CONFIG",
            publicResponse: { error: "Agent feedback URL not configured" },
            exposeMessage: true,
          })
        );
      }

      const forwardPayload = {
        ADGroup,
        user_email,
        id,
        sessionId,
        messageId,
        score,
        categoriesText: categoriesText ?? null,
        comment: comment ?? null,
        message: message ?? null,
        requestTime: requestTime ?? Date.now().toString(),
      };

      let agentResp;
      try {
        agentResp = await fetch(agentFeedbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": agentToken,
            "x-session-id": headerSessionId || sessionId,
          },
          body: JSON.stringify(forwardPayload),
        });
      } catch (e) {
        return next(
          createError(502, "Unable to reach agent feedback service", {
            code: "ERR_UPSTREAM_NETWORK",
            details: { message: e.message },
          })
        );
      }

      const { json, text } = await readUpstream(agentResp);

      if (!agentResp.ok) {
        return next(
          createError(agentResp.status, "Agent feedback service returned an error", {
            code: "ERR_AGENT_FEEDBACK",
            details: {
              upstreamStatus: agentResp.status,
              upstreamStatusText: agentResp.statusText,
              upstreamBody: text,
            },
            publicResponse: { error: "Agent feedback service returned an error" },
            exposeMessage: true,
          })
        );
      }

      // ✅ IMPORTANT: sanitize BEFORE output (this is your line 225 issue)
      const safeJson = sanitizeJsonDeep(json || {});
      return res.status(200).json(safeJson);
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = agentController;