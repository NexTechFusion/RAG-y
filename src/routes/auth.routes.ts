import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { authValidation } from '@/utils/validation/auth.validation';

const router = Router();

// Authentication routes
router.post('/register', validateRequest(authValidation.register), asyncHandler(AuthController.register));
router.post('/login', validateRequest(authValidation.login), asyncHandler(AuthController.login));
router.post('/refresh', validateRequest(authValidation.refresh), asyncHandler(AuthController.refreshToken));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/forgot-password', validateRequest(authValidation.forgotPassword), asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', validateRequest(authValidation.resetPassword), asyncHandler(AuthController.resetPassword));

export { router as authRoutes }; 