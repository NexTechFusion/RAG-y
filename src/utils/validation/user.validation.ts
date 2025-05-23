import { z } from 'zod';

// Common validation rules
const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
const uuidSchema = z.string().uuid('Invalid UUID format');
const nameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');

// Create user validation
export const createUserSchema = z.object({
  body: z.object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    department_id: uuidSchema,
    is_ai_user: z.boolean().optional().default(false),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Update user validation
export const updateUserSchema = z.object({
  body: z.object({
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    email: emailSchema.optional(),
    department_id: uuidSchema.optional(),
    is_active: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get user by ID validation
export const getUserByIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get users list validation
export const getUsersListSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    department_id: uuidSchema.optional(),
    is_ai_user: z.string().transform(val => val === 'true').optional(),
    search: z.string().optional(),
  }),
  params: z.object({}),
});

// Delete user validation
export const deleteUserSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Change user password validation
export const changeUserPasswordSchema = z.object({
  body: z.object({
    new_password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Export validation object
export const userValidation = {
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  getUserById: getUserByIdSchema,
  getUsersList: getUsersListSchema,
  deleteUser: deleteUserSchema,
  changeUserPassword: changeUserPasswordSchema,
}; 