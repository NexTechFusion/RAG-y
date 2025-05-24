import { 
  FolderModel, 
  IFolder, 
  ICreateFolder, 
  IUpdateFolder, 
  IFolderWithJoins, 
  IFolderListResult,
  IFolderFilters,
  ICreateFolderPermission,
  IFolderPermission
} from '@models/Folder.model';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class FolderService {
  /**
   * Get all folders with pagination and filtering
   */
  static async getFolders(
    page: number = 1,
    limit: number = 10,
    filters: IFolderFilters = {},
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderListResult> {
    logger.info('Service: Fetching folders list', { 
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

      const result = await FolderModel.findAll(page, limit, enhancedFilters, requestingUserId);
      
      // Filter out folders user doesn't have access to (additional check)
      const accessibleFolders = await this.filterAccessibleFolders(
        result.folders,
        requestingUserId,
        userPermissions
      );

      logger.info('Service: Folders fetched successfully', { 
        total: result.total,
        accessible_count: accessibleFolders.length,
        page: result.page,
        requesting_user: requestingUserId 
      });

      return {
        ...result,
        folders: accessibleFolders,
        total: accessibleFolders.length
      };
    } catch (error) {
      logger.error('Service: Failed to fetch folders', { 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get folder by ID
   */
  static async getFolderById(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderWithJoins> {
    logger.info('Service: Fetching folder by ID', { 
      folder_id: folderId,
      requesting_user: requestingUserId 
    });

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    try {
      const folder = await FolderModel.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found');
      }

      // Check permissions
      const hasAccess = await this.checkFolderAccess(
        folder,
        requestingUserId,
        userPermissions,
        'read'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this folder');
      }

      logger.info('Service: Folder fetched successfully', { 
        folder_id: folderId,
        requesting_user: requestingUserId 
      });

      return folder;
    } catch (error) {
      logger.error('Service: Failed to fetch folder', { 
        folder_id: folderId,
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Create new folder
   */
  static async createFolder(
    folderData: ICreateFolder,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderWithJoins> {
    logger.info('Service: Creating new folder', { 
      folder_name: folderData.folder_name,
      parent_folder_id: folderData.parent_folder_id,
      created_by: requestingUserId 
    });

    try {
      // Check if user has permission to create folders
      if (!userPermissions.includes('manage_folders')) {
        // If not global permission, check parent folder permissions
        if (folderData.parent_folder_id) {
          const hasParentAccess = await FolderModel.checkUserPermission(
            requestingUserId,
            folderData.parent_folder_id,
            'write'
          );
          if (!hasParentAccess) {
            throw new ForbiddenError('Permission denied: insufficient access to parent folder');
          }
        } else {
          throw new ForbiddenError('Permission denied: manage_folders required to create root folders');
        }
      }

      // Set the created_by_user_id to the requesting user
      const folderToCreate = {
        ...folderData,
        created_by_user_id: requestingUserId,
      };

      const folder = await FolderModel.create(folderToCreate);

      // Get the folder with joins for return
      const createdFolder = await FolderModel.findById(folder.folder_id);
      if (!createdFolder) {
        throw new Error('Failed to retrieve created folder');
      }

      logger.info('Service: Folder created successfully', { 
        folder_id: folder.folder_id,
        folder_name: folder.folder_name,
        created_by: requestingUserId 
      });

      return createdFolder;
    } catch (error) {
      logger.error('Service: Failed to create folder', { 
        folder_name: folderData.folder_name, 
        error,
        created_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Update folder
   */
  static async updateFolder(
    folderId: string,
    updateData: IUpdateFolder,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderWithJoins> {
    logger.info('Service: Updating folder', { 
      folder_id: folderId,
      update_fields: Object.keys(updateData),
      updated_by: requestingUserId 
    });

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    try {
      const folder = await FolderModel.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found');
      }

      // Check permissions
      const hasAccess = await this.checkFolderAccess(
        folder,
        requestingUserId,
        userPermissions,
        'write'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to modify this folder');
      }

      const updatedFolder = await FolderModel.update(folderId, updateData);

      // Get the folder with joins for return
      const folderWithJoins = await FolderModel.findById(updatedFolder.folder_id);
      if (!folderWithJoins) {
        throw new Error('Failed to retrieve updated folder');
      }

      logger.info('Service: Folder updated successfully', { 
        folder_id: folderId,
        updated_by: requestingUserId 
      });

      return folderWithJoins;
    } catch (error) {
      logger.error('Service: Failed to update folder', { 
        folder_id: folderId, 
        error, 
        updated_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Delete folder
   */
  static async deleteFolder(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[],
    deleteContents: boolean = false
  ): Promise<void> {
    logger.info('Service: Deleting folder', { 
      folder_id: folderId,
      delete_contents: deleteContents,
      deleted_by: requestingUserId 
    });

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    try {
      const folder = await FolderModel.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found');
      }

      // Check permissions
      const hasAccess = await this.checkFolderAccess(
        folder,
        requestingUserId,
        userPermissions,
        'delete'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to delete this folder');
      }

      await FolderModel.delete(folderId, deleteContents);

      logger.info('Service: Folder deleted successfully', { 
        folder_id: folderId,
        deleted_by: requestingUserId 
      });
    } catch (error) {
      logger.error('Service: Failed to delete folder', { 
        folder_id: folderId, 
        error, 
        deleted_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get user accessible folders
   */
  static async getUserAccessibleFolders(
    requestingUserId: string,
    permissionType: 'read' | 'write' | 'delete' | 'manage' = 'read'
  ): Promise<IFolderWithJoins[]> {
    logger.info('Service: Fetching user accessible folders', { 
      requesting_user: requestingUserId,
      permission_type: permissionType
    });

    try {
      const folders = await FolderModel.getUserAccessibleFolders(requestingUserId, permissionType);

      logger.info('Service: User accessible folders fetched successfully', { 
        count: folders.length,
        requesting_user: requestingUserId 
      });

      return folders;
    } catch (error) {
      logger.error('Service: Failed to fetch user accessible folders', { 
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Grant folder permission
   */
  static async grantFolderPermission(
    permissionData: ICreateFolderPermission,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderPermission> {
    logger.info('Service: Granting folder permission', { 
      folder_id: permissionData.folder_id,
      permission_type: permissionData.permission_type,
      granted_by: requestingUserId 
    });

    try {
      // Check if user has permission to manage this folder
      const hasManageAccess = await this.checkFolderManageAccess(
        permissionData.folder_id,
        requestingUserId,
        userPermissions
      );

      if (!hasManageAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to manage folder permissions');
      }

      const permission = await FolderModel.grantPermission({
        ...permissionData,
        granted_by_user_id: requestingUserId
      });

      logger.info('Service: Folder permission granted successfully', { 
        folder_permission_id: permission.folder_permission_id,
        granted_by: requestingUserId 
      });

      return permission;
    } catch (error) {
      logger.error('Service: Failed to grant folder permission', { 
        error,
        granted_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Revoke folder permission
   */
  static async revokeFolderPermission(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[],
    userId?: string,
    departmentId?: string,
    permissionType?: string
  ): Promise<void> {
    logger.info('Service: Revoking folder permission', { 
      folder_id: folderId,
      user_id: userId,
      department_id: departmentId,
      permission_type: permissionType,
      revoked_by: requestingUserId 
    });

    try {
      // Check if user has permission to manage this folder
      const hasManageAccess = await this.checkFolderManageAccess(
        folderId,
        requestingUserId,
        userPermissions
      );

      if (!hasManageAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to manage folder permissions');
      }

      await FolderModel.revokePermission(folderId, userId, departmentId, permissionType);

      logger.info('Service: Folder permission revoked successfully', { 
        folder_id: folderId,
        revoked_by: requestingUserId 
      });
    } catch (error) {
      logger.error('Service: Failed to revoke folder permission', { 
        folder_id: folderId,
        error,
        revoked_by: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get folder permissions
   */
  static async getFolderPermissions(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<any[]> {
    logger.info('Service: Fetching folder permissions', { 
      folder_id: folderId,
      requesting_user: requestingUserId 
    });

    try {
      // Check if user has permission to view this folder's permissions
      const hasAccess = await this.checkFolderManageAccess(
        folderId,
        requestingUserId,
        userPermissions
      );

      if (!hasAccess) {
        throw new ForbiddenError('Permission denied: insufficient access to view folder permissions');
      }

      const permissions = await FolderModel.getFolderPermissions(folderId);

      logger.info('Service: Folder permissions fetched successfully', { 
        folder_id: folderId,
        permissions_count: permissions.length,
        requesting_user: requestingUserId 
      });

      return permissions;
    } catch (error) {
      logger.error('Service: Failed to fetch folder permissions', { 
        folder_id: folderId,
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  /**
   * Get folder hierarchy (breadcrumb)
   */
  static async getFolderHierarchy(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolder[]> {
    logger.info('Service: Fetching folder hierarchy', { 
      folder_id: folderId,
      requesting_user: requestingUserId 
    });

    try {
      // Check if user has access to the folder
      const folder = await FolderModel.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found');
      }

      const hasAccess = await this.checkFolderAccess(
        folder,
        requestingUserId,
        userPermissions,
        'read'
      );

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this folder');
      }

      const hierarchy = await FolderModel.getFolderHierarchy(folderId);

      logger.info('Service: Folder hierarchy fetched successfully', { 
        folder_id: folderId,
        hierarchy_depth: hierarchy.length,
        requesting_user: requestingUserId 
      });

      return hierarchy;
    } catch (error) {
      logger.error('Service: Failed to fetch folder hierarchy', { 
        folder_id: folderId,
        error,
        requesting_user: requestingUserId 
      });
      throw error;
    }
  }

  // Private helper methods
  private static async applyPermissionFilters(
    filters: IFolderFilters,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderFilters> {
    // If user has global manage_folders permission, return filters as-is
    if (userPermissions.includes('manage_folders')) {
      return filters;
    }

    // For users without global permissions, we'll filter in filterAccessibleFolders
    return filters;
  }

  private static async filterAccessibleFolders(
    folders: IFolderWithJoins[],
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<IFolderWithJoins[]> {
    // If user has global manage_folders permission, return all folders
    if (userPermissions.includes('manage_folders')) {
      return folders;
    }

    // Filter folders based on accessibility
    const accessibleFolders: IFolderWithJoins[] = [];
    
    for (const folder of folders) {
      const hasAccess = await this.checkFolderAccess(
        folder,
        requestingUserId,
        userPermissions,
        'read'
      );
      
      if (hasAccess) {
        accessibleFolders.push(folder);
      }
    }

    return accessibleFolders;
  }

  private static async checkFolderAccess(
    folder: IFolderWithJoins,
    requestingUserId: string,
    userPermissions: string[],
    requiredPermission: 'read' | 'write' | 'delete' | 'manage'
  ): Promise<boolean> {
    // Global manage_folders permission allows everything
    if (userPermissions.includes('manage_folders')) {
      return true;
    }

    // Folder creator always has access
    if (folder.created_by_user_id === requestingUserId) {
      return true;
    }

    // Public folders allow read access
    if (folder.access_level === 'public' && requiredPermission === 'read') {
      return true;
    }

    // Check specific folder permissions
    return await FolderModel.checkUserPermission(
      requestingUserId,
      folder.folder_id,
      requiredPermission
    );
  }

  private static async checkFolderManageAccess(
    folderId: string,
    requestingUserId: string,
    userPermissions: string[]
  ): Promise<boolean> {
    // Global manage_folders permission allows everything
    if (userPermissions.includes('manage_folders')) {
      return true;
    }

    // Check if user has manage permission on this specific folder
    return await FolderModel.checkUserPermission(
      requestingUserId,
      folderId,
      'manage'
    );
  }
} 