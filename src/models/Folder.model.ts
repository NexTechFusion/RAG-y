import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@database/connection';
import { AppError, NotFoundError, ConflictError, ForbiddenError } from '@utils/AppError';

export interface IFolder {
  folder_id: string;
  folder_name: string;
  parent_folder_id?: string;
  created_by_user_id: string;
  description?: string;
  access_level: 'public' | 'restricted' | 'private' | 'inherited';
  inherit_permissions: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateFolder {
  folder_name: string;
  parent_folder_id?: string;
  created_by_user_id: string;
  description?: string;
  access_level?: 'public' | 'restricted' | 'private' | 'inherited';
  inherit_permissions?: boolean;
}

export interface IUpdateFolder {
  folder_name?: string;
  parent_folder_id?: string;
  description?: string;
  access_level?: 'public' | 'restricted' | 'private' | 'inherited';
  inherit_permissions?: boolean;
  is_active?: boolean;
}

export interface IFolderWithJoins extends IFolder {
  created_by_name?: string;
  created_by_email?: string;
  parent_folder_name?: string;
  document_count?: number;
  subfolder_count?: number;
}

export interface IFolderPermission {
  folder_permission_id: string;
  folder_id: string;
  department_id?: string;
  user_id?: string;
  permission_type: 'read' | 'write' | 'delete' | 'manage';
  granted_at: Date;
  granted_by_user_id: string;
  is_active: boolean;
}

export interface ICreateFolderPermission {
  folder_id: string;
  department_id?: string;
  user_id?: string;
  permission_type: 'read' | 'write' | 'delete' | 'manage';
  granted_by_user_id: string;
}

export interface IFolderListResult {
  folders: IFolderWithJoins[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IFolderFilters {
  parent_folder_id?: string | undefined;
  created_by_user_id?: string;
  access_level?: string;
  search?: string;
  is_active?: boolean;
}

export class FolderModel {
  private static tableName = 'folders';
  private static permissionsTableName = 'folderpermissions';

  /**
   * Get all folders with pagination and filtering
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: IFolderFilters = {},
    requestingUserId?: string
  ): Promise<IFolderListResult> {
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = ['f.is_active = true'];
    let queryParams: any[] = [];
    let paramCount = 0;

    // Build dynamic WHERE conditions
    if (filters.parent_folder_id !== undefined) {
      paramCount++;
      if (filters.parent_folder_id === null || filters.parent_folder_id === '') {
        whereConditions.push('f.parent_folder_id IS NULL');
      } else {
        whereConditions.push(`f.parent_folder_id = $${paramCount}`);
        queryParams.push(filters.parent_folder_id);
      }
    }

    if (filters.created_by_user_id) {
      paramCount++;
      whereConditions.push(`f.created_by_user_id = $${paramCount}`);
      queryParams.push(filters.created_by_user_id);
    }

    if (filters.access_level) {
      paramCount++;
      whereConditions.push(`f.access_level = $${paramCount}`);
      queryParams.push(filters.access_level);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`(f.folder_name ILIKE $${paramCount} OR f.description ILIKE $${paramCount})`);
      queryParams.push(`%${filters.search}%`);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      whereConditions.push(`f.is_active = $${paramCount}`);
      queryParams.push(filters.is_active);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Main query with joins and document/subfolder counts
    const query = `
      SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as created_by_name,
        u.email as created_by_email,
        pf.folder_name as parent_folder_name,
        COALESCE(doc_count.count, 0) as document_count,
        COALESCE(sub_count.count, 0) as subfolder_count
      FROM ${this.tableName} f
      LEFT JOIN users u ON f.created_by_user_id = u.user_id
      LEFT JOIN ${this.tableName} pf ON f.parent_folder_id = pf.folder_id
      LEFT JOIN (
        SELECT folder_id, COUNT(*) as count 
        FROM documents 
        WHERE is_active = true 
        GROUP BY folder_id
      ) doc_count ON f.folder_id = doc_count.folder_id
      LEFT JOIN (
        SELECT parent_folder_id, COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE is_active = true 
        GROUP BY parent_folder_id
      ) sub_count ON f.folder_id = sub_count.parent_folder_id
      ${whereClause}
      ORDER BY f.folder_name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} f
      ${whereClause}
    `;

    queryParams.push(limit, offset);
    const countParams = queryParams.slice(0, -2); // Remove limit and offset for count

    const [dataResult, countResult] = await Promise.all([
      DatabaseConnection.query(query, queryParams),
      DatabaseConnection.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      folders: dataResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find folder by ID with related information
   */
  static async findById(folderId: string): Promise<IFolderWithJoins | null> {
    const query = `
      SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as created_by_name,
        u.email as created_by_email,
        pf.folder_name as parent_folder_name,
        COALESCE(doc_count.count, 0) as document_count,
        COALESCE(sub_count.count, 0) as subfolder_count
      FROM ${this.tableName} f
      LEFT JOIN users u ON f.created_by_user_id = u.user_id
      LEFT JOIN ${this.tableName} pf ON f.parent_folder_id = pf.folder_id
      LEFT JOIN (
        SELECT folder_id, COUNT(*) as count 
        FROM documents 
        WHERE is_active = true 
        GROUP BY folder_id
      ) doc_count ON f.folder_id = doc_count.folder_id
      LEFT JOIN (
        SELECT parent_folder_id, COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE is_active = true 
        GROUP BY parent_folder_id
      ) sub_count ON f.folder_id = sub_count.parent_folder_id
      WHERE f.folder_id = $1 AND f.is_active = true
    `;

    const result = await DatabaseConnection.query(query, [folderId]);
    return result.rows[0] || null;
  }

  /**
   * Create new folder
   */
  static async create(folderData: ICreateFolder): Promise<IFolder> {
    const folderId = uuidv4();

    // Validate parent folder exists if provided
    if (folderData.parent_folder_id) {
      const parentExists = await this.validateFolderExists(folderData.parent_folder_id);
      if (!parentExists) {
        throw new NotFoundError('Parent folder not found');
      }
    }

    // Check for duplicate names within the same parent folder
    await this.validateUniqueNameInParent(
      folderData.folder_name, 
      folderData.parent_folder_id || null
    );

    // Prevent circular references
    if (folderData.parent_folder_id) {
      await this.validateNoCircularReference(folderId, folderData.parent_folder_id);
    }

    const query = `
      INSERT INTO ${this.tableName} (
        folder_id, folder_name, parent_folder_id, created_by_user_id,
        description, access_level, inherit_permissions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      folderId,
      folderData.folder_name,
      folderData.parent_folder_id || null,
      folderData.created_by_user_id,
      folderData.description || null,
      folderData.access_level || 'inherited',
      folderData.inherit_permissions !== undefined ? folderData.inherit_permissions : true,
    ];

    const result = await DatabaseConnection.query(query, values);
    return result.rows[0];
  }

  /**
   * Update folder
   */
  static async update(folderId: string, updateData: IUpdateFolder): Promise<IFolder> {
    const folder = await this.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Validate parent folder exists if being updated
    if (updateData.parent_folder_id) {
      const parentExists = await this.validateFolderExists(updateData.parent_folder_id);
      if (!parentExists) {
        throw new NotFoundError('Parent folder not found');
      }
      
      // Prevent circular references
      await this.validateNoCircularReference(folderId, updateData.parent_folder_id);
    }

    // Check for duplicate names if name or parent is being updated
    if (updateData.folder_name || updateData.parent_folder_id !== undefined) {
      const newName = updateData.folder_name || folder.folder_name;
      const newParentId = updateData.parent_folder_id !== undefined 
        ? updateData.parent_folder_id 
        : folder.parent_folder_id;
      await this.validateUniqueNameInParent(newName, newParentId || null, folderId);
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return folder;
    }

    values.push(folderId);
    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE folder_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await DatabaseConnection.query(query, values);
    return result.rows[0];
  }

  /**
   * Soft delete folder (and optionally its contents)
   */
  static async delete(folderId: string, deleteContents: boolean = false): Promise<void> {
    const folder = await this.findById(folderId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    if (deleteContents) {
      // Recursively delete all subfolders and documents
      await this.deleteContentsRecursively(folderId);
    } else {
      // Check if folder has contents
      const hasContents = await this.hasFolderContents(folderId);
      if (hasContents) {
        throw new ConflictError('Cannot delete folder with contents. Use deleteContents=true to force deletion.');
      }
    }

    // Soft delete the folder
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE folder_id = $1
    `;

    await DatabaseConnection.query(query, [folderId]);
  }

  /**
   * Get user accessible folders
   */
  static async getUserAccessibleFolders(
    userId: string,
    permissionType: 'read' | 'write' | 'delete' | 'manage' = 'read'
  ): Promise<IFolderWithJoins[]> {
    const query = `
      SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as created_by_name,
        u.email as created_by_email,
        pf.folder_name as parent_folder_name,
        COALESCE(doc_count.count, 0) as document_count,
        COALESCE(sub_count.count, 0) as subfolder_count
      FROM get_user_accessible_folders($1, $2) accessible
      JOIN ${this.tableName} f ON accessible.folder_id = f.folder_id
      LEFT JOIN users u ON f.created_by_user_id = u.user_id
      LEFT JOIN ${this.tableName} pf ON f.parent_folder_id = pf.folder_id
      LEFT JOIN (
        SELECT folder_id, COUNT(*) as count 
        FROM documents 
        WHERE is_active = true 
        GROUP BY folder_id
      ) doc_count ON f.folder_id = doc_count.folder_id
      LEFT JOIN (
        SELECT parent_folder_id, COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE is_active = true 
        GROUP BY parent_folder_id
      ) sub_count ON f.folder_id = sub_count.parent_folder_id
      ORDER BY f.folder_name
    `;

    const result = await DatabaseConnection.query(query, [userId, permissionType]);
    return result.rows;
  }

  /**
   * Check if user has folder permission
   */
  static async checkUserPermission(
    userId: string,
    folderId: string,
    permissionType: 'read' | 'write' | 'delete' | 'manage'
  ): Promise<boolean> {
    const query = 'SELECT user_has_folder_permission($1, $2, $3) as has_permission';
    const result = await DatabaseConnection.query(query, [userId, folderId, permissionType]);
    return result.rows[0].has_permission;
  }

  /**
   * Grant folder permission
   */
  static async grantPermission(permissionData: ICreateFolderPermission): Promise<IFolderPermission> {
    // Validate that folder exists
    const folderExists = await this.validateFolderExists(permissionData.folder_id);
    if (!folderExists) {
      throw new NotFoundError('Folder not found');
    }

    // Validate that either user or department exists
    if (permissionData.user_id) {
      const userExists = await this.validateUserExists(permissionData.user_id);
      if (!userExists) {
        throw new NotFoundError('User not found');
      }
    }

    if (permissionData.department_id) {
      const deptExists = await this.validateDepartmentExists(permissionData.department_id);
      if (!deptExists) {
        throw new NotFoundError('Department not found');
      }
    }

    const permissionId = uuidv4();
    const query = `
      INSERT INTO ${this.permissionsTableName} (
        folder_permission_id, folder_id, department_id, user_id,
        permission_type, granted_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      permissionId,
      permissionData.folder_id,
      permissionData.department_id || null,
      permissionData.user_id || null,
      permissionData.permission_type,
      permissionData.granted_by_user_id,
    ];

    const result = await DatabaseConnection.query(query, values);
    return result.rows[0];
  }

  /**
   * Revoke folder permission
   */
  static async revokePermission(
    folderId: string,
    userId?: string,
    departmentId?: string,
    permissionType?: string
  ): Promise<void> {
    let whereConditions = ['folder_id = $1'];
    let queryParams: any[] = [folderId];
    let paramCount = 1;

    if (userId) {
      paramCount++;
      whereConditions.push(`user_id = $${paramCount}`);
      queryParams.push(userId);
    }

    if (departmentId) {
      paramCount++;
      whereConditions.push(`department_id = $${paramCount}`);
      queryParams.push(departmentId);
    }

    if (permissionType) {
      paramCount++;
      whereConditions.push(`permission_type = $${paramCount}`);
      queryParams.push(permissionType);
    }

    const query = `
      UPDATE ${this.permissionsTableName}
      SET is_active = false
      WHERE ${whereConditions.join(' AND ')}
    `;

    await DatabaseConnection.query(query, queryParams);
  }

  /**
   * Get folder permissions
   */
  static async getFolderPermissions(folderId: string): Promise<any[]> {
    const query = `
      SELECT 
        fp.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email,
        d.department_name,
        gb.first_name || ' ' || gb.last_name as granted_by_name
      FROM ${this.permissionsTableName} fp
      LEFT JOIN users u ON fp.user_id = u.user_id
      LEFT JOIN departments d ON fp.department_id = d.department_id
      LEFT JOIN users gb ON fp.granted_by_user_id = gb.user_id
      WHERE fp.folder_id = $1 AND fp.is_active = true
      ORDER BY fp.permission_type, d.department_name, u.first_name
    `;

    const result = await DatabaseConnection.query(query, [folderId]);
    return result.rows;
  }

  /**
   * Get folder hierarchy (breadcrumb)
   */
  static async getFolderHierarchy(folderId: string): Promise<IFolder[]> {
    const query = `
      WITH RECURSIVE folder_path AS (
        SELECT folder_id, folder_name, parent_folder_id, 0 as level
        FROM ${this.tableName}
        WHERE folder_id = $1 AND is_active = true
        
        UNION ALL
        
        SELECT f.folder_id, f.folder_name, f.parent_folder_id, fp.level + 1
        FROM ${this.tableName} f
        JOIN folder_path fp ON f.folder_id = fp.parent_folder_id
        WHERE f.is_active = true
      )
      SELECT folder_id, folder_name, parent_folder_id
      FROM folder_path
      ORDER BY level DESC
    `;

    const result = await DatabaseConnection.query(query, [folderId]);
    return result.rows;
  }

  // Private helper methods
  private static async validateFolderExists(folderId: string): Promise<boolean> {
    const query = `SELECT folder_id FROM ${this.tableName} WHERE folder_id = $1 AND is_active = true`;
    const result = await DatabaseConnection.query(query, [folderId]);
    return result.rows.length > 0;
  }

  private static async validateUserExists(userId: string): Promise<boolean> {
    const query = 'SELECT user_id FROM users WHERE user_id = $1 AND is_active = true';
    const result = await DatabaseConnection.query(query, [userId]);
    return result.rows.length > 0;
  }

  private static async validateDepartmentExists(departmentId: string): Promise<boolean> {
    const query = 'SELECT department_id FROM departments WHERE department_id = $1';
    const result = await DatabaseConnection.query(query, [departmentId]);
    return result.rows.length > 0;
  }

  private static async validateUniqueNameInParent(
    folderName: string,
    parentFolderId: string | null,
    excludeFolderId?: string
  ): Promise<void> {
    let query = `
      SELECT folder_id FROM ${this.tableName}
      WHERE folder_name = $1 AND is_active = true
    `;
    const params: any[] = [folderName];

    if (parentFolderId) {
      query += ' AND parent_folder_id = $2';
      params.push(parentFolderId);
    } else {
      query += ' AND parent_folder_id IS NULL';
    }

    if (excludeFolderId) {
      query += ` AND folder_id != $${params.length + 1}`;
      params.push(excludeFolderId);
    }

    const result = await DatabaseConnection.query(query, params);
    if (result.rows.length > 0) {
      throw new ConflictError('Folder with this name already exists in the parent directory');
    }
  }

  private static async validateNoCircularReference(
    folderId: string,
    parentFolderId: string
  ): Promise<void> {
    // Check if the parent folder is actually a descendant of the current folder
    const query = `
      WITH RECURSIVE folder_descendants AS (
        SELECT folder_id, parent_folder_id
        FROM ${this.tableName}
        WHERE folder_id = $1 AND is_active = true
        
        UNION ALL
        
        SELECT f.folder_id, f.parent_folder_id
        FROM ${this.tableName} f
        JOIN folder_descendants fd ON f.parent_folder_id = fd.folder_id
        WHERE f.is_active = true
      )
      SELECT folder_id FROM folder_descendants WHERE folder_id = $2
    `;

    const result = await DatabaseConnection.query(query, [folderId, parentFolderId]);
    if (result.rows.length > 0) {
      throw new ConflictError('Cannot create circular folder reference');
    }
  }

  private static async hasFolderContents(folderId: string): Promise<boolean> {
    const documentsQuery = `
      SELECT COUNT(*) as count FROM documents 
      WHERE folder_id = $1 AND is_active = true
    `;
    
    const subfoldersQuery = `
      SELECT COUNT(*) as count FROM ${this.tableName} 
      WHERE parent_folder_id = $1 AND is_active = true
    `;

    const [docsResult, foldersResult] = await Promise.all([
      DatabaseConnection.query(documentsQuery, [folderId]),
      DatabaseConnection.query(subfoldersQuery, [folderId])
    ]);

    const docCount = parseInt(docsResult.rows[0].count);
    const folderCount = parseInt(foldersResult.rows[0].count);

    return docCount > 0 || folderCount > 0;
  }

  private static async deleteContentsRecursively(folderId: string): Promise<void> {
    // Get all subfolders
    const subfoldersQuery = `
      SELECT folder_id FROM ${this.tableName} 
      WHERE parent_folder_id = $1 AND is_active = true
    `;
    const subfoldersResult = await DatabaseConnection.query(subfoldersQuery, [folderId]);

    // Recursively delete subfolders
    for (const subfolder of subfoldersResult.rows) {
      await this.deleteContentsRecursively(subfolder.folder_id);
    }

    // Delete all documents in this folder
    const deleteDocsQuery = `
      UPDATE documents 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE folder_id = $1
    `;
    await DatabaseConnection.query(deleteDocsQuery, [folderId]);

    // Delete all subfolders
    const deleteFoldersQuery = `
      UPDATE ${this.tableName} 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE parent_folder_id = $1
    `;
    await DatabaseConnection.query(deleteFoldersQuery, [folderId]);
  }
} 