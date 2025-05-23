import { 
  DocumentModel, 
  ICreateDocument, 
  IUpdateDocument,
  IDocumentFilters,
  IDocumentListResult,
  IDocumentWithJoins
} from '@models/Document.model';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class DocumentService {
  /**
   * Get all documents with pagination and filtering
   */
  static async getDocuments(
    page: number = 1,
    limit: number = 10,
    filters: IDocumentFilters = {},
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentListResult> {
    logger.info('Service: Fetching documents list', { 
      page, 
      limit, 
      filters,
      requesting_user: requestingUserId 
    });

    try {
      // If user doesn't have view_documents permission, only show their own documents
      if (!userPermissions.includes('view_documents')) {
        filters.uploaded_by_user_id = requestingUserId;
      }

      const result = await DocumentModel.findAll(page, limit, filters);
      
      logger.info('Service: Documents fetched successfully', { 
        total: result.total,
        page: result.page,
        requesting_user: requestingUserId 
      });

      return result;
    } catch (error) {
      logger.error('Service: Failed to fetch documents', { 
        error, 
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get document by ID with permission checking
   */
  static async getDocumentById(
    documentId: string, 
    requestingUserId: string, 
    userPermissions: string[]
  ): Promise<IDocumentWithJoins> {
    logger.info('Service: Fetching document by ID', { 
      document_id: documentId, 
      requesting_user: requestingUserId 
    });

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('Document not found');
      }

      // Check if user can access this document
      if (!userPermissions.includes('view_documents') && 
          document.uploaded_by_user_id !== requestingUserId) {
        throw new ForbiddenError('Access denied');
      }

      logger.info('Service: Document fetched successfully', { 
        document_id: documentId,
        requesting_user: requestingUserId 
      });

      return document;
    } catch (error) {
      logger.error('Service: Failed to fetch document', { 
        document_id: documentId, 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Create new document
   */
  static async createDocument(
    documentData: ICreateDocument,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentWithJoins> {
    logger.info('Service: Creating new document', { 
      document_name: documentData.document_name,
      folder_id: documentData.folder_id,
      created_by: requestingUserId 
    });

    try {
      // Check if user has permission to create documents
      if (!userPermissions.includes('create_documents')) {
        throw new ForbiddenError('Permission denied: create_documents required');
      }

      // Set the uploaded_by_user_id to the requesting user
      const documentToCreate = {
        ...documentData,
        uploaded_by_user_id: requestingUserId,
      };

      const document = await DocumentModel.create(documentToCreate);

      logger.info('Service: Document created successfully', { 
        document_id: document.document_id,
        document_name: document.document_name,
        created_by: requestingUserId 
      });

      return document;
    } catch (error) {
      logger.error('Service: Failed to create document', { 
        document_name: documentData.document_name, 
        error,
        created_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Update document with permission checking
   */
  static async updateDocument(
    documentId: string,
    updateData: IUpdateDocument,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentWithJoins> {
    logger.info('Service: Updating document', { 
      document_id: documentId,
      update_fields: Object.keys(updateData),
      requesting_user: requestingUserId 
    });

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    try {
      // Get the document first to check ownership
      const existingDocument = await DocumentModel.findById(documentId);
      if (!existingDocument) {
        throw new NotFoundError('Document not found');
      }

      // Check permissions
      const canEdit = userPermissions.includes('edit_documents') ||
                     (existingDocument.uploaded_by_user_id === requestingUserId);

      if (!canEdit) {
        throw new ForbiddenError('Access denied: insufficient permissions');
      }

      // Prevent non-admin users from changing certain fields
      if (existingDocument.uploaded_by_user_id === requestingUserId && 
          !userPermissions.includes('edit_documents')) {
        const restrictedFields = ['is_active'];
        const hasRestrictedFields = restrictedFields.some(field => field in updateData);
        
        if (hasRestrictedFields) {
          throw new ForbiddenError('Cannot update restricted fields');
        }
      }

      const document = await DocumentModel.update(documentId, updateData);

      logger.info('Service: Document updated successfully', { 
        document_id: documentId,
        requesting_user: requestingUserId 
      });

      return document;
    } catch (error) {
      logger.error('Service: Failed to update document', { 
        document_id: documentId, 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Delete document with permission checking
   */
  static async deleteDocument(
    documentId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<void> {
    logger.info('Service: Deleting document', { 
      document_id: documentId,
      requesting_user: requestingUserId 
    });

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    try {
      // Get the document first to check ownership
      const existingDocument = await DocumentModel.findById(documentId);
      if (!existingDocument) {
        throw new NotFoundError('Document not found');
      }

      // Check permissions
      const canDelete = userPermissions.includes('delete_documents') ||
                       (existingDocument.uploaded_by_user_id === requestingUserId);

      if (!canDelete) {
        throw new ForbiddenError('Access denied: insufficient permissions');
      }

      await DocumentModel.delete(documentId);
      
      logger.info('Service: Document deleted successfully', { 
        document_id: documentId,
        requesting_user: requestingUserId 
      });
    } catch (error) {
      logger.error('Service: Failed to delete document', { 
        document_id: documentId, 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Search documents
   */
  static async searchDocuments(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    filters: IDocumentFilters = {},
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentListResult> {
    logger.info('Service: Searching documents', { 
      search_term: searchTerm,
      page, 
      limit, 
      filters,
      requesting_user: requestingUserId 
    });

    try {
      // If user doesn't have view_documents permission, only search their own documents
      if (!userPermissions.includes('view_documents')) {
        filters.uploaded_by_user_id = requestingUserId;
      }

      const result = await DocumentModel.search(searchTerm, page, limit, filters);
      
      logger.info('Service: Document search completed', { 
        search_term: searchTerm,
        total: result.total,
        page: result.page,
        requesting_user: requestingUserId 
      });

      return result;
    } catch (error) {
      logger.error('Service: Failed to search documents', { 
        search_term: searchTerm,
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get documents by folder
   */
  static async getDocumentsByFolder(
    folderId: string,
    page: number = 1,
    limit: number = 10,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentListResult> {
    logger.info('Service: Fetching documents by folder', { 
      folder_id: folderId,
      page, 
      limit,
      requesting_user: requestingUserId 
    });

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    try {
      const filters: IDocumentFilters = { folder_id: folderId };

      // If user doesn't have view_documents permission, only show their own documents
      if (!userPermissions.includes('view_documents')) {
        filters.uploaded_by_user_id = requestingUserId;
      }

      const result = await DocumentModel.findAll(page, limit, filters);
      
      logger.info('Service: Documents by folder fetched successfully', { 
        folder_id: folderId,
        total: result.total,
        page: result.page,
        requesting_user: requestingUserId 
      });

      return result;
    } catch (error) {
      logger.error('Service: Failed to fetch documents by folder', { 
        folder_id: folderId,
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get document statistics
   */
  static async getDocumentStatistics(
    requestingUserId: string,
    userPermissions: string[]
  ) {
    logger.info('Service: Fetching document statistics', { 
      requesting_user: requestingUserId 
    });

    try {
      // Check if user has permission to view analytics
      if (!userPermissions.includes('view_analytics')) {
        throw new ForbiddenError('Permission denied: view_analytics required');
      }

      const stats = await DocumentModel.getStatistics();
      
      logger.info('Service: Document statistics fetched successfully', { 
        requesting_user: requestingUserId 
      });

      return stats;
    } catch (error) {
      logger.error('Service: Failed to fetch document statistics', { 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Validate document exists
   */
  static async validateDocumentExists(documentId: string): Promise<boolean> {
    logger.info('Service: Validating document exists', { document_id: documentId });

    try {
      const document = await DocumentModel.findById(documentId);
      return !!document;
    } catch (error) {
      logger.error('Service: Failed to validate document exists', { 
        document_id: documentId, 
        error 
      });
      return false;
    }
  }
} 