const mongoose = require('mongoose');

global.mongoConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/o2h-task-portal';
    // Lower timeout to fail fast and fall back instantly in hosted environment
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.mongoConnected = true;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.log('MongoDB connection failed. Automatically falling back to local file-based database for demo hosting!');
    global.mongoConnected = false;
    
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
  }
};

module.exports = connectDB;
