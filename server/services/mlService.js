const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const VALID_CATEGORIES = [
  'Electronics', 'Clothing', 'Shoes', 'Home & Kitchen', 'Home', 'Beauty', 'Sports', 'Books'
];

const VALID_PAYMENT_METHODS = [
  'Credit Card', 'Cash on Delivery', 'Debit Card', 'Net Banking', 'UPI', 'PayPal'
];

/**
 * Validates and normalizes input features for return prediction.
 * Accepts both camelCase (from frontend forms) and PascalCase (from internal controllers).
 */
const validateFeatures = (raw = {}) => {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, errors: ['Input features must be a valid JSON object.'] };
  }

  const get = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null && raw[k] !== '') {
        return raw[k];
      }
    }
    return undefined;
  };

  // 1. Product Price
  const rawPrice = get('Product_Price', 'price', 'productPrice');
  const price = Number(rawPrice);
  if (rawPrice === undefined || isNaN(price) || price < 0) {
    errors.push('Product price must be a non-negative number.');
  }

  // 2. Product Category
  const category = get('Product_Category', 'category', 'productCategory');
  if (!category || typeof category !== 'string' || !VALID_CATEGORIES.includes(category.trim())) {
    errors.push(`Product category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  // 3. Discount (%)
  const rawDiscount = get('Discount', 'discount');
  const discount = rawDiscount !== undefined ? Number(rawDiscount) : 0;
  if (isNaN(discount) || discount < 0 || discount > 100) {
    errors.push('Discount must be a percentage between 0 and 100.');
  }

  // 4. Quantity
  const rawQuantity = get('Quantity', 'quantity');
  const quantity = rawQuantity !== undefined ? parseInt(rawQuantity, 10) : 1;
  if (isNaN(quantity) || quantity < 1) {
    errors.push('Quantity must be an integer of 1 or greater.');
  }

  // 5. Payment Method
  const paymentMethod = get('Payment_Method', 'paymentMethod', 'payment_method') || 'Credit Card';
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    errors.push('Payment method is required.');
  }

  // 6. Delivery Time (Days)
  const rawDelivery = get('Delivery_Time', 'deliveryTime', 'delivery_time');
  const deliveryTime = rawDelivery !== undefined ? Number(rawDelivery) : 3;
  if (isNaN(deliveryTime) || deliveryTime < 1) {
    errors.push('Delivery time must be a number of days >= 1.');
  }

  // 7. Customer Rating (1-5)
  const rawRating = get('Customer_Rating', 'rating', 'customerRating');
  const customerRating = rawRating !== undefined ? Number(rawRating) : 4;
  if (isNaN(customerRating) || customerRating < 1 || customerRating > 5) {
    errors.push('Customer rating must be between 1 and 5.');
  }

  // 8. Previous Returns
  const rawPrevReturns = get('Previous_Returns', 'previousReturns', 'previous_returns');
  const previousReturns = rawPrevReturns !== undefined ? parseInt(rawPrevReturns, 10) : 0;
  if (isNaN(previousReturns) || previousReturns < 0) {
    errors.push('Previous returns must be a non-negative integer.');
  }

  // 9. Customer Age
  const rawAge = get('Customer_Age', 'age', 'customerAge');
  const customerAge = rawAge !== undefined ? parseInt(rawAge, 10) : 30;
  if (isNaN(customerAge) || customerAge < 10 || customerAge > 120) {
    errors.push('Customer age must be a valid age between 10 and 120.');
  }

  // 10. Gender
  const rawGender = get('Gender', 'gender');
  const gender = rawGender && typeof rawGender === 'string' ? rawGender : 'Male';

  // 11. Shipping Distance (km)
  const rawDist = get('Shipping_Distance', 'shippingDistance', 'shipping_distance');
  const shippingDistance = rawDist !== undefined ? Number(rawDist) : 50;
  if (isNaN(shippingDistance) || shippingDistance < 0) {
    errors.push('Shipping distance must be a non-negative distance in km.');
  }

  // 12. Order Frequency (per year)
  const rawFreq = get('Order_Frequency', 'orderFrequency', 'order_frequency');
  const orderFrequency = rawFreq !== undefined ? Number(rawFreq) : 5;
  if (isNaN(orderFrequency) || orderFrequency < 0) {
    errors.push('Order frequency must be a non-negative number.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    normalized: {
      Product_Price: price,
      Product_Category: category.trim(),
      Discount: discount,
      Delivery_Time: deliveryTime,
      Customer_Rating: customerRating,
      Previous_Returns: previousReturns,
      Payment_Method: paymentMethod.trim(),
      Quantity: quantity,
      Customer_Age: customerAge,
      Gender: gender.trim(),
      Shipping_Distance: shippingDistance,
      Order_Frequency: orderFrequency
    }
  };
};

/**
 * Invokes the Python model locally via child_process when ML_API_URL is unavailable or unconfigured.
 */
const runLocalPythonPrediction = (normalizedFeatures) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../ml-model/predict.py');
    if (!fs.existsSync(pythonScript)) {
      return reject(new Error('Local ML model script (predict.py) not found.'));
    }

    // Check potential python executables
    const possiblePythons = [
      path.join(__dirname, '../../.venv/Scripts/python.exe'),
      path.join(__dirname, '../../.venv/bin/python'),
      'python3',
      'python'
    ];

    let pythonBin = null;
    for (const candidate of possiblePythons) {
      if (candidate.includes(path.sep) && fs.existsSync(candidate)) {
        pythonBin = candidate;
        break;
      }
    }
    if (!pythonBin) {
      pythonBin = 'python';
    }

    try {
      const child = spawn(pythonBin, [pythonScript], {
        cwd: path.join(__dirname, '../../ml-model'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });

      child.on('error', err => {
        reject(new Error(`Failed to spawn Python process: ${err.message}`));
      });

      child.on('close', code => {
        if (code !== 0) {
          return reject(new Error(`Python predict process exited with code ${code}: ${stderr}`));
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse ML output JSON: ${e.message} (output: ${stdout})`));
        }
      });

      child.stdin.write(JSON.stringify(normalizedFeatures));
      child.stdin.end();
    } catch (err) {
      reject(err);
    }
  });
};

