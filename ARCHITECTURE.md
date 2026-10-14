# 🏗️ System Architecture

## ReturnSense - Technical Architecture Guide

**Version**: 1.0.0  
**Date**: September 2026

---

## 📐 Architecture Overview

```
─────────────────────────────────────────────────────────────────
│                          CLIENT LAYER                          │
│                      (React.js + Vite)                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Pages (20+)    │  │  Components  │  │  Services (9)  │   │
│  │                 │  │   (25+)      │  │  - authService │   │
│  │ Admin Pages (8) │  │  - Reusable  │  │  - productSvc  │   │
│  │ User Pages (12) │  │  - UI Layer  │  │  - orderSvc    │   │
│  └─────────────────┘  └──────────────┘  └────────────────┘   │
│         │                     │                   │             │
│         └─────────────────────┴───────────────────┘             │
│                         │                                       │
│         ┌───────────────▼──────────────────┐                   │
│         │  Axios HTTP Client               │                   │
│         │  - JWT Authentication            │                   │
│         │  - Error Handling                │                   │
│         │  - Request/Response Interceptors │                   │
│         └────────────────┬─────────────────┘                   │
│                         │                                       │
│                   http://localhost:5000/api
│
├─────────────────────────────────────────────────────────────────
│                      SERVER LAYER                              │
│                  (Express.js + Node.js)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   API Routes (9)                         │ │
│  │  /auth  /users  /products  /orders  /cart  /wishlist    │ │
│  │  /reviews  /predictions  /admin                         │ │
│  └────────────┬─────────────────────────────────────────────┘ │
│               │                                                │
│  ┌────────────▼──────────────────────────────────────────────┐│
│  │                   Middleware Stack                        ││
│  │  - Express body-parser                                    ││
│  │  - CORS middleware                                        ││
│  │  - JWT Authentication & Authorization                    ││
│  │  - Rate Limiting                                          ││
│  │  - Error Handler                                          ││
│  │  - Request Logging (Morgan)                              ││
│  └────────────┬──────────────────────────────────────────────┘│
│               │                                                │
│  ┌────────────▼──────────────────────────────────────────────┐│
│  │           Controllers Layer (9 controllers)               ││
│  │  - authController       - orderController                 ││
│  │  - userController       - predictionController            ││
│  │  - productController    - adminController                 ││
│  │  - cartController       - reviewController               ││
│  │  - wishlistController                                     ││
│  └────────────┬──────────────────────────────────────────────┘│
│               │                                                │
│  ┌────────────▼──────────────────────────────────────────────┐│
│  │         Data Access Layer                                 ││
│  │  - Mongoose Models (7 models)                             ││
│  │  - MongoDB Queries                                        ││
│  │  - Data Validation                                        ││
│  │  - Business Logic                                         ││
│  └────────────┬──────────────────────────────────────────────┘│
│               │                                                │
│               ▼                                                │
│          MongoDB Atlas                                         │
│         (7 Collections)                                        │
│
├─────────────────────────────────────────────────────────────────
│                      ML LAYER                                  │
│                   (Flask + Python)                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /predict  /model-info  /train  /feature-importance      │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Prediction Engine                                 │  │ │
│  │  │  - Feature Encoding                                │  │ │
│  │  │  - Model Loading                                   │  │ │
│  │  │  - Prediction                                      │  │ │
│  │  │  - Confidence Scoring                              │  │ │
│  │  │  - SHAP Explainability                             │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  ML Model                                          │  │ │
│  │  │  - Random Forest Classifier                        │  │ │
│  │  │  - Scikit-learn based                              │  │ │
│  │  │  - model.pkl (persisted)                           │  │ │
│  │  │  - Returns binary classification                   │  │ │
│  │  │  - Probability output (0-100%)                     │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Training Pipeline                                │  │ │
│  │  │  - Dataset Loading (CSV)                          │  │ │
│  │  │  - Feature Engineering                            │  │ │
│  │  │  - Model Training                                 │  │ │
│  │  │  - Metrics Calculation                            │  │ │
│  │  │  - Model Serialization                            │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│
└─────────────────────────────────────────────────────────────────
```

---

## 🏢 Technology Stack

### Frontend
```
React 18.2              - UI library
Vite 5.0                - Build tool (fast bundler)
React Router 6.20       - Routing
React Hook Form 7.48    - Form management
Tailwind CSS 3.3        - Styling
Framer Motion 13.1      - Animations
Recharts 2.10           - Data visualization
Axios 1.6               - HTTP client
React Hot Toast 2.4     - Notifications
```

