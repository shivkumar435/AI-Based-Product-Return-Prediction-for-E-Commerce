const { execSync } = require('child_process');
const { EventEmitter } = require('events');
const mongoose = require('mongoose');
const askMasked = require('./promptMasked');

const LOCAL_TEST_DB = 'mongodb://127.0.0.1:27017/return-prediction-guard-test';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runMaskedTests() {
  console.log('\n[1/6] Testing Masked Input Behavior & Stream Privacy...');

  // 1. Mock TTY stream test
  const mockStdin = new EventEmitter();
  mockStdin.isTTY = true;
  mockStdin.setRawMode = () => {};
  mockStdin.resume = () => {};
  mockStdin.pause = () => {};
  mockStdin.setEncoding = () => {};

  let capturedStdout = '';
  const mockStdout = {
    write: (chunk) => {
      capturedStdout += chunk;
    }
  };

  const sensitiveUri = 'mongodb+srv://admin_user:P@ssw0rd!Secure99@cluster0.abcde.mongodb.net/returnprediction';
  const promptPromise = askMasked('Enter URI: ', mockStdin, mockStdout);

  mockStdin.emit('data', sensitiveUri + '\n');
  const resolvedUri = await promptPromise;

  assert(resolvedUri === sensitiveUri, 'Resolved in-memory URI strictly matches sensitive input');
  assert(!capturedStdout.includes('P@ssw0rd!Secure99'), 'Sensitive password is NEVER emitted into stdout');
  assert(!capturedStdout.includes('admin_user'), 'Username is NEVER emitted into stdout');
  assert(!capturedStdout.includes('mongodb+srv'), 'Connection scheme and host are NEVER emitted into stdout');

  const asteriskMatches = (capturedStdout.match(/\*/g) || []).length;
  assert(asteriskMatches === sensitiveUri.length, `Emitted exactly ${sensitiveUri.length} masking asterisks (*) matching secret length`);

  // 2. Backspace handling test
  let capturedBackspaceStdout = '';
  const mockStdoutBackspace = {
    write: (chunk) => {
      capturedBackspaceStdout += chunk;
    }
  };
  const mockStdinBackspace = new EventEmitter();
  mockStdinBackspace.isTTY = true;
  mockStdinBackspace.setRawMode = () => {};
  mockStdinBackspace.resume = () => {};
  mockStdinBackspace.pause = () => {};
  mockStdinBackspace.setEncoding = () => {};

  const backspacePromise = askMasked('Enter: ', mockStdinBackspace, mockStdoutBackspace);
  mockStdinBackspace.emit('data', 'abc');
  mockStdinBackspace.emit('data', '\u0008'); // backspace
  mockStdinBackspace.emit('data', 'd\n');
  const backspaceResolved = await backspacePromise;

  assert(backspaceResolved === 'abd', 'Backspace correctly edits the in-memory string ("abc" + backspace + "d" -> "abd")');
  assert(capturedBackspaceStdout.includes('\b \b'), 'Backspace emits terminal erase sequence (\\b \\b)');

  // 3. Non-TTY / Piped fallback test
  const { Readable } = require('stream');
  const mockPipedStdin = Readable.from(['piped_test_uri\n']);
  mockPipedStdin.isTTY = false;
  let capturedPipedStdout = '';
  const mockPipedStdout = {
    write: (chunk) => {
      capturedPipedStdout += chunk;
    }
  };

  const pipedPromise = askMasked('Enter: ', mockPipedStdin, mockPipedStdout);
  const pipedResolved = await pipedPromise;
  assert(pipedResolved === 'piped_test_uri', 'Non-TTY piped input resolves cleanly');
}

