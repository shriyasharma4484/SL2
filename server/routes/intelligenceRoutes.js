import express from 'express';
import {
  getScenarios,
  getScenarioDetails,
  analyzeCustomScenario,
  getMetrics
} from '../controllers/intelligenceController.js';

const router = express.Router();

// Public / Protected intelligence endpoints
router.get('/scenarios', getScenarios);
router.get('/scenarios/:id', getScenarioDetails);
router.post('/analyze', analyzeCustomScenario);
router.get('/metrics', getMetrics);

export default router;
