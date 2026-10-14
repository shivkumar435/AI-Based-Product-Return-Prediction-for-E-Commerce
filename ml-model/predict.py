import joblib
import numpy as np
import pandas as pd
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

global_model = None
global_label_encoders = None
global_model_info = None

# Label encoding mappings (must match train_model.py)
GENDER_MAP = {'Male': 1, 'Female': 0, 'Other': 1}
CATEGORY_MAP = {
    'Beauty': 0, 'Books': 1, 'Clothing': 2, 'Electronics': 3,
    'Home & Kitchen': 4, 'Home': 4, 'Shoes': 5, 'Sports': 6
}
PAYMENT_MAP = {
    'Cash on Delivery': 0, 'Credit Card': 1, 'Debit Card': 2,
    'Net Banking': 3, 'UPI': 4, 'PayPal': 1
}

def _get(d, *keys, default=None):
    """Try multiple key names in order, return first match."""
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return default

def reload_model():
    global global_model, global_label_encoders, global_model_info
    try:
        model_path = os.path.join(BASE_DIR, 'model.pkl')
        global_model = joblib.load(model_path)
    except Exception:
        global_model = None
        
    try:
        encoders_path = os.path.join(BASE_DIR, 'label_encoders.pkl')
        global_label_encoders = joblib.load(encoders_path)
    except Exception:
        global_label_encoders = None

    try:
        info_path = os.path.join(BASE_DIR, 'model_info.json')
        with open(info_path, 'r') as f:
            global_model_info = json.load(f)
    except Exception:
        global_model_info = None

# Load model immediately on import
reload_model()

