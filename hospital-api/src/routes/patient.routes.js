/**
 * src/routes/patient.routes.js
 * * Defines protected API routes for Patient Management.
 */

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
    createPatient, 
    getAllPatients, 
    getPatientById, 
    updatePatient, 
    deletePatient 
} = require('../controllers/patient.controller');

const router = express.Router();

// All routes below require a valid JWT (checked by 'protect')

// POST /api/v1/patients/
// Only Admins and Doctors can create a new patient record
router.post('/', protect, authorize(['admin', 'doctor']), createPatient);

// GET /api/v1/patients/
// Only Admins, Doctors, and Nurses can view the list of ALL patients
router.get('/', protect, authorize(['admin', 'doctor', 'nurse']), getAllPatients);

// GET /api/v1/patients/:id
// Admins, Doctors, Nurses, AND the linked Patient (self-access) can view a single record.
// The self-access check for the patient role is handled inside getPatientById controller.
router.get('/:id', protect, authorize(['admin', 'doctor', 'nurse', 'patient']), getPatientById);

// PUT /api/v1/patients/:id
// Only Admins and Doctors can update patient records
router.put('/:id', protect, authorize(['admin', 'doctor']), updatePatient);

// DELETE /api/v1/patients/:id
// Only Admins are allowed to delete records for maximum security
router.delete('/:id', protect, authorize(['admin']), deletePatient);


module.exports = router;
