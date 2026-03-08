import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { ShipmentService } from '../services/shipment.service';
import { HttpError } from '../errors/http-error';

const userService = new UserService();
const userRepository = new UserRepository();
const shipmentService = new ShipmentService();

class RiderController {
  async create(req: Request, res: Response) {
    // Create a user with role='RIDER'
    const userData = {
      ...req.body,
      role: 'RIDER',
      riderStatus: req.body.riderStatus || 'OFFLINE',
    };
    const user = await userService.createUser(userData);
    return res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: user,
    });
  }

  async getAll(req: Request, res: Response) {
    const { page = '1', limit = '10', riderStatus, isActive } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const filters: any = {};
    if (riderStatus) filters.riderStatus = riderStatus;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const { riders, total } = await userRepository.findRidersWithFilters(filters, pageNum, limitNum);
    return res.status(200).json({
      success: true,
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: riders,
      },
    });
  }

  async search(req: Request, res: Response) {
    const { search = '', page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const { riders, total } = await userRepository.searchRiders(search, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: riders,
      },
    });
  }

  async getById(req: Request, res: Response) {
    const rider = await userRepository.findById(req.params.id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }
    return res.status(200).json({
      success: true,
      data: rider,
    });
  }

  async update(req: Request, res: Response) {
    const rider = await userRepository.update(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Rider updated successfully',
      data: rider,
    });
  }

  async remove(req: Request, res: Response) {
    const result = await userRepository.delete(req.params.id);
    if (!result) {
      throw new HttpError(404, 'Rider not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Rider deleted successfully',
    });
  }

  async assign(req: Request, res: Response) {
    const { shipmentId } = req.body as { shipmentId?: string };
    if (!shipmentId) throw new HttpError(400, 'shipmentId is required');

    const shipment = await shipmentService.assignRiderToShipment(shipmentId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Parcel assigned successfully',
      data: shipment,
    });
  }
}

export default new RiderController();
