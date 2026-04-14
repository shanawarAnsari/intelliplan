function safeStatusCode(code) {
  return Number.isInteger(code) && code >= 100 && code <= 599 ? code : 500;
}

function safeLogValue(val) {
  if (val == null) return val;
  return String(val).replace(/[\r\n\t]/g, " ");
}

function errorHandler(err, req, res, next) {
  const statusCode = safeStatusCode(err.statusCode || err.status || 500);

  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    code: err.code,
    message: safeLogValue(err.message),
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    details: err.details, // internal only
  });

  // Preserve existing client contracts when provided
  if (err && err.publicResponse && typeof err.publicResponse === "object") {
    return res.status(statusCode).json(err.publicResponse);
  }

  // Default safe error response (no untrusted err.message)
  const safeMessage =
    err && err.exposeMessage === true
      ? err.message
      : statusCode >= 500
        ? "Internal Server Error"
        : "Request failed";

  return res.status(statusCode).json({
    success: false,
    error: {
      message: safeMessage,
      code: statusCode,
    },
  });
}

module.exports = errorHandler;