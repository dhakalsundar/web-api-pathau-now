import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/upload.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

let authController = new AuthController();
const router = Router();

router.post("/register", asyncHandler((req, res, next) => authController.register(req, res, next)));
router.post("/login", asyncHandler((req, res, next) => authController.login(req, res, next)));

// Admin: create user (multipart/form-data)
router.post('/user', authenticate, isAdmin, upload.single('avatar'), asyncHandler((req, res, next) => authController.createUserByAdmin(req, res, next)));

// Update user (authenticated; owner or admin)
router.put('/:id', authenticate, upload.single('avatar'), asyncHandler((req, res, next) => authController.update(req, res, next)));

export default router;