import { 
  UserModel, 
  ICreateUser, 
  IUpdateUser 
} from '@models/User.model';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export interface IUserListResult {
  users: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserFilters {
  department_id?: string;
  is_ai_user?: boolean;
  search?: string;
}

export class UserService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(
    page: number = 1,
    limit: number = 10,
    filters: IUserFilters = {}
  ): Promise<IUserListResult> {
    logger.info('Service: Fetching users list', { page, limit, filters });

    try {
      const result = await UserModel.findAll(page, limit, filters);
      
      logger.info('Service: Users fetched successfully', { 
        total: result.total,
        page: result.page 
      });

      return result;
    } catch (error) {
      logger.error('Service: Failed to fetch users', { error });
      throw error;
    }
  }

  /**
   * Get user by ID with permission checking
   */
  static async getUserById(userId: string, requestingUserId: string, userPermissions: string[]) {
    logger.info('Service: Fetching user by ID', { user_id: userId, requesting_user: requestingUserId });

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user can access this user's data
      if (requestingUserId !== userId && !userPermissions.includes('view_users')) {
        throw new ForbiddenError('Access denied');
      }

      logger.info('Service: User fetched successfully', { user_id: userId });
      return user;
    } catch (error) {
      logger.error('Service: Failed to fetch user', { user_id: userId, error });
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: ICreateUser) {
    logger.info('Service: Creating new user', { email: userData.email });

    try {
      const user = await UserModel.create(userData);

      logger.info('Service: User created successfully', { 
        user_id: user.user_id, 
        email: user.email 
      });

      return user;
    } catch (error) {
      logger.error('Service: Failed to create user', { 
        email: userData.email, 
        error 
      });
      throw error;
    }
  }

  /**
   * Update user with permission checking
   */
  static async updateUser(
    userId: string, 
    updateData: IUpdateUser, 
    requestingUserId: string, 
    userPermissions: string[]
  ) {
    logger.info('Service: Updating user', { 
      user_id: userId, 
      update_fields: Object.keys(updateData),
      requesting_user: requestingUserId 
    });

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    try {
      // Check if user can update this user's data
      if (requestingUserId !== userId && !userPermissions.includes('edit_users')) {
        throw new ForbiddenError('Access denied');
      }

      // If non-admin user trying to update sensitive fields
      if (requestingUserId === userId && !userPermissions.includes('edit_users')) {
        const restrictedFields = ['department_id', 'is_active', 'is_ai_user'];
        const hasRestrictedFields = restrictedFields.some(field => field in updateData);
        
        if (hasRestrictedFields) {
          throw new ForbiddenError('Cannot update restricted fields');
        }
      }

      const user = await UserModel.update(userId, updateData);

      logger.info('Service: User updated successfully', { user_id: userId });
      return user;
    } catch (error) {
      logger.error('Service: Failed to update user', { user_id: userId, error });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(userId: string, requestingUserId: string): Promise<void> {
    logger.info('Service: Deleting user', { user_id: userId, requesting_user: requestingUserId });

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    try {
      // Prevent self-deletion
      if (requestingUserId === userId) {
        throw new BadRequestError('Cannot deactivate your own account');
      }

      await UserModel.delete(userId);
      
      logger.info('Service: User deleted successfully', { user_id: userId });
    } catch (error) {
      logger.error('Service: Failed to delete user', { user_id: userId, error });
      throw error;
    }
  }

  /**
   * Change user password with permission checking
   */
  static async changeUserPassword(
    userId: string, 
    newPassword: string, 
    requestingUserId: string, 
    userPermissions: string[]
  ): Promise<void> {
    logger.info('Service: Changing user password', { 
      user_id: userId,
      requesting_user: requestingUserId 
    });

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    try {
      // Only allow password change if user is changing their own password or has admin permission
      if (requestingUserId !== userId && !userPermissions.includes('edit_users')) {
        throw new ForbiddenError('Access denied');
      }

      await UserModel.changePassword(userId, newPassword);

      logger.info('Service: User password changed successfully', { user_id: userId });
    } catch (error) {
      logger.error('Service: Failed to change user password', { user_id: userId, error });
      throw error;
    }
  }

  /**
   * Get current user profile with permissions
   */
  static async getCurrentUserProfile(userId: string) {
    logger.info('Service: Fetching current user profile', { user_id: userId });

    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Get user permissions
      const permissions = await UserModel.getUserPermissions(userId);

      logger.info('Service: Current user profile fetched successfully', { user_id: userId });

      return {
        user,
        permissions
      };
    } catch (error) {
      logger.error('Service: Failed to fetch current user profile', { 
        user_id: userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Validate user exists (helper method)
   */
  static async validateUserExists(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
} 