import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import NotificationController from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get pending notifications for authenticated rider
router.get(
  '/pending',
  asyncHandler((req, res, next) => NotificationController.getPendingNotifications(req, res, next))
);

// Get all notifications with pagination
router.get(
  '/',
  asyncHandler((req, res, next) => NotificationController.getRiderNotifications(req, res, next))
);

// Get unread notification count
router.get(
  '/count/unread',
  asyncHandler((req, res, next) => NotificationController.getUnreadCount(req, res, next))
);

// Accept a delivery
router.post(
  '/:notificationId/accept',
  asyncHandler((req, res, next) => NotificationController.acceptDelivery(req, res, next))
);

// Reject a delivery
router.post(
  '/:notificationId/reject',
  asyncHandler((req, res, next) => NotificationController.rejectDelivery(req, res, next))
);

// Mark as read
router.put(
  '/:notificationId/read',
  asyncHandler((req, res, next) => NotificationController.markAsRead(req, res, next))
);

export default router;
