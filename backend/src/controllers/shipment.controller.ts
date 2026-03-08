import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipment.service';
import { userRiderService } from '../services/user.rider.service';
import { HttpError } from '../errors/http-error';

const shipmentService = new ShipmentService();

class ShipmentController {
  async create(req: Request, res: Response) {
    const customerId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();

    // Ensure customerId is present for non-admin users
    if (!customerId) {
      throw new HttpError(401, 'User authentication required. Please log in to create a parcel.');
    }

    const shipment = await shipmentService.createShipment(req.body, customerId, userRole);

    return res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      data: shipment,
    });
  }

  async getAll(req: Request, res: Response) {
    const { page = '1', limit = '10', status, trackingNumber, riderUserId, customerId, paymentStatus, deliveryType, startDate, endDate } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();

    const filters: any = {};
    if (status) filters.status = status;
    if (trackingNumber) filters.trackingNumber = trackingNumber;
    if (riderUserId) filters.riderUserId = riderUserId;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (deliveryType) filters.deliveryType = deliveryType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // Role-based filtering for security
    const isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';
    
    if (isAdmin) {
      // Admins can see all shipments or filter by specific customer
      if (customerId) {
        filters.customerId = customerId;
      }
    } else {
      // Regular users can only see their own shipments
      filters.customerId = userId;
    }

    const { shipments, total } = await shipmentService.getAllShipments(filters, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      message: 'Parcels retrieved successfully',
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: shipments,
      },
    });
  }

  async search(req: Request, res: Response) {
    const { q, page = '1', limit = '10' } = req.query as Record<string, string>;
    if (!q) throw new HttpError(400, 'Search query is required');

    const result = await shipmentService.searchShipments(q, parseInt(page, 10), parseInt(limit, 10));
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async getStats(req: Request, res: Response) {
    const stats = await shipmentService.getShipmentStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  }

  async getById(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const shipment = await shipmentService.getById(req.params.id);

    console.log(` [ShipmentController] getById - User: ${userId}, Role: ${userRole}`);
    console.log(`   Shipment Customer: ${shipment.customerId}`);

    // Security check: Only owner or admin can view
  
   

    console.log(` Shipment retrieved successfully`);
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  }

  async update(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();

    const shipment = await shipmentService.getById(req.params.id);

  

    const updated = await shipmentService.updateShipment(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Parcel updated successfully',
      data: updated,
    });
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';

    const shipment = await shipmentService.getById(req.params.id);



    const result = await shipmentService.deleteShipment(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  async addEvent(req: Request, res: Response) {
    const shipment = await shipmentService.addEvent(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Event added successfully',
      data: shipment,
    });
  }

  async publicTrack(req: Request, res: Response) {
    const shipment = await shipmentService.getByTrackingNumber(req.params.trackingNumber);
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  }

  async track(req: Request, res: Response) {
    return this.publicTrack(req, res);
  }
}

export default new ShipmentController();
