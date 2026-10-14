# 📦 Installation & Setup Guide

## ReturnSense — AI-Based Product Return Prediction for E-Commerce

### System Requirements

- **Node.js**: v16.0.0 or higher
- **Python**: v3.8 or higher (for ML model)
- **MongoDB**: Cloud (MongoDB Atlas) or Local instance
- **npm/yarn**: Latest version
- **Git**: For version control
- **Postman**: Optional, for API testing

### Prerequisites Setup

#### 1. Install Node.js
Download from https://nodejs.org/ (LTS version recommended)

```bash
# Verify installation
node --version
npm --version
```

#### 2. Install Python
Download from https://www.python.org/ (3.8+)

```bash
# Verify installation
python --version
pip --version
```

#### 3. Setup MongoDB
**Option A: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a cluster (M0 free tier)
4. Get connection string
5. Whitelist your IP address

**Option B: MongoDB Local**
Download and install from https://www.mongodb.com/try/download/community

```bash
# Verify MongoDB is running
mongosh # or mongo for older versions
```

---

## 🚀 Project Setup

### Step 1: Clone Repository

```bash
cd path/to/projects
git clone <repository-url>
cd "AI-Based Product Return Prediction for E-Commerce"
```

### Step 2: Setup Backend (Express.js)

```bash
cd server

#Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI=your_mongodb_connection_string
# - JWT_SECRET=your_jwt_secret_key
# - ML_API_URL=http://localhost:5001
# - PORT=5000
# - NODE_ENV=development
# - CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### .env Configuration Example

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Authentication
JWT_SECRET=your_secret_key_here

# ML API
ML_API_URL=http://localhost:5001

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AWS S3 (Optional for image uploads)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket
```

#### Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm run start

# Output should show:
# Server running in development mode on port 5000
# Connected to MongoDB
```

### Step 3: Setup Frontend (React + Vite)

```bash
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - VITE_API_URL=http://localhost:5000/api
```

#### .env Configuration Example

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ReturnSense
VITE_ENV=development
```

#### Start Frontend Development Server

```bash
# Development (with hot reload)
npm run dev

# Output should show:
# VITE v5.0.0 ready in X ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# Build for production
npm run build

# Preview production build
npm run preview
```

### Step 4: Setup ML Model (Flask)

```bash
cd ml-model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train model (if needed)
python train_model.py

# Start Flask server
python app.py

# Output should show:
# Running on http://127.0.0.1:5001
```

---

## 🗄️ Database Seeding

### Option 1: Seed with Sample Data

```bash
cd server

# Run seed script
npm run seed

# This will create:
# - Sample admin user (admin@example.com / admin123)
# - Sample products (Electronics, Clothing, Home products, etc.)
# - Sample categories and brands
```

### Option 2: Manual Database Setup

```bash
# Connect to MongoDB
mongosh

# Create database
use returnsense

# Create collections
db.createCollection("users")
db.createCollection("products")
db.createCollection("orders")
db.createCollection("carts")
db.createCollection("wishlist")
db.createCollection("reviews")
db.createCollection("predictions")

# Create indexes
db.products.createIndex({ "name": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "price": 1 })
```

---

## ✅ Verification Checklist

After setup, verify everything is working:

### Backend
- [ ] Check MongoDB connection in console
- [ ] Verify all routes loaded
- [ ] Test health endpoint: `GET http://localhost:5000/api/health`
- [ ] Test register: `POST http://localhost:5000/api/auth/register`

### Frontend
- [ ] React app loads at `http://localhost:5173`
- [ ] Can navigate to pages
- [ ] Dark mode toggle works
- [ ] Responsive design visible

### ML Model
- [ ] Flask server runs on port 5001
- [ ] Health check: `GET http://localhost:5001/health`
- [ ] Model file exists: `ml-model/model.pkl`
- [ ] Test prediction: `POST http://localhost:5001/predict`

### Full Stack
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can view products
- [ ] Can add to cart
- [ ] Can proceed to checkout
- [ ] Can place order
- [ ] Can get prediction result
- [ ] Admin dashboard accessible

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Common issues:
# - Wrong username/password
# - IP not whitelisted (Atlas)
# - Network connection blocked
```

**Solution:**
```bash
# Test connection string
mongosh "mongodb+srv://username:password@your-cluster.mongodb.net/dbname"
```

### Port Already in Use

```bash
# Check what's using port 5000
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000

# Kill process using port
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Flask/Python Issues

```bash
# Check Python version
python --version  # Should be 3.8+

# Verify virtual env activation
which python  # Should show venv path

# Install specific package versions
pip install scikit-learn==1.3.0
pip install flask==3.0.0
pip install flask-cors==4.0.0
```

### CORS Errors

If getting CORS errors:

1. Verify `CORS_ORIGINS` in backend `.env`
2. Check frontend API URL in `.env`
3. Ensure backend server is running
4. Browser settings (some features need localhost)

```env
# Backend .env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend .env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Production Deployment

### Environment Setup for Production

```env
# Backend Production .env
NODE_ENV=production
JWT_SECRET=long_complex_secret_key_here
MONGODB_URI=mongodb+srv://prod_user:prod_password@production-cluster.mongodb.net/returnsense
PORT=443  # Or use reverse proxy
ML_API_URL=https://ml-api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Build Frontend for Production

```bash
cd client
npm run build

# Output in dist/ folder
# Deploy this to CDN or server

# Gzip compression
gzip dist/* -k
```

### Deploy Backend

**Using Docker (Recommended)**

```bash
# Build image
docker build -t returnsense-api .

# Run container
docker run -p 5000:5000 --env-file .env returnsense-api

# Or use docker-compose
docker-compose up -d
```

**Using PM2 (Alternative)**

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js --name "returnsense-api"

# Monitor
pm2 logs returnsense-api
```

### Deployment Checklist

- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Error logging setup
- [ ] Performance monitoring enabled
- [ ] CDN configured for static files
- [ ] Database indices optimized
- [ ] Caching headers configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

---

## 📝 First Time Setup Summary

```bash
# 1. Clone repo
git clone <repo-url>
cd project

# 2. Backend setup
cd server
npm install
cp .env.example .env
npm run dev

# 3. Frontend setup (new terminal)
cd client
npm install
npm run dev

# 4. ML setup (new terminal)
cd ml-model
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# 5. Visit http://localhost:5173
# That's it! You're ready to go.
```

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Python Scikit-learn](https://scikit-learn.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**For support or issues, please refer to the troubleshooting section or create an issue in the repository.**

**Last Updated**: September 2026
**Version**: 1.0.0
