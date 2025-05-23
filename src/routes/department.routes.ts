import { Router } from 'express';
import { DepartmentController } from '@/controllers/department.controller';
import { validateRequest } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { 
  authenticateToken, 
  requirePermission 
} from '@/middleware/auth.middleware';
import { departmentValidation } from '@/utils/validation/department.validation';

const router = Router();

// All department routes require authentication
router.use(authenticateToken);

// Get all available permissions (helper endpoint for permission management)
router.get('/permissions', 
  requirePermission('manage_permissions'),
  asyncHandler(DepartmentController.getAvailablePermissions)
);

// Get all departments (requires departments.read or system admin permissions)
router.get('/', 
  requirePermission('view_users'), // Users with view_users can see departments for user management
  validateRequest(departmentValidation.getDepartmentsList),
  asyncHandler(DepartmentController.getDepartments)
);

// Get department by ID (requires departments.read permission)
router.get('/:id', 
  requirePermission('view_users'),
  validateRequest(departmentValidation.getDepartmentById),
  asyncHandler(DepartmentController.getDepartmentById)
);

// Get department statistics
router.get('/:id/stats', 
  requirePermission('view_users'),
  validateRequest(departmentValidation.getDepartmentById), // Reuse the validation for ID
  asyncHandler(DepartmentController.getDepartmentStats)
);

// Create new department (requires admin permissions)
router.post('/', 
  requirePermission('manage_permissions'), // Only admins/HR with manage_permissions can create departments
  validateRequest(departmentValidation.createDepartment),
  asyncHandler(DepartmentController.createDepartment)
);

// Update department (requires admin permissions)
router.put('/:id', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.updateDepartment),
  asyncHandler(DepartmentController.updateDepartment)
);

// Delete/deactivate department (requires admin permissions)
router.delete('/:id', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.deleteDepartment),
  asyncHandler(DepartmentController.deleteDepartment)
);

// Get department users (requires user management permissions)
router.get('/:id/users', 
  requirePermission('view_users'),
  validateRequest(departmentValidation.getDepartmentUsers),
  asyncHandler(DepartmentController.getDepartmentUsers)
);

// Get department permissions (requires admin permissions)
router.get('/:id/permissions', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.getDepartmentPermissions),
  asyncHandler(DepartmentController.getDepartmentPermissions)
);

// Get available permissions for a specific department (not already assigned)
router.get('/:id/permissions/available', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.getDepartmentById), // Reuse the validation for ID
  asyncHandler(DepartmentController.getAvailablePermissionsForDepartment)
);

// Add permission to department (requires admin permissions)
router.post('/:id/permissions', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.addDepartmentPermission),
  asyncHandler(DepartmentController.addDepartmentPermission)
);

// Remove permission from department (requires admin permissions)
router.delete('/:id/permissions/:permission_id', 
  requirePermission('manage_permissions'),
  validateRequest(departmentValidation.removeDepartmentPermission),
  asyncHandler(DepartmentController.removeDepartmentPermission)
);

export { router as departmentRoutes }; 