import { Router } from 'express';

import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import riderSelfController from '../controllers/rider.self.controller';

const router = Router();

/**
 * Middleware: Verify rider role for all self-service endpoints
 */
const verifyRiderRole = (req: any, res: any, next: any) => {
  const userRole = req.user?.role?.toUpperCase();
  if (userRole !== 'RIDER') {
    const { HttpError } = require('../errors/http-error');
    throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
  }
  next();
};


router.get(
  '/',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.getProfile(req, res))
);


router.put(
  '/',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.updateProfile(req, res))
);


router.get(
  '/stats',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.getStats(req, res))
);


router.put(
  '/location',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.updateLocation(req, res))
);


router.put(
  '/status',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.updateStatus(req, res))
);


router.get(
  '/available-parcels',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.getAvailableShipments(req, res))
);


router.get(
  '/parcels',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.getAssignedShipments(req, res))
);


router.put(
  '/parcels/:shipmentId/status',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.updateShipmentStatus(req, res))
);


router.get(
  '/parcels/:shipmentId',
  authenticate,
  authorize(['RIDER', 'CUSTOMER']),
  asyncHandler((req, res) => riderSelfController.getShipmentDetails(req, res))
);


router.post(
  '/parcels/:shipmentId/accept',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.acceptShipment(req, res))
);


router.post(
  '/parcels/:shipmentId/reject',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.rejectShipment(req, res))
);


router.patch(
  '/parcels/:shipmentId/payment-status',
  authenticate,
  authorize(['RIDER']),
  asyncHandler((req, res) => riderSelfController.updatePaymentStatus(req, res))
);

export default router;

