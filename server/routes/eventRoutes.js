import express from 'express';
import {
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
  createEvent,
  updateEvent,
  recordAttendance
} from '../controllers/eventController.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

router.post('/:id/register', authenticateToken, registerForEvent);
router.post('/:id/cancel', authenticateToken, cancelRegistration);

// Coordinator event management
router.post('/', authenticateToken, requireRole('coordinator'), upload.single('cover_image'), createEvent);
router.put('/:id', authenticateToken, requireRole('coordinator'), upload.single('cover_image'), updateEvent);
router.post('/:id/attendance', authenticateToken, requireRole('coordinator'), recordAttendance);

export default router;
