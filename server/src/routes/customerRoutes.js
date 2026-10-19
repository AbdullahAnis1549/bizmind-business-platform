import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { createCustomerValidator, updateCustomerValidator } from '../validators/customerValidator.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', checkRole('owner', 'manager'), createCustomerValidator, createCustomer);
router.put('/:id', checkRole('owner', 'manager'), updateCustomerValidator, updateCustomer);
router.delete('/:id', checkRole('owner', 'manager'), deleteCustomer);

export default router;
