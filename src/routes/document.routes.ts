import { Router } from 'express';
import { DocumentController } from '@controllers/document.controller';
import { validateRequest } from '@middleware/validation';
import { asyncHandler } from '@middleware/errorHandler';
import { 
  authenticateToken, 
  requirePermission,
  requireAnyPermission 
} from '@middleware/auth.middleware';
import { documentValidation } from '@utils/validation/document.validation';

const router = Router();

// Get all documents (requires view_documents permission or user can see their own)
router.get('/', 
  authenticateToken,
  validateRequest(documentValidation.getDocumentsList),
  asyncHandler(DocumentController.getDocuments)
);

// Search documents
router.get('/search', 
  authenticateToken,
  validateRequest(documentValidation.searchDocuments),
  asyncHandler(DocumentController.searchDocuments)
);

// Get document statistics (requires view_analytics permission)
router.get('/statistics', 
  authenticateToken,
  requirePermission('view_analytics'),
  validateRequest(documentValidation.getDocumentsStats),
  asyncHandler(DocumentController.getDocumentStatistics)
);

// Get documents by folder
router.get('/folder/:folderId', 
  authenticateToken,
  validateRequest(documentValidation.getDocumentsByFolder),
  asyncHandler(DocumentController.getDocumentsByFolder)
);

// Get document by ID (users can view documents they uploaded or need view_documents permission)
router.get('/:id', 
  authenticateToken,
  validateRequest(documentValidation.getDocumentById),
  asyncHandler(DocumentController.getDocumentById)
);

// Create new document (requires create_documents permission)
router.post('/', 
  authenticateToken,
  requirePermission('create_documents'),
  validateRequest(documentValidation.createDocument),
  asyncHandler(DocumentController.createDocument)
);

// Update document (users can update their own documents or need edit_documents permission)
router.put('/:id', 
  authenticateToken,
  validateRequest(documentValidation.updateDocument),
  asyncHandler(DocumentController.updateDocument)
);

// Delete document (users can delete their own documents or need delete_documents permission)
router.delete('/:id', 
  authenticateToken,
  validateRequest(documentValidation.deleteDocument),
  asyncHandler(DocumentController.deleteDocument)
);

export { router as documentRoutes }; 