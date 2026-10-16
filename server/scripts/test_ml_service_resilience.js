const http = require('http');
const { getNormalizedMlUrl, checkMlHealth, predictReturn } = require('../services/mlService');

let passed = 0;
let failed = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name} ${detail}`);
    failed++;
  }
}

async function runResilienceTests() {
  console.log('======================================================');
  console.log('   ReturnSense: ML Service Resilience Test Suite      ');
  console.log('======================================================\n');

  const originalEnv = { ...process.env };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: URL NORMALIZATION
    // -------------------------------------------------------------------------
    console.log('[1/4] Testing URL Normalization & Production Fallback...');

    // 1a: Trailing slash
    process.env.ML_API_URL = 'https://returnsense-ml-api.onrender.com/';
    process.env.NODE_ENV = 'development';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Strips trailing slashes'
    );

    // 1b: Trailing /predict
    process.env.ML_API_URL = 'https://returnsense-ml-api.onrender.com/predict';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Strips trailing /predict'
    );

    // 1c: Trailing /predict/
    process.env.ML_API_URL = 'https://returnsense-ml-api.onrender.com/predict/';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Strips trailing /predict/'
    );

    // 1d: Scheme-less remote domain
    process.env.ML_API_URL = 'returnsense-ml-api.onrender.com';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Auto-prefixes https:// on scheme-less remote domains'
    );

    // 1e: Localhost in development
    process.env.ML_API_URL = 'localhost:5001';
    assert(
      getNormalizedMlUrl() === 'http://localhost:5001',
      'Auto-prefixes http:// on localhost'
    );

    // 1f: Production fallback when ML_API_URL is unset
    process.env.NODE_ENV = 'production';
    delete process.env.ML_API_URL;
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Production fallback: defaults to deployed Flask ML API if ML_API_URL is unset'
    );

    // 1g: Production fallback when ML_API_URL is mistakenly set to localhost
    process.env.ML_API_URL = 'http://localhost:5001';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Production fallback: safely overrides localhost with deployed Flask ML API in production'
    );

    // 1h: Strips "Copy URL" clipboard artifact from Render Dashboard
    process.env.ML_API_URL = 'https://returnsense-ml-api.onrender.com\n Copy URL';
    assert(
      getNormalizedMlUrl() === 'https://returnsense-ml-api.onrender.com',
      'Strips Render dashboard "Copy URL" button text artifact'
    );

    // -------------------------------------------------------------------------
    // TEST 2: COLD-START RETRY ON TRANSIENT 503 / 502
    // -------------------------------------------------------------------------
    console.log('\n[2/4] Testing Cold-Start Transient Failure Retry Logic...');

    let attemptCount = 0;
    const mockServer = http.createServer((req, res) => {
      attemptCount++;
      if (req.url === '/predict' && req.method === 'POST') {
        if (attemptCount === 1) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Service waking up' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              prediction: 'Likely to Return',
              probability: 60.5,
              confidence: 60.5,
              risk_level: 'Medium',
              risk_factors: [],
              feature_importance: []
            }
          }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
    const mockPort = mockServer.address().port;

    process.env.NODE_ENV = 'development';
    process.env.ML_API_URL = `http://127.0.0.1:${mockPort}`;
    process.env.ML_API_TIMEOUT_MS = '5000';

    const testPayload = {
      price: 50,
      category: 'Electronics',
      quantity: 1,
      paymentMethod: 'Credit Card',
      age: 28,
      deliveryTime: 3,
      discount: 0,
      gender: 'Male',
      orderFrequency: 4,
      previousReturns: 1,
      rating: 4,
      shippingDistance: 25
    };

    const retryResult = await predictReturn(testPayload);
    assert(attemptCount === 2, `Cold-start retry triggered: made exactly 2 attempts (actual: ${attemptCount})`);
    assert(retryResult.isAvailable === true, 'Successfully recovered on attempt 2');
    assert(retryResult.probability === 60.5, `Recovered result probability is 60.5% (actual: ${retryResult.probability})`);

    await new Promise(resolve => mockServer.close(resolve));

    // -------------------------------------------------------------------------
    // TEST 3: LIVE INFERENCE AGAINST PRODUCTION FLASK ML SERVICE
    // -------------------------------------------------------------------------
    console.log('\n[3/4] Testing Live Inference Against Deployed Flask Service...');

    process.env.ML_API_URL = 'https://returnsense-ml-api.onrender.com';
    process.env.NODE_ENV = 'production';

    const healthCheck = await checkMlHealth(10000);
    assert(healthCheck.configured === true, 'checkMlHealth: configured is true');
    assert(healthCheck.host === 'returnsense-ml-api.onrender.com', `checkMlHealth: host is returnsense-ml-api.onrender.com`);
    assert(healthCheck.status === 'connected', `checkMlHealth: status is connected (actual: ${healthCheck.status})`);
    assert(healthCheck.modelType === 'RandomForestClassifier', `checkMlHealth: modelType is RandomForestClassifier`);

    const userPayload = {
      price: 20,
      category: 'Electronics',
      quantity: 1,
      paymentMethod: 'Credit Card',
      age: 30,
      deliveryTime: 3,
      discount: 0,
      gender: 'Male',
      orderFrequency: 5,
      previousReturns: 4,
      rating: 4,
      shippingDistance: 50
    };

    const liveResult = await predictReturn(userPayload);
    assert(liveResult.isAvailable === true, 'Live predictReturn: isAvailable is true');
    assert(liveResult.source === 'ml_api', `Live predictReturn: source is ml_api (actual: ${liveResult.source})`);
    assert(typeof liveResult.probability === 'number' && liveResult.probability > 0, `Live predictReturn: valid probability (${liveResult.probability}%)`);
    assert(typeof liveResult.confidence === 'number' && liveResult.confidence > 0, `Live predictReturn: valid confidence (${liveResult.confidence}%)`);
    assert(liveResult.prediction === 'Likely to Return' || liveResult.prediction === 'Not Likely to Return', `Live predictReturn: valid prediction class (${liveResult.prediction})`);
    assert(Array.isArray(liveResult.risk_factors), 'Live predictReturn: risk_factors is an array');
    assert(Array.isArray(liveResult.feature_importance) && liveResult.feature_importance.length === 12, 'Live predictReturn: feature_importance has all 12 features');

    // -------------------------------------------------------------------------
    // TEST 4: PRODUCTION GUARD FOR LOCAL PYTHON CHILD_PROCESS
    // -------------------------------------------------------------------------
    console.log('\n[4/4] Testing Production Guard on Local Python Fallback...');

    process.env.NODE_ENV = 'production';
    process.env.ML_API_URL = 'https://unreachable-invalid-fake-host-987654.onrender.com';
    delete process.env.ALLOW_LOCAL_PYTHON_FALLBACK;
    process.env.ML_API_TIMEOUT_MS = '1000';

    let caughtError = null;
    try {
      await predictReturn(userPayload);
    } catch (err) {
      caughtError = err;
    }

    assert(caughtError !== null, 'Throws error when upstream is unreachable');
    assert(caughtError.isServiceUnavailable === true, 'Error has isServiceUnavailable = true');
    assert(
      !caughtError.message.includes("No module named 'joblib'"),
      'Safely bypasses local Python in production, preventing confusing joblib missing error'
    );
    assert(
      caughtError.message.includes('unreachable-invalid-fake-host-987654.onrender.com'),
      'Error message identifies the unreachable upstream host cleanly'
    );

  } finally {
    process.env = originalEnv;
  }

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  if (failed === 0) {
    console.log('STATUS: ALL RESILIENCE TESTS PASSED (PASS)');
  } else {
    console.log('STATUS: SOME TESTS FAILED (FAIL)');
  }
  console.log('======================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runResilienceTests();
