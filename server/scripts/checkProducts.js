const path = require('path');
const mongoose = require('mongoose');
const readline = require('readline');
const askMasked = require('./promptMasked');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Product = require('../models/Product');

// Interactive URI prompt helper (avoids storing secrets in history or .env, input is masked)
const promptUriIfRequested = async () => {
  const args = process.argv.slice(2);
  if (args.includes('--prompt-uri') || args.includes('--interactive')) {
    const answer = await askMasked('Enter MongoDB Atlas URI (input is masked): ');
    if (answer && answer.trim()) {
      process.env.MONGO_URI = answer.trim();
    }
  }
};

const checkProducts = async () => {
  try {
    await promptUriIfRequested();
    console.log('Connecting to database...');
    await connectDB();

    // Verify connection state
    if (mongoose.connection.readyState !== 1) {
      console.error('[Error] Failed to establish database connection.');
      process.exit(1);
    }

    const dbName = mongoose.connection.name || 'unknown';
    const host = mongoose.connection.host || 'unknown';

    console.log('\n========================================');
    console.log('      ReturnSense Database Status       ');
    console.log('========================================');
    console.log(`Target Database: ${dbName}`);
    console.log(`Database Host:   ${host}`);
    console.log(`Connection State: Connected (readyState: 1)`);

    // Counts
    const totalCount = await Product.countDocuments();
    const activeCount = await Product.countDocuments({ isActive: true });
    const inactiveCount = totalCount - activeCount;

    console.log('\n--- Product Counts ---');
    console.log(`Total Products:    ${totalCount}`);
    console.log(`Active Products:   ${activeCount}`);
    console.log(`Inactive Products: ${inactiveCount}`);

    if (totalCount === 0) {
      console.log('\n[Result] The product catalog in this database is currently EMPTY (0 products).');
      console.log('To dry-run or seed sample products, use:');
      console.log('  npm run products:dry-run');
      console.log('  npm run products:seed');
      console.log('========================================\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Category breakdown
    const categoryBreakdown = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n--- Breakdown by Category ---');
    categoryBreakdown.forEach(cat => {
      const name = cat._id || 'Uncategorized';
      console.log(`  - ${name.padEnd(16)}: ${String(cat.count).padStart(3)} items (Avg Price: $${cat.avgPrice.toFixed(2)})`);
    });

    // Price and stock stats
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\n--- Pricing & Inventory Stats ---');
      console.log(`Min Price:    $${stats[0].minPrice?.toFixed(2)}`);
      console.log(`Max Price:    $${stats[0].maxPrice?.toFixed(2)}`);
      console.log(`Avg Price:    $${stats[0].avgPrice?.toFixed(2)}`);
      console.log(`Total Stock:  ${stats[0].totalStock} units`);
      console.log(`Out of Stock: ${stats[0].outOfStock} items`);
    }

    // Sample product names
    const sampleProducts = await Product.find({}, 'name category price sku stock').limit(5);
    console.log('\n--- Sample Products in Catalog ---');
    sampleProducts.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.category}] ${p.name} ($${p.price}) - SKU: ${p.sku || 'N/A'}, Stock: ${p.stock}`);
    });

    console.log('\n========================================\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[Check Error]:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

checkProducts();
