import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/', authenticate, isAdmin, upload.single('avatar'), asyncHandler((req, res, next) => adminController.createUser(req, res, next)));
router.get('/', authenticate, isAdmin, asyncHandler((req, res, next) => adminController.getAllUsers(req, res, next)));
router.get('/:id', authenticate, isAdmin, asyncHandler((req, res, next) => adminController.getUserById(req, res, next)));
router.put('/:id', authenticate, isAdmin, upload.single('avatar'), asyncHandler((req, res, next) => adminController.updateUser(req, res, next)));
router.delete('/:id', authenticate, isAdmin, asyncHandler((req, res, next) => adminController.deleteUser(req, res, next)));

export default router;
