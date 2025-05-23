import { Request, Response } from 'express';
import { UserModel, ICreateUser, IUpdateUser } from '@models/User.model';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class UserController {
  // Get all users with pagination and filtering
  static async getUsers(req: Request, res: Response): Promise<void> {
    const { page, limit, department_id, is_ai_user, search } = req.query;

    logger.info('Fetching users list:', { 
      page, 
      limit, 
      department_id, 
      is_ai_user, 
      search,
      requested_by: req.user?.user_id 
    });

    try {
      const filters: {
        department_id?: string;
        is_ai_user?: boolean;
        search?: string;
      } = {};

      if (department_id && typeof department_id === 'string') {
        filters.department_id = department_id;
      }
      if (is_ai_user !== undefined) {
        filters.is_ai_user = is_ai_user === 'true';
      }
      if (search && typeof search === 'string') {
        filters.search = search;
      }

      const result = await UserModel.findAll(
        Number(page) || 1,
        Number(limit) || 10,
        filters
      );

      logger.info('Users fetched successfully:', { 
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: result.users.map(user => ({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            department_name: (user as any).department_name,
            is_ai_user: user.is_ai_user,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch users:', { error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    logger.info('Fetching user by ID:', { user_id: id, requested_by: req.user?.user_id });

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user can access this user's data
      if (req.user?.user_id !== id && !req.user?.permissions.includes('users.read')) {
        throw new ForbiddenError('Access denied');
      }

      logger.info('User fetched successfully:', { user_id: id, requested_by: req.user?.user_id });

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            department_name: (user as any).department_name,
            is_ai_user: user.is_ai_user,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch user:', { user_id: id, error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response): Promise<void> {
    const { first_name, last_name, email, password, department_id, is_ai_user } = req.body;

    logger.info('Creating new user:', { 
      email, 
      department_id, 
      is_ai_user,
      created_by: req.user?.user_id 
    });

    try {
      const userData: ICreateUser = {
        first_name,
        last_name,
        email,
        password,
        department_id,
        is_ai_user,
      };

      const user = await UserModel.create(userData);

      logger.info('User created successfully:', { 
        user_id: user.user_id, 
        email: user.email,
        created_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            is_ai_user: user.is_ai_user,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to create user:', { 
        email, 
        error, 
        created_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    logger.info('Updating user:', { 
      user_id: id, 
      update_fields: Object.keys(updateData),
      updated_by: req.user?.user_id 
    });

    try {
      // Check if user can update this user's data
      if (req.user?.user_id !== id && !req.user?.permissions.includes('users.update')) {
        throw new ForbiddenError('Access denied');
      }

      // If non-admin user trying to update sensitive fields
      if (req.user?.user_id === id && !req.user?.permissions.includes('users.update')) {
        const restrictedFields = ['department_id', 'is_active', 'is_ai_user'];
        const hasRestrictedFields = restrictedFields.some(field => field in updateData);
        
        if (hasRestrictedFields) {
          throw new ForbiddenError('Cannot update restricted fields');
        }
      }

      const user = await UserModel.update(id, updateData as IUpdateUser);

      logger.info('User updated successfully:', { 
        user_id: id,
        updated_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            is_ai_user: user.is_ai_user,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update user:', { 
        user_id: id, 
        error,
        updated_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Delete user (soft delete by deactivating)
  static async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    logger.info('Deactivating user:', { 
      user_id: id,
      deleted_by: req.user?.user_id 
    });

    try {
      // Prevent self-deletion
      if (req.user?.user_id === id) {
        throw new BadRequestError('Cannot deactivate your own account');
      }

      await UserModel.delete(id);

      logger.info('User deactivated successfully:', { 
        user_id: id,
        deleted_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: null,
      });
    } catch (error) {
      logger.error('Failed to deactivate user:', { 
        user_id: id, 
        error,
        deleted_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Change user password (admin only)
  static async changeUserPassword(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    logger.info('Changing user password:', { 
      user_id: id,
      changed_by: req.user?.user_id 
    });

    try {
      // Only allow password change if user is changing their own password or has admin permission
      if (req.user?.user_id !== id && !req.user?.permissions.includes('users.update')) {
        throw new ForbiddenError('Access denied');
      }

      await UserModel.changePassword(id, new_password);

      logger.info('User password changed successfully:', { 
        user_id: id,
        changed_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
        data: null,
      });
    } catch (error) {
      logger.error('Failed to change user password:', { 
        user_id: id, 
        error,
        changed_by: req.user?.user_id 
      });
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    logger.info('Fetching current user profile:', { user_id: req.user?.user_id });

    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const user = await UserModel.findById(req.user.user_id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Get user permissions
      const permissions = await UserModel.getUserPermissions(req.user.user_id);

      logger.info('Current user profile fetched successfully:', { user_id: req.user.user_id });

      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            department_name: (user as any).department_name,
            is_ai_user: user.is_ai_user,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            permissions,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch current user profile:', { 
        user_id: req.user?.user_id, 
        error 
      });
      throw error;
    }
  }
} 