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
  const mlApiUrl = process.env.ML_API_URL ? process.env.ML_API_URL.replace(/\/+$/, '') : null;

  // 1. Attempt HTTP request to ML_API_URL if configured
  if (mlApiUrl) {
    try {
      const response = await axios.post(`${mlApiUrl}/predict`, normalized, { timeout: 8000 });
      const data = response.data?.data || response.data;
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
    } catch (httpErr) {
      console.warn(`[ML Service Warning] HTTP connection to ${mlApiUrl} failed (${httpErr.message}). Attempting local Python fallback...`);
    }
  }

  // 2. Attempt local Python model execution
  try {
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

  // 3. Both failed: Report honest unavailability (Zero 50% fabrication)
  const unavailableErr = new Error('Machine Learning prediction service is currently unavailable. No trained model could be reached.');
  unavailableErr.isServiceUnavailable = true;
  unavailableErr.normalizedFeatures = normalized;
  throw unavailableErr;
};

module.exports = {
  validateFeatures,
  predictReturn,
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS
};
