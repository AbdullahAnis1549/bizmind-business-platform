import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizmind_ai';
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('[MongoDB Hint] Atlas username ya password ghalat hai. Special characters URL-encoded hone chahiye.');
    } else if (error.message.includes('querySrv') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.error('[MongoDB Hint] Atlas Network Access check karein (Ensure "0.0.0.0/0 - Allow Access from Anywhere" is enabled in Atlas dashboard).');
    }
    // In serverless environments like Vercel, don't exit the process
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};
