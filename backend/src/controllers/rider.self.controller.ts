import { Request, Response } from 'express';
import { userRiderService } from '../services/user.rider.service';
import { ShipmentService } from '../services/shipment.service';
import { socketEventManager } from '../services/socket.event.manager';
import { HttpError } from '../errors/http-error';

const shipmentService = new ShipmentService();

/**
 * Rider Self-Service Controller
 * Handles endpoints for authenticated riders managing their own profile and shipments
 */
class RiderSelfController {
  /**
   * Get current authenticated rider's profile
   * GET /api/riders/me
   */
  async getProfile(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    
    const user = await userRiderService.getRiderByUserId(userId);

    return res.status(200).json({
      success: true,
      message: 'Rider profile retrieved successfully',
      data: user,
    });
  }

  /**
   * Update current authenticated rider's profile
   * PUT /api/riders/me
   * Body: { name?, email?, phoneNumber?, vehicleType?, vehicleNumber? }
   */
  async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    const updated = await userRiderService.updateRiderProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Rider profile updated successfully',
      data: updated,
    });
  }

  /**
   * Get current rider's assigned shipments
   * GET /api/riders/me/shipments
   * Query params: ?page=1&limit=10&status=IN_TRANSIT
   */
  async getAssignedShipments(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { page = '1', limit = '10', status } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    console.log(`\n[GetAssignedShipments] ========== START ==========`);
    console.log(`[GetAssignedShipments] User ID: ${userId}`);
    console.log(`[GetAssignedShipments] Page: ${pageNum}, Limit: ${limitNum}`);

    // Verify user is a rider
    const user = await userRiderService.getRiderByUserId(userId);
    
    if (!user) {
      console.error(`[GetAssignedShipments] Rider user not found for user ${userId}`);
      throw new HttpError(404, 'User not found');
    }

    console.log(`[GetAssignedShipments] Found user:`, {
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
    });

    // Build filters for rider's assigned shipments using riderUserId
    const filters: any = {
      riderUserId: user._id,
    };

    console.log(`[GetAssignedShipments] Query filter - riderUserId: ${user._id?.toString()}`);

    if (status) {
      filters.status = status;
      console.log(`[GetAssignedShipments] Additional status filter: ${status}`);
    }

    const { shipments, total } = await shipmentService.getAllShipments(filters, pageNum, limitNum);

    console.log(`[GetAssignedShipments] Found ${shipments.length} assigned shipments out of ${total} total`);
    shipments.forEach((s, idx) => {
      console.log(`  [${idx + 1}] ID: ${s._id}, Status: ${s.status}, RiderUserId: ${s.riderUserId?.toString()}`);
    });
    console.log(`[GetAssignedShipments] ========== END (200) ==========\n`);

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
  }

  /**
   * Get available shipments (not assigned to any rider)
   * GET /api/riders/me/available-shipments
   * Query params: ?page=1&limit=10
   */
  async getAvailableShipments(req: Request, res: Response) {
    const { page = '1', limit = '10' } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    console.log(`\n[GetAvailableShipments] ========== START ==========`);
    console.log(`[GetAvailableShipments] Page: ${pageNum}, Limit: ${limitNum}`);

    const { shipments, total } = await shipmentService.getAvailableShipments(pageNum, limitNum);

    console.log(`[GetAvailableShipments] Found ${shipments.length} available shipments out of ${total} total`);
    shipments.forEach((s, idx) => {
      console.log(`  [${idx + 1}] ID: ${s._id}, Status: ${s.status}, RiderId: ${s.riderId}`);
    });
    console.log(`[GetAvailableShipments] ========== END (200) ==========\n`);

    return res.status(200).json({
      success: true,
      message: 'Available shipments retrieved successfully',
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: shipments,
      },
    });
  }

  /**
   * Get single shipment details
   * Riders: Can view unassigned shipments (to accept) or assigned to them
   * Customers: Can view their own shipments
   * GET /api/riders/me/shipments/:shipmentId
   */
  async getShipmentDetails(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const { shipmentId } = req.params;

    console.log(`\n[ShipmentDetails] ========== START ==========`);
    console.log(`[ShipmentDetails] User: ${userId}, Role: ${userRole}, ShipmentId: ${shipmentId}`);

    try {
      // Fetch shipment
      let shipment;
      try {
        shipment = await shipmentService.getById(shipmentId);
        console.log(` [ShipmentDetails] Shipment found - ID: ${shipment._id}`);
        console.log(`[ShipmentDetails] Shipment details - riderId: ${shipment.riderId}, customerId: ${shipment.customerId}`);
      } catch (shipmentError: any) {
        console.error(` [ShipmentDetails] Error fetching shipment:`, shipmentError.message);
        throw shipmentError;
      }

      // Authorization logic
      let hasPermission = false;
      let riderContext: any = null; // For tracking rider-specific context

      if (userRole === 'RIDER') {
        console.log(`[ShipmentDetails] Authorization type: RIDER`);
        
        // Get rider profile
        let user;
        try {
          user = await userRiderService.getRiderByUserId(userId);
          if (!user) {
            console.log(` [ShipmentDetails] Rider not found for userId: ${userId}`);
            throw new HttpError(404, 'Rider profile not found');
          }
          console.log(` [ShipmentDetails] Rider found - ID: ${user._id}`);
        } catch (riderError: any) {
          console.log(` [ShipmentDetails] Error getting rider:`, riderError.message);
          throw riderError;
        }

        // Riders can view:
        // 1. Unassigned shipments (riderUserId is null/undefined) - available for acceptance/rejection
        // 2. Shipments already assigned to them
        // 3. Even shipments assigned to other riders (but can't update them)
        const isUnassigned = !shipment.riderUserId;
        const isAssignedToRider = shipment.riderUserId?.toString() === user._id.toString();
        const isAssignedToOther = !!(shipment.riderUserId && !isAssignedToRider);

        console.log(`[ShipmentDetails] Rider authorization checks:`);
        console.log(`  - isUnassigned: ${isUnassigned}`);
        console.log(`  - isAssignedToRider: ${isAssignedToRider}`);
        console.log(`  - isAssignedToOther: ${isAssignedToOther}`);

        // Riders can view unassigned, theirs, or others' (but with limited actions)
        hasPermission = isUnassigned || isAssignedToRider || isAssignedToOther;

        // Build context for response
        riderContext = {
          isUnassigned,
          isAssignedToMe: isAssignedToRider,
          isAssignedToOther,
          riderId: user._id,
        };
      } else if (userRole === 'CUSTOMER') {
        console.log(`[ShipmentDetails] Authorization type: CUSTOMER`);
        hasPermission = shipment.customerId?.toString() === userId;
        console.log(`[ShipmentDetails] Customer check - customerId: ${shipment.customerId?.toString()}, userId: ${userId}, match: ${hasPermission}`);
      } else {
        console.log(`[ShipmentDetails] ⚠️ Unknown role: ${userRole}`);
      }

      if (!hasPermission) {
        console.log(` [ShipmentDetails] Permission DENIED - Role: ${userRole}`);
        console.log(`[ShipmentDetails] ========== END (403) ==========\n`);
        throw new HttpError(403, `User with role ${userRole} does not have permission to view this shipment`);
      }

      console.log(` [ShipmentDetails] Permission GRANTED`);
      console.log(`[ShipmentDetails] ========== END (200) ==========\n`);

      // Build response with action hints for riders
      const response: any = {
        success: true,
        message: 'Shipment retrieved successfully',
        data: shipment,
      };

      if (userRole === 'RIDER' && riderContext) {
        response.riderContext = {
          isUnassigned: riderContext.isUnassigned,
          isAssignedToMe: riderContext.isAssignedToMe,
          isAssignedToOther: riderContext.isAssignedToOther,
          availableActions: {
            canView: true,
            canAccept: riderContext.isUnassigned && shipment.status === 'PENDING',
            canReject: riderContext.isUnassigned && shipment.status === 'PENDING',
            canUpdateStatus: riderContext.isAssignedToMe && shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED',
          },
        };
      }

      return res.status(200).json(response);
    } catch (error: any) {
      console.error(` [ShipmentDetails] CAUGHT ERROR:`, error.message);
      console.log(`[ShipmentDetails] ========== END (ERROR) ==========\n`);
      throw error;
    }
  }

  /**
   * Update shipment status for rider's assigned shipment
   * PUT /api/riders/me/shipments/:shipmentId/status
   * Body: { status: string, message?: string, location?: string }
   */
  async updateShipmentStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { shipmentId } = req.params;
    const { status, message, location } = req.body;

    console.log(`\n[UpdateShipmentStatus] ========== START ==========`);
    console.log(`[UpdateShipmentStatus] User: ${userId}, ShipmentId: ${shipmentId}, Status: ${status}`);

    if (!status) {
      throw new HttpError(400, 'Status is required');
    }

    // Get rider profile
    const user = await userRiderService.getRiderByUserId(userId);

    if (!user) {
      console.error(`[UpdateShipmentStatus] Rider not found for userId: ${userId}`);
      throw new HttpError(404, 'Rider profile not found');
    }

    console.log(`[UpdateShipmentStatus] Rider found - ID: ${user._id}`);

    // Verify shipment exists and is assigned to this rider
    const shipment = await shipmentService.getById(shipmentId);

    console.log(`\n[UpdateShipmentStatus] === VERIFICATION ===`);
    console.log(`  User._id (from token): ${userId}`);
    console.log(`  Rider._id: ${user._id.toString()}`);
    console.log(`  Shipment.status: ${shipment.status}`);
    console.log(`  Shipment.riderUserId (stored value): ${shipment.riderUserId?.toString() || 'NULL'}`);
    console.log(`\n[UpdateShipmentStatus] === ID COMPARISON ===`);
    const shipmentRiderIdStr = shipment.riderUserId?.toString() || '';
    const riderIdStr = user._id.toString();
    console.log(`  Shipment.riderUserId: '${shipmentRiderIdStr}'`);
    console.log(`  Current Rider._id: '${riderIdStr}'`);
    console.log(`  Match? ${shipmentRiderIdStr === riderIdStr}`);

    // Check 1: Shipment must be assigned to this rider
    // if (shipmentRiderIdStr !== riderIdStr) {
    //   console.error(`[UpdateShipmentStatus] Rider not assigned to this shipment`);
    //   if (!shipment.riderUserId) {
    //     throw new HttpError(403, 'Shipment not accepted. You must accept this delivery first before updating its status.');
    //   } else {
    //     throw new HttpError(403, 'This delivery is assigned to another rider. Only the assigned rider can update its status.');
    //   }
    // }

    // Check 2: Cannot update if already delivered or cancelled
    if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(shipment.status)) {
      console.error(`[UpdateShipmentStatus] Cannot update ${shipment.status} shipment`);
      throw new HttpError(400, `Cannot update shipment with status: ${shipment.status}`);
    }

    console.log(`[UpdateShipmentStatus] Permission granted - updating status from ${shipment.status} to ${status}`);

    // Update shipment status with event
    const eventData = {
      message: message || `Status updated to ${status}`,
      location: location,
    };

    const updated = await shipmentService.updateShipmentStatus(shipmentId, status, eventData);

    // If delivered, increment rider's delivery count
    if (status === 'DELIVERED') {
      await userRiderService.incrementDeliveries(userId);
    }

    if(!updated){
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or not updated',
    });
    }

    // Emit real-time event to customer
    try {
      if (updated.customerId) {
        socketEventManager.emitShipmentStatusUpdated(
          updated.customerId.toString(),
          {
            shipmentId: updated._id.toString(),
            trackingNumber: updated.trackingNumber,
            oldStatus: shipment.status,
            newStatus: status,
            message: eventData.message,
            location: eventData.location,
            updatedAt: new Date().toISOString(),
            timeline: {
              status,
              message: eventData.message,
              timestamp: new Date().toISOString(),
              location: eventData.location,
            },
          }
        );
      }
    } catch (socketError) {
      console.error('Failed to emit shipment:status_updated event:', socketError);
      // Don't fail the update if socket emission fails
    }

    console.log(`[UpdateShipmentStatus] Status updated successfully`);
    console.log(`[UpdateShipmentStatus] ========== END (200) ==========\n`);

    return res.status(200).json({
      success: true,
      message: 'Shipment status updated successfully',
      data: updated,
    });
  }

  /**
   * Update current rider's location
   * PUT /api/riders/me/location
   * Body: { latitude: number, longitude: number, address?: string }
   */
  async updateLocation(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { latitude, longitude, address } = req.body;

    if (latitude === undefined || longitude === undefined) {
      throw new HttpError(400, 'Latitude and longitude are required');
    }

    // Update rider location
    const locationData = { latitude, longitude, address };
    const updated = await userRiderService.updateRiderLocation(userId, locationData);

    if (!updated) {
      throw new HttpError(404, 'Rider profile not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updated,
    });
  }

  /**
   * Update current rider's availability status
   * PUT /api/riders/me/status
   * Body: { status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' }
   */
  async updateStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { status } = req.body;

    if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(status)) {
      throw new HttpError(400, 'Invalid status. Must be AVAILABLE, BUSY, or OFFLINE');
    }

    // Update rider status
    const updated = await userRiderService.updateRiderStatus(userId, status);

    if (!updated) {
      throw new HttpError(404, 'Rider profile not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updated,
    });
  }

  /**
   * Accept a shipment - Rider claims an available delivery
   * POST /api/riders/me/shipments/:shipmentId/accept
   * Body: { reason?: string }
   */
  async acceptShipment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { shipmentId } = req.params;

    console.log(`\n[AcceptShipment] ========== START ==========`);
    console.log(`[AcceptShipment] userId (from auth token): ${userId}`);
    console.log(`[AcceptShipment] ShipmentId: ${shipmentId}`);

    // Verify user has RIDER role
    const user = await userRiderService.getRiderByUserId(userId);

    if (!user) {
      console.error(`[AcceptShipment] User not found for userId: ${userId}`);
      throw new HttpError(404, 'User not found');
    }

    console.log(`\n[AcceptShipment] === USER VERIFICATION ===`);
    console.log(`  User._id: ${user._id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Will save to Shipment.riderUserId: ${user._id.toString()}`);

    try {
      const accepted = await shipmentService.acceptShipment(shipmentId, user._id.toString());
      
      console.log(` [AcceptShipment] Shipment accepted successfully`);
      

      if(!accepted){
        return res.status(404).json({
          success: false,
          message: 'Shipment not found or not accepted',
      });
      }
      // Emit real-time event to customer
      try {
        if (accepted.customerId) {
          socketEventManager.emitShipmentAccepted(
            String(accepted.customerId),
            {
              shipmentId: accepted._id.toString(),
              trackingNumber: accepted.trackingNumber,
              status: accepted.status,
              riderId: String(user._id),
              riderName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              riderPhoneNumber: user.phoneNumber || '',
              message: `Your parcel ${accepted.trackingNumber} has been accepted and is being picked up`,
              acceptedAt: new Date().toISOString(),
            }
          );
        }
      } catch (socketError) {
        console.error('Failed to emit shipment:accepted event:', socketError);
        // Don't fail the acceptance if socket emission fails
      }

      console.log(`[AcceptShipment] ========== END (200) ==========\n`);

      return res.status(200).json({
        success: true,
        message: 'Delivery accepted! Status changed to ASSIGNED. You can now update its status (PICKED_UP, IN_TRANSIT, DELIVERED, etc.). It appears in your \"My Deliveries\".',
        data: accepted,
      });
    } catch (error: any) {
      console.error(` [AcceptShipment] Error:`, error.message);
      console.log(`[AcceptShipment] ========== END (ERROR) ==========\n`);
      throw error;
    }
  }

  /**
   * Reject a shipment - Rider declines an available delivery
   * POST /api/riders/me/shipments/:shipmentId/reject
   * Body: { reason?: string }
   */
  async rejectShipment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { shipmentId } = req.params;
    const { reason } = req.body;

    console.log(`\n[RejectShipment] ========== START ==========`);
    console.log(`[RejectShipment] Rider userId: ${userId}, ShipmentId: ${shipmentId}, Reason: ${reason || 'Not provided'}`);

    // Get rider profile
    const user = await userRiderService.getRiderByUserId(userId);

    if (!user) {
      console.error(`[RejectShipment] Rider not found for userId: ${userId}`);
      throw new HttpError(404, 'Rider profile not found');
    }

    console.log(`[RejectShipment] Rider found - ID: ${user._id}`);

    try {
      const rejected = await shipmentService.rejectShipment(shipmentId, user._id.toString(), reason);
      
      console.log(` [RejectShipment] Shipment rejected successfully - remains available for other riders`);
      console.log(`[RejectShipment] ========== END (200) ==========\n`);

      return res.status(200).json({
        success: true,
        message: 'Shipment rejected. It remains available for other riders',
        data: rejected,
      });
    } catch (error: any) {
      console.error(` [RejectShipment] Error:`, error.message);
      console.log(`[RejectShipment] ========== END (ERROR) ==========\n`);
      throw error;
    }
  }

  /**
   * Get current rider's performance statistics
   * GET /api/riders/me/stats
   */
  async getStats(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    const user = await userRiderService.getRiderByUserId(userId);
    if (!user) {
      throw new HttpError(404, 'Rider profile not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Rider stats retrieved successfully',
      data: {
        totalDeliveries: user?.totalDeliveries || 0,
        rating: user?.rating || 0,
        status: user?.riderStatus,
        assignedParcelsCount: (user?.assignedParcels || []).length,
      },
    });
  }

  /**
   * Update payment status for accepted shipment
   * PATCH /api/riders/me/shipments/:shipmentId/payment-status
   * Body: { paymentStatus: 'PENDING' | 'PAID' | 'COD' }
   * Only the assigned rider can update payment status
   */
  async updatePaymentStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { shipmentId } = req.params;
    const { paymentStatus } = req.body;

    console.log(`\n[UpdatePaymentStatus] ========== START ==========`);
    console.log(`[UpdatePaymentStatus] Rider: ${userId}, ShipmentId: ${shipmentId}, NewStatus: ${paymentStatus}`);

    if (!paymentStatus) {
      throw new HttpError(400, 'Payment status is required');
    }

    // Get rider profile to ensure we use the correct _id
    const user = await userRiderService.getRiderByUserId(userId);
    if (!user) {
      throw new HttpError(404, 'Rider profile not found');
    }

    try {
      const updated = await shipmentService.updatePaymentStatus(shipmentId, user._id.toString(), paymentStatus);

      console.log(` [UpdatePaymentStatus] Payment status updated successfully`);
      console.log(`[UpdatePaymentStatus] ========== END (200) ==========\n`);

      return res.status(200).json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
        data: updated,
      });
    } catch (error: any) {
      console.error(` [UpdatePaymentStatus] Error:`, error.message);
      console.log(`[UpdatePaymentStatus] ========== END (ERROR) ==========\n`);
      throw error;
    }
  }
}

export default new RiderSelfController();
