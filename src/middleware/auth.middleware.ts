import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/config';
import { UserModel } from '@models/User.model';
import { UnauthorizedError, ForbiddenError } from '@utils/AppError';
import { logger } from '@utils/logger';
import { RedisConnection } from '@database/redis';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        email: string;
        first_name: string;
        last_name: string;
        department_id: string;
        is_ai_user: boolean;
        permissions: string[];
      };
    }
  }
}

interface JWTPayload {
  user_id: string;
  email: string;
  iat: number;
  exp: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    // Check if token is blacklisted
    const isBlacklisted = await RedisConnection.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Get user from database with fresh data
    const user = await UserModel.findById(decoded.user_id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('User account is deactivated');
    }

    // Get user permissions
    const permissions = await UserModel.getUserPermissions(user.user_id);

    // Attach user to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      department_id: user.department_id,
      is_ai_user: user.is_ai_user,
      permissions,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    const isBlacklisted = await RedisConnection.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    const user = await UserModel.findById(decoded.user_id);

    if (user && user.is_active) {
      const permissions = await UserModel.getUserPermissions(user.user_id);
      req.user = {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department_id: user.department_id,
        is_ai_user: user.is_ai_user,
        permissions,
      };
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    logger.warn('Optional authentication failed:', error);
    next();
  }
};

// Permission checking middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn('Permission denied:', {
        user_id: req.user.user_id,
        required_permission: permission,
        user_permissions: req.user.permissions,
      });
      throw new ForbiddenError(`Permission '${permission}' required`);
    }

    next();
  };
};

// Multiple permissions check (user needs ALL permissions)
export const requirePermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const missingPermissions = permissions.filter(
      permission => !req.user!.permissions.includes(permission)
    );

    if (missingPermissions.length > 0) {
      logger.warn('Permissions denied:', {
        user_id: req.user.user_id,
        required_permissions: permissions,
        missing_permissions: missingPermissions,
        user_permissions: req.user.permissions,
      });
      throw new ForbiddenError(`Permissions required: ${missingPermissions.join(', ')}`);
    }

    next();
  };
};

// Any of the permissions check (user needs at least ONE permission)
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasPermission = permissions.some(
      permission => req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('No matching permissions:', {
        user_id: req.user.user_id,
        required_permissions: permissions,
        user_permissions: req.user.permissions,
      });
      throw new ForbiddenError(`One of these permissions required: ${permissions.join(', ')}`);
    }

    next();
  };
};

// Admin check
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Check if user has admin permission or is in admin department
  const isAdmin = req.user.permissions.includes('system_settings') || 
                  req.user.permissions.includes('manage_permissions');

  if (!isAdmin) {
    throw new ForbiddenError('Admin access required');
  }

  next();
}; 