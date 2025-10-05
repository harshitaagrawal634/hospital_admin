/**
 * src/controllers/auth.controller.js
 * * Contains the business logic for user authentication (register, login, password reset).
 */

const User = require('../models/User');
const transporter = require('../config/email.config'); // Nodemailer transporter
const crypto = require('crypto');
const { promisify } = require('util');

// Helper function to send JWT token
const sendTokenResponse = (user, statusCode, res) => {
    // Create JWT
    const token = user.getSignedJwtToken();

    // Options for cookie (not used in pure API, but good practice)
    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30 * 24 * 60 * 60 * 1000)), // 30 days
        httpOnly: true
    };

    // If in production, secure cookie
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Send response with token (in JSON body, typical for API)
    res.status(statusCode).json({
        success: true,
        token: token,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
};

// --- 1. Register User ---
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

            // Create user as a regular patient. Public registration cannot set roles.
            const user = await User.create({
                username,
                email,
                password,
                role: 'patient'
            });

        // Send token response to the registering user
        sendTokenResponse(user, 201, res);

        // Notify admin about new registration (non-blocking)
        (async () => {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'harshita.agrawal634@gmail.com'
                if (adminEmail) {
                    const sendMail = promisify(transporter.sendMail).bind(transporter)
                    const adminMail = {
                        from: process.env.EMAIL_USER,
                        to: adminEmail,
                        subject: 'New user registered',
                        text: `New user registered: ${user.email} (${user.username}) at ${new Date().toISOString()}`
                    }
                    await sendMail(adminMail)
                }
            } catch (e) {
                console.warn('Failed to notify admin about new registration', e && e.message ? e.message : e)
            }
        })()

    } catch (error) {
        console.error('Registration Error:', error.message);

        // Handle duplicate key error (e.g., duplicate email/username)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or Email already in use.' 
            });
        }
        // Handle Mongoose validation errors (e.g., password too short, invalid email)
        if (error.name === 'ValidationError' && error.errors) {
            const messages = Object.values(error.errors).map(e => e.message).join('; ')
            return res.status(400).json({ success: false, message: messages })
        }

        // Fallback
        console.error(error.stack)
        res.status(500).json({ success: false, message: 'Server Error during registration.' });
    }
};

// --- 2. Login User ---
// @route POST /api/v1/auth/login
// @access Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password presence
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
        }

        // Check for user (select: false allows us to retrieve the password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error during login.' });
    }
};

// --- 3. Forgot Password ---
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Respond with success even if email not found to prevent user enumeration
            return res.status(200).json({ success: true, message: 'If user exists, an email has been sent.' });
        }

        // Get reset token and save it to the user record
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false }); // Skip validation for these temp fields

    // Create reset URL
    // Prefer explicit FRONTEND_URL from env, otherwise try the request origin, otherwise fall back to localhost (Vite default)
    const frontendBase = process.env.FRONTEND_URL || req.headers?.origin || `http://localhost:5173`
    // Frontend route is /reset-password/:token (we use this in the React app)
    const resetURL = `${frontendBase.replace(/\/$/, '')}/reset-password/${resetToken}`
        
        // Email message structure
        const message = `You are receiving this because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetURL} \n\n This token is only valid for 10 minutes.`;

        // Attempt to send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Hospital Management API Password Reset Token',
            text: message,
            html: `
                <p>Hello ${user.username},</p>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <p><a href="${resetURL}">Reset Password</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        // Promisify transporter.sendMail for async/await
        const sendMailPromise = promisify(transporter.sendMail).bind(transporter);

        try {
            await sendMailPromise(mailOptions);
            // Notify admin that a password reset was requested (non-blocking)
            (async () => {
                try {
                    const adminEmail = process.env.ADMIN_EMAIL || 'harshita.agrawal634@gmail.com'
                    if (adminEmail) {
                        const adminMail = {
                            from: process.env.EMAIL_USER,
                            to: adminEmail,
                            subject: 'Password reset requested',
                            text: `Password reset requested for user: ${user.email} at ${new Date().toISOString()}`
                        }
                        await sendMailPromise(adminMail)
                    }
                } catch(e){ console.warn('Failed to notify admin about reset request', e && e.message ? e.message : e) }
            })()

            // Allow developers to receive the reset URL in the API response for testing.
            // Enable by setting DEV_RETURN_RESET_URL=true in .env or when NODE_ENV !== 'production'.
            const alwaysReturnResetURL = (process.env.DEV_RETURN_RESET_URL === 'true') || (process.env.NODE_ENV !== 'production');
            if (alwaysReturnResetURL) {
                return res.status(200).json({ success: true, message: 'Email sent (dev: reset URL included).', resetURL });
            }

            return res.status(200).json({ success: true, message: 'Email sent successfully.' });
        } catch (mailErr) {
            // In development, allow testing without SMTP by logging the reset URL and returning it in the response
            console.warn('Password reset email failed to send:', mailErr && mailErr.message ? mailErr.message : mailErr)
            if (process.env.NODE_ENV !== 'production' || process.env.DEV_RETURN_RESET_URL === 'true') {
                console.warn('Dev reset URL (copy to browser):', resetURL)
                return res.status(200).json({ success: true, message: 'Dev mode: reset URL logged to server console.', resetURL })
            }
            // If in production, clear token fields and return an error
            const userToClear = await User.findOne({ email: req.body.email });
            if (userToClear) {
                userToClear.resetPasswordToken = undefined;
                userToClear.resetPasswordExpire = undefined;
                await userToClear.save({ validateBeforeSave: false });
            }
            return res.status(500).json({ success: false, message: 'Email could not be sent. Server error.' });
        }

    } catch (error) {
        // If email sending fails, clear the token from the user record
        console.error('Forgot Password Email Error:', error.message);
        
        // Clear tokens from DB
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }

        res.status(500).json({ success: false, message: 'Email could not be sent. Server error.' });
    }
};

// --- 4. Reset Password ---
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token from URL parameter
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        // Find user by hashed token and check expiration
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // $gt means greater than (not expired)
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        // Set new password
        user.password = req.body.password;
        
        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        // The pre('save') hook in the User model will automatically hash the new password
        await user.save(); 

        sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error('Reset Password Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error during password reset.' });
    }
};
