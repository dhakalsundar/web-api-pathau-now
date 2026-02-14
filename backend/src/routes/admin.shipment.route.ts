import { Router } from 'express';
import ShipmentController from '../controllers/shipment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/', authenticate, isAdmin, asyncHandler((req, res) => ShipmentController.create(req, res)));
router.get('/', authenticate, isAdmin, asyncHandler((req, res) => ShipmentController.getAll(req, res)));
router.put('/:id', authenticate, isAdmin, asyncHandler((req, res) => ShipmentController.update(req, res)));
router.post('/:id/events', authenticate, isAdmin, asyncHandler((req, res) => ShipmentController.addEvent(req, res)));
router.delete('/:id', authenticate, isAdmin, asyncHandler((req, res) => ShipmentController.delete(req, res)));

export default router;