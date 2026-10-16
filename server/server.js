const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { checkMlHealth } = require('./services/mlService');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Parse allowed CORS origins from environment variable
// Supports exact domains and wildcard patterns (e.g. https://ai-based-product-return-prediction*.vercel.app)
const rawOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (e.g. curl, mobile apps, server-to-server)
  const normalizedOrigin = origin.trim().replace(/\/+$/, '');

  return rawOrigins.some(pattern => {
    if (pattern === '*' || pattern === normalizedOrigin) return true;
    if (pattern.includes('*')) {
      const regexStr = '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$';
      return new RegExp(regexStr, 'i').test(normalizedOrigin);
    }
    return false;
  });
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Return callback(null, false) to disallow origin cleanly without crashing with an uncaught 500 error
    return callback(null, false);
  },
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check
app.get('/api/health', async (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  let productCount = null;
  if (isDbReady) {
    try {
      productCount = await mongoose.model('Product').countDocuments();
    } catch (e) {
      productCount = 'unavailable';
    }
  }

  // Fast liveness probe for ML API (2500ms max timeout)
  const mlHealth = await checkMlHealth(2500);

  res.status(200).json({
    status: isDbReady ? 'ok' : 'degraded',
    database: isDbReady ? 'connected' : 'disconnected',
    databaseName: isDbReady ? (mongoose.connection.name || 'unknown') : null,
    productCount: isDbReady ? productCount : 0,
    mlService: mlHealth,
    timestamp: new Date().toISOString()
  });
});

// Redirect browser visits to the frontend app
app.get('/', (req, res) => {
  res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Process interrupted');
  });
});
