/**
 * src/models/Appointment.js
 * * Mongoose model for scheduling and managing patient appointments.
 */
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    // Reference to the Patient (using the separate Patient model ID)
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    // Reference to the Doctor (using the User model ID, constrained by role 'doctor')
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Optional: Could add validation here to ensure the referenced user has role 'doctor'
    },
    // Appointment details
    appointmentDate: {
        type: Date,
        required: true,
        index: true // Index for fast time-based querying
    },
    appointmentTime: {
        type: String, // Store as a string (e.g., "10:00 AM") or use a full Date object
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    // Status of the appointment
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'canceled', 'rescheduled'],
        default: 'scheduled'
    },
    // Type of appointment (e.g., Checkup, Follow-up, Emergency)
    type: {
        type: String,
        enum: ['checkup', 'follow-up', 'emergency', 'consultation'],
        default: 'consultation'
    },
    // Room or clinic location
    location: {
        type: String,
        default: 'Main Clinic',
        trim: true
    }
}, { 
    timestamps: true 
});

// Compound index to prevent double-booking the same doctor at the exact same time
AppointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
