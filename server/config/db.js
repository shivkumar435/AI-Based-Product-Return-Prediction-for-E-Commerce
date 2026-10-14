const mongoose = require('mongoose');

/**
 * Normalizes and sanitizes the MongoDB connection string.
 * Handles common copy-paste errors from cloud hosting dashboards (Render, Heroku, etc.):
 * - Checks MONGODB_URI, MONGO_URI, and DATABASE_URL
 * - Trims whitespace
 * - Strips accidental surrounding quotes (" or ')
 * - Strips enclosing angle brackets (<...>)
 * - Fixes spaces after scheme (mongodb+srv: //...)
 * - Auto-prepends mongodb+srv:// if a .mongodb.net hostname is provided without scheme
 */
const getMongoUri = () => {
  const envKeys = ['MONGODB_URI', 'MONGO_URI', 'DATABASE_URL'];
  let rawUri = null;

  for (const key of envKeys) {
    if (process.env[key] && typeof process.env[key] === 'string' && process.env[key].trim() !== '') {
      rawUri = process.env[key];
      break;
    }
  }

  if (!rawUri) {
    return 'mongodb://127.0.0.1:27017/return-prediction';
  }

  let uri = rawUri.trim();

  // Strip leading and trailing quotes or whitespace
  uri = uri.replace(/^["'\s]+|["'\s]+$/g, '').trim();

  // Strip enclosing angle brackets: <mongodb+srv://...>
  if (uri.startsWith('<') && uri.endsWith('>')) {
    uri = uri.slice(1, -1).trim();
  }

  // Fix space after scheme if present: mongodb+srv: //...
  uri = uri.replace(/^mongodb\+srv:\s*\/\//i, 'mongodb+srv://').replace(/^mongodb:\s*\/\//i, 'mongodb://');

  // If user copied just the cluster host without scheme: cluster0.xxx.mongodb.net/...
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://') && uri.includes('.mongodb.net')) {
    uri = `mongodb+srv://${uri}`;
  }

  return uri;
};

/**
 * Masks credentials in connection string for safe diagnostic logging without leaking secrets.
 */
const maskCredentials = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

const connectDB = async (retries = 5, delay = 2000) => {
  const mongoUri = getMongoUri();
  const isSchemeValid = mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://');

  if (!isSchemeValid) {
    console.error(`[Database Error] Invalid MongoDB scheme.`);
    console.error(`Expected connection string to start with "mongodb://" or "mongodb+srv://".`);
    console.error(`Received formatted string: "${maskCredentials(mongoUri).substring(0, 30)}..."`);
    console.error(`Please configure MONGO_URI (or MONGODB_URI) in your Render environment variables dashboard.`);

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
      console.warn(`[Database Warning] Unable to connect to MongoDB after multiple attempts.`);
      console.warn(`Server remains running to serve health checks and will retry in the background.`);
      // Periodic background retry every 30 seconds
      setTimeout(() => connectDB(1, 30000), 30000);
    }
  }
};

module.exports = connectDB;
