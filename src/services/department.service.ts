import { 
  DepartmentModel, 
  ICreateDepartment, 
  IUpdateDepartment,
  IDepartmentWithStats 
} from '@models/Department.model';
import { PermissionModel } from '@models/Permission.model';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export interface IDepartmentListResult {
  departments: IDepartmentWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDepartmentFilters {
  search?: string;
  is_active?: boolean;
}

export class DepartmentService {
  /**
   * Get all departments with pagination and filtering
   */
  static async getDepartments(
    page: number = 1,
    limit: number = 10,
    filters: IDepartmentFilters = {}
  ): Promise<IDepartmentListResult> {
    logger.info('Service: Fetching departments list', { page, limit, filters });

    try {
      const result = await DepartmentModel.findAll(page, limit, filters);
      
      logger.info('Service: Departments fetched successfully', { 
        total: result.total,
        page: result.page 
      });

      return result;
    } catch (error) {
      logger.error('Service: Failed to fetch departments', { error });
      throw error;
    }
  }

  /**
   * Get department by ID
   */
  static async getDepartmentById(departmentId: string) {
    logger.info('Service: Fetching department by ID', { department_id: departmentId });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      logger.info('Service: Department fetched successfully', { department_id: departmentId });
      return department;
    } catch (error) {
      logger.error('Service: Failed to fetch department', { department_id: departmentId, error });
      throw error;
    }
  }

  /**
   * Create new department
   */
  static async createDepartment(departmentData: ICreateDepartment) {
    logger.info('Service: Creating new department', { department_name: departmentData.department_name });

    try {
      const department = await DepartmentModel.create(departmentData);

      logger.info('Service: Department created successfully', { 
        department_id: department.department_id, 
        department_name: department.department_name 
      });

      return department;
    } catch (error) {
      logger.error('Service: Failed to create department', { 
        department_name: departmentData.department_name, 
        error 
      });
      throw error;
    }
  }

  /**
   * Update department
   */
  static async updateDepartment(departmentId: string, updateData: IUpdateDepartment) {
    logger.info('Service: Updating department', { 
      department_id: departmentId, 
      update_fields: Object.keys(updateData) 
    });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      const updatedDepartment = await DepartmentModel.update(departmentId, updateData);

      logger.info('Service: Department updated successfully', { department_id: departmentId });
      return updatedDepartment;
    } catch (error) {
      logger.error('Service: Failed to update department', { department_id: departmentId, error });
      throw error;
    }
  }

  /**
   * Delete department (soft delete)
   */
  static async deleteDepartment(departmentId: string): Promise<void> {
    logger.info('Service: Deleting department', { department_id: departmentId });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      await DepartmentModel.delete(departmentId);
      
      logger.info('Service: Department deleted successfully', { department_id: departmentId });
    } catch (error) {
      logger.error('Service: Failed to delete department', { department_id: departmentId, error });
      throw error;
    }
  }

  /**
   * Get department users
   */
  static async getDepartmentUsers(departmentId: string) {
    logger.info('Service: Fetching department users', { department_id: departmentId });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      // Check if department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      const users = await DepartmentModel.getDepartmentUsers(departmentId);

      logger.info('Service: Department users fetched successfully', { 
        department_id: departmentId, 
        user_count: users.length 
      });

      return {
        department,
        users
      };
    } catch (error) {
      logger.error('Service: Failed to fetch department users', { 
        department_id: departmentId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get department permissions
   */
  static async getDepartmentPermissions(departmentId: string) {
    logger.info('Service: Fetching department permissions', { department_id: departmentId });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      // Check if department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      const permissions = await DepartmentModel.getDepartmentPermissions(departmentId);

      logger.info('Service: Department permissions fetched successfully', { 
        department_id: departmentId, 
        permission_count: permissions.length 
      });

      return {
        department,
        permissions
      };
    } catch (error) {
      logger.error('Service: Failed to fetch department permissions', { 
        department_id: departmentId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Add permission to department
   */
  static async addPermissionToDepartment(
    departmentId: string, 
    permissionId: string, 
    grantedByUserId?: string
  ): Promise<void> {
    logger.info('Service: Adding permission to department', { 
      department_id: departmentId, 
      permission_id: permissionId,
      granted_by: grantedByUserId 
    });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permissionId) {
      throw new BadRequestError('Permission ID is required');
    }

    try {
      await DepartmentModel.addPermission(departmentId, permissionId, grantedByUserId);

      logger.info('Service: Permission added to department successfully', { 
        department_id: departmentId, 
        permission_id: permissionId,
        granted_by: grantedByUserId 
      });
    } catch (error) {
      logger.error('Service: Failed to add permission to department', { 
        department_id: departmentId, 
        permission_id: permissionId,
        error,
        granted_by: grantedByUserId 
      });
      throw error;
    }
  }

  /**
   * Remove permission from department
   */
  static async removePermissionFromDepartment(
    departmentId: string, 
    permissionId: string
  ): Promise<void> {
    logger.info('Service: Removing permission from department', { 
      department_id: departmentId, 
      permission_id: permissionId 
    });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permissionId) {
      throw new BadRequestError('Permission ID is required');
    }

    try {
      await DepartmentModel.removePermission(departmentId, permissionId);

      logger.info('Service: Permission removed from department successfully', { 
        department_id: departmentId, 
        permission_id: permissionId 
      });
    } catch (error) {
      logger.error('Service: Failed to remove permission from department', { 
        department_id: departmentId, 
        permission_id: permissionId,
        error 
      });
      throw error;
    }
  }

  /**
   * Get all available permissions (helper for permission management)
   */
  static async getAvailablePermissions(category?: string) {
    logger.info('Service: Fetching available permissions', { category });

    try {
      const permissions = await PermissionModel.findAll(category);

      logger.info('Service: Available permissions fetched successfully', { 
        permission_count: permissions.length,
        category 
      });

      return permissions;
    } catch (error) {
      logger.error('Service: Failed to fetch available permissions', { error });
      throw error;
    }
  }

  /**
   * Get available permissions for a specific department (not already assigned)
   */
  static async getAvailablePermissionsForDepartment(departmentId: string) {
    logger.info('Service: Fetching available permissions for department', { 
      department_id: departmentId 
    });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      // Check if department exists
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }

      const permissions = await PermissionModel.getAvailablePermissionsForDepartment(departmentId);

      logger.info('Service: Available permissions for department fetched successfully', { 
        department_id: departmentId,
        permission_count: permissions.length 
      });

      return {
        department,
        available_permissions: permissions
      };
    } catch (error) {
      logger.error('Service: Failed to fetch available permissions for department', { 
        department_id: departmentId,
        error 
      });
      throw error;
    }
  }

  /**
   * Validate department exists (helper method)
   */
  static async validateDepartmentExists(departmentId: string) {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStats(departmentId: string) {
    logger.info('Service: Fetching department statistics', { department_id: departmentId });

    if (!departmentId) {
      throw new BadRequestError('Department ID is required');
    }

    try {
      const department = await this.validateDepartmentExists(departmentId);
      const users = await DepartmentModel.getDepartmentUsers(departmentId);
      const permissions = await DepartmentModel.getDepartmentPermissions(departmentId);

      const stats = {
        department_id: departmentId,
        department_name: department.department_name,
        total_users: users.length,
        active_users: users.filter(user => user.is_active).length,
        ai_users: users.filter(user => user.is_ai_user).length,
        total_permissions: permissions.length,
        permission_categories: [...new Set(permissions.map(p => p.category))].filter(Boolean)
      };

      logger.info('Service: Department statistics fetched successfully', { 
        department_id: departmentId,
        stats 
      });

      return stats;
    } catch (error) {
      logger.error('Service: Failed to fetch department statistics', { 
        department_id: departmentId,
        error 
      });
      throw error;
    }
  }
} 