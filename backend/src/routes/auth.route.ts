import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/upload.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateBody } from "../validators/validate.middleware";
import { registerSchema, loginSchema } from "../validators/schemas";
import { loginLimiter, refreshLimiter } from "../middleware/rateLimiter.middleware";

let authController = new AuthController();
const router = Router();

// Apply rate limiting to auth endpoints
router.post("/register", validateBody(registerSchema), asyncHandler((req, res, next) => authController.register(req, res, next)));
router.post("/login", loginLimiter, validateBody(loginSchema), asyncHandler((req, res, next) => authController.login(req, res, next)));
router.post("/refresh", refreshLimiter, asyncHandler((req, res, next) => authController.refresh(req, res, next)));

// Admin: create user (multipart/form-data)
router.post('/user', authenticate, isAdmin, upload.single('avatar'), asyncHandler((req, res, next) => authController.createUserByAdmin(req, res, next)));

// Update user (authenticated; owner or admin)
router.put('/:id', authenticate, upload.single('avatar'), asyncHandler((req, res, next) => authController.update(req, res, next)));

export default router;