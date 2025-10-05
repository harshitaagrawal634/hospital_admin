const User = require('../models/User');
const AppointmentRequest = require('../models/AppointmentRequest');
const InventoryRequest = require('../models/InventoryRequest');

exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('username email')
    res.json({ count: doctors.length, doctors })
  } catch (err) { res.status(500).json({ message: 'Server error' }) }
}

exports.createAppointmentRequest = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body
    const patientUser = req.user._id
    if (!doctorId || !appointmentDate || !appointmentTime) return res.status(400).json({ message: 'Missing fields' })
    const ar = await AppointmentRequest.create({ patientUser, doctor: doctorId, appointmentDate, appointmentTime, reason })
    res.status(201).json({ success:true, data: ar })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
}

exports.createInventoryRequest = async (req, res) => {
  try {
    const { itemId, quantity } = req.body
    const patientUser = req.user._id
    if (!itemId || !quantity) return res.status(400).json({ message: 'Missing fields' })
    const ir = await InventoryRequest.create({ patientUser, item: itemId, quantity })
    res.status(201).json({ success:true, data: ir })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
}

exports.listAppointmentRequests = async (req, res) => {
  try {
    const filter = {}
    if (req.user.role === 'patient') filter.patientUser = req.user._id
    const list = await AppointmentRequest.find(filter).populate('doctor', 'username email').populate('patientUser', 'username email')
    res.json({ count: list.length, requests: list })
  } catch (err) { res.status(500).json({ message: 'Server error' }) }
}

exports.listInventoryRequests = async (req, res) => {
  try {
    const filter = {}
    if (req.user.role === 'patient') filter.patientUser = req.user._id
    const list = await InventoryRequest.find(filter).populate('item', 'itemName currentStock unit').populate('patientUser', 'username email')
    res.json({ count: list.length, requests: list })
  } catch (err) { res.status(500).json({ message: 'Server error' }) }
}
