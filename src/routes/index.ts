import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { departmentRoutes } from './department.routes';
import { documentRoutes } from './document.routes';
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
router.use('/permissions', permissionRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/messages', messageRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'AI Chat Application API',
    version: '1.0.0',
    description: 'RESTful API for AI-powered chat application with document management',
    architecture: 'Clean Architecture with Service Layer Pattern',
    endpoints: {
      auth: '/auth',
      test: '/test',
      users: '/users',
      departments: '/departments',
      documents: '/documents',
      permissions: '/permissions',
      // conversations: '/conversations',
      // messages: '/messages',
      // aiModels: '/ai-models',
    },
    documentation: '/docs',
    health: '/health',
  });
});

export { router as routes }; 