### Backend
```
Express.js 4.18         - Web framework
Node.js 16+             - Runtime
MongoDB 5.0+            - Database
Mongoose 7.0            - ODM/Schema validation
JWT (jsonwebtoken)      - Authentication
Bcrypt 5.1              - Password hashing
Express Rate Limit      - Rate limiting
Cors 2.8                - Cross-origin requests
Morgan 1.10             - Request logging
Multer 1.4              - File uploads
```

### ML/AI
```
Python 3.8+             - Language
Flask 3.0               - Web framework
Scikit-learn 1.3        - ML library
Pandas 2.0              - Data manipulation
NumPy 1.24              - Numerical computing
Pickle                  - Model serialization
SHAP 0.42               - Explainability
```

### DevOps & Deployment
```
Docker 20.10+           - Containerization
MongoDB Atlas           - Cloud database
Git/GitHub              - Version control
Postman                 - API testing
JWT                     - Secure auth
HTTPS/TLS               - Encryption
```

---

## 📦 Project Structure

```
AI-Based Product Return Prediction/
│
├── README.md                      # Project overview
├── INSTALLATION.md                # Setup guide
├── API_DOCS.md                    # API reference
├── DATABASE_SCHEMA.md             # DB schema
├── USER_MANUAL.md                 # User guide
├── IMPLEMENTATION_PLAN.md         # Development plan
│
├── client/                        # React Frontend
│   ├── src/
│   │   ├── pages/                 # 20+ pages
│   │   │   ├── admin/             # 10 admin pages
│   │   │   └── ...
│   │   ├── components/            # 25+ reusable components
│   │   ├── services/              # 9 API service files
│   │   ├── context/               # 4 context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Layout components
│   │   ├── App.jsx                # Main app
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # Entry point
│   ├── public/                    # Static assets
│   ├── package.json               # Dependencies
│   ├── vite.config.js             # Vite config
│   └── tailwind.config.js         # Tailwind config
│
├── server/                        # Express Backend
│   ├── models/                    # Mongoose schemas (7)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── Review.js
│   │   └── Prediction.js
│   ├── controllers/               # Route handlers (9)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── reviewController.js
│   │   ├── predictionController.js
│   │   └── adminController.js
│   ├── routes/                    # API routes (9)
│   ├── middleware/                # Express middleware
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── config/                    # Configuration
│   │   └── db.js
│   ├── server.js                  # Entry point
│   ├── package.json               # Dependencies
│   └── .env                       # Environment variables
│
├── ml-model/                      # ML/Python
│   ├── app.py                     # Flask app
│   ├── predict.py                 # Prediction logic
│   ├── train_model.py             # Training script
│   ├── generate_dataset.py        # Dataset generation
│   ├── model.pkl                  # Trained model
│   ├── label_encoders.pkl         # Feature encoders
│   ├── model_info.json            # Model metrics
│   ├── dataset.csv                # Training data
│   ├── requirements.txt            # Python deps
│   └── __pycache__/               # Compiled cache
│
└── .gitignore                     # Git ignore rules
```

---

## 🔄 Data Flow

### User Registration Flow
```
1. User fills registration form (Client)
2. Frontend validates input (React Hook Form)
3. POST /auth/register (Axios)
4. Express receives request
5. Middleware validates data
6. Hash password (Bcrypt)
7. Create User document (MongoDB)
8. Generate JWT token
9. Send response with token
10. Frontend stores token (localStorage)
11. Redirect to dashboard
```

### Order Placement Flow
```
1. User adds items to cart (Frontend)
2. Proceeds to checkout
3. Selects shipping address & payment
4. Clicks "Place Order"
5. POST /orders (with JWT)
6. Express validates request
7. Check product stock
8. Calculate totals & taxes
9. Call ML API for prediction
10. Create Order document
11. Create Prediction document
12. Decrease product stock
13. Send response
14. Frontend shows confirmation
15. Redirect to order tracking
```

### ML Prediction Flow
```
1. Order being placed
2. Extract features from order
3. Send POST /predict to Flask
4. Flask receives features
5. Load model from pickle
6. Encode categorical features
7. Run prediction
8. Generate confidence score
9. Calculate SHAP values
10. Return prediction with explanation
11. Express stores in database
12. Client displays risk level
```

### Order Tracking Flow
```
1. User goes to "My Orders"
2. Frontend: GET /orders (with JWT)
3. Backend fetches user's orders
4. Populate order data
5. Include status history
6. Return to frontend
7. Display status timeline
8. Show tracking info
9. User can request return
10. Frontend: POST /orders/:id/return
11. Update order status
12. React to changes
```

