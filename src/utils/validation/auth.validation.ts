import { z } from 'zod';

// Common validation rules
const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

const uuidSchema = z.string().uuid('Invalid UUID format');

// Registration validation
export const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required').max(255, 'First name too long'),
    last_name: z.string().min(1, 'Last name is required').max(255, 'Last name too long'),
    email: emailSchema,
    password: passwordSchema,
    department_id: uuidSchema,
    is_ai_user: z.boolean().optional().default(false),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Login validation
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Refresh token validation
export const refreshSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
  query: z.object({}),
  params: z.object({}),
});

// Reset password validation
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    new_password: passwordSchema,
  }),
  query: z.object({}),
  params: z.object({}),
});

// Change password validation
export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: passwordSchema,
  }),
  query: z.object({}),
  params: z.object({}),
});

// Export validation object
export const authValidation = {
  register: registerSchema,
  login: loginSchema,
  refresh: refreshSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
}; 