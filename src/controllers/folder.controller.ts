import { Request, Response } from 'express';
import { FolderService } from '@services/folder.service';
import { 
  BadRequestError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '@utils/AppError';
import { logger } from '@utils/logger';

export class FolderController {
  /**
   * Get all folders with pagination and filtering
   */
  static async getFolders(req: Request, res: Response): Promise<void> {
    const { page, limit, parent_folder_id, created_by_user_id, access_level, search, is_active } = req.query;

    logger.info('Fetching folders list:', { 
      page, 
      limit, 
      parent_folder_id,
      created_by_user_id,
      access_level,
      search,
      is_active,
      requested_by: req.user?.user_id 
    });

    try {
      const filters: {
        parent_folder_id?: string | undefined;
        created_by_user_id?: string;
        access_level?: string;
        search?: string;
        is_active?: boolean;
      } = {};

      if (parent_folder_id !== undefined) {
        if (typeof parent_folder_id === 'string') {
          filters.parent_folder_id = parent_folder_id === '' ? undefined : parent_folder_id;
        }
      }
      if (created_by_user_id && typeof created_by_user_id === 'string') {
        filters.created_by_user_id = created_by_user_id;
      }
      if (access_level && typeof access_level === 'string') {
        filters.access_level = access_level;
      }
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }

      const result = await FolderService.getFolders(
        Number(page) || 1,
        Number(limit) || 10,
        filters,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folders fetched successfully:', { 
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folders retrieved successfully',
        data: {
          folders: result.folders.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            parent_folder_name: folder.parent_folder_name,
            created_by_user_id: folder.created_by_user_id,
            created_by_name: folder.created_by_name,
            created_by_email: folder.created_by_email,
            description: folder.description,
            access_level: folder.access_level,
            inherit_permissions: folder.inherit_permissions,
            document_count: folder.document_count,
            subfolder_count: folder.subfolder_count,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
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
      logger.error('Failed to fetch folders:', { error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  /**
   * Get folder by ID
   */
  static async getFolderById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Fetching folder by ID:', { folder_id: id, requested_by: req.user?.user_id });

    try {
      const folder = await FolderService.getFolderById(
        id,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder fetched successfully:', { folder_id: id, requested_by: req.user?.user_id });

      res.json({
        success: true,
        message: 'Folder retrieved successfully',
        data: {
          folder: {
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            parent_folder_name: folder.parent_folder_name,
            created_by_user_id: folder.created_by_user_id,
            created_by_name: folder.created_by_name,
            created_by_email: folder.created_by_email,
            description: folder.description,
            access_level: folder.access_level,
            inherit_permissions: folder.inherit_permissions,
            document_count: folder.document_count,
            subfolder_count: folder.subfolder_count,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to fetch folder:', { folder_id: id, error, requested_by: req.user?.user_id });
      throw error;
    }
  }

  /**
   * Create new folder
   */
  static async createFolder(req: Request, res: Response): Promise<void> {
    const { folder_name, parent_folder_id, description, access_level, inherit_permissions } = req.body;

    logger.info('Creating new folder:', { 
      folder_name,
      parent_folder_id,
      access_level,
      created_by: req.user?.user_id 
    });

    try {
      const folderData = {
        folder_name,
        parent_folder_id,
        description,
        access_level,
        inherit_permissions,
        created_by_user_id: req.user!.user_id, // This will be overridden in service
      };

      const folder = await FolderService.createFolder(
        folderData,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder created successfully:', { 
        folder_id: folder.folder_id,
        folder_name: folder.folder_name,
        created_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: {
          folder: {
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            created_by_user_id: folder.created_by_user_id,
            description: folder.description,
            access_level: folder.access_level,
            inherit_permissions: folder.inherit_permissions,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to create folder:', { 
        folder_name, 
        error, 
        created_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Update folder
   */
  static async updateFolder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Updating folder:', { 
      folder_id: id,
      update_fields: Object.keys(updateData),
      updated_by: req.user?.user_id 
    });

    try {
      const folder = await FolderService.updateFolder(
        id,
        updateData,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder updated successfully:', { 
        folder_id: id,
        updated_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder updated successfully',
        data: {
          folder: {
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            created_by_user_id: folder.created_by_user_id,
            description: folder.description,
            access_level: folder.access_level,
            inherit_permissions: folder.inherit_permissions,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update folder:', { 
        folder_id: id, 
        error, 
        updated_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Delete folder
   */
  static async deleteFolder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { delete_contents } = req.query;

    if (!id) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Deleting folder:', { 
      folder_id: id,
      delete_contents: delete_contents === 'true',
      deleted_by: req.user?.user_id 
    });

    try {
      await FolderService.deleteFolder(
        id,
        req.user!.user_id,
        req.user!.permissions,
        delete_contents === 'true'
      );

      logger.info('Folder deleted successfully:', { 
        folder_id: id,
        deleted_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder deleted successfully',
        data: null,
      });
    } catch (error) {
      logger.error('Failed to delete folder:', { 
        folder_id: id, 
        error, 
        deleted_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get user accessible folders
   */
  static async getUserAccessibleFolders(req: Request, res: Response): Promise<void> {
    const { permission_type } = req.query;

    logger.info('Fetching user accessible folders:', { 
      permission_type,
      requested_by: req.user?.user_id 
    });

    try {
      const folders = await FolderService.getUserAccessibleFolders(
        req.user!.user_id,
        permission_type as 'read' | 'write' | 'delete' | 'manage' || 'read'
      );

      logger.info('User accessible folders fetched successfully:', { 
        count: folders.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Accessible folders retrieved successfully',
        data: {
          folders: folders.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            parent_folder_name: folder.parent_folder_name,
            created_by_user_id: folder.created_by_user_id,
            created_by_name: folder.created_by_name,
            description: folder.description,
            access_level: folder.access_level,
            inherit_permissions: folder.inherit_permissions,
            document_count: folder.document_count,
            subfolder_count: folder.subfolder_count,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch user accessible folders:', { 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Grant folder permission
   */
  static async grantFolderPermission(req: Request, res: Response): Promise<void> {
    const { folder_id, department_id, user_id, permission_type } = req.body;

    logger.info('Granting folder permission:', { 
      folder_id,
      department_id,
      user_id,
      permission_type,
      granted_by: req.user?.user_id 
    });

    try {
      const permission = await FolderService.grantFolderPermission(
        {
          folder_id,
          department_id,
          user_id,
          permission_type,
          granted_by_user_id: req.user!.user_id,
        },
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder permission granted successfully:', { 
        folder_permission_id: permission.folder_permission_id,
        granted_by: req.user?.user_id 
      });

      res.status(201).json({
        success: true,
        message: 'Folder permission granted successfully',
        data: {
          permission: {
            folder_permission_id: permission.folder_permission_id,
            folder_id: permission.folder_id,
            department_id: permission.department_id,
            user_id: permission.user_id,
            permission_type: permission.permission_type,
            granted_at: permission.granted_at,
            granted_by_user_id: permission.granted_by_user_id,
            is_active: permission.is_active,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to grant folder permission:', { 
        folder_id, 
        error, 
        granted_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Revoke folder permission
   */
  static async revokeFolderPermission(req: Request, res: Response): Promise<void> {
    const { folderId } = req.params;
    const { user_id, department_id, permission_type } = req.body;

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Revoking folder permission:', { 
      folder_id: folderId,
      user_id,
      department_id,
      permission_type,
      revoked_by: req.user?.user_id 
    });

    try {
      await FolderService.revokeFolderPermission(
        folderId,
        req.user!.user_id,
        req.user!.permissions,
        user_id,
        department_id,
        permission_type
      );

      logger.info('Folder permission revoked successfully:', { 
        folder_id: folderId,
        revoked_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder permission revoked successfully',
        data: null,
      });
    } catch (error) {
      logger.error('Failed to revoke folder permission:', { 
        folder_id: folderId, 
        error, 
        revoked_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get folder permissions
   */
  static async getFolderPermissions(req: Request, res: Response): Promise<void> {
    const { folderId } = req.params;

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Fetching folder permissions:', { 
      folder_id: folderId,
      requested_by: req.user?.user_id 
    });

    try {
      const permissions = await FolderService.getFolderPermissions(
        folderId,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder permissions fetched successfully:', { 
        folder_id: folderId,
        permissions_count: permissions.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder permissions retrieved successfully',
        data: {
          permissions: permissions.map(perm => ({
            folder_permission_id: perm.folder_permission_id,
            folder_id: perm.folder_id,
            department_id: perm.department_id,
            department_name: perm.department_name,
            user_id: perm.user_id,
            user_name: perm.user_name,
            user_email: perm.user_email,
            permission_type: perm.permission_type,
            granted_at: perm.granted_at,
            granted_by_user_id: perm.granted_by_user_id,
            granted_by_name: perm.granted_by_name,
            is_active: perm.is_active,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch folder permissions:', { 
        folder_id: folderId, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get folder hierarchy (breadcrumb)
   */
  static async getFolderHierarchy(req: Request, res: Response): Promise<void> {
    const { folderId } = req.params;

    if (!folderId) {
      throw new BadRequestError('Folder ID is required');
    }

    logger.info('Fetching folder hierarchy:', { 
      folder_id: folderId,
      requested_by: req.user?.user_id 
    });

    try {
      const hierarchy = await FolderService.getFolderHierarchy(
        folderId,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder hierarchy fetched successfully:', { 
        folder_id: folderId,
        hierarchy_depth: hierarchy.length,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder hierarchy retrieved successfully',
        data: {
          hierarchy: hierarchy.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
          })),
        },
      });
    } catch (error) {
      logger.error('Failed to fetch folder hierarchy:', { 
        folder_id: folderId, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Search folders
   */
  static async searchFolders(req: Request, res: Response): Promise<void> {
    const { q, page, limit, parent_folder_id, access_level } = req.query;

    if (!q || typeof q !== 'string') {
      throw new BadRequestError('Search query is required');
    }

    logger.info('Searching folders:', { 
      search_query: q,
      page,
      limit,
      parent_folder_id,
      access_level,
      requested_by: req.user?.user_id 
    });

    try {
      const filters: {
        parent_folder_id?: string;
        access_level?: string;
        search: string;
      } = { search: q };

      if (parent_folder_id && typeof parent_folder_id === 'string') {
        filters.parent_folder_id = parent_folder_id;
      }
      if (access_level && typeof access_level === 'string') {
        filters.access_level = access_level;
      }

      const result = await FolderService.getFolders(
        Number(page) || 1,
        Number(limit) || 10,
        filters,
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folder search completed:', { 
        search_query: q,
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Folder search completed',
        data: {
          folders: result.folders.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            parent_folder_name: folder.parent_folder_name,
            created_by_user_id: folder.created_by_user_id,
            created_by_name: folder.created_by_name,
            description: folder.description,
            access_level: folder.access_level,
            document_count: folder.document_count,
            subfolder_count: folder.subfolder_count,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
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
      logger.error('Failed to search folders:', { 
        search_query: q, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }

  /**
   * Get folders by parent ID
   */
  static async getFoldersByParent(req: Request, res: Response): Promise<void> {
    const { parentId } = req.params;
    const { page, limit } = req.query;

    if (!parentId) {
      throw new BadRequestError('Parent folder ID is required');
    }

    logger.info('Fetching folders by parent:', { 
      parent_folder_id: parentId,
      page,
      limit,
      requested_by: req.user?.user_id 
    });

    try {
      const result = await FolderService.getFolders(
        Number(page) || 1,
        Number(limit) || 10,
        { parent_folder_id: parentId },
        req.user!.user_id,
        req.user!.permissions
      );

      logger.info('Folders by parent fetched successfully:', { 
        parent_folder_id: parentId,
        total: result.total,
        page: result.page,
        requested_by: req.user?.user_id 
      });

      res.json({
        success: true,
        message: 'Subfolders retrieved successfully',
        data: {
          folders: result.folders.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            parent_folder_id: folder.parent_folder_id,
            created_by_user_id: folder.created_by_user_id,
            created_by_name: folder.created_by_name,
            description: folder.description,
            access_level: folder.access_level,
            document_count: folder.document_count,
            subfolder_count: folder.subfolder_count,
            is_active: folder.is_active,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
          parent_folder_id: parentId,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch folders by parent:', { 
        parent_folder_id: parentId, 
        error, 
        requested_by: req.user?.user_id 
      });
      throw error;
    }
  }
} 