---

## 🔐 Security Architecture

### Authentication
```
1. User submits credentials
2. Backend validates via password hash
3. JWT token generated (secret key)
4. Token expires in 24 hours
5. Token stored in localStorage (frontend)
6. Token sent in Authorization header
7. Middleware verifies token
8. Route handler executes
9. Token refresh on new login
```

### Password Security
```
- Stored: Never in plain text
- Hashed: Using Bcrypt (10 rounds)
- Salt: Unique salt per password
- Comparison: Async bcrypt.compare()
- Reset: Time-limited token (30 min)
```

### Data Protection
```
- HTTPS/TLS: All transmissions encrypted
- CORS: Cross-origin restricted
- Rate Limit: Prevent brute force
- Input Validation: Server-side always
- Output Encoding: XSS prevention
- SQL Injection: Mongoose prevents
```

---

## 📊 API Communication

### Request Structure
```
GET /api/products?page=1&limit=12
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "search": "iPhone",
  "category": "Electronics"
}
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 🗄️ Database Architecture

### Connections
```
Frontend (Vite) 
    ↓ 
Axios HTTP Client 
    ↓ 
Express Server (Node.js) 
    ↓ 
Mongoose ODM 
    ↓ 
MongoDB Atlas (Cloud)
```

### Collections Relationships
```
Users (1) ←→ (Many) Orders
Users (1) ←→ (Many) Cart
Users (1) ←→ (Many) Wishlist
Orders (Many) → (1) Products
Products (1) ←→ (Many) Reviews
Orders (Many) → (1) Predictions
```

### Indexing Strategy
```
- Text Indexes: Product name/description
- Hash Indexes: Email (unique)
- B-Tree Indexes: On frequently queried fields
- TTL Indexes: Session expiration
```

---

## 🚀 Deployment Architecture

### Development
```
Localhost:5173  ← React Dev Server (Vite)
Localhost:5000  ← Express API Server
Localhost:5001  ← Flask ML Server
Localhost:27017 ← MongoDB (Local/Atlas)
```

### Production
```
CDN → Static Files (Vite build dist/)
        ↓
API Gateway → Express Server (Docker)
                ↓
             MongoDB Atlas (Cloud)
        
ML Server → Flask (Docker)
```

### Docker Compose (Optional)
```yaml
version: '3'
services:
  mongo:
    image: mongo:5.0
    ports: ["27017:27017"]
  
  backend:
    build: ./server
    ports: ["5000:5000"]
    depends_on: [mongo]
  
  ml:
    build: ./ml-model
    ports: ["5001:5001"]
  
  frontend:
    build: ./client
    ports: ["5173:5173"]
```

---

## 🔧 Configuration Management

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=connection_string
JWT_SECRET=secret_key
ML_API_URL=http://localhost:5001
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ReturnSense
VITE_ENV=development
```

**ML (.env)**
```env
FLASK_ENV=development
FLASK_DEBUG=True
MODEL_PATH=./model.pkl
```

---

## 📈 Scalability Considerations

### Horizontal Scaling
```
Load Balancer
    ├─→ Server Instance 1
    ├─→ Server Instance 2
    └─→ Server Instance N
        ↓
    MongoDB Replica Set
    MongoDB Sharding
```

### Caching Layer
```
Optional: Redis Cache
- Session storage
- Frequently accessed data
- Rate limiting counters
```

### Database Optimization
```
- Indexing strategy
- Query optimization
- Connection pooling
- Read replicas for analytics
```

---

## 🧪 Testing Architecture

### Frontend Testing
```
- Unit Tests: Jest
- Component Tests: React Testing Library
- E2E Tests: Cypress
```

### Backend Testing
```
- Unit Tests: Mocha/Chai
- Integration Tests: Supertest
- API Tests: Postman collections
```

### ML Testing
```
- Model Validation: Cross-validation
- Performance Metrics: Accuracy, Precision, Recall
- Feature Importance: SHAP values
```

---

## 📊 Monitoring & Logging

### Application Logs
```
- Server: Morgan + Winston
- Frontend: Console + Sentry
- ML: Logging module
```

### Performance Monitoring
```
- Response times
- Error rates
- Database query performance
- Cache hit rates
```

### Analytics
```
- User engagement
- Product views
- Conversion funnel
- Return rate trends
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: September 2026  
**Maintained By**: Development Team
