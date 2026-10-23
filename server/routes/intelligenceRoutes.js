import express from 'express';
import {
  getIntelligenceMetrics,
  getCivicLocations,
  getCivicLocationById,
  createIntervention,
  completeIntervention,
  recordInspection
} from '../controllers/intelligenceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Read endpoints: open for public evaluation & coordinator inspection
router.get('/metrics', getIntelligenceMetrics);
router.get('/locations', getCivicLocations);
router.get('/locations/:id', getCivicLocationById);

// Write endpoints: strictly require verified coordinator credentials
router.post('/interventions', authenticateToken, requireRole('coordinator'), createIntervention);
router.patch('/interventions/:id/complete', authenticateToken, requireRole('coordinator'), completeIntervention);
router.post('/inspections', authenticateToken, requireRole('coordinator'), recordInspection);

export default router;
