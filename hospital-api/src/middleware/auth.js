/**
 * src/middleware/auth.js
 * * Middleware functions for JWT validation and role-based access control.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

// Load environment variables
require('dotenv').config();
const { JWT_SECRET } = process.env;

/**
 * 1. Protect Middleware: Checks for a valid JWT and attaches user to the request.
 */
const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (format: 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, JWT_SECRET);

            // If running in demo SKIP_DB mode, do not query the DB — attach a minimal user object
            if (process.env.SKIP_DB === 'true') {
                req.user = { _id: decoded.id, role: decoded.role || 'admin' }
                return next()
            }

            // Find the user by ID from the decoded token payload
            // We use .select('-password') to ensure we don't return the hashed password
            // Note: We need to INCLUDE the password field when authenticating a user (in auth.controller.js)
            req.user = await User.findById(decoded.id).select('-password');

            // If user is found, proceed to the next middleware/controller
            next();

        } catch (error) {
            console.error(error);
            // Token is invalid or expired
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // No token provided in the header
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * 2. Authorize Middleware: Checks if the user's role is included in the allowed roles array.
 * @param {Array<string>} roles - An array of allowed roles (e.g., ['admin', 'doctor'])
 */
const authorize = (roles = []) => {
    // If roles is a single string, convert it to an array
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user is attached by the 'protect' middleware
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
            return res.status(403).json({
                message: `User role (${req.user ? req.user.role : 'none'}) is not authorized to access this route.`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
