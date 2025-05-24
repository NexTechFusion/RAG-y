import { Router } from 'express';
import { FolderController } from '@controllers/folder.controller';
import { validateRequest } from '@middleware/validation';
import { asyncHandler } from '@middleware/errorHandler';
import { 
  authenticateToken, 
  requirePermission,
  requireAnyPermission 
} from '@middleware/auth.middleware';
import { folderValidation } from '@utils/validation/folder.validation';

const router = Router();

// Get all folders (requires view permissions or user sees only accessible folders)
router.get('/', 
  authenticateToken,
  validateRequest(folderValidation.getFoldersList),
  asyncHandler(FolderController.getFolders)
);

// Search folders
router.get('/search', 
  authenticateToken,
  validateRequest(folderValidation.searchFolders),
  asyncHandler(FolderController.searchFolders)
);

// Get user accessible folders
router.get('/accessible', 
  authenticateToken,
  validateRequest(folderValidation.getUserAccessibleFolders),
  asyncHandler(FolderController.getUserAccessibleFolders)
);

// Get folder hierarchy (breadcrumb)
router.get('/:folderId/hierarchy', 
  authenticateToken,
  validateRequest(folderValidation.getFolderHierarchy),
  asyncHandler(FolderController.getFolderHierarchy)
);

// Get folder permissions (requires manage_folders permission or folder manage access)
router.get('/:folderId/permissions', 
  authenticateToken,
  validateRequest(folderValidation.getFolderPermissions),
  asyncHandler(FolderController.getFolderPermissions)
);

// Grant folder permission (requires manage_folders permission or folder manage access)
router.post('/permissions', 
  authenticateToken,
  validateRequest(folderValidation.grantFolderPermission),
  asyncHandler(FolderController.grantFolderPermission)
);

// Revoke folder permission (requires manage_folders permission or folder manage access)
router.delete('/:folderId/permissions', 
  authenticateToken,
  validateRequest(folderValidation.revokeFolderPermission),
  asyncHandler(FolderController.revokeFolderPermission)
);

// Get folders by parent ID
router.get('/parent/:parentId', 
  authenticateToken,
  validateRequest(folderValidation.getFoldersByParent),
  asyncHandler(FolderController.getFoldersByParent)
);

// Get folder by ID (users can view folders they have access to)
router.get('/:id', 
  authenticateToken,
  validateRequest(folderValidation.getFolderById),
  asyncHandler(FolderController.getFolderById)
);

// Create new folder (requires manage_folders permission or write access to parent folder)
router.post('/', 
  authenticateToken,
  validateRequest(folderValidation.createFolder),
  asyncHandler(FolderController.createFolder)
);

// Update folder (requires manage_folders permission or folder write access)
router.put('/:id', 
  authenticateToken,
  validateRequest(folderValidation.updateFolder),
  asyncHandler(FolderController.updateFolder)
);

// Delete folder (requires manage_folders permission or folder delete access)
router.delete('/:id', 
  authenticateToken,
  validateRequest(folderValidation.deleteFolder),
  asyncHandler(FolderController.deleteFolder)
);

export { router as folderRoutes }; 