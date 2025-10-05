const mongoose = require('mongoose');

const InventoryRequestSchema = new mongoose.Schema({
  patientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['requested','fulfilled','rejected'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryRequest', InventoryRequestSchema);
