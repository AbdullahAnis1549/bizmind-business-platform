import express from 'express';
import { onboard, getBusiness, updateBusiness } from '../controllers/businessController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { onboardingValidator } from '../validators/businessValidator.js';

const router = express.Router();

router.post('/onboard', protect, onboardingValidator, onboard);
router.get('/', protect, requireBusiness, getBusiness);
router.put('/', protect, requireBusiness, checkRole('owner'), updateBusiness);

export default router;
