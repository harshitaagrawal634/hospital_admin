/**
 * src/controllers/appointment.controller.js
 * * Contains the business logic for managing appointments (CRUD operations).
 */

const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

// --- Helper function to check if a doctor is busy ---
const isDoctorAvailable = async (doctorId, date, time) => {
    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: date,
        appointmentTime: time,
        status: 'scheduled' // Only check for existing scheduled appointments
    });
    return !existingAppointment;
};

// --- 1. Book a New Appointment ---
exports.bookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, appointmentTime, reason, type, location } = req.body;

        // 1. Basic Validation
        if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({ message: 'Missing required fields for booking.' });
        }

        // 2. Verify Patient and Doctor existence and roles
        const patient = await Patient.findById(patientId);
        const doctor = await User.findById(doctorId);

        if (!patient) return res.status(404).json({ message: 'Patient not found.' });
        // NOTE: In a real app, you would verify the doctor's role: if (doctor.role !== 'doctor') 
        if (!doctor) return res.status(404).json({ message: 'Doctor not found.' }); 

        // 3. Check for Doctor Availability
        const dateObj = new Date(appointmentDate);
        const available = await isDoctorAvailable(doctorId, dateObj, appointmentTime);

        if (!available) {
            return res.status(409).json({ message: `Doctor is already scheduled at ${appointmentTime} on ${dateObj.toDateString()}.` });
        }

        // 4. Create Appointment
        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            appointmentDate: dateObj,
            appointmentTime,
            reason,
            type: type || 'consultation',
            location: location || 'Main Clinic'
        });

        res.status(201).json({ 
            message: 'Appointment successfully booked.', 
            appointment: appointment 
        });

    } catch (error) {
        console.error('Book Appointment Error:', error.message);
        // Handle unique constraint error from Mongoose index
        if (error.code === 11000) {
             return res.status(409).json({ message: 'A duplicate appointment already exists for this slot.' });
        }
        res.status(500).json({ message: 'Server error booking appointment.' });
    }
};

// --- 2. Get All Appointments (Filterable) ---
exports.getAllAppointments = async (req, res) => {
    try {
        const { status, doctorId } = req.query;
        let filter = {};

        // Apply filters if provided
        if (status) filter.status = status;
        if (doctorId) filter.doctor = doctorId;

        const appointments = await Appointment.find(filter)
            .populate('patient', 'firstName lastName dateOfBirth')
            .populate('doctor', 'fullName email role -_id')
            .sort('appointmentDate');

        res.status(200).json({
            count: appointments.length,
            appointments: appointments
        });
    } catch (error) {
        console.error('Get All Appointments Error:', error.message);
        res.status(500).json({ message: 'Server error retrieving appointments.' });
    }
};

// --- 3. Update Appointment Status or Details ---
exports.updateAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const updates = req.body;

        const appointment = await Appointment.findByIdAndUpdate(appointmentId, updates, {
            new: true, // return the new document after update
            runValidators: true // run model schema validation
        })
        .populate('patient', 'firstName lastName')
        .populate('doctor', 'fullName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        res.status(200).json({ 
            message: 'Appointment updated successfully.', 
            appointment: appointment 
        });

    } catch (error) {
        console.error('Update Appointment Error:', error.message);
        res.status(500).json({ message: 'Server error updating appointment.' });
    }
};

// --- 4. Cancel Appointment ---
exports.cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, 
            { status: 'canceled' }, 
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        
        res.status(200).json({ 
            message: 'Appointment successfully canceled.',
            appointment: appointment
        });

    } catch (error) {
        console.error('Cancel Appointment Error:', error.message);
        res.status(500).json({ message: 'Server error canceling appointment.' });
    }
};
