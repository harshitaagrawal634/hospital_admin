/**
 * src/models/User.js
 * * Mongoose model for User authentication and roles.
 * Includes password hashing (bcrypt) and JWT generation logic.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default on queries
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'nurse', 'patient'],
        default: 'patient'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Fields for Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// --- Mongoose Middleware and Methods ---

// Encrypt password using bcrypt before saving the user
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token for password reset workflow
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token (plain text)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and set to resetPasswordToken field (stored in DB)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Return the plain token to be sent to the user via email
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
