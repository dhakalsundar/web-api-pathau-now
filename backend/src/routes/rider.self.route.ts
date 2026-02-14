import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { riderService } from '../services/rider.service';
import { ShipmentService } from '../services/shipment.service';
import { HttpError } from '../errors/http-error';

const router = Router();
const shipmentService = new ShipmentService();

/**
 * Get current rider's profile (authenticated rider only)
 * GET /api/riders/me
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    // Verify that authenticated user is a RIDER
    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    const rider = await riderService.getRiderById(riderId);

    return res.status(200).json({
      success: true,
      message: 'Rider profile retrieved successfully',
      data: rider,
    });
  })
);

/**
 * Get current rider's assigned shipments
 * GET /api/riders/me/shipments
 * Query params: ?page=1&limit=10&status=IN_TRANSIT
 */
router.get(
  '/shipments',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { page = '1', limit = '10', status } = req.query as Record<string, string>;

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Get rider to see assigned parcels
    const rider = await riderService.getRiderById(riderId);
    
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Build filters for rider's assigned shipments
    const filters: any = {
      riderId,
    };

    if (status) {
      filters.status = status;
    }

    const { shipments, total } = await shipmentService.getAllShipments(filters, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      message: 'Assigned shipments retrieved successfully',
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: shipments,
      },
    });
  })
);

/**
 * Get single shipment details (only if assigned to rider)
 * GET /api/riders/me/shipments/:shipmentId
 */
router.get(
  '/shipments/:shipmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { shipmentId } = req.params;

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    const shipment = await shipmentService.getById(shipmentId);

    // Verify shipment is assigned to this rider
    if (shipment.riderId?.toString() !== riderId) {
      throw new HttpError(403, 'You do not have permission to view this shipment');
    }

    return res.status(200).json({
      success: true,
      message: 'Shipment retrieved successfully',
      data: shipment,
    });
  })
);

/**
 * Update shipment status (rider can only update their own shipments)
 * PUT /api/riders/me/shipments/:shipmentId/status
 */
router.put(
  '/shipments/:shipmentId/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { shipmentId } = req.params;
    const { status, message, location } = req.body;

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    if (!status) {
      throw new HttpError(400, 'Status is required');
    }

    // Verify shipment exists and is assigned to this rider
    const shipment = await shipmentService.getById(shipmentId);

    if (shipment.riderId?.toString() !== riderId) {
      throw new HttpError(403, 'You do not have permission to update this shipment');
    }

    // Update shipment status with event
    const eventData = {
      message: message || `Status updated to ${status}`,
      location: location,
    };

    const updated = await shipmentService.updateShipmentStatus(shipmentId, status, eventData);

    // If delivered, increment rider's delivery count
    if (status === 'DELIVERED') {
      await riderService.incrementDeliveries(riderId);
    }

    return res.status(200).json({
      success: true,
      message: 'Shipment status updated successfully',
      data: updated,
    });
  })
);

/**
 * Update rider's current location
 * PUT /api/riders/me/location
 * Body: { latitude: number, longitude: number, address?: string }
 */
router.put(
  '/location',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { latitude, longitude, address } = req.body;

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    if (latitude === undefined || longitude === undefined) {
      throw new HttpError(400, 'Latitude and longitude are required');
    }

    const locationData = { latitude, longitude, address };
    const updated = await riderService.updateRiderLocation(riderId, locationData);

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updated,
    });
  })
);

/**
 * Update rider's availability status
 * PUT /api/riders/me/status
 * Body: { status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' }
 */
router.put(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { status } = req.body;

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(status)) {
      throw new HttpError(400, 'Invalid status. Must be AVAILABLE, BUSY, or OFFLINE');
    }

    const updated = await riderService.updateRiderStatus(riderId, status);

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updated,
    });
  })
);

/**
 * Get rider's performance stats
 * GET /api/riders/me/stats
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const riderId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();

    if (!riderId) {
      throw new HttpError(401, 'User not authenticated');
    }

    if (userRole !== 'RIDER') {
      throw new HttpError(403, 'Access denied: Only riders can access this endpoint');
    }

    const rider = await riderService.getRiderById(riderId);

    return res.status(200).json({
      success: true,
      message: 'Rider stats retrieved successfully',
      data: {
        totalDeliveries: rider.totalDeliveries || 0,
        rating: rider.rating || 0,
        status: rider.status,
        assignedParcelsCount: (rider.assignedParcels || []).length,
      },
    });
  })
);

export default router;
