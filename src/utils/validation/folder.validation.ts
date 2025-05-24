import { z } from 'zod';

// Common validation rules
const uuidSchema = z.string().uuid('Invalid UUID format');
const folderNameSchema = z.string()
  .min(1, 'Folder name is required')
  .max(255, 'Folder name too long')
  .regex(/^[a-zA-Z0-9\s\-_\.()]+$/, 'Folder name contains invalid characters');

const accessLevelSchema = z.enum(['public', 'restricted', 'private', 'inherited'], {
  errorMap: () => ({ message: 'Access level must be public, restricted, private, or inherited' })
});

const permissionTypeSchema = z.enum(['read', 'write', 'delete', 'manage'], {
  errorMap: () => ({ message: 'Permission type must be read, write, delete, or manage' })
});

// Create folder validation
export const createFolderSchema = z.object({
  body: z.object({
    folder_name: folderNameSchema,
    parent_folder_id: uuidSchema.optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    access_level: accessLevelSchema.optional(),
    inherit_permissions: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Update folder validation
export const updateFolderSchema = z.object({
  body: z.object({
    folder_name: folderNameSchema.optional(),
    parent_folder_id: uuidSchema.nullable().optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    access_level: accessLevelSchema.optional(),
    inherit_permissions: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get folder by ID validation
export const getFolderByIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get folders list validation
export const getFoldersListSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    parent_folder_id: z.string().optional().transform(val => val === '' ? undefined : val),
    created_by_user_id: uuidSchema.optional(),
    access_level: accessLevelSchema.optional(),
    search: z.string().min(1).max(255).optional(),
    is_active: z.string().transform(val => val === 'true').optional(),
  }),
  params: z.object({}),
});

// Delete folder validation
export const deleteFolderSchema = z.object({
  body: z.object({}),
  query: z.object({
    delete_contents: z.string().transform(val => val === 'true').optional().default('false'),
  }),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get user accessible folders validation
export const getUserAccessibleFoldersSchema = z.object({
  body: z.object({}),
  query: z.object({
    permission_type: permissionTypeSchema.optional().default('read'),
  }),
  params: z.object({}),
});

// Grant folder permission validation
export const grantFolderPermissionSchema = z.object({
  body: z.object({
    folder_id: uuidSchema,
    department_id: uuidSchema.optional(),
    user_id: uuidSchema.optional(),
    permission_type: permissionTypeSchema,
  }).refine(
    data => (data.department_id && !data.user_id) || (!data.department_id && data.user_id),
    {
      message: 'Either department_id or user_id must be provided, but not both',
      path: ['department_id', 'user_id']
    }
  ),
  query: z.object({}),
  params: z.object({}),
});

// Revoke folder permission validation
export const revokeFolderPermissionSchema = z.object({
  body: z.object({
    user_id: uuidSchema.optional(),
    department_id: uuidSchema.optional(),
    permission_type: permissionTypeSchema.optional(),
  }),
  query: z.object({}),
  params: z.object({
    folderId: uuidSchema,
  }),
});

// Get folder permissions validation
export const getFolderPermissionsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    folderId: uuidSchema,
  }),
});

// Get folder hierarchy validation
export const getFolderHierarchySchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    folderId: uuidSchema,
  }),
});

// Search folders validation
export const searchFoldersSchema = z.object({
  body: z.object({}),
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(255, 'Search query too long'),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    parent_folder_id: uuidSchema.optional(),
    access_level: accessLevelSchema.optional(),
  }),
  params: z.object({}),
});

// Get folders by parent validation
export const getFoldersByParentSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  }),
  params: z.object({
    parentId: uuidSchema,
  }),
});

// Bulk folder operations validation
export const bulkFolderOperationSchema = z.object({
  body: z.object({
    folder_ids: z.array(uuidSchema).min(1, 'At least one folder ID is required').max(50, 'Too many folder IDs'),
    operation: z.enum(['delete', 'move', 'change_access'], {
      errorMap: () => ({ message: 'Operation must be delete, move, or change_access' })
    }),
    target_parent_id: uuidSchema.optional(), // For move operation
    new_access_level: accessLevelSchema.optional(), // For change_access operation
    delete_contents: z.boolean().optional().default(false), // For delete operation
  }),
  query: z.object({}),
  params: z.object({}),
});

// Export validation object
export const folderValidation = {
  createFolder: createFolderSchema,
  updateFolder: updateFolderSchema,
  getFolderById: getFolderByIdSchema,
  getFoldersList: getFoldersListSchema,
  deleteFolder: deleteFolderSchema,
  getUserAccessibleFolders: getUserAccessibleFoldersSchema,
  grantFolderPermission: grantFolderPermissionSchema,
  revokeFolderPermission: revokeFolderPermissionSchema,
  getFolderPermissions: getFolderPermissionsSchema,
  getFolderHierarchy: getFolderHierarchySchema,
  searchFolders: searchFoldersSchema,
  getFoldersByParent: getFoldersByParentSchema,
  bulkFolderOperation: bulkFolderOperationSchema,
}; 