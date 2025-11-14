#!/usr/bin/env node

// Migration script: fill missing descriptions on Category documents
// Usage: node scripts/migrate-fill-category-descriptions.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const Category = require(path.join(__dirname, '..', 'src', 'models', 'category'));

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const filter = { $or: [ { description: { $exists: false } }, { description: null }, { description: '' } ] };

    const categories = await Category.find(filter).lean();
    if (!categories || categories.length === 0) {
      console.log('No categories require migration.');
      process.exit(0);
    }

    console.log(`Found ${categories.length} categories to update.`);

    let updated = 0;
    for (const cat of categories) {
      const desc = cat.description || '';
      // You can customize the default placeholder here if you want
      const newDesc = desc; // keep empty string
      await Category.findByIdAndUpdate(cat._id, { description: newDesc });
      updated += 1;
      console.log(`Updated ${cat._id} (${cat.name})`);
    }

    console.log(`Migration complete. Updated ${updated} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

run();
