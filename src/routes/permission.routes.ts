import { Router } from 'express';
import { validateRequest } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { 
  authenticateToken, 
  requirePermission,
  requireAnyPermission 
} from '@/middleware/auth.middleware';
import { permissionValidation } from '@/utils/validation/permission.validation';
import { PermissionController } from '@/controllers/permission.controller';

const router = Router();

// Get all permissions with optional category filtering
router.get('/', 
  authenticateToken,
  requirePermission('view_permissions'),
  validateRequest(permissionValidation.getPermissionsList),
  asyncHandler(PermissionController.getPermissions)
);

// Get permission categories
router.get('/categories', 
  authenticateToken,
  requirePermission('view_permissions'),
  asyncHandler(PermissionController.getCategories)
);

// Get permissions by category
router.get('/category/:category', 
  authenticateToken,
  requirePermission('view_permissions'),
  validateRequest(permissionValidation.getPermissionsByCategory),
  asyncHandler(PermissionController.getPermissionsByCategory)
);

// Get permission by ID
router.get('/:id', 
  authenticateToken,
  requirePermission('view_permissions'),
  validateRequest(permissionValidation.getPermissionById),
  asyncHandler(PermissionController.getPermissionById)
);

// Get permissions for a specific department
router.get('/department/:departmentId', 
  authenticateToken,
  requireAnyPermission(['view_permissions', 'manage_department_permissions']),
  validateRequest(permissionValidation.getDepartmentPermissions),
  asyncHandler(PermissionController.getDepartmentPermissions)
);

// Get available permissions for a department (not yet assigned)
router.get('/department/:departmentId/available', 
  authenticateToken,
  requirePermission('manage_department_permissions'),
  validateRequest(permissionValidation.getAvailablePermissions),
  asyncHandler(PermissionController.getAvailablePermissionsForDepartment)
);

// Get permissions for a specific user
router.get('/user/:userId', 
  authenticateToken,
  requireAnyPermission(['view_permissions', 'view_users']),
  validateRequest(permissionValidation.getUserPermissions),
  asyncHandler(PermissionController.getUserPermissions)
);

// Create new permission (system admin only)
router.post('/', 
  authenticateToken,
  requirePermission('create_permissions'),
  validateRequest(permissionValidation.createPermission),
  asyncHandler(PermissionController.createPermission)
);

// Update permission (system admin only)
router.put('/:id', 
  authenticateToken,
  requirePermission('edit_permissions'),
  validateRequest(permissionValidation.updatePermission),
  asyncHandler(PermissionController.updatePermission)
);

// Assign permission to department
router.post('/department/:departmentId/assign', 
  authenticateToken,
  requirePermission('manage_department_permissions'),
  validateRequest(permissionValidation.assignPermissionToDepartment),
  asyncHandler(PermissionController.assignPermissionToDepartment)
);

// Remove permission from department
router.delete('/department/:departmentId/permission/:permissionId', 
  authenticateToken,
  requirePermission('manage_department_permissions'),
  validateRequest(permissionValidation.removePermissionFromDepartment),
  asyncHandler(PermissionController.removePermissionFromDepartment)
);

// Deactivate permission (system admin only)
router.delete('/:id', 
  authenticateToken,
  requirePermission('delete_permissions'),
  validateRequest(permissionValidation.deletePermission),
  asyncHandler(PermissionController.deletePermission)
);

export { router as permissionRoutes }; 