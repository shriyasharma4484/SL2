import express from 'express';
import {
  getAdminOverview,
  getAdminAnalytics,
  getIncomingReports,
  getVolunteerRoster,
  moderateComment,
  getAuditLogs,
  getAllCommentsForModeration
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes here strictly require coordinator role
router.use(authenticateToken);
router.use(requireRole('coordinator'));

router.get('/overview', getAdminOverview);
router.get('/analytics', getAdminAnalytics);
router.get('/incoming-reports', getIncomingReports);
router.get('/volunteers', getVolunteerRoster);
router.get('/audit-logs', getAuditLogs);
router.get('/comments', getAllCommentsForModeration);
router.patch('/comments/:id/moderate', moderateComment);

export default router;
