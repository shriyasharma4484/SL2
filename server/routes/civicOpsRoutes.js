import express from 'express';
import {
  getCivicOpsOverview,
  generateOptimizationPlans,
  simulateCancellation,
  approveDeploymentPlan,
  resetScenario
} from '../controllers/civicOpsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public / evaluation read endpoints
router.get('/overview', getCivicOpsOverview);
router.post('/generate-plans', generateOptimizationPlans);
router.post('/simulate-cancellation', simulateCancellation);
router.post('/reset', resetScenario);

// Coordinator approval endpoint (uses optionalAuth so eval mode works seamlessly, but records coordinator ID if logged in)
router.post('/approve-plan', optionalAuth, approveDeploymentPlan);

export default router;
