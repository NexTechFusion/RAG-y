import { Request, Response } from 'express';
import { DocumentService } from '@services/document.service';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class DocumentController {
  /**
   * Get all documents with pagination and filtering
   */
  static async getDocuments(req: Request, res: Response): Promise<void> {
    const { page, limit, folder_id, uploaded_by_user_id, mime_type, search, is_active } = req.query;

    logger.info('Fetching documents list:', { 
      page, 
      limit, 
      folder_id,
      uploaded_by_user_id,
      mime_type,
      search,
      is_active,
      requested_by: req.user?.user_id 
    });

    try {
      const filters: {
        folder_id?: string;
        uploaded_by_user_id?: string;
        mime_type?: string;
        search?: string;
        is_active?: boolean;
      } = {};

      if (folder_id && typeof folder_id === 'string') {
        filters.folder_id = folder_id;
      }
      if (uploaded_by_user_id && typeof uploaded_by_user_id === 'string') {
        filters.uploaded_by_user_id = uploaded_by_user_id;
      }
      if (mime_type && typeof mime_type === 'string') {
        filters.mime_type = mime_type;
      }
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }

      const result = await DocumentService.getDocuments(
        Number(page) || 1,
        Number(limit) || 10,
        filters,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Documents fetched successfully:', { 
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          documents: result.documents.map(doc => ({
            document_id: doc.document_id,
            document_name: doc.document_name,
            file_path: doc.file_path,
            folder_id: doc.folder_id,
            folder_name: doc.folder_name,
            uploaded_by_user_id: doc.uploaded_by_user_id,
            uploaded_by_name: doc.uploaded_by_name,
            uploaded_by_email: doc.uploaded_by_email,
            file_size_bytes: doc.file_size_bytes,
            mime_type: doc.mime_type,
            file_hash: doc.file_hash,
            version_number: doc.version_number,
            is_active: doc.is_active,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch documents:', { error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Document ID is required');
    }

    logger.info('Fetching document by ID:', { document_id: id, requested_by: req.user?.user_id });

    try {
      const document = await DocumentService.getDocumentById(
        id,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document fetched successfully:', { document_id: id, requested_by: req.user?.user_id });

      res.json({
        success: true,
        message: 'Document retrieved successfully',
        data: {
          document: {
            document_id: document.document_id,
            document_name: document.document_name,
            file_path: document.file_path,
            folder_id: document.folder_id,
            folder_name: document.folder_name,
            uploaded_by_user_id: document.uploaded_by_user_id,
            uploaded_by_name: document.uploaded_by_name,
            uploaded_by_email: document.uploaded_by_email,
            file_size_bytes: document.file_size_bytes,
            mime_type: document.mime_type,
            file_hash: document.file_hash,
            version_number: document.version_number,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch document:', { document_id: id, error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  /**
   * Create new document
   */
  static async createDocument(req: Request, res: Response): Promise<void> {
    const { document_name, file_path, folder_id, file_size_bytes, mime_type, file_hash } = req.body;

    logger.info('Creating new document:', { 
      document_name,
      folder_id,
      file_size_bytes,
      mime_type,
      created_by: req.user?.user_id 
    });

    try {
      const documentData = {
        document_name,
        file_path,
        folder_id,
        file_size_bytes,
        mime_type,
        file_hash,
        uploaded_by_user_id: req.user!.user_id, // This will be overridden in service
      };

      const document = await DocumentService.createDocument(
        documentData,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document created successfully:', { 
        document_id: document.document_id,
        document_name: document.document_name,
        created_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'Document created successfully',
        data: {
          document: {
            document_id: document.document_id,
            document_name: document.document_name,
            file_path: document.file_path,
            folder_id: document.folder_id,
            uploaded_by_user_id: document.uploaded_by_user_id,
            file_size_bytes: document.file_size_bytes,
            mime_type: document.mime_type,
            file_hash: document.file_hash,
            version_number: document.version_number,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to create document:', { 
        document_name, 
        error, 
        created_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Update document
   */
  static async updateDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Document ID is required');
    }

    logger.info('Updating document:', { 
      document_id: id,
      update_fields: Object.keys(updateData),
      updated_by: req.user?.user_id 
    });

    try {
      const document = await DocumentService.updateDocument(
        id,
        updateData,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document updated successfully:', { 
        document_id: id,
        updated_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Document updated successfully',
        data: {
          document: {
            document_id: document.document_id,
            document_name: document.document_name,
            file_path: document.file_path,
            folder_id: document.folder_id,
            uploaded_by_user_id: document.uploaded_by_user_id,
            file_size_bytes: document.file_size_bytes,
            mime_type: document.mime_type,
            file_hash: document.file_hash,
            version_number: document.version_number,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update document:', { 
        document_id: id, 
        error, 
        updated_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Document ID is required');
    }

    logger.info('Deleting document:', { 
      document_id: id,
      deleted_by: req.user?.user_id 
    });

    try {
      await DocumentService.deleteDocument(
        id,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document deleted successfully:', { 
        document_id: id,
        deleted_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Document deleted successfully',
        data: null,
      });
    } catch (error) {
      logger.error('Failed to delete document:', { 
        document_id: id, 
        error, 
        deleted_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Search documents
   */
  static async searchDocuments(req: Request, res: Response): Promise<void> {
    const { q, page, limit, folder_id, mime_type } = req.query;

    if (!q || typeof q !== 'string') {
      throw new BadRequestError('Search query is required');
    }

    logger.info('Searching documents:', { 
      search_query: q,
      page,
      limit,
      folder_id,
      mime_type,
      requested_by: req.user?.user_id 
    });

    try {
      const filters: {
        folder_id?: string;
        mime_type?: string;
      } = {};

      if (folder_id && typeof folder_id === 'string') {
        filters.folder_id = folder_id;
      }
      if (mime_type && typeof mime_type === 'string') {
        filters.mime_type = mime_type;
      }

      const result = await DocumentService.searchDocuments(
        q,
        Number(page) || 1,
        Number(limit) || 10,
        filters,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document search completed:', { 
        search_query: q,
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Document search completed',
        data: {
          documents: result.documents.map(doc => ({
            document_id: doc.document_id,
            document_name: doc.document_name,
            file_path: doc.file_path,
            folder_id: doc.folder_id,
            folder_name: doc.folder_name,
            uploaded_by_user_id: doc.uploaded_by_user_id,
            uploaded_by_name: doc.uploaded_by_name,
            file_size_bytes: doc.file_size_bytes,
            mime_type: doc.mime_type,
            version_number: doc.version_number,
            is_active: doc.is_active,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
          query: q,
        },
      });
    } catch (error) {
      logger.error('Failed to search documents:', { 
        search_query: q, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get documents by folder
   */
  static async getDocumentsByFolder(req: Request, res: Response): Promise<void> {
    const { folderId } = req.params;
    const { page, limit } = req.query;

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Fetching documents by folder:', { 
      folder_id: folderId,
      page,
      limit,
      requested_by: req.user?.user_id 
    });

    try {
      const result = await DocumentService.getDocumentsByFolder(
        folderId,
        Number(page) || 1,
        Number(limit) || 10,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Documents by folder fetched successfully:', { 
        folder_id: folderId,
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          documents: result.documents.map(doc => ({
            document_id: doc.document_id,
            document_name: doc.document_name,
            file_path: doc.file_path,
            folder_id: doc.folder_id,
            folder_name: doc.folder_name,
            uploaded_by_user_id: doc.uploaded_by_user_id,
            uploaded_by_name: doc.uploaded_by_name,
            file_size_bytes: doc.file_size_bytes,
            mime_type: doc.mime_type,
            version_number: doc.version_number,
            is_active: doc.is_active,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
          folder_id: folderId,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch documents by folder:', { 
        folder_id: folderId, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get document statistics
   */
  static async getDocumentStatistics(req: Request, res: Response): Promise<void> {
    logger.info('Fetching document statistics:', { 
      requested_by: req.user?.user_id 
    });

    try {
      const stats = await DocumentService.getDocumentStatistics(
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Document statistics fetched successfully:', { 
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Document statistics retrieved successfully',
        data: {
          statistics: {
            total_documents: parseInt(stats.total_documents),
            active_documents: parseInt(stats.active_documents),
            total_file_size: parseInt(stats.total_file_size),
            unique_mime_types: parseInt(stats.unique_mime_types),
            unique_uploaders: parseInt(stats.unique_uploaders),
            average_file_size: stats.total_documents > 0 
              ? Math.round(stats.total_file_size / stats.total_documents) 
              : 0,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch document statistics:', { 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }
} 