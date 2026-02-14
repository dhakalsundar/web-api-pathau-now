import { Request, Response } from 'express';
import { riderService } from '../services/rider.service';
import { ShipmentService } from '../services/shipment.service';
import { HttpError } from '../errors/http-error';

const shipmentService = new ShipmentService();

class RiderController {
  async create(req: Request, res: Response) {
    const rider = await riderService.createRider(req.body);
    return res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: rider,
    });
  }

  async getAll(req: Request, res: Response) {
    const { page = '1', limit = '10', status, isActive } = req.query as Record<string, string>;
    const filters: any = {};
    if (status) filters.status = status;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const riders = await riderService.getAllRiders(filters, parseInt(page, 10), parseInt(limit, 10));
    return res.status(200).json({
      success: true,
      data: riders,
    });
  }

  async getById(req: Request, res: Response) {
    const rider = await riderService.getRiderById(req.params.id);
    return res.status(200).json({
      success: true,
      data: rider,
    });
  }

  async update(req: Request, res: Response) {
    const rider = await riderService.updateRider(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Rider updated successfully',
      data: rider,
    });
  }

  async remove(req: Request, res: Response) {
    const result = await riderService.deleteRider(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  async assign(req: Request, res: Response) {
    const { shipmentId } = req.body as { shipmentId?: string };
    if (!shipmentId) throw new HttpError(400, 'shipmentId is required');

    const shipment = await shipmentService.assignRiderToShipment(shipmentId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Shipment assigned successfully',
      data: shipment,
    });
  }
}

export default new RiderController();
