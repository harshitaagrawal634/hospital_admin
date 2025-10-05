/**
 * src/utils/errorResponse.js
 * * Defines a custom Error class for consistent HTTP status codes and messages.
 */

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Optional: Capture the stack trace for better debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorResponse;
