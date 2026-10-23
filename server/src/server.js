import 'dotenv/config';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.warn('[BizMind AI Server] WARNING: JWT_SECRET environment variable is missing. Please add it to your environment variables.');
}

import app from './app.js';
import { connectDB } from './config/db.js';
const PORT = process.env.PORT || 7000;

// Connect to MongoDB then start Express server (only listen if not running serverless on Vercel)
connectDB().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`[BizMind AI Server] Running on http://localhost:${PORT}`);
      console.log(`[BizMind AI Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[BizMind AI Server] CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  }
}).catch(err => {
  console.error('[BizMind AI Server] Failed to initialize:', err);
});

export default app;
