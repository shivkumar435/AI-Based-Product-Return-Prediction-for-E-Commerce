Local Development & Run Guide

Purpose
- Describe exact steps to run the three services locally on Windows:
  1) Frontend (React + Vite) — port 5173
  2) Backend (Node + Express) — port 5000
  3) ML API (Python + Flask) — port 5001

Prerequisites
- Node.js (>=18) and npm available in PATH
- Python 3.12 (recommended) installed and accessible as full path
- MongoDB running locally (or Atlas). For local, the default connection string used is mongodb://127.0.0.1:27017/return-prediction
- Git (optional)
- For Windows: build tools may be required for some Python packages if you install across Python versions (prefer Python 3.12 so wheels are available)

Repository layout (top-level)
- client/        -> React app (Vite + Tailwind)
- server/        -> Express backend (API)
- ml-model/      -> Python ML API, training, model artifacts

Environment files
- server/.env.example (updated) shows the variables used by the backend.
- Create server/.env from server/.env.example; never commit .env (it is in .gitignore)

Minimum server/.env (example)
MONGO_URI=mongodb://127.0.0.1:27017/return-prediction
JWT_SECRET=change-this-secret-before-production
PORT=5000
ML_API_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development

ML environment
- Use Python 3.12 to avoid building numpy/pandas from source on Windows.
- Create a virtual environment (optional but recommended):
  C:\> cd <repo>/ml-model
  C:\...\ml-model> C:\path\to\python312\python -m venv .venv
  C:\...\ml-model> .\.venv\Scripts\Activate.ps1
- Install packages (from ml-model/requirements.txt):
  (.venv) C:\...\ml-model> python -m pip install -r requirements.txt

Train model (optional but recommended before first run)
- From ml-model folder, run:
  (.venv) C:\...\ml-model> python train_model.py
- This will generate model.pkl, label_encoders.pkl, and model_info.json in ml-model/.
- If training fails because pip can't build numpy/pandas, switch to Python 3.12 and try again.

Start ML API (Flask)
- With Python 3.12 (and the environment above) active:
  (.venv) C:\...\ml-model> python app.py
- Health-check: http://localhost:5001/health should return JSON {success:true,...} when model files exist.

Start Backend (Express)
- From server folder:
  C:\...\server> npm install
  C:\...\server> cp .env.example .env   (or edit .env manually)
  C:\...\server> npm run seed   # optional: seed DB with sample data
  C:\...\server> npm run dev
- Health-check: http://localhost:5000/api/health should return {status: 'ok'}
- Root path (http://localhost:5000/) will redirect to the frontend (CLIENT_URL) for convenience.

Start Frontend (React/Vite)
- From client folder:
  C:\...\client> npm install
  C:\...\client> npm run dev
- The dev server runs at http://localhost:5173 and proxies `/api` requests to http://localhost:5000 (configured in vite.config.js)

End-to-end test (example)
1) Register + Login + Predict through backend
- Register:
  POST http://localhost:5000/api/auth/register
  body: {"name":"Test","email":"test@example.com","password":"password123"}
- Login -> receive token
- Use token to POST to backend predict:
  POST http://localhost:5000/api/predict
  Headers: Authorization: Bearer <token>
  Body (sample):
  {
    "Gender":"Female",
    "Product_Category":"Clothing",
    "Payment_Method":"Cash on Delivery",
    "Customer_Age":27,
    "Product_Price":89.99,
    "Discount":35,
    "Quantity":2,
    "Delivery_Time":9,
    "Shipping_Distance":420,
    "Previous_Returns":4,
    "Customer_Rating":2.8,
    "Order_Frequency":3
  }
- Expected: backend will forward to ML API, create a Prediction record, and return the prediction result with fields: prediction, probability, confidence, risk_level, risk_factors, feature_importance, recommendation

Health checks
- Frontend: open http://localhost:5173
- Backend: GET http://localhost:5000/api/health
- ML API: GET http://localhost:5001/health

Common issues & troubleshooting
- ML API pip install failures on Windows: use Python 3.12 to get compatible binary wheels for numpy/pandas. If installation tries to compile numpy from source, you likely have a Python that lacks wheels.
- ML model load errors: If model.pkl was trained with a different scikit-learn version, you may see InconsistentVersionWarning. Re-run `python train_model.py` in the same Python environment to retrain and overwrite model.pkl.
- MongoDB connection: ensure MongoDB is running on the host specified by `MONGO_URI`. For local testing use `mongodb://127.0.0.1:27017/return-prediction` to avoid IPv6/::1 binding issues.
- CORS: server reads `CORS_ORIGINS` from .env; default allows http://localhost:5173 and http://localhost:3000.
- Frontend blank/white page after changes: run `npm run build` to reveal bundling errors, or check the browser console/network for 404/500 requests.

Developer notes
- The server root `/` redirects to the frontend `CLIENT_URL` for convenience during local development.
- The API controller was hardened to accept either camelCase or snake_case ML responses and saves standardized fields in the DB.
- Keep machine-wide secrets out of `.env` and do not commit `.env` to source control.

Files changed (summary)
- client/src/context/CartContext.jsx (import path fixed)
- client/src/context/WishlistContext.jsx (import path fixed)
- client/src/pages/PredictionResultPage.jsx (tolerant parsing of ML response)
- server/server.js (added redirect from root -> CLIENT_URL)
- server/controllers/predictionController.js (robust ML API parsing & returned payload)
- server/config/db.js (default to 127.0.0.1 fallback)
- server/.env.example (updated defaults and CORS/CLIENT_URL)

If you want, I can now:
- Run a final verified end-to-end test and paste the exact responses from each service.
- Commit the changes and create a short QA checklist for manual verification.
