import { Router } from 'express';
import AnalyticsController from '../controllers/admin.analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/stats', authenticate, isAdmin, asyncHandler((req, res) => AnalyticsController.stats(req, res)));

export default router;