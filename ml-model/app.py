import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict, reload_model

app = Flask(__name__)
CORS(app)

# Configure request logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    if request.path != '/health':
        logger.info(f"Request: {request.method} {request.url}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_INFO_PATH = os.path.join(BASE_DIR, 'model_info.json')

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No input data provided'}), 400
        
        result = predict(data)
        return jsonify({
            'success': True,
            'message': 'Prediction successful',
            'data': result
        }), 200
    except Exception as e:
        logger.error(f"Error in predict_endpoint: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/train', methods=['POST'])
def train_endpoint():
    try:
        # Import dynamically to avoid loading training dependencies during normal inference
        from train_model import train
        
        info = train()
        reload_model()
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'data': info
        }), 200
    except Exception as e:
        logger.error(f"Error in train_endpoint: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info_endpoint():
    try:
        if not os.path.exists(MODEL_INFO_PATH):
            return jsonify({'success': False, 'message': 'Model info not found. Has a model been trained yet?'}), 404
            
        with open(MODEL_INFO_PATH, 'r') as f:
            info = json.load(f)
            
        feature_names = info.get('feature_names', [])
        importances = info.get('feature_importances', [])
        fi_dict = {}
        if feature_names and importances and len(feature_names) == len(importances):
            for name, imp in zip(feature_names, importances):
                fi_dict[name] = imp
        info['feature_importance'] = fi_dict
        
        acc = info.get('accuracy', 0) or 0
        prec = info.get('precision', 0) or 0
        rec = info.get('recall', 0) or 0
        f1 = info.get('f1_score', 0) or 0
        
        info['metrics'] = {
            'accuracy': round(acc * 100, 2) if acc <= 1 else round(acc, 2),
            'precision': round(prec * 100, 2) if prec <= 1 else round(prec, 2),
            'recall': round(rec * 100, 2) if rec <= 1 else round(rec, 2),
            'f1_score': round(f1 * 100, 2) if f1 <= 1 else round(f1, 2),
            'model_name': info.get('model_name', 'Unknown')
        }
            
        return jsonify({
            'success': True,
            'message': 'Model info retrieved successfully',
            'data': info
        }), 200
    except Exception as e:
        logger.error(f"Error in model_info_endpoint: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/feature-importance', methods=['GET'])
def feature_importance_endpoint():
    try:
        if not os.path.exists(MODEL_INFO_PATH):
            return jsonify({'success': False, 'message': 'Model info not found.'}), 404
            
        with open(MODEL_INFO_PATH, 'r') as f:
            info = json.load(f)
            
        feature_names = info.get('feature_names', [])
        importances = info.get('feature_importances', [])
        
        labels = {
            'Customer_Age': 'Customer Age',
            'Gender': 'Gender',
            'Product_Category': 'Product Category',
            'Product_Price': 'Product Price',
            'Discount': 'Discount (%)',
            'Quantity': 'Quantity',
            'Payment_Method': 'Payment Method',
            'Delivery_Time': 'Delivery Time (Days)',
            'Shipping_Distance': 'Shipping Distance',
            'Previous_Returns': 'Previous Returns',
            'Customer_Rating': 'Customer Rating',
            'Order_Frequency': 'Order Frequency'
        }
        
        result = []
        if feature_names and importances and len(feature_names) == len(importances):
            for name, imp in zip(feature_names, importances):
                result.append({
                    "feature": name,
                    "importance": imp,
                    "label": labels.get(name, name)
                })
            result = sorted(result, key=lambda x: x['importance'], reverse=True)
            
        return jsonify({
            'success': True,
            'message': 'Feature importances retrieved',
            'data': result
        }), 200
    except Exception as e:
        logger.error(f"Error in feature_importance_endpoint: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/model-metrics', methods=['GET'])
def model_metrics_endpoint():
    try:
        if not os.path.exists(MODEL_INFO_PATH):
            return jsonify({'success': False, 'message': 'Model metrics not found.'}), 404
            
        with open(MODEL_INFO_PATH, 'r') as f:
            info = json.load(f)
            
        metrics = {
            'accuracy': info.get('accuracy', 0),
            'precision': info.get('precision', 0),
            'recall': info.get('recall', 0),
            'f1_score': info.get('f1_score', 0),
            'model_name': info.get('model_name', 'Unknown'),
            'training_date': info.get('training_date', None)
        }
            
        return jsonify({
            'success': True,
            'message': 'Model metrics retrieved successfully',
            'data': metrics
        }), 200
    except Exception as e:
        logger.error(f"Error in model_metrics_endpoint: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_endpoint():
    model_exists = os.path.exists(os.path.join(BASE_DIR, 'model.pkl'))
    encoders_exist = os.path.exists(os.path.join(BASE_DIR, 'label_encoders.pkl'))
    if model_exists and encoders_exist:
        return jsonify({'success': True, 'message': 'System healthy', 'data': {'status': 'ok'}}), 200
    else:
        return jsonify({'success': False, 'message': 'Missing model files', 'data': {'status': 'missing_model_files'}}), 503

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
