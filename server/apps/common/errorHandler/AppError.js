// apps/common/errorHandler/AppError.js
class AppError extends Error {
    constructor(message, statusCode, options = {}) {
        super(message);
        this.name = "AppError";

        this.statusCode = statusCode || 500;

        // What the client should see (optional). If omitted, middleware uses safe defaults.
        this.publicResponse = options.publicResponse; // e.g. { message: "..."} or { error: "..."}

        // Mark if it's safe to expose message directly (generally false in production)
        this.exposeMessage = options.exposeMessage === true;

        // Internal-only diagnostics (never sent to client)
        this.details = options.details;
        this.code = options.code || "ERR_GENERIC";
    }
}

module.exports = AppError;