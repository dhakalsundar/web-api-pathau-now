import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

class AdminAnalyticsController {
  async stats(req: Request, res: Response) {
    const data = await adminService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data,
    });
  }
}

export default new AdminAnalyticsController();
