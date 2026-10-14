import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split, StratifiedKFold, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def train():
    df = pd.read_csv(os.path.join(BASE_DIR, 'dataset.csv'))
    
    categorical_features = ['Gender', 'Product_Category', 'Payment_Method']
    X = df.drop('Return_Status', axis=1)
    y = df['Return_Status']
    
    feature_names = X.columns.tolist()
    
    # Split first to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Preprocess
    label_encoders = {}
    
    # Create copies to avoid SettingWithCopyWarning
    X_train = X_train.copy()
    X_test = X_test.copy()
    
    for col in categorical_features:
        le = LabelEncoder()
        X_train[col] = le.fit_transform(X_train[col])
        X_test[col] = X_test[col].map(lambda s: le.transform([s])[0] if s in le.classes_ else -1)
        label_encoders[col] = le
        
    joblib.dump(label_encoders, os.path.join(BASE_DIR, 'label_encoders.pkl'))
    
    # Models to evaluate
    models = {
        'Logistic Regression': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=1000))
        ]),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'XGBoost': XGBClassifier(eval_metric='logloss', random_state=42)
    }
    
    # We will use StratifiedKFold for cross-validation on the Random Forest in RandomizedSearchCV
    rf_param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    print("Running RandomizedSearchCV for Random Forest...")
    rf_search = RandomizedSearchCV(
        RandomForestClassifier(random_state=42), 
        param_distributions=rf_param_grid, 
        n_iter=10, 
        scoring='f1', 
        cv=cv, 
        random_state=42,
        n_jobs=-1
    )
    rf_search.fit(X_train, y_train)
    models['Random Forest (Tuned)'] = rf_search.best_estimator_
    
    results = {}
    best_model_name = ""
    best_f1 = -1
    best_model = None
    
    print("\nModel Comparison:")
    print("-" * 80)
    print(f"{'Model':<25} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-" * 80)
    
    for name, model in models.items():
        if name != 'Random Forest (Tuned)':
            model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        results[name] = {'Accuracy': acc, 'Precision': prec, 'Recall': rec, 'F1-Score': f1}
        print(f"{name:<25} | {acc:<10.4f} | {prec:<10.4f} | {rec:<10.4f} | {f1:<10.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = model
            
    print("-" * 80)
    print(f"Best Model selected: {best_model_name} with F1-Score: {best_f1:.4f}")
    
    joblib.dump(best_model, os.path.join(BASE_DIR, 'model.pkl'))
    
    feature_importances = None
    actual_model = best_model
    if hasattr(best_model, 'named_steps'):
        actual_model = best_model.named_steps['clf']
        
    if hasattr(actual_model, 'feature_importances_'):
        feature_importances = actual_model.feature_importances_.tolist()
    elif hasattr(actual_model, 'coef_'):
        feature_importances = actual_model.coef_[0].tolist()
        
    # Training data statistics
    feature_stats = {}
    for col in feature_names:
        feature_stats[col] = {
            "mean": float(X_train[col].mean()),
            "std": float(X_train[col].std()) if X_train[col].std() != 0 else 1.0
        }
        
    model_info = {
        "model_name": best_model_name,
        "best_model": best_model_name,
        "accuracy": results[best_model_name]['Accuracy'],
        "precision": results[best_model_name]['Precision'],
        "recall": results[best_model_name]['Recall'],
        "f1_score": best_f1,
        "training_date": datetime.now().isoformat(),
        "feature_names": feature_names,
        "features": feature_names,
        "feature_importances": feature_importances,
        "feature_stats": feature_stats
    }
    
    with open(os.path.join(BASE_DIR, 'model_info.json'), 'w') as f:
        json.dump(model_info, f, indent=4)
        
    print("Saved best model to 'model.pkl' and info to 'model_info.json'")
    return model_info

if __name__ == "__main__":
    train()
