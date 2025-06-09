import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bca-buy-sell';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface ConnectionCache {
  isConnected?: number;
}

const connection: ConnectionCache = {};

async function connectDB() {
  if (connection.isConnected) {
    console.log('Using existing database connection');
    return Promise.resolve();
  }

  try {
    console.log('Connecting to MongoDB:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    };
    
    const db = await mongoose.connect(MONGODB_URI, opts);
    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully, readyState:', connection.isConnected);
    return db;
  } catch (error) {
    console.error('MongoDB connection error details:', error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Could not connect to MongoDB server. Make sure MongoDB is running.');
      } else if (error.message.includes('Authentication failed')) {
        console.error('MongoDB authentication failed. Check your username and password.');
      } else if (error.message.includes('bad auth')) {
        console.error('MongoDB authentication failed. Check your credentials in the connection string.');
      } else if (error.message.includes('ETIMEDOUT')) {
        console.error('Connection to MongoDB timed out. Check your network or firewall settings.');
      }
    }
    throw error;
  }
}

export default connectDB; 