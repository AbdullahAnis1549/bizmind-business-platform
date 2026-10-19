import express from 'express';
import {
  adminLogin,
  adminVerifyOTP,
  adminResendOTP,
  getPlatformStats,
  getWorkspaces,
  toggleWorkspaceStatus,
} from '../controllers/adminController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public Admin Auth Routes
router.post('/login', authLimiter, adminLogin);
router.post('/verify-otp', authLimiter, adminVerifyOTP);
router.post('/resend-otp', authLimiter, adminResendOTP);

// Protected Super Admin Routes
router.use(protect);
router.use(checkRole('superadmin'));

router.get('/stats', getPlatformStats);
router.get('/workspaces', getWorkspaces);
router.put('/workspaces/:id/status', toggleWorkspaceStatus);

export default router;
