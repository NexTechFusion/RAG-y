import { Router, Request, Response } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { DepartmentController } from '@/controllers/department.controller';
import { validateRequest } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { authValidation } from '@/utils/validation/auth.validation';

const router = Router();

// Debug middleware for registration
const debugRegistration = (req: Request, res: Response, next: any) => {
  console.log('=== REGISTRATION DEBUG ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('==========================');
  next();
};

// Public departments endpoint for registration
router.get('/departments', asyncHandler(async (req: Request, res: Response) => {
  // Get basic department info for registration dropdown
  const departments = await DepartmentController.getPublicDepartments();
  res.json({
    success: true,
    message: 'Departments retrieved successfully',
    data: departments
  });
}));

// Authentication routes
router.post('/register', debugRegistration, validateRequest(authValidation.register), asyncHandler(AuthController.register));
router.post('/login', validateRequest(authValidation.login), asyncHandler(AuthController.login));
router.post('/refresh', validateRequest(authValidation.refresh), asyncHandler(AuthController.refreshToken));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/forgot-password', validateRequest(authValidation.forgotPassword), asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', validateRequest(authValidation.resetPassword), asyncHandler(AuthController.resetPassword));

export { router as authRoutes }; 