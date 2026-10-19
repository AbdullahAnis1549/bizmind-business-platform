import express from 'express';
import {
  chatWithAssistant,
  getInsights,
  generateReport,
  generateContent,
  getAIStatus,
} from '../controllers/aiController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.post('/chat', checkRole('owner', 'manager'), aiLimiter, chatWithAssistant);
router.get('/insights', checkRole('owner', 'manager'), getInsights);
router.post('/report', checkRole('owner', 'manager'), generateReport);
router.post('/content', aiLimiter, generateContent);
router.get('/status', getAIStatus);

export default router;
