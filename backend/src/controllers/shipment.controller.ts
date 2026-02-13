import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipment.service';
import { HttpError } from '../errors/http-error';

const shipmentService = new ShipmentService();

class ShipmentController {
  async create(req: Request, res: Response) {
    const customerId = (req as any).user?.id;
    const shipment = await shipmentService.createShipment(req.body, customerId);

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment,
    });
  }

  async getAll(req: Request, res: Response) {
    const { page = '1', limit = '10', status, riderId, customerId, paymentStatus, deliveryType, startDate, endDate } = req.query as Record<string, string>;

    const filters: any = {};
    if (status) filters.status = status;
    if (riderId) filters.riderId = riderId;
    if (customerId) filters.customerId = customerId;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (deliveryType) filters.deliveryType = deliveryType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const result = await shipmentService.getAllShipments(filters, parseInt(page, 10), parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      data: result,
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
    const shipment = await shipmentService.getById(req.params.id);
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  }

  async update(req: Request, res: Response) {
    const shipment = await shipmentService.updateShipment(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipment,
    });
  }

  async delete(req: Request, res: Response) {
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
