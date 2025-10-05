/**
 * index.js
 * * Main application file. Sets up Express, MongoDB, Routes, and Middleware.
 */
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
// Load environment variables from .env file
dotenv.config();

// Configuration Imports
const connectDB = require('./src/config/db.config');
const jwt = require('jsonwebtoken')
const transporter = require('./src/config/email.config'); // Import Nodemailer transporter
const { errorHandler } = require('./src/middleware/error'); // NEW: Import Error Handler

// Route Imports 
const authRoutes = require('./src/routes/auth.routes');
const patientRoutes = require('./src/routes/patient.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const requestsRoutes = require('./src/routes/requests.routes');

// --- Initialization ---
const app = express();
// Enable CORS for requests from the frontend dev server and others
app.use(cors());
const PORT = process.env.PORT || 5000;

// Connect to Database (skip when SKIP_DB is set for local UI/testing)
if (process.env.SKIP_DB === 'true') {
    console.log('SKIP_DB is true — skipping database connection (demo mode)')
} else {
    connectDB();
}

// --- Middleware ---
// Body parser for JSON data (allows us to read req.body)
app.use(express.json());

// --- Public Demo Routes (for frontend testing without auth) ---
app.get('/api/v1/demo/patients', (req, res) => {
    const patients = [
        { _id: 'demo-1', firstName: 'John', lastName: 'Doe', fullName: 'John Doe' },
        { _id: 'demo-2', firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith' },
        { _id: 'demo-3', firstName: 'Alice', lastName: 'Wong', fullName: 'Alice Wong' }
    ];
    res.json({ count: patients.length, patients });
});

// --- Dev-only auth (when SKIP_DB=true) ---
// Provides a simple login that returns a signed JWT so frontend testing works without a DB.
if (process.env.SKIP_DB === 'true') {
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret'
    // Accept multiple demo accounts for different roles
    const demoAccounts = {
        [process.env.CREATE_ADMIN_EMAIL || 'admin@local']: { password: process.env.CREATE_ADMIN_PASSWORD || 'Admin123!', role: 'admin', username: 'admin' },
        [process.env.CREATE_DOCTOR_EMAIL || 'doctor@local']: { password: process.env.CREATE_DOCTOR_PASSWORD || 'Doctor123!', role: 'doctor', username: 'dr' },
        [process.env.CREATE_NURSE_EMAIL || 'nurse@local']: { password: process.env.CREATE_NURSE_PASSWORD || 'Nurse123!', role: 'nurse', username: 'nurse' },
        [process.env.CREATE_PATIENT_EMAIL || 'patient@local']: { password: process.env.CREATE_PATIENT_PASSWORD || 'Patient123!', role: 'patient', username: 'patient' }
    }

    app.post('/api/v1/auth/login', (req, res) => {
        const { email, password } = req.body || {}
        const account = demoAccounts[email]
        if (account && password === account.password) {
            const payload = { id: `dev-${account.role}`, role: account.role }
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
            return res.json({ success: true, token, data: { id: payload.id, username: account.username, email, role: account.role } })
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials (demo mode)' })
    })
    // Dev-only register endpoint: returns a fake token so frontend registration works in demo mode
    app.post('/api/v1/auth/register', (req, res) => {
        const { username, email, password, role } = req.body || {}
        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: 'Missing fields' })
        }
        const userRole = role || 'patient'

        // Save into demoAccounts so subsequent logins with this email will work
        demoAccounts[email] = { password, role: userRole, username }

        const payload = { id: `dev-${userRole}-${email}`, role: userRole }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
        return res.status(201).json({ success: true, token, data: { id: payload.id, username, email, role: userRole } })
    })
}

// --- Routes ---
// Health Check Route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        message: 'Hospital API is running smoothly!',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Authentication Routes (e.g., /api/v1/auth/register, /api/v1/auth/login)
app.use('/api/v1/auth', authRoutes);
// Patient Management Routes
app.use('/api/v1/patients', patientRoutes);
// Appointment Routes
app.use('/api/v1/appointments', appointmentRoutes);
// Inventory Routes
app.use('/api/v1/inventory', inventoryRoutes);
// Requests: patient appointment/inventory requests and doctor listing
app.use('/api/v1/requests', requestsRoutes);

// --- Error Handling Middleware (MUST BE LAST) ---
app.use(errorHandler); // NEW: Use the global error handler here

// --- Start Server ---
const server = app.listen(PORT, () => { // change app.listen to save the server instance
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);

    // Optional: Verify Nodemailer connection on startup
    transporter.verify(function (error, success) {
        if (error) {
            console.warn("Nodemailer transporter verification failed. Check EMAIL_USER/PASS in .env:", error.message);
        } else {
            console.log("Nodemailer is ready to send emails");
        }
    });
});

// Handle unhandled rejections (e.g., failure to connect to DB)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1)); // Use the saved server instance 'server'
});