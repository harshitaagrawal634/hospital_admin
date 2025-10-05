/**
 * src/routes/appointment.routes.js
 * * Defines protected API routes for Appointment Scheduling.
 */

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
    bookAppointment, 
    getAllAppointments, 
    updateAppointment, 
    cancelAppointment
} = require('../controllers/appointment.controller');

const router = express.Router();

// POST /api/v1/appointments
// Only Admins, Doctors, and Nurses can book/create an appointment.
router.post('/', protect, authorize(['admin', 'doctor', 'nurse']), bookAppointment);

// GET /api/v1/appointments
// Admins, Doctors, and Nurses can view all appointments (doctors/nurses can filter by their ID).
router.get('/', protect, authorize(['admin', 'doctor', 'nurse']), getAllAppointments);

// PUT /api/v1/appointments/:id
// Only Admins, Doctors, and Nurses can update appointment details (like status).
router.put('/:id', protect, authorize(['admin', 'doctor', 'nurse']), updateAppointment);

// DELETE /api/v1/appointments/:id (Changes status to 'canceled')
// Admins, Doctors, and Nurses can cancel appointments.
router.delete('/:id', protect, authorize(['admin', 'doctor', 'nurse']), cancelAppointment);


module.exports = router;
