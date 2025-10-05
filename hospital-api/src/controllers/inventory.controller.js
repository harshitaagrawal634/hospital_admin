/**
 * src/controllers/inventory.controller.js
 * * Contains the business logic for managing inventory (stock management, CRUD).
 */

const Inventory = require('../models/Inventory');

// --- 1. Add New Item to Inventory ---
exports.createItem = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json({ 
            message: 'New inventory item created.', 
            data: item 
        });
    } catch (error) {
        console.error('Create Inventory Item Error:', error.message);
        // Handle duplicate item name error
        if (error.code === 11000) {
            return res.status(409).json({ message: `Item name '${req.body.itemName}' already exists.` });
        }
        res.status(400).json({ message: 'Error creating item.', error: error.message });
    }
};

// --- 2. Get All Inventory Items (with filters for low stock/category) ---
exports.getAllItems = async (req, res) => {
    try {
        const { category, lowStock } = req.query;
        let filter = {};

        if (category) filter.category = category;
        
        let items = await Inventory.find(filter).sort('itemName');

        // Filter for low stock in memory, as Mongoose virtuals aren't directly queryable
        if (lowStock === 'true') {
            items = items.filter(item => item.isLowStock);
        }

        res.status(200).json({
            count: items.length,
            items: items
        });
    } catch (error) {
        console.error('Get All Inventory Items Error:', error.message);
        res.status(500).json({ message: 'Server error retrieving inventory.' });
    }
};

// --- 3. Update Item Details ---
exports.updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Inventory.findByIdAndUpdate(itemId, req.body, {
            new: true,
            runValidators: true
        });

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }

        res.status(200).json({ 
            message: 'Inventory item updated successfully.', 
            data: item 
        });

    } catch (error) {
        console.error('Update Inventory Item Error:', error.message);
        res.status(500).json({ message: 'Server error updating item.' });
    }
};

// --- 4. Restock/Usage Update (Atomic Update) ---
exports.updateStock = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { quantityChange } = req.body; // positive for restock, negative for usage

        if (typeof quantityChange !== 'number' || quantityChange === 0) {
            return res.status(400).json({ message: 'Invalid quantity change specified.' });
        }

        const item = await Inventory.findByIdAndUpdate(itemId, { 
            // $inc is crucial for atomic updates to prevent race conditions
            $inc: { currentStock: quantityChange },
            // Update last restock date only if it was a positive stock addition
            lastRestockDate: quantityChange > 0 ? new Date() : undefined
        }, {
            new: true,
            runValidators: true
        });

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }
        
        // Safety check for stock going below zero (although schema enforces min: 0)
        if (item.currentStock < 0) {
            // Rollback the failed transaction
            item.currentStock -= quantityChange; 
            await item.save();
            return res.status(400).json({ 
                message: 'Stock update failed: Cannot use more items than currently in stock.',
                data: item
            });
        }

        res.status(200).json({ 
            message: `Stock updated by ${quantityChange}. Current stock: ${item.currentStock}`, 
            data: item 
        });

    } catch (error) {
        console.error('Update Stock Error:', error.message);
        res.status(500).json({ message: 'Server error updating stock.' });
    }
};

// --- 5. Delete Item ---
exports.deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Inventory.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }

        res.status(200).json({ message: 'Inventory item deleted successfully.' });

    } catch (error) {
        console.error('Delete Inventory Item Error:', error.message);
        res.status(500).json({ message: 'Server error deleting item.' });
    }
};
