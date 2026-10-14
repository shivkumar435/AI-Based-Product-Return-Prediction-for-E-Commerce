const Prediction = require('../models/Prediction');
const axios = require('axios');

const predict = async (req, res) => {
  try {
    const features = req.body;
    let mlPrediction = 'Unknown';
    let mlProbability = 50;
    let mlConfidence = 50;
    let mlRiskLevel = 'Medium';
    let mlRiskFactors = [];
    let mlFeatureImportance = [];
    let mlRecommendation = 'No specific action required.';

    try {
      const mlApiUrl = process.env.ML_API_URL || 'http://localhost:5001';
      const mlResponse = await axios.post(`${mlApiUrl}/predict`, features, { timeout: 30000 });
      const mlData = mlResponse.data?.data || mlResponse.data || {};

      mlPrediction = mlData.prediction ?? mlPrediction;
      mlProbability = Number(mlData.probability ?? mlProbability);
      mlConfidence = Number(mlData.confidence ?? mlConfidence);
      mlRiskLevel = mlData.risk_level ?? mlData.riskLevel ?? mlRiskLevel;
      mlRiskFactors = mlData.risk_factors ?? mlData.riskFactors ?? [];
      mlFeatureImportance = mlData.feature_importance ?? mlData.featureImportance ?? [];
      mlRecommendation = mlData.recommendation ?? mlRecommendation;

      if (mlPrediction === 'Likely to Return') {
        mlProbability = Math.max(mlProbability, 50);
      }
    } catch (mlError) {
      console.error('ML API Error:', mlError.message);
    }

    const predPayload = {
      user: req.user ? req.user._id : null,
      inputFeatures: features,
      prediction: mlPrediction,
      confidence: Number(mlConfidence) || 0,
      probability: Number(mlProbability) || 0,
      riskLevel: mlRiskLevel,
      riskFactors: mlRiskFactors,
      featureImportance: mlFeatureImportance,
      recommendation: mlRecommendation,
      orderId: features.orderId || features.order_id || null
    };

    let predictionRec;
    if (predPayload.orderId) {
      // Upsert by orderId to avoid duplicate predictions on retries
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
        prediction: mlPrediction,
        probability: mlProbability,
        confidence: mlConfidence,
        risk_level: mlRiskLevel,
        risk_factors: mlRiskFactors,
        feature_importance: mlFeatureImportance,
        recommendation: mlRecommendation,
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
