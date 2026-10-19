import express from 'express';
import {
  getTeamMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/teamController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { requireBusiness } from '../middleware/tenantMiddleware.js';
import { teamMemberValidator } from '../validators/teamValidator.js';

const router = express.Router();

router.use(protect, requireBusiness);

router.get('/', getTeamMembers);
router.post('/invite', checkRole('owner'), teamMemberValidator, inviteMember);
router.post('/add', checkRole('owner'), teamMemberValidator, inviteMember);
router.put('/:id/role', checkRole('owner'), updateMemberRole);
router.delete('/:id', checkRole('owner'), removeMember);

export default router;
