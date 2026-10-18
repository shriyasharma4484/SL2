import express from 'express';
import {
  createIssue,
  getPublicIssues,
  getIssueById,
  toggleConfirmation,
  addComment,
  updateStatusByCoordinator,
  submitResolutionFeedback,
  getMyReports,
  getAssignedToVolunteer,
  submitVolunteerProgress
} from '../controllers/issueController.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public / Authenticated search
router.get('/', getPublicIssues);
router.get('/my-reports', authenticateToken, getMyReports);
router.get('/assigned-to-me', authenticateToken, requireRole('volunteer', 'coordinator'), getAssignedToVolunteer);
router.get('/:id', optionalAuth, getIssueById);

// Submit report
router.post('/', authenticateToken, upload.single('photo'), createIssue);

// Community interaction
router.post('/:id/confirm', authenticateToken, toggleConfirmation);
router.post('/:id/comments', authenticateToken, upload.single('photo'), addComment);
router.post('/:id/feedback', authenticateToken, submitResolutionFeedback);

// Volunteer progress update
router.post('/:id/volunteer-progress', authenticateToken, requireRole('volunteer', 'coordinator'), upload.single('photo'), submitVolunteerProgress);

// Coordinator status change
router.patch('/:id/status', authenticateToken, requireRole('coordinator'), upload.single('photo'), updateStatusByCoordinator);

export default router;
