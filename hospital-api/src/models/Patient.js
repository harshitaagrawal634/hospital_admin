/**
 * src/models/Patient.js
 * * Mongoose model for storing patient demographic and medical information.
 */
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    // Link to the User model for login credentials if the patient is also a user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // This is not required, as a patient record can be created by staff
        // before the patient has registered for an online account.
        unique: true,
        sparse: true // Allows multiple null values for 'user'
    },
    firstName: {
        type: String,
        required: [true, 'Please provide a first name.'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please provide a last name.'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide a date of birth.']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Please specify a gender.']
    },
    contact: {
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            // This email can be different from the login email
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid contact email.'
            ]
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    // Basic medical information
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [{
        type: String
    }],
    // Embedded sub-document for medical history
    medicalHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        condition: {
            type: String,
            required: true
        },
        notes: {
            type: String
        },
        // Reference to the doctor who made the entry
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }
});

// Virtual for patient's full name
PatientSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for patient's age
PatientSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

module.exports = mongoose.model('Patient', PatientSchema);
