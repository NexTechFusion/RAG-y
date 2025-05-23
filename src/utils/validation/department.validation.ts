import { z } from 'zod';

// Common validation rules
const uuidSchema = z.string().uuid('Invalid UUID format');
const departmentNameSchema = z.string()
  .min(1, 'Department name is required')
  .max(255, 'Department name too long')
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Department name can only contain letters, numbers, spaces, hyphens, underscores, and periods');

// Create department validation
export const createDepartmentSchema = z.object({
  body: z.object({
    department_name: departmentNameSchema,
    description: z.string().max(1000, 'Description too long').optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Update department validation
export const updateDepartmentSchema = z.object({
  body: z.object({
    department_name: departmentNameSchema.optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    is_active: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get department by ID validation
export const getDepartmentByIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Delete department validation
export const deleteDepartmentSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get departments list validation
export const getDepartmentsListSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    search: z.string().optional(),
    is_active: z.string().transform(val => val === 'true').optional(),
  }),
  params: z.object({}),
});

// Get department users validation
export const getDepartmentUsersSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get department permissions validation
export const getDepartmentPermissionsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Add permission to department validation
export const addDepartmentPermissionSchema = z.object({
  body: z.object({
    permission_id: uuidSchema,
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Remove permission from department validation
export const removeDepartmentPermissionSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
    permission_id: uuidSchema,
  }),
});

// Export all validation schemas
export const departmentValidation = {
  createDepartment: createDepartmentSchema,
  updateDepartment: updateDepartmentSchema,
  getDepartmentById: getDepartmentByIdSchema,
  deleteDepartment: deleteDepartmentSchema,
  getDepartmentsList: getDepartmentsListSchema,
  getDepartmentUsers: getDepartmentUsersSchema,
  getDepartmentPermissions: getDepartmentPermissionsSchema,
  addDepartmentPermission: addDepartmentPermissionSchema,
  removeDepartmentPermission: removeDepartmentPermissionSchema,
}; 