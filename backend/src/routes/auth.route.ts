import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { upload } from "../middleware/upload.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateBody } from "../validators/validate.middleware";
import { registerSchema, loginSchema } from "../validators/schemas";
import { loginLimiter, refreshLimiter, otpRequestLimiter, otpVerifyLimiter } from "../middleware/rateLimiter.middleware";
import { ForgotPasswordDTO, VerifyOtpDTO, ResetPasswordDTO } from "../dtos/user.dto";

let authController = new AuthController();
const router = Router();

// Apply rate limiting to auth endpoints
router.post("/register", validateBody(registerSchema), asyncHandler((req, res, next) => authController.register(req, res, next)));
router.post("/login", loginLimiter, validateBody(loginSchema), asyncHandler((req, res, next) => authController.login(req, res, next)));
router.post("/refresh", refreshLimiter, asyncHandler((req, res, next) => authController.refresh(req, res, next)));

// Forgot Password Flow
router.post("/forgot-password", otpRequestLimiter, validateBody(ForgotPasswordDTO), asyncHandler((req, res, next) => authController.forgotPassword(req, res, next)));
router.post("/verify-otp", otpVerifyLimiter, validateBody(VerifyOtpDTO), asyncHandler((req, res, next) => authController.verifyOtp(req, res, next)));
router.post("/reset-password", validateBody(ResetPasswordDTO), asyncHandler((req, res, next) => authController.resetPassword(req, res, next)));

// Admin: create user (multipart/form-data)
router.post('/user', authenticate, isAdmin, upload.single('avatar'), asyncHandler((req, res, next) => authController.createUserByAdmin(req, res, next)));

// Get current user profile (authenticated users only)
router.get('/me', authenticate, asyncHandler((req, res, next) => authController.getCurrentUser(req, res, next)));

// Update current user profile (authenticated users only)
router.put('/me', authenticate, upload.single('avatar'), asyncHandler((req, res, next) => authController.updateCurrentUser(req, res, next)));

// Upload/update profile picture (authenticated users only)
router.put('/me/avatar', authenticate, upload.single('avatar'), asyncHandler((req, res, next) => authController.updateAvatar(req, res, next)));

// Update user (authenticated; owner or admin) - keep this last so /me is matched first
router.put('/:id', authenticate, upload.single('avatar'), asyncHandler((req, res, next) => authController.update(req, res, next)));

export default router;