import { Request, Response } from 'express';
import { PermissionService, ICreatePermission, IUpdatePermission } from '@services/permission.service';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class PermissionController {
  // Get all permissions with optional category filtering
  static async getPermissions(req: Request, res: Response): Promise<void> {
    const { category } = req.query;

    logger.info('Fetching permissions list:', { 
      category,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await PermissionService.getAllPermissions(
        category as string | undefined
      );

      logger.info('Permissions fetched successfully:', { 
        count: permissions.length,
        category,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permissions retrieved successfully',
        data: {
          permissions: permissions.map(permission => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch permissions:', { 
        error, 
        category,
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get permission by ID
  static async getPermissionById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Fetching permission by ID:', { 
      permission_id: id, 
      requested_by: req.user?.user_id 
    });

    try {
      const permission = await PermissionService.getPermissionById(id);

      logger.info('Permission fetched successfully:', { 
        permission_id: id, 
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permission retrieved successfully',
        data: {
          permission: {
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch permission:', { 
        permission_id: id, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get all permission categories
  static async getCategories(req: Request, res: Response): Promise<void> {
    logger.info('Fetching permission categories:', { 
      requested_by: req.user?.user_id 
    });

    try {
      const categories = await PermissionService.getCategories();

      logger.info('Permission categories fetched successfully:', { 
        count: categories.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permission categories retrieved successfully',
        data: {
          categories,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch permission categories:', { 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get permissions by category
  static async getPermissionsByCategory(req: Request, res: Response): Promise<void> {
    const { category } = req.params;

    if (!category) {
      throw new BadRequestError('Category is required');
    }

    logger.info('Fetching permissions by category:', { 
      category,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await PermissionService.getPermissionsByCategory(category);

      logger.info('Permissions by category fetched successfully:', { 
        category,
        count: permissions.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permissions retrieved successfully',
        data: {
          category,
          permissions: permissions.map(permission => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch permissions by category:', { 
        category,
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get permissions for a specific department
  static async getDepartmentPermissions(req: Request, res: Response): Promise<void> {
    const { departmentId } = req.params;

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Fetching department permissions:', { 
      department_id: departmentId,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await PermissionService.getDepartmentPermissions(departmentId);

      logger.info('Department permissions fetched successfully:', { 
        department_id: departmentId,
        count: permissions.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Department permissions retrieved successfully',
        data: {
          department_id: departmentId,
          permissions: permissions.map(permission => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            granted_at: (permission as any).granted_at,
            granted_by_user_id: (permission as any).granted_by_user_id,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch department permissions:', { 
        department_id: departmentId,
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get available permissions for a department (not yet assigned)
  static async getAvailablePermissionsForDepartment(req: Request, res: Response): Promise<void> {
    const { departmentId } = req.params;

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Fetching available permissions for department:', { 
      department_id: departmentId,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await PermissionService.getAvailablePermissionsForDepartment(departmentId);

      logger.info('Available permissions for department fetched successfully:', { 
        department_id: departmentId,
        count: permissions.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Available permissions retrieved successfully',
        data: {
          department_id: departmentId,
          permissions: permissions.map(permission => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch available permissions for department:', { 
        department_id: departmentId,
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get permissions for a specific user
  static async getUserPermissions(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    // Check if user can access this user's permissions
    if (req.user?.user_id !== userId && 
        !req.user?.permissions.includes('view_permissions') && 
        !req.user?.permissions.includes('view_users')) {
      throw new ForbiddenError('Access denied');
    }

    logger.info('Fetching user permissions:', { 
      user_id: userId,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await PermissionService.getUserPermissions(userId);

      logger.info('User permissions fetched successfully:', { 
        user_id: userId,
        count: permissions.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'User permissions retrieved successfully',
        data: {
          user_id: userId,
          permissions: permissions.map(permission => ({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            granted_at: (permission as any).granted_at,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch user permissions:', { 
        user_id: userId,
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Create new permission
  static async createPermission(req: Request, res: Response): Promise<void> {
    const { permission_name, description, category } = req.body;

    logger.info('Creating new permission:', { 
      permission_name,
      category,
      created_by: req.user?.user_id 
    });

    try {
      const permissionData: ICreatePermission = {
        permission_name,
        description,
        category,
      };

      const permission = await PermissionService.createPermission(
        permissionData, 
        req.user!.user_id
      );

      logger.info('Permission created successfully:', { 
        permission_id: permission.permission_id,
        permission_name: permission.permission_name,
        created_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: {
          permission: {
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to create permission:', { 
        permission_name,
        category,
        error, 
        created_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Update permission
  static async updatePermission(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Updating permission:', { 
      permission_id: id,
      update_fields: Object.keys(updateData),
      updated_by: req.user?.user_id 
    });

    try {
      const permission = await PermissionService.updatePermission(
        id, 
        updateData as IUpdatePermission, 
        req.user!.user_id
      );

      logger.info('Permission updated successfully:', { 
        permission_id: id,
        updated_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: {
          permission: {
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            description: permission.description,
            category: permission.category,
            is_active: permission.is_active,
            created_at: permission.created_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update permission:', { 
        permission_id: id,
        update_data: updateData,
        error, 
        updated_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Assign permission to department
  static async assignPermissionToDepartment(req: Request, res: Response): Promise<void> {
    const { departmentId } = req.params;
    const { permission_id } = req.body;

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permission_id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Assigning permission to department:', { 
      department_id: departmentId,
      permission_id,
      assigned_by: req.user?.user_id 
    });

    try {
      await PermissionService.assignPermissionToDepartment(
        departmentId,
        permission_id,
        req.user!.user_id
      );

      logger.info('Permission assigned to department successfully:', { 
        department_id: departmentId,
        permission_id,
        assigned_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'Permission assigned to department successfully',
        data: {
          department_id: departmentId,
          permission_id,
          assigned_at: new Date().toISOString(),
          assigned_by: req.user!.user_id,
        },
      });
    } catch (error) {
      logger.error('Failed to assign permission to department:', { 
        department_id: departmentId,
        permission_id,
        error, 
        assigned_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Remove permission from department
  static async removePermissionFromDepartment(req: Request, res: Response): Promise<void> {
    const { departmentId, permissionId } = req.params;

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permissionId) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Removing permission from department:', { 
      department_id: departmentId,
      permission_id: permissionId,
      removed_by: req.user?.user_id 
    });

    try {
      await PermissionService.removePermissionFromDepartment(
        departmentId,
        permissionId,
        req.user!.user_id
      );

      logger.info('Permission removed from department successfully:', { 
        department_id: departmentId,
        permission_id: permissionId,
        removed_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permission removed from department successfully',
        data: {
          department_id: departmentId,
          permission_id: permissionId,
          removed_at: new Date().toISOString(),
          removed_by: req.user!.user_id,
        },
      });
    } catch (error) {
      logger.error('Failed to remove permission from department:', { 
        department_id: departmentId,
        permission_id: permissionId,
        error, 
        removed_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Delete/deactivate permission
  static async deletePermission(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Deactivating permission:', { 
      permission_id: id,
      deleted_by: req.user?.user_id 
    });

    try {
      await PermissionService.deletePermission(id, req.user!.user_id);

      logger.info('Permission deactivated successfully:', { 
        permission_id: id,
        deleted_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Permission deactivated successfully',
        data: {
          permission_id: id,
          deactivated_at: new Date().toISOString(),
          deactivated_by: req.user!.user_id,
        },
      });
    } catch (error) {
      logger.error('Failed to deactivate permission:', { 
        permission_id: id,
        error, 
        deleted_by: req.user?.user_id 
      });
      throw error;
    }
  }
} 