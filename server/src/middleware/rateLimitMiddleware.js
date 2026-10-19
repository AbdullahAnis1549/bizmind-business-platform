import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Per-USER limit on endpoints that call the paid external AI API.
// Must be used AFTER the `protect` middleware (needs req.user).
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.AI_HOURLY_LIMIT) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `ai-user-${req.user?._id || 'anonymous'}`,
  message: {
    success: false,
    message: 'AI usage limit reached for this hour. Please try again later.',
  },
});
