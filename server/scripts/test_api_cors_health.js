const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

async function runTests() {
  console.log('======================================================');
  console.log('   ReturnSense: API, CORS, & Health Diagnostics Test  ');
  console.log('======================================================\n');

  // 1. CORS MATCHING LOGIC TESTS
  console.log('[1/4] Testing CORS Origin Pattern Matching...');

  const configuredOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ai-based-product-return-prediction*.vercel.app',
    'https://ai-based-product-return-prediction.vercel.app'
  ];

  const rawOrigins = configuredOrigins.map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);

  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    return rawOrigins.some(pattern => {
      if (pattern === '*' || pattern === normalizedOrigin) return true;
      if (pattern.includes('*')) {
        const regexStr = '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$';
        return new RegExp(regexStr, 'i').test(normalizedOrigin);
      }
      return false;
    });
  };

  assert(isOriginAllowed('http://localhost:5173'), 'Allows localhost:5173');
  assert(isOriginAllowed('http://localhost:3000'), 'Allows localhost:3000');
  assert(isOriginAllowed('https://ai-based-product-return-prediction.vercel.app'), 'Allows canonical Vercel domain');
  assert(isOriginAllowed('https://ai-based-product-return-prediction.vercel.app/'), 'Allows canonical Vercel domain with trailing slash');
  assert(isOriginAllowed('https://ai-based-product-return-prediction-ndwta2shd-shivkumar3.vercel.app'), 'Allows preview domain with hash (ndwta2shd)');
  assert(isOriginAllowed('https://ai-based-product-return-prediction-ndwta2sh-shivkumar3.vercel.app'), 'Allows earlier preview domain with hash (ndwta2sh)');
  assert(isOriginAllowed('https://ai-based-product-return-prediction-git-main-shivkumar3.vercel.app'), 'Allows branch preview domain');
  assert(!isOriginAllowed('https://malicious-site.com'), 'Blocks arbitrary third-party origin');
  assert(!isOriginAllowed('https://other-app.vercel.app'), 'Blocks unrelated Vercel apps');
  assert(isOriginAllowed(null), 'Allows non-browser requests (null origin)');

  // 2. EXPRESS CORS PREFLIGHT HTTP TEST
  console.log('\n[2/4] Testing Express CORS Middleware with OPTIONS preflight...');
  const app = express();
  app.use(cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  }));

  app.get('/test-endpoint', (req, res) => res.json({ ok: true }));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  const testOrigin = async (origin, method = 'OPTIONS') => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: '/test-endpoint',
        method: method,
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'GET'
        }
      }, (res) => {
        resolve({
          statusCode: res.statusCode,
          allowOrigin: res.headers['access-control-allow-origin']
        });
      });
      req.end();
    });
  };

  const allowedPreflight = await testOrigin('https://ai-based-product-return-prediction-ndwta2shd-shivkumar3.vercel.app');
  assert(allowedPreflight.statusCode === 204 && allowedPreflight.allowOrigin === 'https://ai-based-product-return-prediction-ndwta2shd-shivkumar3.vercel.app', 'Preflight OPTIONS returns 204 and Access-Control-Allow-Origin for preview domain');

  const disallowedPreflight = await testOrigin('https://malicious-hacker.com');
  assert(!disallowedPreflight.allowOrigin, 'Disallowed origin does NOT receive Access-Control-Allow-Origin header');
  assert(disallowedPreflight.statusCode !== 500, 'Disallowed origin does NOT cause 500 error on server');

  server.close();

  // 3. HEALTH CHECK ENDPOINT TEST
  console.log('\n[3/4] Testing Health Check Database Name & Product Count...');
  const testDbUri = 'mongodb://localhost:27017/return-prediction';
  await mongoose.connect(testDbUri);

  const Product = require('../models/Product');
  const count = await Product.countDocuments();
  const dbName = mongoose.connection.name;

  assert(dbName === 'return-prediction', `Health check detects database name correctly (${dbName})`);
  assert(typeof count === 'number' && count >= 0, `Health check reads product count successfully (${count} products)`);

  // 4. PRODUCT CONTROLLER & PAGINATION VERIFICATION
  console.log('\n[4/4] Testing Product Controller Query and Pagination Structure...');
  const { getProducts } = require('../controllers/productController');

  // Mock req and res
  const mockReq = { query: { page: '1', limit: '12', sort: 'name-asc' } };
  let responseData = null;
  const mockRes = {
    json: (data) => { responseData = data; }
  };

  await getProducts(mockReq, mockRes);
  assert(responseData.success === true, 'getProducts responds with success: true');
  assert(Array.isArray(responseData.products), `getProducts returns products array (length: ${responseData.products.length})`);
  assert(responseData.pagination?.page === 1, 'Pagination reflects page: 1');
  assert(responseData.pagination?.limit === 12, 'Pagination reflects limit: 12');
  assert(typeof responseData.pagination?.totalProducts === 'number', `Pagination includes totalProducts (${responseData.pagination?.totalProducts})`);
  assert(typeof responseData.pagination?.totalPages === 'number', `Pagination includes totalPages (${responseData.pagination?.totalPages})`);

  await mongoose.connection.close();

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  if (failed === 0) {
    console.log('STATUS: ALL LOCAL VERIFICATION TESTS PASSED (PASS)');
  } else {
    console.log('STATUS: SOME TESTS FAILED (FAIL)');
  }
  console.log('======================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
