import { Request, Response } from 'express';
import { DepartmentService } from '@services/department.service';
import { BadRequestError } from '@utils/AppError';
import { logger } from '@utils/logger';

export class DepartmentController {
  // Get all departments with pagination and filtering
  static async getDepartments(req: Request, res: Response): Promise<void> {
    const { page, limit, search, is_active } = req.query;

    logger.info('Controller: Get departments request', { 
      page, 
      limit, 
      search,
      is_active,
      requested_by: req.user?.user_id 
    });

    const filters = {
      ...(search && typeof search === 'string' && { search }),
      ...(is_active !== undefined && { is_active: is_active === 'true' })
    };

    const result = await DepartmentService.getDepartments(
      Number(page) || 1,
      Number(limit) || 10,
      filters
    );

    res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: {
        departments: result.departments?.map(dept => ({
          department_id: dept.department_id,
          department_name: dept.department_name,
          description: dept.description,
          is_active: dept.is_active,
          user_count: Number(dept.user_count),
          permission_count: Number(dept.permission_count),
          created_at: dept.created_at,
          updated_at: dept.updated_at,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    });
  }

  // Get department by ID
  static async getDepartmentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Get department by ID request', { 
      department_id: id, 
      requested_by: req.user?.user_id 
    });

    const department = await DepartmentService.getDepartmentById(id);

    res.json({
      success: true,
      message: 'Department retrieved successfully',
      data: {
        department: {
          department_id: department.department_id,
          department_name: department.department_name,
          description: department.description,
          is_active: department.is_active,
          created_at: department.created_at,
          updated_at: department.updated_at,
        },
      },
    });
  }

  // Create new department
  static async createDepartment(req: Request, res: Response): Promise<void> {
    const { department_name, description } = req.body;

    logger.info('Controller: Create department request', { 
      department_name, 
      created_by: req.user?.user_id 
    });

    const department = await DepartmentService.createDepartment({
      department_name,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        department: {
          department_id: department.department_id,
          department_name: department.department_name,
          description: department.description,
          is_active: department.is_active,
          created_at: department.created_at,
          updated_at: department.updated_at,
        },
      },
    });
  }

  // Update department
  static async updateDepartment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Update department request', { 
      department_id: id, 
      update_fields: Object.keys(updateData),
      updated_by: req.user?.user_id 
    });

    const updatedDepartment = await DepartmentService.updateDepartment(id, updateData);

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: {
        department: {
          department_id: updatedDepartment.department_id,
          department_name: updatedDepartment.department_name,
          description: updatedDepartment.description,
          is_active: updatedDepartment.is_active,
          created_at: updatedDepartment.created_at,
          updated_at: updatedDepartment.updated_at,
        },
      },
    });
  }

  // Delete department (soft delete)
  static async deleteDepartment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Delete department request', { 
      department_id: id, 
      deleted_by: req.user?.user_id 
    });

    await DepartmentService.deleteDepartment(id);

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  }

  // Get department users
  static async getDepartmentUsers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Get department users request', { 
      department_id: id, 
      requested_by: req.user?.user_id 
    });

    const { department, users } = await DepartmentService.getDepartmentUsers(id);

    res.json({
      success: true,
      message: 'Department users retrieved successfully',
      data: {
        department_id: id,
        department_name: department.department_name,
        users: users.map(user => ({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_ai_user: user.is_ai_user,
          is_active: user.is_active,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
        })),
      },
    });
  }

  // Get department permissions
  static async getDepartmentPermissions(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Get department permissions request', { 
      department_id: id, 
      requested_by: req.user?.user_id 
    });

    const { department, permissions } = await DepartmentService.getDepartmentPermissions(id);

    res.json({
      success: true,
      message: 'Department permissions retrieved successfully',
      data: {
        department_id: id,
        department_name: department.department_name,
        permissions: permissions.map(permission => ({
          permission_id: permission.permission_id,
          permission_name: permission.permission_name,
          description: permission.description,
          category: permission.category,
          granted_at: permission.granted_at,
        })),
      },
    });
  }

  // Add permission to department
  static async addDepartmentPermission(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { permission_id } = req.body;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permission_id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Controller: Add department permission request', { 
      department_id: id, 
      permission_id,
      granted_by: req.user?.user_id 
    });

    await DepartmentService.addPermissionToDepartment(id, permission_id, req.user?.user_id);

    res.status(201).json({
      success: true,
      message: 'Permission added to department successfully',
      data: {
        department_id: id,
        permission_id,
        granted_by: req.user?.user_id,
        granted_at: new Date(),
      },
    });
  }

  // Remove permission from department
  static async removeDepartmentPermission(req: Request, res: Response): Promise<void> {
    const { id, permission_id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    if (!permission_id) {
      throw new BadRequestError('Permission ID is required');
    }

    logger.info('Controller: Remove department permission request', { 
      department_id: id, 
      permission_id,
      removed_by: req.user?.user_id 
    });

    await DepartmentService.removePermissionFromDepartment(id, permission_id);

    res.json({
      success: true,
      message: 'Permission removed from department successfully',
    });
  }

  // Get all available permissions (helper endpoint for permission management)
  static async getAvailablePermissions(req: Request, res: Response): Promise<void> {
    const { category } = req.query;

    logger.info('Controller: Get available permissions request', { 
      category,
      requested_by: req.user?.user_id 
    });

    const permissions = await DepartmentService.getAvailablePermissions(category as string);

    res.json({
      success: true,
      message: 'Available permissions retrieved successfully',
      data: {
        permissions: permissions.map(permission => ({
          permission_id: permission.permission_id,
          permission_name: permission.permission_name,
          description: permission.description,
          category: permission.category,
          created_at: permission.created_at,
        })),
      },
    });
  }

  // Get available permissions for a specific department (not already assigned)
  static async getAvailablePermissionsForDepartment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Get available permissions for department request', { 
      department_id: id,
      requested_by: req.user?.user_id 
    });

    const { department, available_permissions } = await DepartmentService.getAvailablePermissionsForDepartment(id);

    res.json({
      success: true,
      message: 'Available permissions for department retrieved successfully',
      data: {
        department_id: id,
        department_name: department.department_name,
        available_permissions: available_permissions.map(permission => ({
          permission_id: permission.permission_id,
          permission_name: permission.permission_name,
          description: permission.description,
          category: permission.category,
          created_at: permission.created_at,
        })),
      },
    });
  }

  // Get department statistics
  static async getDepartmentStats(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Department ID is required');
    }

    logger.info('Controller: Get department statistics request', { 
      department_id: id,
      requested_by: req.user?.user_id 
    });

    const stats = await DepartmentService.getDepartmentStats(id);

    res.json({
      success: true,
      message: 'Department statistics retrieved successfully',
      data: stats,
    });
  }

  // Public method to get basic department info for registration
  static async getPublicDepartments(): Promise<any[]> {
    logger.info('Controller: Get public departments for registration');
    
    const result = await DepartmentService.getDepartments(1, 100, { is_active: true });
    
    return result.departments?.map(dept => ({
      id: dept.department_id,
      name: dept.department_name,
      description: dept.description
    }));
  }
} 