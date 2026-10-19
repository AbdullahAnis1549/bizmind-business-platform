import express from 'express';
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/verify-otp', authLimiter, verifyOtpValidator, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
