import { DatabaseConnection } from '@database/connection';
import { AppError, NotFoundError } from '@utils/AppError';

export interface IPermission {
  permission_id: string;
  permission_name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: Date;
}

export class PermissionModel {
  private static tableName = 'permissions';

  static async findAll(category?: string): Promise<IPermission[]> {
    let query = `
      SELECT * FROM ${this.tableName}
      WHERE is_active = true
    `;
    
    const queryParams: any[] = [];
    
    if (category) {
      query += ' AND category = $1';
      queryParams.push(category);
    }
    
    query += ' ORDER BY category, permission_name';

    const result = await DatabaseConnection.query(query, queryParams);
    return result.rows;
  }

  static async findById(permissionId: string): Promise<IPermission | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE permission_id = $1 AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [permissionId]);
    return result.rows[0] || null;
  }

  static async findByName(permissionName: string): Promise<IPermission | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE permission_name = $1 AND is_active = true
    `;

    const result = await DatabaseConnection.query(query, [permissionName]);
    return result.rows[0] || null;
  }

  static async getCategories(): Promise<string[]> {
    const query = `
      SELECT DISTINCT category
      FROM ${this.tableName}
      WHERE is_active = true AND category IS NOT NULL
      ORDER BY category
    `;

    const result = await DatabaseConnection.query(query);
    return result.rows.map((row: any) => row.category);
  }

  static async getDepartmentPermissions(departmentId: string): Promise<IPermission[]> {
    const query = `
      SELECT p.*, dp.granted_at, dp.granted_by_user_id
      FROM ${this.tableName} p
      JOIN departmentpermissions dp ON p.permission_id = dp.permission_id
      WHERE dp.department_id = $1 AND p.is_active = true
      ORDER BY p.category, p.permission_name
    `;

    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows;
  }

  static async getUserPermissions(userId: string): Promise<IPermission[]> {
    const query = `
      SELECT DISTINCT p.*, dp.granted_at
      FROM ${this.tableName} p
      JOIN departmentpermissions dp ON p.permission_id = dp.permission_id
      JOIN users u ON dp.department_id = u.department_id
      WHERE u.user_id = $1 AND u.is_active = true AND p.is_active = true
      ORDER BY p.category, p.permission_name
    `;

    const result = await DatabaseConnection.query(query, [userId]);
    return result.rows;
  }

  static async getAvailablePermissionsForDepartment(departmentId: string): Promise<IPermission[]> {
    const query = `
      SELECT p.*
      FROM ${this.tableName} p
      WHERE p.is_active = true
      AND p.permission_id NOT IN (
        SELECT dp.permission_id
        FROM departmentpermissions dp
        WHERE dp.department_id = $1
      )
      ORDER BY p.category, p.permission_name
    `;

    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows;
  }
} 