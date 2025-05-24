import { 
  DocumentModel, 
  IDocument, 
  ICreateDocument, 
  IUpdateDocument, 
  IDocumentWithJoins, 
  IDocumentListResult,
  IDocumentFilters 
} from '@models/Document.model';
import { FolderModel } from '@models/Folder.model';
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
      // Apply permission-based filtering
      const enhancedFilters = await this.applyPermissionFilters(
        filters, 
        requestingUserId, 
        userPermissions
      );

      const result = await DocumentModel.findAll(page, limit, enhancedFilters);
      
      // Filter documents based on folder permissions
      const accessibleDocuments = await this.filterDocumentsByFolderAccess(
        result.documents,
        requestingUserId,
        userPermissions
      );

      logger.info('Service: Documents fetched successfully', { 
        total: result.total,
        accessible_count: accessibleDocuments.length,
        page: result.page,
        requesting_user: requestingUserId 
      });

      return {
        ...result,
        documents: accessibleDocuments,
        total: accessibleDocuments.length
      };
    } catch (error) {
      logger.error('Service: Failed to fetch documents', { 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get document by ID
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

      // Check permissions
      const hasAccess = await this.checkDocumentAccess(
        document,
        requestingUserId,
        userPermissions,
        'read'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this document');
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
      // Check folder permissions if document is being placed in a folder
      if (documentData.folder_id) {
        const hasWriteAccess = await FolderModel.checkUserPermission(
          requestingUserId,
          documentData.folder_id,
          'write'
        );
        
        if (!hasWriteAccess && !userPermissions.includes('create_documents')) {
          throw new ForbiddenError('Permission denied: insufficient access to create documents in this folder');
        }
      } else {
        // For root-level documents, require create_documents permission
        if (!userPermissions.includes('create_documents')) {
          throw new ForbiddenError('Permission denied: create_documents required');
        }
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
   * Update document
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
      updated_by: requestingUserId 
    });

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('Document not found');
      }

      // Check permissions
      const hasAccess = await this.checkDocumentAccess(
        document,
        requestingUserId,
        userPermissions,
        'write'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to modify this document');
      }

      // If moving to a different folder, check new folder permissions
      if (updateData.folder_id && updateData.folder_id !== document.folder_id) {
        const hasNewFolderAccess = await FolderModel.checkUserPermission(
          requestingUserId,
          updateData.folder_id,
          'write'
        );
        
        if (!hasNewFolderAccess && !userPermissions.includes('edit_documents')) {
          throw new ForbiddenError('Permission denied: insufficient access to move document to target folder');
        }
      }

      const updatedDocument = await DocumentModel.update(documentId, updateData);

      logger.info('Service: Document updated successfully', { 
        document_id: documentId,
        updated_by: requestingUserId 
      });

      return updatedDocument;
    } catch (error) {
      logger.error('Service: Failed to update document', { 
        document_id: documentId, 
        error, 
        updated_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(
    documentId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<void> {
    logger.info('Service: Deleting document', { 
      document_id: documentId,
      deleted_by: requestingUserId 
    });

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('Document not found');
      }

      // Check permissions
      const hasAccess = await this.checkDocumentAccess(
        document,
        requestingUserId,
        userPermissions,
        'delete'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to delete this document');
      }

      await DocumentModel.delete(documentId);

      logger.info('Service: Document deleted successfully', { 
        document_id: documentId,
        deleted_by: requestingUserId 
      });
    } catch (error) {
      logger.error('Service: Failed to delete document', { 
        document_id: documentId, 
        error, 
        deleted_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Search documents
   */
  static async searchDocuments(
    searchQuery: string,
    page: number = 1,
    limit: number = 10,
    filters: Partial<IDocumentFilters> = {},
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentListResult> {
    logger.info('Service: Searching documents', { 
      search_query: searchQuery,
      page, 
      limit,
      filters,
      requesting_user: requestingUserId 
    });

    if (!searchQuery) {
      throw new BadRequestError('Search query is required');
    }

    try {
      const searchFilters: IDocumentFilters = {
        ...filters,
        search: searchQuery
      };

      return await this.getDocuments(page, limit, searchFilters, requestingUserId, userPermissions);
    } catch (error) {
      logger.error('Service: Failed to search documents', { 
        search_query: searchQuery,
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
      // Check folder access first
      const hasAccess = await FolderModel.checkUserPermission(
        requestingUserId,
        folderId,
        'read'
      );

      if (!hasAccess && !userPermissions.includes('view_documents')) {
        throw new ForbiddenError('Access denied to this folder');
      }

      const filters: IDocumentFilters = { folder_id: folderId };
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
  ): Promise<any> {
    logger.info('Service: Fetching document statistics', { 
      requesting_user: requestingUserId 
    });

    try {
      const stats = await DocumentModel.getStatistics();

      // If user doesn't have view_analytics permission, filter stats
      if (!userPermissions.includes('view_analytics')) {
        // Return limited stats - just show basic counts without sensitive data
        return {
          total_documents: 0,
          active_documents: 0,
          total_file_size: 0,
          unique_mime_types: 0,
          unique_uploaders: 0,
          average_file_size: 0,
          message: 'Limited statistics for non-admin users'
        };
      }

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

  // Private helper methods
  private static async applyPermissionFilters(
    filters: IDocumentFilters,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentFilters> {
    // If user has global view_documents permission, return filters as-is
    if (userPermissions.includes('view_documents')) {
      return filters;
    }

    // For users without global permissions, only show their own documents
    // (additional folder-based filtering happens in filterDocumentsByFolderAccess)
    return {
      ...filters,
      uploaded_by_user_id: requestingUserId
    };
  }

  private static async filterDocumentsByFolderAccess(
    documents: IDocumentWithJoins[],
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IDocumentWithJoins[]> {
    // If user has global view_documents permission, return all documents
    if (userPermissions.includes('view_documents')) {
      return documents;
    }

    // Filter documents based on folder access
    const accessibleDocuments: IDocumentWithJoins[] = [];
    
    for (const document of documents) {
      const hasAccess = await this.checkDocumentAccess(
        document,
        requestingUserId,
        userPermissions,
        'read'
      );
      
      if (hasAccess) {
        accessibleDocuments.push(document);
      }
    }

    return accessibleDocuments;
  }

  private static async checkDocumentAccess(
    document: IDocumentWithJoins,
    requestingUserId: string,
    userPermissions: string[],
    requiredPermission: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    // Global permissions allow everything
    const globalPermissionMap = {
      read: 'view_documents',
      write: 'edit_documents',
      delete: 'delete_documents'
    };

    if (userPermissions.includes(globalPermissionMap[requiredPermission])) {
      return true;
    }

    // Document owner always has access
    if (document.uploaded_by_user_id === requestingUserId) {
      return true;
    }

    // Check folder permissions if document is in a folder
    if (document.folder_id) {
      const folderPermissionMap = {
        read: 'read',
        write: 'write',
        delete: 'delete'
      };

      return await FolderModel.checkUserPermission(
        requestingUserId,
        document.folder_id,
        folderPermissionMap[requiredPermission] as 'read' | 'write' | 'delete' | 'manage'
      );
    }

    // For documents not in folders, only global permissions or ownership grant access
    return false;
  }
} 