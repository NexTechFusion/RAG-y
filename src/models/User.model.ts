import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { DatabaseConnection } from '@database/connection';
import { config } from '@config/config';
import { AppError, NotFoundError, ConflictError } from '@utils/AppError';

export interface IUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  department_id: string;
  is_ai_user: boolean;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department_id: string;
  is_ai_user?: boolean;
}

export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  department_id?: string;
  is_active?: boolean;
}

export class UserModel {
  private static tableName = 'users';

  static async create(userData: ICreateUser): Promise<IUser> {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);

    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const query = `
      INSERT INTO ${this.tableName} (
        user_id, first_name, last_name, email, password_hash, 
        department_id, is_ai_user, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      userId,
      userData.first_name,
      userData.last_name,
      userData.email,
      hashedPassword,
      userData.department_id,
      userData.is_ai_user || false,
    ];

    try {
      const result = await DatabaseConnection.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictError('Email already exists');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new AppError('Invalid department ID', 400);
      }
      throw error;
    }
  }

  static async findById(userId: string): Promise<IUser | null> {
    const query = `
      SELECT u.*, d.department_name 
      FROM ${this.tableName} u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE u.user_id = $1 AND u.is_active = true
    `;

    const result = await DatabaseConnection.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE email = $1 AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      department_id?: string;
      is_ai_user?: boolean;
      search?: string;
    } = {}
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let whereConditions = ['u.is_active = true'];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (filters.department_id) {
      paramCount++;
      whereConditions.push(`u.department_id = $${paramCount}`);
      queryParams.push(filters.department_id);
    }

    if (filters.is_ai_user !== undefined) {
      paramCount++;
      whereConditions.push(`u.is_ai_user = $${paramCount}`);
      queryParams.push(filters.is_ai_user);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(
        u.first_name ILIKE $${paramCount} OR 
        u.last_name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount}
      )`);
      queryParams.push(`%${filters.search}%`);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} u
      WHERE ${whereClause}
    `;

    const countResult = await DatabaseConnection.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Data query with pagination
    const offset = (page - 1) * limit;
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const dataQuery = `
      SELECT u.*, d.department_name
      FROM ${this.tableName} u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const dataResult = await DatabaseConnection.query(dataQuery, queryParams);

    return {
      users: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(userId: string, updateData: IUpdateUser): Promise<IUser> {
    // Check if user exists
    const existingUser = await this.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.findByEmail(updateData.email);
      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        queryParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return existingUser;
    }

    paramCount++;
    queryParams.push(userId);

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await DatabaseConnection.query(query, queryParams);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError('Email already exists');
      }
      if (error.code === '23503') {
        throw new AppError('Invalid department ID', 400);
      }
      throw error;
    }
  }

  static async delete(userId: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false, updated_at = NOW()
      WHERE user_id = $1 AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [userId]);
    
    if (result.rowCount === 0) {
      throw new NotFoundError('User not found');
    }
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE user_id = $1
    `;

    await DatabaseConnection.query(query, [userId]);
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    
    const query = `
      UPDATE ${this.tableName}
      SET password_hash = $1, updated_at = NOW()
      WHERE user_id = $2
    `;

    const result = await DatabaseConnection.query(query, [hashedPassword, userId]);
    
    if (result.rowCount === 0) {
      throw new NotFoundError('User not found');
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT p.permission_name
      FROM users u
      JOIN departments d ON u.department_id = d.department_id
      JOIN departmentpermissions dp ON d.department_id = dp.department_id
      JOIN permissions p ON dp.permission_id = p.permission_id
      WHERE u.user_id = $1 AND u.is_active = true AND p.is_active = true
    `;

    const result = await DatabaseConnection.query(query, [userId]);
    return result.rows.map((row: any) => row.permission_name);
  }
} 