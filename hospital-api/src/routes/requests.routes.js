const express = require('express')
const { protect } = require('../middleware/auth')
const {
  listDoctors,
  createAppointmentRequest,
  createInventoryRequest,
  listAppointmentRequests,
  listInventoryRequests
} = require('../controllers/requests.controller')

const router = express.Router()

router.get('/doctors', protect, listDoctors)
router.post('/appointments', protect, createAppointmentRequest)
router.get('/appointments', protect, listAppointmentRequests)
router.post('/inventory', protect, createInventoryRequest)
router.get('/inventory', protect, listInventoryRequests)

module.exports = router
