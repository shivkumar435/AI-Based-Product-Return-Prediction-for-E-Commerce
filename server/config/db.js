const path = require('path');
const mongoose = require('mongoose');

// Ensure environment variables are loaded even if db.js is required independently
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Normalizes and sanitizes the MongoDB connection string.
 * Handles common cloud dashboard (Render, Heroku, etc.) copy-paste artifacts:
 * - Checks MONGO_URI first, then MONGODB_URI and DATABASE_URL
 * - In development, falls back to local mongodb://127.0.0.1:27017/return-prediction
 * - In production, returns null if missing so an explicit configuration error is raised
 * - Trims whitespace and newlines
 * - Strips accidental surrounding quotes (" or ')
 * - Strips enclosing angle brackets (<...>)
 * - Fixes spaces after scheme (mongodb+srv: //... -> mongodb+srv://)
 * - Auto-prepends mongodb+srv:// if a .mongodb.net hostname is supplied without scheme
 */
const getMongoUri = () => {
  const envKeys = ['MONGO_URI', 'MONGODB_URI', 'DATABASE_URL'];
  let rawUri = null;

  for (const key of envKeys) {
    if (process.env[key] && typeof process.env[key] === 'string' && process.env[key].trim() !== '') {
      rawUri = process.env[key];
      break;
    }
  }

  if (!rawUri) {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    return 'mongodb://127.0.0.1:27017/return-prediction';
  }

  let uri = rawUri.trim();

  // Strip leading and trailing quotes or whitespace
  uri = uri.replace(/^["'\s]+|["'\s]+$/g, '').trim();

  // Strip enclosing angle brackets: <mongodb+srv://...>
  if (uri.startsWith('<') && uri.endsWith('>')) {
    uri = uri.slice(1, -1).trim();
  }

  // Strip accidental http:// or https:// prefix (e.g. https://mongodb+srv://... or https://cluster0...)
  uri = uri.replace(/^https?:\/\/(mongodb(?:\+srv)?:\/\/)?/i, (m, p1) => p1 || '');

  // Fix space after scheme if present: mongodb+srv: //... -> mongodb+srv://
  uri = uri.replace(/^mongodb\+srv:\s*\/\//i, 'mongodb+srv://')
           .replace(/^mongodb:\s*\/\//i, 'mongodb://');

  // If user copied just the cluster host without scheme: cluster0.xxx.mongodb.net/...
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://') && uri.includes('.mongodb.net')) {
    uri = `mongodb+srv://${uri}`;
  }

  return uri;
};

const connectDB = async (retries = 5, delay = 2000) => {
  const mongoUri = getMongoUri();

  // Guard: Missing URI in production
  if (!mongoUri) {
    console.error('[Database Configuration Error] MONGO_URI is missing or empty in environment variables.');
    console.error('In your Render Dashboard, go to your Web Service -> Environment -> Add MONGO_URI.');
    console.error('Example Atlas URI: mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/return-prediction?retryWrites=true&w=majority');
    console.error('(Do NOT wrap the value in quotation marks)');
    console.error('Server will continue running on PORT and retry in the background.');

    if (retries > 0) {
      setTimeout(() => connectDB(retries - 1, Math.min(delay * 2, 30000)), delay);
    }
    return;
  }

  // Guard: Scheme validation before passing to Mongoose
  const isSchemeValid = mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://');

  if (!isSchemeValid) {
    console.error('[Database Configuration Error] Invalid scheme in MongoDB connection string.');
    console.error('Expected connection string to start with "mongodb://" or "mongodb+srv://".');
    // Safely log only the starting prefix (max 15 characters) to avoid exposing credentials
    console.error(`Received value starting with: "${mongoUri.substring(0, 15)}..." (length: ${mongoUri.length} characters)`);
    console.error('Please verify MONGO_URI in your Render environment variables dashboard.');

    if (retries > 0) {
      console.log(`Will retry database connection in ${delay / 1000}s... (${retries} attempts remaining)`);
      setTimeout(() => connectDB(retries - 1, Math.min(delay * 2, 30000)), delay);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds... (${retries} retries left)`);
      setTimeout(() => connectDB(retries - 1, Math.min(delay * 2, 30000)), delay);
    } else {
      console.warn('[Database Warning] Unable to connect to MongoDB after multiple attempts.');
      console.warn('Server remains running to serve health checks and will retry in the background.');
      // Periodic background retry every 30 seconds
      setTimeout(() => connectDB(1, 30000), 30000);
    }
  }
};

module.exports = connectDB;
