import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', globalSearch);

export default router;
