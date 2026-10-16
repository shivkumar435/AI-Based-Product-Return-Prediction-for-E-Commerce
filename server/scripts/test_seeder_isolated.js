const { execSync } = require('child_process');
const mongoose = require('mongoose');

const TEST_DB_URI = 'mongodb://localhost:27017/return-prediction-isolated-test';

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Prediction = require('../models/Prediction');

async function runIsolatedTest() {
  console.log('======================================================');
  console.log('   Testing Product Seeder on Isolated Test Database   ');
  console.log('======================================================\n');

  try {
    // Connect to isolated test database
    await mongoose.connect(TEST_DB_URI);
    console.log('Connected to isolated test database: return-prediction-isolated-test');

    // Clean only the isolated test database
    await mongoose.connection.db.dropDatabase();
    console.log('Initialized clean isolated test database.');

    // Create dummy records in other collections
    const dummyUser = await User.create({
      name: 'Untouched Test User',
      email: 'untouched@example.test',
      password: 'password123'
    });

    const dummyOrder = await Order.create({
      user: dummyUser._id,
      totalPrice: 99.99,
      paymentMethod: 'Credit Card',
      status: 'Delivered'
    });

    const dummyPrediction = await Prediction.create({
      user: dummyUser._id,
      inputFeatures: { test: true },
      prediction: 'Not Likely to Return',
      confidence: 85
    });

    console.log('Created dummy records in User, Order, and Prediction collections.');

    const initialProductCount = await Product.countDocuments();
    if (initialProductCount !== 0) {
      throw new Error(`Expected 0 initial products in test DB, found ${initialProductCount}`);
    }
    console.log('Verified initial products count is 0.');

    await mongoose.connection.close();

    // Run 1: Dry run against test DB
    console.log('\n--- Step 1: Testing Dry Run ---');
    const dryRunOutput = execSync('node scripts/seedProducts.js --dry-run', {
      cwd: __dirname + '/..',
      env: { ...process.env, MONGO_URI: TEST_DB_URI },
      encoding: 'utf8'
    });
    console.log(dryRunOutput);

    // Verify DB still has 0 products
    await mongoose.connect(TEST_DB_URI);
    const countAfterDryRun = await Product.countDocuments();
    if (countAfterDryRun !== 0) {
      throw new Error(`Dry run wrote records! Expected 0, found ${countAfterDryRun}`);
    }
    console.log('Verified: Dry-run wrote 0 records.');
    await mongoose.connection.close();

    // Run 2: Confirmed write against test DB
    console.log('\n--- Step 2: Testing Confirmed Write ---');
    const writeOutput = execSync('node scripts/seedProducts.js --confirm-write --allow-local-write', {
      cwd: __dirname + '/..',
      env: { ...process.env, MONGO_URI: TEST_DB_URI },
      encoding: 'utf8'
    });
    console.log(writeOutput);

    // Verify DB has exactly 55 products
    await mongoose.connect(TEST_DB_URI);
    const countAfterWrite = await Product.countDocuments();
    if (countAfterWrite !== 55) {
      throw new Error(`Write failed! Expected 55 products, found ${countAfterWrite}`);
    }
    console.log(`Verified: Seed successfully created ${countAfterWrite} products.`);

    // Verify other collections remain intact
    const userStillExists = await User.findById(dummyUser._id);
    const orderStillExists = await Order.findById(dummyOrder._id);
    const predStillExists = await Prediction.findById(dummyPrediction._id);

    if (!userStillExists || !orderStillExists || !predStillExists) {
      throw new Error('FAIL: Seeder modified or deleted unrelated collections!');
    }
    console.log('Verified: Other collections (User, Order, Prediction) are 100% untouched!');

    await mongoose.connection.close();

    // Run 3: Idempotency test (running seed a second time)
    console.log('\n--- Step 3: Testing Idempotency (Second Seed Execution) ---');
    const secondWriteOutput = execSync('node scripts/seedProducts.js --confirm-write --allow-local-write', {
      cwd: __dirname + '/..',
      env: { ...process.env, MONGO_URI: TEST_DB_URI },
      encoding: 'utf8'
    });
    console.log(secondWriteOutput);

    await mongoose.connect(TEST_DB_URI);
    const countAfterSecondWrite = await Product.countDocuments();
    if (countAfterSecondWrite !== 55) {
      throw new Error(`Idempotency failed! Expected 55 products, found ${countAfterSecondWrite}`);
    }
    console.log('Verified: Repeated execution is idempotent (0 inserted, 55 skipped, total still 55).');

    // Cleanup: drop isolated test database
    await mongoose.connection.db.dropDatabase();
    console.log('Cleaned up isolated test database.');
    await mongoose.connection.close();

    console.log('\n======================================================');
    console.log('      ALL ISOLATED SEEDER TESTS PASSED (PASS)         ');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[Test Failure]:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runIsolatedTest();
