import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { createInvoiceValidator } from '../validators/invoiceValidator.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', checkRole('owner', 'manager'), getInvoices);
router.get('/:id', checkRole('owner', 'manager'), getInvoiceById);
router.post('/', checkRole('owner', 'manager'), createInvoiceValidator, createInvoice);
router.put('/:id/status', checkRole('owner', 'manager'), updateInvoiceStatus);
router.delete('/:id', checkRole('owner', 'manager'), deleteInvoice);

export default router;
