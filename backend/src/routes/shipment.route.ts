import { Router } from 'express';
import ShipmentController from '../controllers/shipment.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../validators/validate.middleware';
import { createShipmentSchema } from '../validators/schemas';

const router = Router();

// Public - Tracking (no authentication required)
router.get('/track/:trackingNumber', asyncHandler((req, res) => ShipmentController.publicTrack(req, res)));

// Protected - Customer parcel routes
router.post(
  '/',
  authenticate,
  validateBody(createShipmentSchema),
  asyncHandler((req, res) => ShipmentController.create(req, res))
);

router.get('/', authenticate, asyncHandler((req, res) => ShipmentController.getAll(req, res)));

router.get('/search', authenticate, asyncHandler((req, res) => ShipmentController.search(req, res)));

router.get('/stats', authenticate, asyncHandler((req, res) => ShipmentController.getStats(req, res)));

router.get('/:id', authenticate, asyncHandler((req, res) => ShipmentController.getById(req, res)));

router.put('/:id', authenticate, asyncHandler((req, res) => ShipmentController.update(req, res)));

router.delete('/:id', authenticate, asyncHandler((req, res) => ShipmentController.delete(req, res)));

export default router;