const PRODUCTION_FALLBACK_ML_URL = 'https://returnsense-ml-api.onrender.com';

/**
 * Normalizes ML_API_URL:
 * - Trims whitespace
 * - Ensures scheme (https:// or http://)
 * - Removes trailing slashes and /predict suffixes
 * - In production, defaults to deployed Flask ML API if unset or pointing to localhost
 */
const getNormalizedMlUrl = () => {
  let url = (process.env.ML_API_URL || '').trim();

  // If user copied "Copy URL" button text or newlines from Render dashboard UI
  if (url) {
    url = url.split(/[\r\n\s]+/)[0].trim();
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // If in production on Render and URL is missing or set to localhost, fallback to deployed service
  if (isProduction && (!url || url.includes('localhost') || url.includes('127.0.0.1'))) {
    return PRODUCTION_FALLBACK_ML_URL;
  }

  if (!url) {
    return isProduction ? PRODUCTION_FALLBACK_ML_URL : null;
  }

  // Auto-prefix protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = (url.includes('localhost') || url.includes('127.0.0.1')) ? `http://${url}` : `https://${url}`;
  }

  // Strip trailing slashes and redundant /predict path
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/predict$/i, '');
  url = url.replace(/\/+$/, '');

  return url;
};

/**
 * Strips sensitive query/auth credentials for safe logging.
 */
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl) return 'none';
  try {
    const u = new URL(rawUrl);
    const path = (u.pathname || '').replace(/\/+$/, '');
    return `${u.protocol}//${u.host}${path}`;
  } catch (e) {
    return rawUrl.replace(/:\/\/.*@/, '://<credentials>@').replace(/\/+$/, '');
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes an HTTP request to the Flask ML service with cold-start retry handling.
 */
const callRemotePredict = async (mlApiUrl, normalized, timeoutMs = 25000) => {
  const targetEndpoint = `${mlApiUrl}/predict`;
  const sanitizedHost = sanitizeUrl(mlApiUrl);
  const maxAttempts = 2; // Initial attempt + 1 retry on cold start

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();
    try {
      console.log(`[ML Service] Attempt ${attempt}/${maxAttempts}: POST ${sanitizedHost}/predict (timeout: ${timeoutMs}ms)`);
      const response = await axios.post(targetEndpoint, normalized, { timeout: timeoutMs });
      const duration = Date.now() - startTime;
      console.log(`[ML Service] Prediction success from ${sanitizedHost} in ${duration}ms (status ${response.status})`);
      return response.data?.data || response.data;
    } catch (err) {
      const duration = Date.now() - startTime;
      const statusCode = err.response?.status;
      const errorCode = err.code || 'UNKNOWN';
      const isTransient = (
        errorCode === 'ECONNABORTED' ||
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ECONNRESET' ||
        statusCode === 502 ||
        statusCode === 503 ||
        statusCode === 504
      );

      console.warn(`[ML Service Warning] Attempt ${attempt} to ${sanitizedHost} failed after ${duration}ms. Code: ${errorCode}, Status: ${statusCode || 'no-response'}, Error: ${err.message}`);

      if (attempt < maxAttempts && isTransient) {
        const retryDelay = 2500;
        console.log(`[ML Service] Transient error detected (likely container cold-start). Retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
        continue;
      }
      throw err;
    }
  }
};

/**
 * Lightweight health check for the upstream ML service.
 */
const checkMlHealth = async (timeoutMs = 2500) => {
  const mlApiUrl = getNormalizedMlUrl();
  if (!mlApiUrl) {
    return {
      configured: false,
      host: null,
      status: 'not_configured'
    };
  }

  let host = 'unknown';
  try {
    host = new URL(mlApiUrl).host;
  } catch (e) {
    host = mlApiUrl;
  }

  try {
    const res = await axios.get(`${mlApiUrl}/health`, { timeout: timeoutMs });
    const isOk = res.status === 200 && (res.data?.data?.status === 'ok' || res.data?.status === 'ok' || res.data?.success === true);
    return {
      configured: true,
      host,
      status: isOk ? 'connected' : 'degraded',
      modelType: res.data?.data?.model_type || null
    };
  } catch (err) {
    return {
      configured: true,
      host,
      status: 'unreachable',
      error: err.code || err.message
    };
  }
};

/**
 * Predicts product return risk using the trained Random Forest model.
 * Connects to the Flask ML API if configured, or falls back to local Python runtime.
 * Never fabricates 50% or arbitrary fallback predictions.
 *
 * @param {Object} features - Raw input features
 * @returns {Promise<Object>} Formatted prediction result
 */
const predictReturn = async (features) => {
  const validation = validateFeatures(features);
  if (!validation.isValid) {
    const err = new Error(`Invalid prediction features: ${validation.errors.join('; ')}`);
    err.isValidationError = true;
    err.validationErrors = validation.errors;
    throw err;
  }

  const normalized = validation.normalized;
  const mlApiUrl = getNormalizedMlUrl();
  const timeoutMs = parseInt(process.env.ML_API_TIMEOUT_MS, 10) || 25000;
  const isProduction = process.env.NODE_ENV === 'production';
  let httpFailed = false;
  let httpError = null;

  // 1. Attempt HTTP request to ML_API_URL if configured or in production
  if (mlApiUrl) {
    try {
      const data = await callRemotePredict(mlApiUrl, normalized, timeoutMs);
      if (data && typeof data === 'object' && data.probability !== undefined) {
        const prob = Number(data.probability);
        const conf = Number(data.confidence ?? (prob >= 50 ? prob : 100 - prob));
        const risk = data.risk_level || data.riskLevel || (prob >= 70 ? 'High' : prob >= 40 ? 'Medium' : 'Low');
        const factors = data.risk_factors || data.riskFactors || [];
        const importance = data.feature_importance || data.featureImportance || [];
        return {
          isAvailable: true,
          prediction: data.prediction || (prob > 50 ? 'Likely to Return' : 'Not Likely to Return'),
          probability: prob,
          confidence: conf,
          risk_level: risk,
          riskLevel: risk,
          risk_factors: factors,
          riskFactors: factors,
          feature_importance: importance,
          featureImportance: importance,
          recommendation: data.recommendation || 'No specific action required.',
          normalizedFeatures: normalized,
          source: 'ml_api'
        };
      }
    } catch (err) {
      httpFailed = true;
      httpError = err;
    }
  }

  // 2. In production, avoid running local Python child_process unless explicitly allowed,
  // as standard Node.js production containers lack Python ML dependencies (joblib, scikit-learn).
  const allowLocalPython = !isProduction || process.env.ALLOW_LOCAL_PYTHON_FALLBACK === 'true';

  if (allowLocalPython) {
    try {
      console.log('[ML Service] Attempting local Python model execution fallback...');
      const localData = await runLocalPythonPrediction(normalized);
      if (localData && typeof localData === 'object' && localData.probability !== undefined) {
        const prob = Number(localData.probability);
        const conf = Number(localData.confidence ?? (prob >= 50 ? prob : 100 - prob));
        const risk = localData.risk_level || localData.riskLevel || (prob >= 70 ? 'High' : prob >= 40 ? 'Medium' : 'Low');
        const factors = localData.risk_factors || localData.riskFactors || [];
        const importance = localData.feature_importance || localData.featureImportance || [];
        return {
          isAvailable: true,
          prediction: localData.prediction || (prob > 50 ? 'Likely to Return' : 'Not Likely to Return'),
          probability: prob,
          confidence: conf,
          risk_level: risk,
          riskLevel: risk,
          risk_factors: factors,
          riskFactors: factors,
          feature_importance: importance,
          featureImportance: importance,
          recommendation: localData.recommendation || 'No specific action required.',
          normalizedFeatures: normalized,
          source: 'local_model'
        };
      }
    } catch (localErr) {
      console.warn(`[ML Service Warning] Local Python model execution unavailable: ${localErr.message}`);
    }
  } else if (httpFailed) {
    console.warn('[ML Service] Production mode: skipping local Python child_process fallback to prevent missing-dependency overhead.');
  }

  // 3. Both failed: Report honest unavailability (Zero 50% fabrication)
  const hostLabel = mlApiUrl ? sanitizeUrl(mlApiUrl) : 'unconfigured';
  const detail = httpError ? ` (upstream: ${httpError.code || httpError.message})` : '';
  const unavailableErr = new Error(`Machine Learning prediction service is currently unavailable. No trained model could be reached at ${hostLabel}${detail}.`);
  unavailableErr.isServiceUnavailable = true;
  unavailableErr.normalizedFeatures = normalized;
  throw unavailableErr;
};

module.exports = {
  validateFeatures,
  predictReturn,
  getNormalizedMlUrl,
  checkMlHealth,
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS
};
