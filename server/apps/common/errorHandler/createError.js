// apps/common/errorHandler/createError.js
const AppError = require("./AppError");

function createError(statusCode, message, options = {}) {
    return new AppError(message, statusCode, options);
}

module.exports = createError;