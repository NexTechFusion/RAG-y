import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@database/connection';
import { AppError, NotFoundError, ConflictError } from '@utils/AppError';

export interface IDepartment {
  department_id: string;
  department_name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateDepartment {
  department_name: string;
  description?: string;
}

export interface IUpdateDepartment {
  department_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface IDepartmentWithStats {
  department_id: string;
  department_name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  user_count: number;
  permission_count: number;
}

export class DepartmentModel {
  private static tableName = 'departments';

  static async create(departmentData: ICreateDepartment): Promise<IDepartment> {
    const departmentId = uuidv4();

    // Check if department name already exists
    const existingDepartment = await this.findByName(departmentData.department_name);
    if (existingDepartment) {
      throw new ConflictError('Department name already exists');
    }

    const query = `
      INSERT INTO ${this.tableName} (
        department_id, department_name, description, created_at, updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      departmentId,
      departmentData.department_name,
      departmentData.description || null,
    ];

    try {
      const result = await DatabaseConnection.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictError('Department name already exists');
      }
      throw error;
    }
  }

  static async findById(departmentId: string): Promise<IDepartment | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE department_id = $1 AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows[0] || null;
  }

  static async findByName(departmentName: string): Promise<IDepartment | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE LOWER(department_name) = LOWER($1) AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [departmentName]);
    return result.rows[0] || null;
  }

  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      search?: string;
      is_active?: boolean;
    } = {}
  ): Promise<{
    departments: IDepartmentWithStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let whereConditions = ['d.is_active = true'];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (filters.is_active !== undefined) {
      whereConditions[0] = `d.is_active = $${++paramCount}`;
      queryParams.push(filters.is_active);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(
        d.department_name ILIKE $${paramCount} OR 
        d.description ILIKE $${paramCount}
      )`);
      queryParams.push(`%${filters.search}%`);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} d
      WHERE ${whereClause}
    `;

    const countResult = await DatabaseConnection.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Data query with pagination and statistics
    const offset = (page - 1) * limit;
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const dataQuery = `
      SELECT 
        d.*,
        COUNT(DISTINCT u.user_id) as user_count,
        COUNT(DISTINCT dp.permission_id) as permission_count
      FROM ${this.tableName} d
      LEFT JOIN users u ON d.department_id = u.department_id AND u.is_active = true
      LEFT JOIN departmentpermissions dp ON d.department_id = dp.department_id
      WHERE ${whereClause}
      GROUP BY d.department_id, d.department_name, d.description, d.is_active, d.created_at, d.updated_at
      ORDER BY d.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const dataResult = await DatabaseConnection.query(dataQuery, queryParams);

    return {
      departments: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(departmentId: string, updateData: IUpdateDepartment): Promise<IDepartment> {
    // Check if department exists
    const existingDepartment = await this.findById(departmentId);
    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
    }

    // Check department name uniqueness if name is being updated
    if (updateData.department_name && updateData.department_name !== existingDepartment.department_name) {
      const nameExists = await this.findByName(updateData.department_name);
      if (nameExists) {
        throw new ConflictError('Department name already exists');
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
      return existingDepartment;
    }

    paramCount++;
    queryParams.push(departmentId);

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE department_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await DatabaseConnection.query(query, queryParams);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError('Department name already exists');
      }
      throw error;
    }
  }

  static async delete(departmentId: string): Promise<void> {
    // Check if department exists
    const existingDepartment = await this.findById(departmentId);
    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
    }

    // Check if department has active users
    const userCountQuery = `
      SELECT COUNT(*) as user_count
      FROM users
      WHERE department_id = $1 AND is_active = true
    `;
    const userCountResult = await DatabaseConnection.query(userCountQuery, [departmentId]);
    const userCount = parseInt(userCountResult.rows[0].user_count);

    if (userCount > 0) {
      throw new AppError('Cannot delete department with active users', 400);
    }

    // Soft delete (set is_active to false)
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false, updated_at = NOW()
      WHERE department_id = $1
    `;

    await DatabaseConnection.query(query, [departmentId]);
  }

  static async getDepartmentUsers(departmentId: string): Promise<any[]> {
    const query = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_ai_user,
        u.is_active,
        u.last_login_at,
        u.created_at
      FROM users u
      WHERE u.department_id = $1
      ORDER BY u.created_at DESC
    `;

    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows;
  }

  static async getDepartmentPermissions(departmentId: string): Promise<any[]> {
    const query = `
      SELECT 
        p.permission_id,
        p.permission_name,
        p.description,
        p.category,
        dp.granted_at
      FROM permissions p
      JOIN departmentpermissions dp ON p.permission_id = dp.permission_id
      WHERE dp.department_id = $1 AND p.is_active = true
      ORDER BY p.category, p.permission_name
    `;

    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows;
  }

  static async addPermission(departmentId: string, permissionId: string, grantedByUserId?: string): Promise<void> {
    // Check if department exists
    const department = await this.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    // Check if permission already exists for this department
    const existingQuery = `
      SELECT 1 FROM departmentpermissions
      WHERE department_id = $1 AND permission_id = $2
    `;
    const existingResult = await DatabaseConnection.query(existingQuery, [departmentId, permissionId]);
    
    if (existingResult.rows.length > 0) {
      throw new ConflictError('Permission already granted to this department');
    }

    const query = `
      INSERT INTO departmentpermissions (department_id, permission_id, granted_by_user_id)
      VALUES ($1, $2, $3)
    `;

    try {
      await DatabaseConnection.query(query, [departmentId, permissionId, grantedByUserId || null]);
    } catch (error: any) {
      if (error.code === '23503') { // Foreign key violation
        throw new AppError('Invalid department ID or permission ID', 400);
      }
      throw error;
    }
  }

  static async removePermission(departmentId: string, permissionId: string): Promise<void> {
    const query = `
      DELETE FROM departmentpermissions
      WHERE department_id = $1 AND permission_id = $2
    `;

    const result = await DatabaseConnection.query(query, [departmentId, permissionId]);
    
    if (result.rowCount === 0) {
      throw new NotFoundError('Permission not found for this department');
    }
  }
} 