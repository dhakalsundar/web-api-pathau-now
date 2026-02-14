import { Router } from 'express';
import ShipmentController from '../controllers/shipment.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Public tracking lookup: GET /api/track/:trackingNumber
router.get('/:trackingNumber', asyncHandler((req, res) => ShipmentController.track(req, res)));

export default router;