def predict(features_dict):
    global global_model, global_label_encoders, global_model_info
    
    # Support both PascalCase (from orderController) and camelCase (from frontend direct)
    gender_raw = _get(features_dict, 'Gender', 'gender', default='Male')
    category_raw = _get(features_dict, 'Product_Category', 'category', default='Electronics')
    payment_raw = _get(features_dict, 'Payment_Method', 'paymentMethod', default='Credit Card')

    try:
        if global_label_encoders is None:
            raise ValueError("Encoders not loaded")
        gender_encoded = global_label_encoders['Gender'].transform([gender_raw])[0]
        category_encoded = global_label_encoders['Product_Category'].transform([category_raw])[0]
        payment_encoded = global_label_encoders['Payment_Method'].transform([payment_raw])[0]
    except Exception:
        gender_encoded = GENDER_MAP.get(gender_raw, 1)
        category_encoded = CATEGORY_MAP.get(category_raw, 3)
        payment_encoded = PAYMENT_MAP.get(payment_raw, 1)

    # Extract values for risk factors and features
    discount = float(_get(features_dict, 'Discount', 'discount', default=0))
    prev_returns = float(_get(features_dict, 'Previous_Returns', 'previousReturns', default=0))
    rating = float(_get(features_dict, 'Customer_Rating', 'rating', default=4))
    delivery_time = float(_get(features_dict, 'Delivery_Time', 'deliveryTime', default=5))
    shipping_distance = float(_get(features_dict, 'Shipping_Distance', 'shippingDistance', default=100))
    price = float(_get(features_dict, 'Product_Price', 'price', default=100))
    quantity = float(_get(features_dict, 'Quantity', 'quantity', default=1))
    age = float(_get(features_dict, 'Customer_Age', 'age', default=30))
    order_freq = float(_get(features_dict, 'Order_Frequency', 'orderFrequency', default=5))

    # Build feature DataFrame with correct column names — same order as training
    feature_names = [
        'Customer_Age', 'Gender', 'Product_Category', 'Product_Price', 'Discount', 
        'Quantity', 'Payment_Method', 'Delivery_Time', 'Shipping_Distance', 
        'Previous_Returns', 'Customer_Rating', 'Order_Frequency'
    ]
    
    feature_df = pd.DataFrame({
        'Customer_Age': [age],
        'Gender': [float(gender_encoded)],
        'Product_Category': [float(category_encoded)],
        'Product_Price': [price],
        'Discount': [discount],
        'Quantity': [quantity],
        'Payment_Method': [float(payment_encoded)],
        'Delivery_Time': [delivery_time],
        'Shipping_Distance': [shipping_distance],
        'Previous_Returns': [prev_returns],
        'Customer_Rating': [rating],
        'Order_Frequency': [order_freq]
    })

    if global_model is None:
        raise ValueError("Model is not loaded. Please train or reload the model.")

    prediction = global_model.predict(feature_df)[0]
    probability_array = global_model.predict_proba(feature_df)[0]
    
    probability = round(float(probability_array[1]) * 100, 2)
    confidence = round(float(max(probability_array)) * 100, 2)
    
    if probability >= 70:
        risk_level = 'High'
    elif probability >= 40:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'

    # Get feature importances from the model or model_info
    importances = {}
    if hasattr(global_model, 'feature_importances_'):
        feat_imp = global_model.feature_importances_
        for i, name in enumerate(feature_names):
            importances[name] = float(feat_imp[i])
    elif global_model_info and 'feature_importances' in global_model_info and global_model_info['feature_importances']:
        feat_imp = global_model_info['feature_importances']
        for i, name in enumerate(feature_names):
            importances[name] = float(feat_imp[i])
    else:
        # Fallback if no importances available
        for name in feature_names:
            importances[name] = 0.05
            
    def get_impact(contrib):
        if contrib > 0.1: return 'high'
        if contrib > 0.05: return 'medium'
        return 'low'

    risk_factors = []
    if discount > 30:
        contrib = importances.get('Discount', 0)
        risk_factors.append({
            "feature": "Discount",
            "reason": f"High discount ({discount}%) significantly increases return likelihood",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if prev_returns > 3:
        contrib = importances.get('Previous_Returns', 0)
        risk_factors.append({
            "feature": "Previous_Returns",
            "reason": f"Multiple previous returns ({prev_returns}) indicates high return tendency",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if rating < 3:
        contrib = importances.get('Customer_Rating', 0)
        risk_factors.append({
            "feature": "Customer_Rating",
            "reason": f"Low customer rating ({rating}/5) for this product type",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if payment_raw == 'Cash on Delivery':
        contrib = importances.get('Payment_Method', 0)
        risk_factors.append({
            "feature": "Payment_Method",
            "reason": "Cash on Delivery payment has higher return rates",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if delivery_time > 7:
        contrib = importances.get('Delivery_Time', 0)
        risk_factors.append({
            "feature": "Delivery_Time",
            "reason": f"Long delivery time ({delivery_time} days) increases buyer remorse",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if category_raw in ['Clothing', 'Shoes']:
        contrib = importances.get('Product_Category', 0)
        risk_factors.append({
            "feature": "Product_Category",
            "reason": f"{category_raw} category has inherently higher return risk due to sizing/fit issues",
            "impact": get_impact(contrib),
            "contribution": contrib
        })
    if shipping_distance > 300:
        contrib = importances.get('Shipping_Distance', 0)
        risk_factors.append({
            "feature": "Shipping_Distance",
            "reason": f"Long shipping distance ({shipping_distance}km) increases risk of damage in transit",
            "impact": get_impact(contrib),
            "contribution": contrib
        })

    # Sort risk factors by contribution
    risk_factors = sorted(risk_factors, key=lambda x: x['contribution'], reverse=True)

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

    feature_importance_list = []
    for feature in feature_names:
        feature_importance_list.append({
            "feature": feature,
            "importance": importances.get(feature, 0),
            "label": labels.get(feature, feature)
        })
    
    # Sort feature importances
    feature_importance_list = sorted(feature_importance_list, key=lambda x: x['importance'], reverse=True)

    recommendation = "No specific action required."
    if len(risk_factors) > 0:
        top_risk = risk_factors[0]['feature']
        if top_risk == 'Discount':
            recommendation = "Consider reducing discount levels for this customer or product category."
        elif top_risk == 'Previous_Returns':
            recommendation = "Customer has a history of returns. Review account for potential abuse."
        elif top_risk == 'Customer_Rating':
            recommendation = "Product rating is low. Investigate product quality or accurate description."
        elif top_risk == 'Payment_Method':
            recommendation = "Encourage prepaid payment methods with a small additional discount."
        elif top_risk == 'Delivery_Time':
            recommendation = "Expedite shipping to reduce wait time and buyer's remorse."
        elif top_risk == 'Product_Category':
            recommendation = "Ensure detailed sizing charts and fit information are prominently displayed."
        elif top_risk == 'Shipping_Distance':
            recommendation = "Ensure robust packaging for long-distance transit to prevent damage."
        else:
            recommendation = "Review order details carefully before fulfillment."

    return {
        'prediction': 'Likely to Return' if prediction == 1 else 'Not Likely to Return',
        'probability': probability,
        'confidence': confidence,
        'risk_level': risk_level,
        'risk_factors': risk_factors,
        'feature_importance': feature_importance_list,
        'recommendation': recommendation
    }
