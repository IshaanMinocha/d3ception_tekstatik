import mongoose from 'mongoose';
import envConfig from './dotenv.js';

envConfig();

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017");
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;