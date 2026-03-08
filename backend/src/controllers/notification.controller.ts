import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/notification.service';
import { HttpError } from '../errors/http-error';

export class NotificationController {
  /**
   * Get pending notifications for the authenticated rider
   */
  async getPendingNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const notifications = await NotificationService.getPendingNotificationsForRider(
        currentUser.id
      );

      return res.status(200).json({
        success: true,
        message: 'Pending notifications retrieved successfully',
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all notifications for the authenticated rider with pagination
   */
  async getRiderNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const { page = 1, limit = 20, status, type } = req.query;

      const filters = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        status: status as string,
        type: type as string,
      };

      const notifications = await NotificationService.getRiderNotifications(
        currentUser.id,
        filters
      );

      return res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept a delivery
   */
  async acceptDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const { notificationId } = req.params;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      if (!notificationId) {
        throw new HttpError(400, 'Notification ID is required');
      }

      const result = await NotificationService.acceptDelivery(notificationId, currentUser.id);

      return res.status(200).json({
        success: true,
        message: 'Delivery accepted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject a delivery
   */
  async rejectDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const { notificationId } = req.params;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      if (!notificationId) {
        throw new HttpError(400, 'Notification ID is required');
      }

      const result = await NotificationService.rejectDelivery(notificationId, currentUser.id);

      return res.status(200).json({
        success: true,
        message: 'Delivery rejected',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const count = await NotificationService.getUnreadCount(currentUser.id);

      return res.status(200).json({
        success: true,
        message: 'Unread count retrieved',
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const { notificationId } = req.params;

      if (!currentUser || !currentUser.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      if (!notificationId) {
        throw new HttpError(400, 'Notification ID is required');
      }

      const result = await NotificationService.markAsRead(notificationId);

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
