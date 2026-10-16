const Prediction = require('../models/Prediction');
const { predictReturn, validateFeatures } = require('../services/mlService');

const predict = async (req, res) => {
  try {
    const features = req.body;

    // 1. Validate input features
    const validation = validateFeatures(features);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for prediction features.',
        errors: validation.errors
      });
    }

    // 2. Invoke real trained model (HTTP or local Python)
    let mlResult;
    try {
      mlResult = await predictReturn(features);
    } catch (mlErr) {
      if (mlErr.isValidationError) {
        return res.status(400).json({
          success: false,
          message: mlErr.message,
          errors: mlErr.validationErrors
        });
      }

      // Explicit, honest error reporting when ML model is unreachable
      return res.status(503).json({
        success: false,
        isAvailable: false,
        message: 'The machine learning prediction service is currently unavailable. No model output could be generated.',
        error: mlErr.message
      });
    }

    // 3. Save genuine prediction record
    const predPayload = {
      user: req.user ? req.user._id : null,
      inputFeatures: mlResult.normalizedFeatures || features,
      prediction: mlResult.prediction,
      confidence: Number(mlResult.confidence) || 0,
      probability: Number(mlResult.probability) || 0,
      riskLevel: mlResult.risk_level,
      riskFactors: mlResult.risk_factors || [],
      featureImportance: mlResult.feature_importance || [],
      recommendation: mlResult.recommendation,
      orderId: features.orderId || features.order_id || null,
      isFallback: false
    };

    let predictionRec;
    if (predPayload.orderId) {
      predictionRec = await Prediction.findOneAndUpdate(
        { orderId: predPayload.orderId },
        { $set: predPayload },
        { upsert: true, new: true }
      );
    } else {
      predictionRec = await Prediction.create(predPayload);
    }

    res.status(201).json({
      success: true,
      prediction: {
        isAvailable: true,
        prediction: mlResult.prediction,
        probability: mlResult.probability,
        confidence: mlResult.confidence,
        risk_level: mlResult.risk_level,
        risk_factors: mlResult.risk_factors,
        feature_importance: mlResult.feature_importance,
        recommendation: mlResult.recommendation,
        source: mlResult.source,
        savedPrediction: predictionRec
      }
    });
  } catch (error) {
    console.error('Prediction Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserPredictions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Prediction.countDocuments({ user: req.user._id });

    const predictions = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      predictions,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalPredictions: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPredictions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Prediction.countDocuments({});

    const predictions = await Prediction.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      predictions,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalPredictions: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  predict,
  getUserPredictions,
  getAllPredictions
};
