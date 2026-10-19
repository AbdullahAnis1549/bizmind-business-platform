import express from 'express';
import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/', checkRole('owner', 'manager'), createProductValidator, createProduct);
router.put('/:id', checkRole('owner', 'manager'), updateProductValidator, updateProduct);
router.delete('/:id', checkRole('owner', 'manager'), deleteProduct);

export default router;
