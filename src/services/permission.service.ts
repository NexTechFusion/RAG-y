import { PermissionModel, IPermission } from '@models/Permission.model';
import { DepartmentModel } from '@models/Department.model';
import { UserModel } from '@models/User.model';
import { DatabaseConnection } from '@database/connection';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export interface ICreatePermission {
  permission_name: string;
  description?: string;
  category: string;
}

export interface IUpdatePermission {
  permission_name?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

export class PermissionService {
  // Get all permissions with optional category filtering
  static async getAllPermissions(category?: string): Promise<IPermission[]> {
    try {
      const permissions = await PermissionModel.findAll(category);
      
      logger.info('Permissions retrieved successfully:', { 
        count: permissions.length,
        category 
      });

      return permissions;
    } catch (error) {
      logger.error('Failed to retrieve permissions:', { error, category });
      throw error;
    }
  }

  // Get permission by ID
  static async getPermissionById(permissionId: string): Promise<IPermission> {
    try {
      const permission = await PermissionModel.findById(permissionId);
      
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }

      logger.info('Permission retrieved successfully:', { permission_id: permissionId });
      return permission;
    } catch (error) {
      logger.error('Failed to retrieve permission:', { error, permission_id: permissionId });
      throw error;
    }
  }

  // Get all permission categories
  static async getCategories(): Promise<string[]> {
    try {
      const categories = await PermissionModel.getCategories();
      
      logger.info('Permission categories retrieved successfully:', { 
        count: categories.length 
      });

      return categories;
    } catch (error) {
      logger.error('Failed to retrieve permission categories:', { error });
      throw error;
    }
  }

  // Get permissions by category
  static async getPermissionsByCategory(category: string): Promise<IPermission[]> {
    try {
      const permissions = await PermissionModel.findAll(category);
      
      logger.info('Permissions by category retrieved successfully:', { 
        category,
        count: permissions.length 
      });

      return permissions;
    } catch (error) {
      logger.error('Failed to retrieve permissions by category:', { error, category });
      throw error;
    }
  }

  // Get permissions for a specific department
  static async getDepartmentPermissions(departmentId: string): Promise<IPermission[]> {
    try {
      // Verify department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      const permissions = await PermissionModel.getDepartmentPermissions(departmentId);
      
      logger.info('Department permissions retrieved successfully:', { 
        department_id: departmentId,
        count: permissions.length 
      });

      return permissions;
    } catch (error) {
      logger.error('Failed to retrieve department permissions:', { 
        error, 
        department_id: departmentId 
      });
      throw error;
    }
  }

  // Get available permissions for a department (not yet assigned)
  static async getAvailablePermissionsForDepartment(departmentId: string): Promise<IPermission[]> {
    try {
      // Verify department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      const permissions = await PermissionModel.getAvailablePermissionsForDepartment(departmentId);
      
      logger.info('Available permissions for department retrieved successfully:', { 
        department_id: departmentId,
        count: permissions.length 
      });

      return permissions;
    } catch (error) {
      logger.error('Failed to retrieve available permissions for department:', { 
        error, 
        department_id: departmentId 
      });
      throw error;
    }
  }

  // Get permissions for a specific user
  static async getUserPermissions(userId: string): Promise<IPermission[]> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const permissions = await PermissionModel.getUserPermissions(userId);
      
      logger.info('User permissions retrieved successfully:', { 
        user_id: userId,
        count: permissions.length 
      });

