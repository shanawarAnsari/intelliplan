// apps/common/errorHandler/index.js

function safeStatusCode(code) {
  return Number.isInteger(code) && code >= 100 && code <= 599 ? code : 500;
}

function errorHandler(err, req, res, next) {
  const statusCode = safeStatusCode(err.statusCode || err.status || 500);

  // Log the error (you can enhance this with Winston or other loggers)
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: statusCode,
    },
  });
}

module.exports = errorHandler;