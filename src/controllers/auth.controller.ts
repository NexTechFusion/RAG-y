import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@config/config';
import { UserModel } from '@models/User.model';
import { RedisConnection } from '@database/redis';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  NotFoundError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

interface TokenPayload {
  user_id: string;
  email: string;
}

export class AuthController {
  // Generate JWT token
  private static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '15m' });
  }

  // Generate refresh token
  private static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' });
  }

  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    const { first_name, last_name, email, password, department_id, is_ai_user } = req.body;

    logger.info('User registration attempt:', { email, department_id });

    try {
      // Create user
      const user = await UserModel.create({
        first_name,
        last_name,
        email,
        password,
        department_id,
        is_ai_user,
      });

      // Generate tokens
      const tokenPayload = { user_id: user.user_id, email: user.email };
      const accessToken = AuthController.generateToken(tokenPayload);
      const refreshToken = AuthController.generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      const refreshTokenKey = `refresh_token:${user.user_id}`;
      await RedisConnection.set(refreshTokenKey, refreshToken, { 
        EX: 7 * 24 * 60 * 60 // 7 days
      });

      logger.info('User registered successfully:', { user_id: user.user_id, email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            is_ai_user: user.is_ai_user,
            created_at: user.created_at,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt.expiresIn,
        },
      });
    } catch (error) {
      logger.error('Registration failed:', { email, error });
      throw error;
    }
  }

  // User login
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    logger.info('Login attempt:', { email });

    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await UserModel.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn('Invalid password attempt:', { email });
        throw new UnauthorizedError('Invalid email or password');
      }

      // Update last login
      await UserModel.updateLastLogin(user.user_id);

      // Generate tokens
      const tokenPayload = { user_id: user.user_id, email: user.email };
      const accessToken = AuthController.generateToken(tokenPayload);
      const refreshToken = AuthController.generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      const refreshTokenKey = `refresh_token:${user.user_id}`;
      await RedisConnection.set(refreshTokenKey, refreshToken, { 
        EX: 7 * 24 * 60 * 60 // 7 days
      });

      // Get user permissions
      const permissions = await UserModel.getUserPermissions(user.user_id);

      logger.info('User logged in successfully:', { user_id: user.user_id, email });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department_id: user.department_id,
            is_ai_user: user.is_ai_user,
            permissions,
            last_login_at: new Date(),
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt.expiresIn,
        },
      });
    } catch (error) {
      logger.error('Login failed:', { email, error });
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refresh_token } = req.body;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refresh_token, config.jwt.refreshSecret) as TokenPayload;

      // Check if refresh token exists in Redis
      const refreshTokenKey = `refresh_token:${decoded.user_id}`;
      const storedToken = await RedisConnection.get(refreshTokenKey);

      if (!storedToken || storedToken !== refresh_token) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Get user to ensure they still exist and are active
      const user = await UserModel.findById(decoded.user_id);
      if (!user || !user.is_active) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new tokens
      const tokenPayload = { user_id: user.user_id, email: user.email };
      const newAccessToken = AuthController.generateToken(tokenPayload);
      const newRefreshToken = AuthController.generateRefreshToken(tokenPayload);

      // Update refresh token in Redis
      await RedisConnection.set(refreshTokenKey, newRefreshToken, { 
        EX: 7 * 24 * 60 * 60 // 7 days
      });

      logger.info('Token refreshed successfully:', { user_id: user.user_id });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: config.jwt.expiresIn,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  // User logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Get token expiry to set appropriate TTL for blacklist
        const decoded = jwt.decode(token) as any;
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = decoded.exp - currentTime;

        if (remainingTime > 0) {
          // Add token to blacklist
          await RedisConnection.set(`blacklist:${token}`, 'true', { EX: remainingTime });
        }

        // If we have user info, remove refresh token
        if (req.user) {
          const refreshTokenKey = `refresh_token:${req.user.user_id}`;
          await RedisConnection.del(refreshTokenKey);
          
          logger.info('User logged out:', { user_id: req.user.user_id });
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      // Even if logout fails, we should respond successfully
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenKey = `password_reset:${resetToken}`;
      
      // Store reset token with user ID for 1 hour
      await RedisConnection.set(resetTokenKey, user.user_id, { EX: 3600 });

      // TODO: Send email with reset link
      // For now, we'll just log it (in production, implement email service)
      logger.info('Password reset requested:', { 
        email, 
        user_id: user.user_id, 
        reset_token: resetToken 
      });

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // In development, return the token for testing
        ...(config.nodeEnv === 'development' && { reset_token: resetToken })
      });
    } catch (error) {
      logger.error('Forgot password error:', { email, error });
      throw error;
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, new_password } = req.body;

    try {
      // Get user ID from reset token
      const resetTokenKey = `password_reset:${token}`;
      const userId = await RedisConnection.get(resetTokenKey);

      if (!userId) {
        throw new BadRequestError('Invalid or expired reset token');
      }

      // Update password
      await UserModel.changePassword(userId, new_password);

      // Remove reset token
      await RedisConnection.del(resetTokenKey);

      // Remove all refresh tokens for this user (force re-login)
      const refreshTokenKey = `refresh_token:${userId}`;
      await RedisConnection.del(refreshTokenKey);

      logger.info('Password reset successfully:', { user_id: userId });

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Reset password error:', { token, error });
      throw error;
    }
  }

  // Change password (for authenticated users)
  static async changePassword(req: Request, res: Response): Promise<void> {
    const { current_password, new_password } = req.body;

    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    try {
      // Get current user
      const user = await UserModel.findById(req.user.user_id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await UserModel.comparePassword(
        current_password, 
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestError('Current password is incorrect');
      }

      // Update password
      await UserModel.changePassword(req.user.user_id, new_password);

      // Remove all refresh tokens for this user (force re-login on other devices)
      const refreshTokenKey = `refresh_token:${req.user.user_id}`;
      await RedisConnection.del(refreshTokenKey);

      logger.info('Password changed successfully:', { user_id: req.user.user_id });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', { user_id: req.user?.user_id, error });
      throw error;
    }
  }
} 