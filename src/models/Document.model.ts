import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@database/connection';
import { AppError, NotFoundError, ConflictError } from '@utils/AppError';

export interface IDocument {
  document_id: string;
  document_name: string;
  file_path: string;
  folder_id?: string;
  uploaded_by_user_id: string;
  file_size_bytes: number;
  mime_type?: string;
  file_hash?: string;
  version_number: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateDocument {
  document_name: string;
  file_path: string;
  folder_id?: string;
  uploaded_by_user_id: string;
  file_size_bytes: number;
  mime_type?: string;
  file_hash?: string;
}

export interface IUpdateDocument {
  document_name?: string;
  file_path?: string;
  folder_id?: string;
  file_size_bytes?: number;
  mime_type?: string;
  is_active?: boolean;
}

export interface IDocumentFilters {
  folder_id?: string;
  uploaded_by_user_id?: string;
  mime_type?: string;
  search?: string;
  is_active?: boolean;
}

export interface IDocumentWithJoins extends IDocument {
  uploaded_by_name?: string;
  uploaded_by_email?: string;
  folder_name?: string;
  parent_folder_id?: string;
}

export interface IDocumentListResult {
  documents: IDocumentWithJoins[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DocumentModel {
  private static tableName = 'documents';

  /**
   * Get all documents with pagination and filtering
   */
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: IDocumentFilters = {}
  ): Promise<IDocumentListResult> {
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = ['d.is_active = true'];
    let queryParams: any[] = [];
    let paramCount = 0;

    // Build dynamic WHERE conditions
    if (filters.folder_id) {
      paramCount++;
      whereConditions.push(`d.folder_id = $${paramCount}`);
      queryParams.push(filters.folder_id);
    }

    if (filters.uploaded_by_user_id) {
      paramCount++;
      whereConditions.push(`d.uploaded_by_user_id = $${paramCount}`);
      queryParams.push(filters.uploaded_by_user_id);
    }

    if (filters.mime_type) {
      paramCount++;
      whereConditions.push(`d.mime_type = $${paramCount}`);
      queryParams.push(filters.mime_type);
    }

    if (filters.search) {
      paramCount++;
      whereConditions.push(`d.document_name ILIKE $${paramCount}`);
      queryParams.push(`%${filters.search}%`);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      whereConditions.push(`d.is_active = $${paramCount}`);
      queryParams.push(filters.is_active);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Main query with joins
    const query = `
      SELECT 
        d.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        u.email as uploaded_by_email,
        f.folder_name,
        f.parent_folder_id
      FROM ${this.tableName} d
      LEFT JOIN users u ON d.uploaded_by_user_id = u.user_id
      LEFT JOIN folders f ON d.folder_id = f.folder_id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} d
      ${whereClause}
    `;

    queryParams.push(limit, offset);

    const [documentsResult, countResult] = await Promise.all([
      DatabaseConnection.query(query, queryParams),
      DatabaseConnection.query(countQuery, queryParams.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      documents: documentsResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find document by ID
   */
  static async findById(documentId: string): Promise<IDocumentWithJoins | null> {
    const query = `
      SELECT 
        d.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        u.email as uploaded_by_email,
        f.folder_name,
        f.parent_folder_id
      FROM ${this.tableName} d
      LEFT JOIN users u ON d.uploaded_by_user_id = u.user_id
      LEFT JOIN folders f ON d.folder_id = f.folder_id
      WHERE d.document_id = $1 AND d.is_active = true
    `;

    const result = await DatabaseConnection.query(query, [documentId]);
    return result.rows[0] || null;
  }

  /**
   * Create new document
   */
  static async create(documentData: ICreateDocument): Promise<IDocument> {
    const documentId = uuidv4();

    // Validate folder exists if provided
    if (documentData.folder_id) {
      const folderExists = await this.validateFolderExists(documentData.folder_id);
      if (!folderExists) {
        throw new NotFoundError('Folder not found');
      }
    }

    // Check for duplicate names in the same folder
    await this.validateUniqueNameInFolder(documentData.document_name, documentData.folder_id || null);

    const query = `
      INSERT INTO ${this.tableName} (
        document_id, document_name, file_path, folder_id, uploaded_by_user_id,
        file_size_bytes, mime_type, file_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      documentId,
      documentData.document_name,
      documentData.file_path,
      documentData.folder_id || null,
      documentData.uploaded_by_user_id,
      documentData.file_size_bytes,
      documentData.mime_type || null,
      documentData.file_hash || null,
    ];

    const result = await DatabaseConnection.query(query, values);
    return result.rows[0];
  }

  /**
   * Update document
   */
  static async update(documentId: string, updateData: IUpdateDocument): Promise<IDocument> {
    const document = await this.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Validate folder exists if being updated
    if (updateData.folder_id) {
      const folderExists = await this.validateFolderExists(updateData.folder_id);
      if (!folderExists) {
        throw new NotFoundError('Folder not found');
      }
    }

    // Check for duplicate names if name or folder is being updated
    if (updateData.document_name || updateData.folder_id !== undefined) {
      const newName = updateData.document_name || document.document_name;
      const newFolderId = updateData.folder_id !== undefined ? updateData.folder_id : document.folder_id;
      await this.validateUniqueNameInFolder(newName, newFolderId || null, documentId);
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
      return document;
    }

    values.push(documentId);
    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE document_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await DatabaseConnection.query(query, values);
    return result.rows[0];
  }

  /**
   * Soft delete document
   */
  static async delete(documentId: string): Promise<void> {
    const document = await this.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    const query = `
      UPDATE ${this.tableName}
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE document_id = $1
    `;

    await DatabaseConnection.query(query, [documentId]);
  }

  /**
   * Get documents by folder ID
   */
  static async findByFolder(
    folderId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IDocumentListResult> {
    return this.findAll(page, limit, { folder_id: folderId });
  }

  /**
   * Get documents by user ID
   */
  static async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IDocumentListResult> {
    return this.findAll(page, limit, { uploaded_by_user_id: userId });
  }

  /**
   * Check if document name is unique within folder
   */
  private static async validateUniqueNameInFolder(
    documentName: string,
    folderId: string | null,
    excludeDocumentId?: string
  ): Promise<void> {
    let query = `
      SELECT document_id FROM ${this.tableName}
      WHERE document_name = $1 AND is_active = true
    `;
    const params: any[] = [documentName];

    if (folderId) {
      query += ' AND folder_id = $2';
      params.push(folderId);
    } else {
      query += ' AND folder_id IS NULL';
    }

    if (excludeDocumentId) {
      query += ` AND document_id != $${params.length + 1}`;
      params.push(excludeDocumentId);
    }

    const result = await DatabaseConnection.query(query, params);
    if (result.rows.length > 0) {
      throw new ConflictError('Document with this name already exists in the folder');
    }
  }

  /**
   * Validate that folder exists
   */
  private static async validateFolderExists(folderId: string): Promise<boolean> {
    const query = 'SELECT folder_id FROM folders WHERE folder_id = $1 AND is_active = true';
    const result = await DatabaseConnection.query(query, [folderId]);
    return result.rows.length > 0;
  }

  /**
   * Get document statistics
   */
  static async getStatistics(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_documents,
        COALESCE(SUM(file_size_bytes), 0) as total_file_size,
        COUNT(DISTINCT mime_type) as unique_mime_types,
        COUNT(DISTINCT uploaded_by_user_id) as unique_uploaders
      FROM ${this.tableName}
    `;

    const result = await DatabaseConnection.query(query);
    return result.rows[0];
  }

  /**
   * Search documents by content or metadata
   */
  static async search(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    filters: IDocumentFilters = {}
  ): Promise<IDocumentListResult> {
    return this.findAll(page, limit, {
      ...filters,
      search: searchTerm,
    });
  }
} 