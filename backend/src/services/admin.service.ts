import { ShipmentRepository } from '../repositories/shipment.repository';
import { RiderRepository } from '../repositories/rider.repository';
import { UserRepository } from '../repositories/user.repository';

const shipmentRepository = new ShipmentRepository();
const riderRepository = new RiderRepository();
const userRepository = new UserRepository();

export class AdminService {
  async getDashboardStats() {
    // Get shipment stats
    const shipmentStats = await shipmentRepository.getStats();
    
    // Get rider stats
    const riderStats = await riderRepository.getStats();
    
    // Get total revenue
    const totalRevenue = await shipmentRepository.getTotalRevenue();
    
    // Get total users
    const totalCustomers = await userRepository.countByRole('CUSTOMER');
    const totalStaff = await userRepository.countByRole('STAFF');
    const totalAdmins = await userRepository.countByRole('ADMIN');

    return {
      shipments: {
        total: shipmentStats.total,
        pending: shipmentStats.pending,
        pickedUp: shipmentStats.pickedUp,
        inTransit: shipmentStats.inTransit,
        outForDelivery: shipmentStats.outForDelivery,
        delivered: shipmentStats.delivered,
        failed: shipmentStats.failed,
        cancelled: shipmentStats.cancelled,
      },
      riders: {
        total: riderStats.total,
        available: riderStats.available,
        busy: riderStats.busy,
        offline: riderStats.offline,
      },
      users: {
        totalCustomers,
        totalStaff,
        totalAdmins,
        totalUsers: totalCustomers + totalStaff + totalAdmins,
      },
      revenue: {
        total: totalRevenue,
      },
    };
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date) {
    const revenue = await shipmentRepository.getRevenueByDateRange(startDate, endDate);
    return { revenue, startDate, endDate };
  }

  async getRecentShipments(limit: number = 10) {
    const { shipments } = await shipmentRepository.findAll({}, 1, limit);
    return shipments;
  }

  async getShipmentsByStatus(status: string, page: number = 1, limit: number = 10) {
    return await shipmentRepository.findAll({ status }, page, limit);
  }

  async getShipmentsByDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 10) {
    return await shipmentRepository.findAll({ startDate, endDate }, page, limit);
  }

  // User Management Methods
  async createUser(userData: any) {
    return await userRepository.create(userData);
  }

  async getAllUsers(options: any) {
    const { page = 1, limit = 10, role, search } = options;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    return await userRepository.findAll(filter, page, limit);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateData: any) {
    return await userRepository.update(id, updateData);
  }

  async deleteUser(id: string) {
    return await userRepository.delete(id);
  }
}

export const adminService = new AdminService();