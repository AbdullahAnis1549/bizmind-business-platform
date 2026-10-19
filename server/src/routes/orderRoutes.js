import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { createOrderValidator } from '../validators/orderValidator.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', checkRole('owner', 'manager', 'staff'), createOrderValidator, createOrder);
router.put('/:id/status', checkRole('owner', 'manager'), updateOrderStatus);

export default router;
