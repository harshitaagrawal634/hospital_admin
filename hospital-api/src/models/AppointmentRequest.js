const mongoose = require('mongoose');

const AppointmentRequestSchema = new mongoose.Schema({
  patientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason: { type: String },
  status: { type: String, enum: ['requested','approved','rejected'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('AppointmentRequest', AppointmentRequestSchema);
