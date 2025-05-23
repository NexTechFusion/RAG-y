import { z } from 'zod';

// Common validation rules
const uuidSchema = z.string().uuid('Invalid UUID format');
const permissionNameSchema = z.string()
  .min(1, 'Permission name is required')
  .max(100, 'Permission name too long')
  .regex(/^[a-z_]+$/, 'Permission name must contain only lowercase letters and underscores');

// Create permission validation
export const createPermissionSchema = z.object({
  body: z.object({
    permission_name: permissionNameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Update permission validation
export const updatePermissionSchema = z.object({
  body: z.object({
    permission_name: permissionNameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
    is_active: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get permission by ID validation
export const getPermissionByIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get permissions list validation
export const getPermissionsListSchema = z.object({
  body: z.object({}),
  query: z.object({
    category: z.string().optional(),
  }),
  params: z.object({}),
});

// Get permissions by category validation
export const getPermissionsByCategorySchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    category: z.string().min(1, 'Category is required'),
  }),
});

// Get department permissions validation
export const getDepartmentPermissionsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    departmentId: uuidSchema,
  }),
});

// Get available permissions for department validation
export const getAvailablePermissionsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    departmentId: uuidSchema,
  }),
});

// Get user permissions validation
export const getUserPermissionsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    userId: uuidSchema,
  }),
});

// Assign permission to department validation
export const assignPermissionToDepartmentSchema = z.object({
  body: z.object({
    permission_id: uuidSchema,
  }),
  query: z.object({}),
  params: z.object({
    departmentId: uuidSchema,
  }),
});

// Remove permission from department validation
export const removePermissionFromDepartmentSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    departmentId: uuidSchema,
    permissionId: uuidSchema,
  }),
});

// Delete permission validation
export const deletePermissionSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Export validation object
export const permissionValidation = {
  createPermission: createPermissionSchema,
  updatePermission: updatePermissionSchema,
  getPermissionById: getPermissionByIdSchema,
  getPermissionsList: getPermissionsListSchema,
  getPermissionsByCategory: getPermissionsByCategorySchema,
  getDepartmentPermissions: getDepartmentPermissionsSchema,
  getAvailablePermissions: getAvailablePermissionsSchema,
  getUserPermissions: getUserPermissionsSchema,
  assignPermissionToDepartment: assignPermissionToDepartmentSchema,
  removePermissionFromDepartment: removePermissionFromDepartmentSchema,
  deletePermission: deletePermissionSchema,
}; 