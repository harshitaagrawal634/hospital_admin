/**
 * src/models/Inventory.js
 * * Mongoose model for tracking medical supplies and equipment stock.
 */
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['drug', 'equipment', 'consumable', 'vaccine', 'other'],
        default: 'consumable',
        required: true
    },
    currentStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    unit: {
        type: String, // e.g., 'tablets', 'mL', 'pieces', 'boxes'
        required: true,
        trim: true
    },
    minimumStockLevel: {
        type: Number,
        min: 0,
        default: 10 // Alert when stock drops below this level
    },
    supplier: {
        type: String,
        trim: true
    },
    expirationDate: {
        type: Date,
        required: function() {
            // Require expiration date only for drugs/vaccines
            return this.category === 'drug' || this.category === 'vaccine';
        },
        index: true // Index for quick expiry checks
    },
    lastRestockDate: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Virtual property to check if the item is low on stock
InventorySchema.virtual('isLowStock').get(function() {
    return this.currentStock <= this.minimumStockLevel;
});

module.exports = mongoose.model('Inventory', InventorySchema);
