/**
 * src/routes/auth.routes.js
 * * Defines the authentication routes for user management.
 */
const express = require('express');
const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controller');

const router = express.Router();

// --- Public Routes ---

// @route POST /api/v1/auth/register
router.post('/register', register);

// @route POST /api/v1/auth/login
router.post('/login', login);

// @route POST /api/v1/auth/forgotpassword
// Sends a password reset token to the user's email
router.post('/forgotpassword', forgotPassword);

// @route PUT /api/v1/auth/resetpassword/:resettoken
// Uses the token from the email to set a new password
router.put('/resetpassword/:resettoken', resetPassword);

// Add protected routes later if needed (e.g., /api/v1/auth/me)

module.exports = router;