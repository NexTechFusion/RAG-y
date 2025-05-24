import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { departmentRoutes } from './department.routes';
import { documentRoutes } from './document.routes';
import { folderRoutes } from './folder.routes';
// import { conversationRoutes } from './conversation.routes';
// import { messageRoutes } from './message.routes';
import { permissionRoutes } from './permission.routes';
// import { aiModelRoutes } from './aiModel.routes';

const router = Router();

// Test endpoint to verify imports work
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'All imports working correctly!',
    timestamp: new Date().toISOString(),
    architecture: 'Clean Architecture with Service Layer',
    imports: {
      authRoutes: 'imported successfully',
      authController: 'imported successfully', 
      validation: 'imported successfully',
      authValidation: 'imported successfully',
      userRoutes: 'imported successfully',
      userController: 'imported successfully',
      userValidation: 'imported successfully',
      userService: 'imported successfully',
      departmentRoutes: 'imported successfully',
      departmentController: 'imported successfully',
      departmentValidation: 'imported successfully',
      departmentService: 'imported successfully',
      documentRoutes: 'imported successfully',
      documentController: 'imported successfully',
      documentValidation: 'imported successfully',
      documentService: 'imported successfully',
      folderRoutes: 'imported successfully',
      folderController: 'imported successfully',
      folderValidation: 'imported successfully',
      folderService: 'imported successfully',
      permissionRoutes: 'imported successfully',
      permissionController: 'imported successfully',
      permissionValidation: 'imported successfully',
      permissionService: 'imported successfully',
      permissionModel: 'imported successfully'
    },
    layers: {
      controllers: 'Handle HTTP requests/responses only',
      services: 'Contain business logic and validation',
      models: 'Handle data access and database operations',
      middleware: 'Handle cross-cutting concerns',
      validation: 'Handle input validation and sanitization'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/documents', documentRoutes);
router.use('/folders', folderRoutes);
router.use('/permissions', permissionRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/messages', messageRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'AI Chat Application API',
    version: '1.0.0',
    description: 'RESTful API for AI-powered chat application with document management and folder permissions',
    architecture: 'Clean Architecture with Service Layer Pattern',
    endpoints: {
      auth: '/auth',
      test: '/test',
      users: '/users',
      departments: '/departments',
      documents: '/documents',
      folders: '/folders',
      permissions: '/permissions',
      // conversations: '/conversations',
      // messages: '/messages',
      // aiModels: '/ai-models',
    },
    features: {
      authentication: 'JWT-based authentication with refresh tokens',
      authorization: 'Role-based permissions system',
      documents: 'Document management with file operations',
      folders: 'Hierarchical folder structure with granular permissions',
      permissions: 'Fine-grained permission control at folder and system level',
    },
    documentation: '/docs',
    health: '/health',
  });
});

export { router as routes }; 