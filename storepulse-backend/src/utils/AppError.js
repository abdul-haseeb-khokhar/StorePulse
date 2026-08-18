/**
 * Custom Error subclass that carries an HTTP status code and an optional
 * app-specific error code. Thrown anywhere in the request lifecycle, it's
 * caught by app.js's global error handler and turned straight into the
 * matching HTTP response.
 */
class AppError extends Error {
    /**
     * @param {string} message Human-readable error message, sent back to the client as-is.
     * @param {number} statusCode HTTP status code to respond with.
     * @param {string} [code] Optional machine-readable error code for clients that need to branch on it.
     */
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

module.exports = AppError;
