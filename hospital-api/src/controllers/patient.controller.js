const Patient = require('../models/Patient');
const User = require('../models/User');

// --- Helper: Get the requesting user's role ---
const getRequesterRole = (req) => req.user ? req.user.role : 'patient';

// --- 1. Create New Patient Record ---
exports.createPatient = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, contact } = req.body;
        
        // Ensure required fields are present
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return res.status(400).json({ message: 'Missing required patient fields.' });
        }

        // Create the new patient record
        const patient = await Patient.create({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contact
            // The 'user' field (link to User login) can be added separately if needed
        });

        res.status(201).json({ 
            message: 'Patient record created successfully.', 
            patient: patient 
        });

    } catch (error) {
        console.error('Create Patient Error:', error.message);
        res.status(500).json({ message: 'Server error creating patient record.' });
    }
};

// --- 2. Get All Patient Records ---
exports.getAllPatients = async (req, res) => {
    try {
        // Find all patients and populate the associated doctor's name if available
        const patients = await Patient.find({})
            .populate('medicalHistory.doctor', 'fullName email -_id'); // Select only name and email of doctor

        res.status(200).json({ 
            count: patients.length,
            patients: patients 
        });

    } catch (error) {
        console.error('Get All Patients Error:', error.message);
        res.status(500).json({ message: 'Server error retrieving patients.' });
    }
};

// --- 3. Get Single Patient Record by ID ---
exports.getPatientById = async (req, res) => {
    try {
        const patientId = req.params.id;

        const patient = await Patient.findById(patientId)
            .populate('medicalHistory.doctor', 'fullName email -_id');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // --- Authorization Check (Self-Access for linked Patient User) ---
        // If the logged-in user is a patient AND their user ID doesn't match the linked patient ID, deny access.
        if (getRequesterRole(req) === 'patient' && req.user._id.toString() !== patient.user?.toString()) {
            return res.status(403).json({ message: 'Access denied. You can only view your own record.' });
        }
        
        res.status(200).json({ patient });

    } catch (error) {
        console.error('Get Patient Error:', error.message);
        res.status(500).json({ message: 'Server error retrieving patient record.' });
    }
};

// --- 4. Update Patient Record ---
exports.updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const updates = req.body;

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // --- Authorization Check (Only Admin/Doctor can update) ---
        // Authorization is mainly handled by the route middleware, but this is an extra layer
        if (!['admin', 'doctor'].includes(getRequesterRole(req))) {
            return res.status(403).json({ message: 'Forbidden. Only doctors and admins can update patient records.' });
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            patient[key] = updates[key];
        });

        await patient.save();

        res.status(200).json({ 
            message: 'Patient record updated successfully.', 
            patient: patient 
        });

    } catch (error) {
        console.error('Update Patient Error:', error.message);
        res.status(500).json({ message: 'Server error updating patient record.' });
    }
};

// --- 5. Delete Patient Record ---
exports.deletePatient = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Note: Route middleware ensures only 'admin' can reach this point
        const result = await Patient.findByIdAndDelete(patientId);

        if (!result) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.status(200).json({ message: 'Patient record deleted successfully.' });

    } catch (error) {
        console.error('Delete Patient Error:', error.message);
        res.status(500).json({ message: 'Server error deleting patient record.' });
    }
};
