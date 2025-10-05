/**
 * src/routes/inventory.routes.js
 * * Defines protected API routes for Inventory Management.
 */

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
    createItem, 
    getAllItems, 
    updateItem, 
    updateStock, 
    deleteItem
} = require('../controllers/inventory.controller');

const router = express.Router();

// All inventory operations require authentication and administrative/nurse/doctor roles
// Base route /api/v1/inventory
router.route('/')
    .post(protect, authorize(['admin', 'nurse']), createItem)    // Create new item
    .get(protect, authorize(['admin', 'nurse', 'doctor']), getAllItems); // View all items

// Route for stock updates and item detail management /api/v1/inventory/:id
router.route('/:id')
    .put(protect, authorize(['admin', 'nurse']), updateItem) // Update general details
    .delete(protect, authorize(['admin', 'nurse']), deleteItem); // Delete item

// Specific route for stock transactions (Restock/Usage)
router.patch('/:id/stock', protect, authorize(['admin', 'nurse', 'doctor']), updateStock);

module.exports = router;
