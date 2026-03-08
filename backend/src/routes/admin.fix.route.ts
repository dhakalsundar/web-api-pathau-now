import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { ShipmentModel } from '../models/shipment.model';
import { HttpError } from '../errors/http-error';

const router = Router();

/**
 * ADMIN ONLY - Reset a parcel to PENDING and clear riderUserId
 * POST /api/admin/fix/reset-parcel/:shipmentId
 * Use this to fix parcels that were accepted with the old code
 */
router.post(
  '/reset-parcel/:shipmentId',
  authenticate,
  authorize(['ADMIN']),
  asyncHandler(async (req, res) => {
    const { shipmentId } = req.params;

    console.log(`\n[ADMIN FIX] Resetting parcel ${shipmentId} to PENDING`);

    const shipment = await ShipmentModel.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    console.log(`  Before: status=${shipment.status}, riderUserId=${shipment.riderUserId?.toString() || 'NULL'}`);

    // Reset to PENDING and clear riderUserId
    shipment.status = 'PENDING';
    shipment.riderUserId = undefined;
    await shipment.save();

    console.log(`  After: status=${shipment.status}, riderUserId=NULL`);
    console.log(`[ADMIN FIX] Parcel reset successfully\n`);

    return res.status(200).json({
      success: true,
      message: 'Parcel reset to PENDING. Rider can now accept it again with the fixed code.',
      data: shipment,
    });
  })
);

export default router;
