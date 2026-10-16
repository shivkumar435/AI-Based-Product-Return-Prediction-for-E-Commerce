"""
Automated Verification Suite: Flask ML Service Deployment & Runtime Configuration
Verifies:
1. Python runtime files (.python-version, runtime.txt) in ml-model/ and root.
2. requirements.txt package pinning & compatibility (NumPy 1.26.4, SciPy 1.11.4, etc.).
3. gunicorn.conf.py port binding and concurrency configuration.
4. Model binary integrity and unpickling (model.pkl, label_encoders.pkl).
5. Flask application structure, endpoints ('/', '/health', '/predict', '/model-info').
6. Live test-client prediction matching real 12-feature payload.
"""

import os
import sys
import json
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_MODEL_DIR = os.path.join(REPO_ROOT, 'ml-model')

class TestMLServiceDeployment(unittest.TestCase):

    def test_01_runtime_version_files_exist(self):
        """Verify .python-version and runtime.txt exist in both ml-model and root."""
        root_py_version = os.path.join(REPO_ROOT, '.python-version')
        ml_py_version = os.path.join(ML_MODEL_DIR, '.python-version')
        root_runtime = os.path.join(REPO_ROOT, 'runtime.txt')
        ml_runtime = os.path.join(ML_MODEL_DIR, 'runtime.txt')

        self.assertTrue(os.path.exists(root_py_version), "Root .python-version must exist")
        self.assertTrue(os.path.exists(ml_py_version), "ml-model/.python-version must exist")
        self.assertTrue(os.path.exists(root_runtime), "Root runtime.txt must exist")
        self.assertTrue(os.path.exists(ml_runtime), "ml-model/runtime.txt must exist")

        with open(root_py_version, 'r') as f:
            v_root = f.read().strip()
        with open(ml_py_version, 'r') as f:
            v_ml = f.read().strip()

        self.assertEqual(v_root, '3.11.10', "Root .python-version must specify 3.11.10")
        self.assertEqual(v_ml, '3.11.10', "ml-model/.python-version must specify 3.11.10")
        print("[PASS] Python runtime configuration verified: 3.11.10 in both root and ml-model/")

    def test_02_requirements_pins(self):
        """Verify requirements.txt pins compatible, stable versions for Python 3.11."""
        req_path = os.path.join(ML_MODEL_DIR, 'requirements.txt')
        self.assertTrue(os.path.exists(req_path))

        with open(req_path, 'r') as f:
            lines = [l.strip() for l in f if l.strip() and not l.startswith('#')]

        req_dict = {}
        for line in lines:
            if '==' in line:
                pkg, ver = line.split('==', 1)
                req_dict[pkg.lower()] = ver

        self.assertIn('numpy', req_dict)
        self.assertEqual(req_dict['numpy'], '1.26.4', "NumPy should be 1.26.4 for Cython 3 and py311 wheel support")
        self.assertIn('scipy', req_dict)
        self.assertEqual(req_dict['scipy'], '1.11.4', "SciPy must be pinned to 1.11.4 to prevent NumPy 2.x conflicts")
        self.assertIn('scikit-learn', req_dict)
        self.assertEqual(req_dict['scikit-learn'], '1.3.2', "scikit-learn must be 1.3.2 matching trained model")
        self.assertIn('gunicorn', req_dict)
        self.assertIn('flask', req_dict)
        self.assertIn('flask-cors', req_dict)
        print("[PASS] requirements.txt verified: NumPy 1.26.4, SciPy 1.11.4, scikit-learn 1.3.2, Gunicorn pinned.")

    def test_03_gunicorn_conf(self):
        """Verify gunicorn.conf.py binds dynamically to PORT."""
        conf_path = os.path.join(ML_MODEL_DIR, 'gunicorn.conf.py')
        self.assertTrue(os.path.exists(conf_path))

        with open(conf_path, 'r') as f:
            content = f.read()

        self.assertIn('os.environ.get("PORT"', content)
        self.assertIn('bind = f"0.0.0.0:{port}"', content)
        print("[PASS] gunicorn.conf.py verified: dynamic 0.0.0.0:$PORT binding configured.")

    def test_04_model_loading_and_prediction(self):
        """Verify model unpickling and inference with trained artifacts."""
        sys.path.insert(0, ML_MODEL_DIR)
        import predict

        model_file = os.path.join(ML_MODEL_DIR, 'model.pkl')
        encoders_file = os.path.join(ML_MODEL_DIR, 'label_encoders.pkl')
        self.assertTrue(os.path.exists(model_file), "model.pkl must exist")
        self.assertTrue(os.path.exists(encoders_file), "label_encoders.pkl must exist")

        self.assertIsNotNone(predict.global_model, "global_model must be loaded")
        self.assertIsNotNone(predict.global_label_encoders, "label_encoders must be loaded")

        sample_input = {
            'Customer_Age': 32,
            'Gender': 'Female',
            'Product_Category': 'Electronics',
            'Product_Price': 249.99,
            'Discount': 15,
            'Quantity': 1,
            'Payment_Method': 'Credit Card',
            'Delivery_Time': 4,
            'Shipping_Distance': 35,
            'Previous_Returns': 0,
            'Customer_Rating': 4.5,
            'Order_Frequency': 12
        }

        res = predict.predict(sample_input)
        self.assertIn('prediction', res)
        self.assertIn('probability', res)
        self.assertIn('confidence', res)
        self.assertIn('risk_level', res)
        self.assertIsInstance(res['probability'], (int, float))
        self.assertIsInstance(res['confidence'], (int, float))
        print(f"[PASS] predict() execution verified: Prediction={res['prediction']}, Prob={res['probability']}%, Conf={res['confidence']}%")

    def test_05_flask_endpoints(self):
        """Verify Flask app endpoints via test client."""
        sys.path.insert(0, ML_MODEL_DIR)
        from app import app

        client = app.test_client()

        # 1. Root
        r0 = client.get('/')
        self.assertEqual(r0.status_code, 200)
        d0 = r0.get_json()
        self.assertEqual(d0['status'], 'running')

        # 2. Health
        r_health = client.get('/health')
        self.assertEqual(r_health.status_code, 200)
        d_health = r_health.get_json()
        self.assertEqual(d_health['data']['status'], 'ok')
        self.assertEqual(d_health['data']['model_loaded'], True)

        # 3. Model info
        r_info = client.get('/model-info')
        self.assertEqual(r_info.status_code, 200)

        # 4. Predict endpoint POST
        payload = {
            'Customer_Age': 24,
            'Gender': 'Male',
            'Product_Category': 'Clothing',
            'Product_Price': 80,
            'Discount': 40,
            'Quantity': 3,
            'Payment_Method': 'Cash on Delivery',
            'Delivery_Time': 6,
            'Shipping_Distance': 90,
            'Previous_Returns': 4,
            'Customer_Rating': 2.0,
            'Order_Frequency': 2
        }
        r_pred = client.post('/predict', json=payload)
        self.assertEqual(r_pred.status_code, 200)
        d_pred = r_pred.get_json()
        self.assertTrue(d_pred['success'])
        self.assertIn('probability', d_pred['data'])
        self.assertIn('confidence', d_pred['data'])
        print(f"[PASS] Flask /health and /predict endpoints verified via HTTP test client: HTTP {r_pred.status_code}")

if __name__ == '__main__':
    unittest.main()
