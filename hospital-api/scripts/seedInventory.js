require('dotenv').config();
const connectDB = require('../src/config/db.config');
const Inventory = require('../src/models/Inventory');

const items = [
  { itemName: 'Paracetamol 500mg', category: 'drug', currentStock: 200, unit: 'tablets', minimumStockLevel: 20 },
  { itemName: 'Amoxicillin 250mg', category: 'drug', currentStock: 120, unit: 'capsules', minimumStockLevel: 10 },
  { itemName: 'Saline IV 500ml', category: 'consumable', currentStock: 50, unit: 'bottles', minimumStockLevel: 5 },
  { itemName: 'Syringe 5ml', category: 'consumable', currentStock: 500, unit: 'pieces', minimumStockLevel: 50 },
  { itemName: 'Paracetamol Syrup', category: 'drug', currentStock: 80, unit: 'bottles', minimumStockLevel: 10 },
  { itemName: 'Gauze Pack', category: 'consumable', currentStock: 300, unit: 'packs', minimumStockLevel: 30 }
]

const run = async () => {
  try {
    await connectDB();
    for (const it of items) {
      try {
        const existing = await Inventory.findOne({ itemName: it.itemName });
        if (existing) { console.log(`Item ${it.itemName} exists, skipping`); continue }
        await Inventory.create(it)
        console.log(`Created item ${it.itemName}`)
      } catch(e){ console.error(`Failed to create ${it.itemName}`, e && e.message ? e.message : e) }
    }
    process.exit(0)
  } catch (err) { console.error(err); process.exit(1) }
}

run()
