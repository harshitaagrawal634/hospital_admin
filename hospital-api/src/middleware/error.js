const ErrorResponse = require('../utils/errorResponse'); // Custom error class

// --- Custom Error Class (Self-contained) ---
// This class extends the native JavaScript Error object to include a statusCode
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}


const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500; // Default to 500 Internal Server Error

    // Log the error for development/debugging purposes
    console.error(`Error encountered:`, err);

    // 1. Mongoose Bad ObjectId Error (CastError for bad ID format)
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}.`;
        error = new CustomError(message, 404);
    }

    // 2. Mongoose Duplicate Key Error (E11000)
    if (err.code === 11000) {
        // Extract the duplicated field name from the error message
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        const message = `Duplicate field value: ${value}. Please use another value.`;
        error = new CustomError(message, 400);
    }

    // 3. Mongoose Validation Error
    if (err.name === 'ValidationError') {
        // Extract all validation messages and join them
        const messages = Object.values(err.errors).map(val => val.message);
        const message = `Validation failed: ${messages.join(', ')}`;
        error = new CustomError(message, 400);
    }
    
    // 4. JWT Error (Verification failure)
    if (err.name === 'JsonWebTokenError') {
        const message = 'Not authorized, token failed.';
        error = new CustomError(message, 401);
    }

    // Send the response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = { errorHandler, CustomError };
