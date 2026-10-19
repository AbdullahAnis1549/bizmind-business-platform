import express from 'express';
import { getDashboardKPIs, getDetailedAnalytics, getStaffSummary } from '../controllers/analyticsController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect, requireBusiness);

// Owner & Manager only — contains revenue, profit, invoice totals
router.get('/dashboard', checkRole('owner', 'manager'), getDashboardKPIs);
router.get('/detailed', checkRole('owner', 'manager'), getDetailedAnalytics);

// Staff-safe endpoint — no revenue, no financials
router.get('/staff-summary', checkRole('owner', 'manager', 'staff'), getStaffSummary);

export default router;
