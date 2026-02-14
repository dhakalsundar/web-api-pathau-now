import { Router } from 'express';
import RiderController from '../controllers/rider.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Protected endpoints - only staff and admin may manage riders
router.post('/', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.create(req, res)));
router.get('/', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.getAll(req, res)));
router.get('/:id', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.getById(req, res)));
router.put('/:id', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.update(req, res)));
router.delete('/:id', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.remove(req, res)));

// Assign a shipment to a rider
router.post('/:id/assign', authenticate, authorize(['ADMIN','STAFF']), asyncHandler((req, res) => RiderController.assign(req, res)));

export default router;