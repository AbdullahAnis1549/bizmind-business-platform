import 'dotenv/config';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('[BizMind AI Server] FATAL ERROR: JWT_SECRET environment variable is missing.');
  console.error('[BizMind AI Server] The server refuses to start without a valid JWT_SECRET configured in the environment.');
  process.exit(1);
}

import app from './app.js';
import { connectDB } from './config/db.js';
const PORT = process.env.PORT || 7000;

// Connect to MongoDB then start Express server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[BizMind AI Server] Running on http://localhost:${PORT}`);
    console.log(`[BizMind AI Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[BizMind AI Server] CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}).catch(err => {
  console.error('[BizMind AI Server] Failed to initialize:', err);
});