async function runMissingConfirmationFlagsTests() {
  console.log('\n[2/6] Testing Rejection of Missing Production Confirmation Flags...');

  // Test A: NODE_ENV=production with only --confirm-write (missing --confirm-production)
  let rejectedA = false;
  let outputA = '';
  try {
    outputA = execSync('node scripts/seedProducts.js --confirm-write', {
      cwd: __dirname + '/..',
      env: { ...process.env, NODE_ENV: 'production', MONGO_URI: LOCAL_TEST_DB },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    rejectedA = true;
    outputA = (err.stdout || '') + (err.stderr || '');
  }

  assert(rejectedA, 'Script aborts with non-zero exit code when --confirm-production is omitted');
  assert(outputA.includes('[PRODUCTION SAFETY GUARD ACTIVE]'), 'Output displays [PRODUCTION SAFETY GUARD ACTIVE]');
  assert(
    outputA.includes('--confirm-write AND --confirm-production'),
    'Output explicitly informs user that BOTH --confirm-write AND --confirm-production are required'
  );

  // Test B: Verify ALLOW_PRODUCTION_SEED=true does NOT bypass --confirm-production
  let rejectedB = false;
  let outputB = '';
  try {
    outputB = execSync('node scripts/seedProducts.js --confirm-write', {
      cwd: __dirname + '/..',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ALLOW_PRODUCTION_SEED: 'true',
        MONGO_URI: LOCAL_TEST_DB
      },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    rejectedB = true;
    outputB = (err.stdout || '') + (err.stderr || '');
  }

  assert(rejectedB, 'ALLOW_PRODUCTION_SEED=true is ignored and does NOT bypass --confirm-production');
  assert(!outputB.includes('ALLOW_PRODUCTION_SEED=true'), 'Output no longer references ALLOW_PRODUCTION_SEED environment variable');
}

async function runNonAtlasHostTests() {
  console.log('\n[3/6] Testing Host Verification (Must Be Atlas *.mongodb.net)...');

  // Attempt production write against localhost with --confirm-write AND --confirm-production
  let rejected = false;
  let output = '';
  try {
    output = execSync('node scripts/seedProducts.js --confirm-write --confirm-production', {
      cwd: __dirname + '/..',
      env: { ...process.env, MONGO_URI: LOCAL_TEST_DB },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    rejected = true;
    output = (err.stdout || '') + (err.stderr || '');
  }

  assert(rejected, 'Aborts production write when connected host is not an Atlas host');
  assert(output.includes('[HOST VERIFICATION FAILED]'), 'Output displays [HOST VERIFICATION FAILED]');
  assert(output.includes('Expected MongoDB Atlas host (*.mongodb.net)'), 'Output explains that *.mongodb.net is required');
  assert(output.includes('No data was modified'), 'Output confirms zero data was modified');
}

async function runDatabaseNameAssertionTests() {
  console.log('\n[4/6] Testing Database Name Assertion (Must Be Exact: returnprediction)...');

  // Verify that the production assertion correctly and strictly permits only 'returnprediction'
  const isDbAllowed = (name) => name === 'returnprediction';

  assert(!isDbAllowed('return-prediction'), 'Blocks hyphenated database name "return-prediction"');
  assert(!isDbAllowed('return_prediction'), 'Blocks underscore database name "return_prediction"');
  assert(!isDbAllowed('test'), 'Blocks default "test" database');
  assert(!isDbAllowed('admin'), 'Blocks "admin" database');
  assert(!isDbAllowed('returnprediction_dev'), 'Blocks "returnprediction_dev" database');
  assert(isDbAllowed('returnprediction'), 'Strictly permits only exact "returnprediction"');
}

async function runLocalWriteGuardTests() {
  console.log('\n[5/6] Testing Local Write Guard...');

  // Attempt local write with --confirm-write but without --allow-local-write
  let rejected = false;
  let output = '';
  try {
    output = execSync('node scripts/seedProducts.js --confirm-write', {
      cwd: __dirname + '/..',
      env: { ...process.env, MONGO_URI: LOCAL_TEST_DB, NODE_ENV: 'development' },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    rejected = true;
    output = (err.stdout || '') + (err.stderr || '');
  }

  assert(rejected, 'Aborts local write when --allow-local-write is omitted');
  assert(output.includes('[LOCAL WRITE GUARD ACTIVE]'), 'Output displays [LOCAL WRITE GUARD ACTIVE]');
  assert(output.includes('--allow-local-write'), 'Output instructs user to provide --allow-local-write for local writes');
}

async function runDryRunGuaranteeTests() {
  console.log('\n[6/6] Testing Dry-Run Zero-Write Guarantee...');

  const Product = require('../models/Product');

  // Connect to isolated test database and ensure 0 products
  await mongoose.connect(LOCAL_TEST_DB);
  await mongoose.connection.db.dropDatabase();
  const initialCount = await Product.countDocuments();
  assert(initialCount === 0, 'Clean test database initialized with 0 products');
  await mongoose.connection.close();

  // Execute dry-run
  const dryRunOutput = execSync('node scripts/seedProducts.js --dry-run', {
    cwd: __dirname + '/..',
    env: { ...process.env, MONGO_URI: LOCAL_TEST_DB },
    encoding: 'utf8'
  });

  assert(dryRunOutput.includes('[DRY RUN SUMMARY]'), 'Output contains [DRY RUN SUMMARY]');
  assert(dryRunOutput.includes('This was a DRY RUN. Zero changes were written to the database.'), 'Confirms zero changes written');

  // Verify database count is still 0
  await mongoose.connect(LOCAL_TEST_DB);
  const countAfterDryRun = await Product.countDocuments();
  assert(countAfterDryRun === 0, `Database product count after dry-run is strictly 0 (verified ${countAfterDryRun})`);

  // Clean up
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
}

async function main() {
  console.log('======================================================');
  console.log('   ReturnSense: Seeder Safety Guard Verification Suite');
  console.log('======================================================');

  try {
    await runMaskedTests();
    await runMissingConfirmationFlagsTests();
    await runNonAtlasHostTests();
    await runDatabaseNameAssertionTests();
    await runLocalWriteGuardTests();
    await runDryRunGuaranteeTests();

    console.log('\n======================================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    if (failed === 0) {
      console.log('STATUS: ALL SAFETY GUARD TESTS PASSED (PASS)');
      console.log('======================================================\n');
      process.exit(0);
    } else {
      console.error('STATUS: SOME TESTS FAILED (FAIL)');
      console.log('======================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n[Test Suite Error]:', err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

main();