      return permissions;
    } catch (error) {
      logger.error('Failed to retrieve user permissions:', { 
        error, 
        user_id: userId 
      });
      throw error;
    }
  }

  // Create a new permission
  static async createPermission(
    permissionData: ICreatePermission,
    createdBy: string
  ): Promise<IPermission> {
    try {
      // Check if permission with same name already exists
      const existingPermission = await PermissionModel.findByName(permissionData.permission_name);
      if (existingPermission) {
        throw new ConflictError('Permission with this name already exists');
      }

      const query = `
        INSERT INTO permissions (permission_name, description, category, is_active, created_at)
        VALUES ($1, $2, $3, true, NOW())
        RETURNING *
      `;

      const values = [
        permissionData.permission_name,
        permissionData.description,
        permissionData.category
      ];

      const result = await DatabaseConnection.query(query, values);
      const permission = result.rows[0];

      logger.info('Permission created successfully:', {
        permission_id: permission.permission_id,
        permission_name: permission.permission_name,
        created_by: createdBy
      });

      return permission;
    } catch (error) {
      logger.error('Failed to create permission:', { 
        error, 
        permission_data: permissionData,
        created_by: createdBy 
      });
      throw error;
    }
  }

  // Update permission
  static async updatePermission(
    permissionId: string,
    updateData: IUpdatePermission,
    updatedBy: string
  ): Promise<IPermission> {
    try {
      // Verify permission exists
      const existingPermission = await PermissionModel.findById(permissionId);
      if (!existingPermission) {
        throw new NotFoundError('Permission not found');
      }

      // Check if new permission name conflicts with existing permissions
      if (updateData.permission_name && updateData.permission_name !== existingPermission.permission_name) {
        const conflictingPermission = await PermissionModel.findByName(updateData.permission_name);
        if (conflictingPermission) {
          throw new ConflictError('Permission with this name already exists');
        }
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.permission_name !== undefined) {
        updateFields.push(`permission_name = $${paramIndex++}`);
        values.push(updateData.permission_name);
      }

      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updateData.description);
      }

      if (updateData.category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        values.push(updateData.category);
      }

      if (updateData.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        values.push(updateData.is_active);
      }

      if (updateFields.length === 0) {
        throw new BadRequestError('No valid fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(permissionId);

      const query = `
        UPDATE permissions 
        SET ${updateFields.join(', ')}
        WHERE permission_id = $${paramIndex}
        RETURNING *
      `;

      const result = await DatabaseConnection.query(query, values);
      const permission = result.rows[0];

      logger.info('Permission updated successfully:', {
        permission_id: permissionId,
        updated_fields: Object.keys(updateData),
        updated_by: updatedBy
      });

      return permission;
    } catch (error) {
      logger.error('Failed to update permission:', { 
        error, 
        permission_id: permissionId,
        update_data: updateData,
        updated_by: updatedBy 
      });
      throw error;
    }
  }

  // Assign permission to department
  static async assignPermissionToDepartment(
    departmentId: string,
    permissionId: string,
    assignedBy: string
  ): Promise<void> {
    try {
      // Verify department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      // Verify permission exists
      const permission = await PermissionModel.findById(permissionId);
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }

      // Check if permission is already assigned to department
      const existingAssignment = await DatabaseConnection.query(
        'SELECT * FROM departmentpermissions WHERE department_id = $1 AND permission_id = $2',
        [departmentId, permissionId]
      );

      if (existingAssignment.rows.length > 0) {
        throw new ConflictError('Permission already assigned to this department');
      }

      const query = `
        INSERT INTO departmentpermissions (department_id, permission_id, granted_at, granted_by_user_id)
        VALUES ($1, $2, NOW(), $3)
      `;

      await DatabaseConnection.query(query, [departmentId, permissionId, assignedBy]);

      logger.info('Permission assigned to department successfully:', {
        department_id: departmentId,
        permission_id: permissionId,
        assigned_by: assignedBy
      });
    } catch (error) {
      logger.error('Failed to assign permission to department:', { 
        error, 
        department_id: departmentId,
        permission_id: permissionId,
        assigned_by: assignedBy 
      });
      throw error;
    }
  }

  // Remove permission from department
  static async removePermissionFromDepartment(
    departmentId: string,
    permissionId: string,
    removedBy: string
  ): Promise<void> {
    try {
      // Verify department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      // Verify permission exists
      const permission = await PermissionModel.findById(permissionId);
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }

      // Check if permission is assigned to department
      const existingAssignment = await DatabaseConnection.query(
        'SELECT * FROM departmentpermissions WHERE department_id = $1 AND permission_id = $2',
        [departmentId, permissionId]
      );

      if (existingAssignment.rows.length === 0) {
        throw new NotFoundError('Permission not assigned to this department');
      }

      const query = `
        DELETE FROM departmentpermissions 
        WHERE department_id = $1 AND permission_id = $2
      `;

      await DatabaseConnection.query(query, [departmentId, permissionId]);

      logger.info('Permission removed from department successfully:', {
        department_id: departmentId,
        permission_id: permissionId,
        removed_by: removedBy
      });
    } catch (error) {
      logger.error('Failed to remove permission from department:', { 
        error, 
        department_id: departmentId,
        permission_id: permissionId,
        removed_by: removedBy 
      });
      throw error;
    }
  }

  // Delete/deactivate permission
  static async deletePermission(permissionId: string, deletedBy: string): Promise<void> {
    try {
      // Verify permission exists
      const permission = await PermissionModel.findById(permissionId);
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }

      // Soft delete by setting is_active to false
      const query = `
        UPDATE permissions 
        SET is_active = false, updated_at = NOW()
        WHERE permission_id = $1
      `;

      await DatabaseConnection.query(query, [permissionId]);

      logger.info('Permission deactivated successfully:', {
        permission_id: permissionId,
        deleted_by: deletedBy
      });
    } catch (error) {
      logger.error('Failed to delete permission:', { 
        error, 
        permission_id: permissionId,
        deleted_by: deletedBy 
      });
      throw error;
    }
  }
} 