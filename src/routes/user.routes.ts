import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { validateRequest } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { 
  authenticateToken, 
  requirePermission,
  requireAnyPermission 
} from '@/middleware/auth.middleware';
import { userValidation } from '@/utils/validation/user.validation';

const router = Router();

// Get current user profile (no special permissions needed)
router.get('/me', 
  authenticateToken, 
  asyncHandler(UserController.getCurrentUser)
);

// Get all users (requires view_users permission)
router.get('/', 
  authenticateToken,
  requirePermission('view_users'),
  validateRequest(userValidation.getUsersList),
  asyncHandler(UserController.getUsers)
);

// Get user by ID (users can view their own profile, or need view_users permission)
router.get('/:id', 
  authenticateToken,
  validateRequest(userValidation.getUserById),
  asyncHandler(UserController.getUserById)
);

// Create new user (requires create_users permission)
router.post('/', 
  authenticateToken,
  requirePermission('create_users'),
  validateRequest(userValidation.createUser),
  asyncHandler(UserController.createUser)
);

// Update user (users can update their own profile, or need edit_users permission)
router.put('/:id', 
  authenticateToken,
  validateRequest(userValidation.updateUser),
  asyncHandler(UserController.updateUser)
);

// Change user password (users can change their own password, or need edit_users permission)
router.patch('/:id/password', 
  authenticateToken,
  validateRequest(userValidation.changeUserPassword),
  asyncHandler(UserController.changeUserPassword)
);

// Delete/deactivate user (requires delete_users permission)
router.delete('/:id', 
  authenticateToken,
  requirePermission('delete_users'),
  validateRequest(userValidation.deleteUser),
  asyncHandler(UserController.deleteUser)
);

export { router as userRoutes }; 