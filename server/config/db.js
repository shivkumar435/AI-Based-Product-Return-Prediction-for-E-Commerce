const mongoose = require('mongoose');

const connectDB = async (retries = 3, delay = 1000) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/return-prediction';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (retries === 0) {
      process.exit(1);
    }
    console.log(`Retrying connection in ${delay / 1000} seconds...`);
    setTimeout(() => connectDB(retries - 1, delay * 2), delay);
  }
};

module.exports = connectDB;
