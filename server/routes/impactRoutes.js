import express from 'express';
import { getPublicImpactStats } from '../controllers/impactController.js';

const router = express.Router();

router.get('/', getPublicImpactStats);

export default router;
