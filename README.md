# AI Chat Application Backend

A comprehensive Node.js backend built with Bun, TypeScript, and PostgreSQL for an AI-powered chat application with document management and role-based access control.

## 🚀 Features

- **AI-Powered Chat**: Integrate with multiple AI providers (OpenAI, Anthropic, Google)
- **Advanced Document Management**: Upload, organize, and manage documents with hierarchical folder structure and granular permissions
- **Folder Management System**: Complete folder hierarchy with user/department-based permissions (read, write, delete, manage)
- **Role-Based Access Control**: Department-based permissions system with folder-level access control
- **Real-time Messaging**: Support for text, audio, and file attachments
- **User Management**: Complete user lifecycle with authentication and authorization
- **Audit Logging**: Track all system changes and user activities
- **Performance Optimized**: Database indexing and connection pooling
- **Security First**: JWT authentication, input validation, and SQL injection protection

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Bun (Node.js alternative)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod for environment variables, Joi for request validation
- **Logging**: Winston with multiple transports
- **Security**: Helmet, CORS, rate limiting

### Database Schema
The application implements a comprehensive schema including:
- Users and Departments (role-based access)
- Documents and Folders (hierarchical structure)
- Conversations and Messages (AI chat functionality)
- AI Models and Configurations
- Permissions and Audit Logs

## 📋 Prerequisites

- **Bun** >= 1.0.0
- **PostgreSQL** >= 13.0
- **Redis** >= 6.0 (optional, for caching)
- **Node.js** >= 18.0 (for compatibility)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chat-backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ai_chat_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Secrets (generate strong secrets)
   JWT_SECRET=your-super-secret-jwt-key-32-chars-min
   JWT_REFRESH_SECRET=your-refresh-secret-32-chars-min
   
   # AI API Keys (optional)
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   GOOGLE_AI_API_KEY=your-google-key
   ```

4. **Database Setup**
   ```bash
   # Create database by running docker
   docker-compose up -d postgres redis
   
   # Run migrations
   bun run migrate
   
   # Seed initial data
   bun run seed
   ```

   // migrate failing if again
   ```
DELETE FROM migrations WHERE filename = '001_initial_schema.sql';

-- Connect to your database and run this to clean slate:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Also delete migration tracking
-- (Note: migrations table would be dropped with schema)

   ```

5. **Start the application**
   ```bash
   # Development mode
   bun run dev
   
   # Production mode
   bun run build
   bun start
   ```

6. **Start the frontend**
```bash 
 cd app
 npm install 
 npm run dev
```

## 📊 Database Migrations

The application includes a complete database schema with:

### Core Tables
- `departments` - Organizational departments
- `users` - User accounts and profiles
- `permissions` - System permissions
- `departmentpermissions` - Role-based access control

### Document Management
- `folders` - Hierarchical folder structure
- `folderpermissions` - Granular folder-level permissions for users and departments
- `documents` - File metadata and references

### AI Chat System
- `aimodels` - AI model configurations
- `conversations` - Chat sessions
- `conversationparticipants` - Conversation membership
- `messages` - Chat messages with AI metadata
- `messagereactions` - User feedback on messages

### Audit & Security
- `auditlog` - System change tracking

## 📁 Folder Management System

The application features a comprehensive hierarchical folder management system with granular permissions, allowing organizations to structure and control access to documents effectively.

### 🏗️ Folder Architecture

#### Hierarchical Structure
- **Tree-based Organization**: Unlimited depth folder nesting
- **Parent-Child Relationships**: Clear hierarchical navigation
- **Breadcrumb Support**: Full path navigation with `getFolderHierarchy`
- **Circular Reference Prevention**: Automatic validation to prevent folder loops

#### Database Schema
The folder system is built on two main tables:

**`folders` Table**:
- Hierarchical structure with `parent_folder_id` relationships
- Access level control (`public`, `restricted`, `private`, `inherited`)
- Permission inheritance settings
- Creator tracking and metadata

**`folderpermissions` Table**:
- Granular user and department-based permissions
- Four permission types: `read`, `write`, `delete`, `manage`
- Permission inheritance through folder hierarchy
- Audit trail with granted-by tracking

### 🔐 Permission Model

#### Access Levels
- **`public`**: Readable by all authenticated users
- **`restricted`**: Access controlled by explicit permissions
- **`private`**: Access limited to creator and explicitly granted users/departments
- **`inherited`**: Inherits access level from parent folder

#### Permission Types
- **`read`**: View folder and list contents
- **`write`**: Create/upload documents and subfolders
- **`delete`**: Delete folder contents and subfolders  
- **`manage`**: Full control including permission management

#### Permission Inheritance
- Permissions automatically cascade down the folder hierarchy
- Can be disabled per folder with `inherit_permissions: false`
- Child folders can override parent permissions when inheritance is disabled
- Database functions ensure efficient permission checking

### 🎯 Permission Resolution

The system follows a priority order for access control:

1. **Global Permissions**: `manage_folders` grants admin access to all folders
2. **Folder Creator**: Original creator always has full access
3. **Explicit Permissions**: Direct user or department permissions on folder
4. **Inherited Permissions**: Parent folder permissions (if inheritance enabled)
5. **Public Access**: Public folders allow read access to all users

### 🛠️ API Features

#### Core Operations
- **CRUD Operations**: Full create, read, update, delete functionality
- **Search & Filter**: Text search with filtering by parent, access level, creator
- **Pagination**: Efficient pagination for large folder structures
- **Bulk Operations**: Support for batch folder operations

#### Permission Management
- **Grant Permissions**: Assign permissions to users or departments
- **Revoke Permissions**: Remove specific permissions with granular control
- **Permission Listing**: View all permissions for administrative oversight
- **Access Validation**: Real-time permission checking for operations

#### Navigation & Discovery
- **Accessible Folders**: Get folders user can access based on permission type
- **Hierarchy Traversal**: Generate breadcrumb navigation paths
- **Parent-Child Navigation**: Efficient subfolder listing
- **Permission-Aware Filtering**: Results automatically filtered by user access

### 🔄 Document Integration

The folder system is tightly integrated with document management:

#### Document Access Control
- **Folder-Based Permissions**: Documents inherit access control from containing folder
- **Upload Restrictions**: Users need `write` permission to upload to folders
- **Move Operations**: Permission validation when moving documents between folders
- **Read Access**: Documents respect folder `read` permissions for viewing

#### Permission Checking
- Documents without folders use global permissions (`view_documents`, `edit_documents`)
- Documents in folders use folder permissions as primary access control
- Document creators maintain access regardless of folder permissions
- Admin users with global permissions override folder restrictions

### 🔧 Implementation Examples

#### Creating a Folder Structure
```typescript
// Create parent folder
POST /api/v1/folders
{
  "folder_name": "Company Documents",
  "access_level": "restricted",
  "description": "Main company document repository"
}

// Create subfolder
POST /api/v1/folders  
{
  "folder_name": "HR Policies",
  "parent_folder_id": "parent-uuid",
  "access_level": "inherited",
  "inherit_permissions": true
}
```

#### Granting Permissions
```typescript
// Grant department write access
POST /api/v1/folders/permissions
{
  "folder_id": "folder-uuid",
  "department_id": "hr-dept-uuid", 
  "permission_type": "write"
}

// Grant user manage access
POST /api/v1/folders/permissions
{
  "folder_id": "folder-uuid",
  "user_id": "user-uuid",
  "permission_type": "manage"
}
```

#### Permission-Aware Document Upload
```typescript
// System automatically checks folder write permissions
POST /api/v1/documents
{
  "document_name": "Employee Handbook.pdf",
  "folder_id": "hr-folder-uuid",
  "file_path": "/uploads/handbook.pdf"
  // Requires write access to hr-folder-uuid
}
```

### 📊 Database Functions

The system includes optimized PostgreSQL functions:

- **`user_has_folder_permission(user_id, folder_id, permission_type)`**: Efficient permission checking with hierarchy traversal
- **`get_user_accessible_folders(user_id, permission_type)`**: Returns all accessible folders for a user
- **Permission Inheritance**: Automatic cascade through folder hierarchy with depth limits

### 🛡️ Security Features

- **SQL Injection Prevention**: Parameterized queries and input validation
- **Permission Validation**: Multi-layer access control checking
- **Audit Trail**: Complete tracking of permission grants and modifications
- **Input Sanitization**: Folder names and descriptions validated against malicious input
- **Circular Reference Protection**: Prevents infinite loops in folder structure

## 🔐 Authentication & Authorization

### JWT Authentication
- Access tokens (15 minutes default)
- Refresh tokens (7 days default)
- Secure token storage and rotation

### Role-Based Access Control
Users are assigned to departments, which have specific permissions:

#### Default Departments & Permissions
- **Admin**: Full system access including all folder management and global permissions
- **IT**: Technical management, user administration, and folder management capabilities
- **HR**: User management, document access, and department-specific folder permissions
- **Finance**: Document access, analytics, and assigned folder permissions
- **Marketing**: Basic document and chat access with limited folder permissions
- **Operations**: Document management, analytics, and operational folder access

**Note**: The `manage_folders` permission grants admin-level access to all folders regardless of specific folder permissions.

### Default Admin User
- **Email**: admin@example.com
- **Password**: Admin123!
- **⚠️ Change this password immediately in production!**

## 🛣️ API Endpoints

### Authentication
```
POST /api/v1/auth/register    - User registration
POST /api/v1/auth/login       - User login
POST /api/v1/auth/refresh     - Token refresh
POST /api/v1/auth/logout      - User logout
POST /api/v1/auth/forgot-password - Password reset request
POST /api/v1/auth/reset-password  - Password reset
```

### Users
```
GET    /api/v1/users          - List users
GET    /api/v1/users/:id      - Get user details
POST   /api/v1/users          - Create user
PUT    /api/v1/users/:id      - Update user
DELETE /api/v1/users/:id      - Deactivate user
```

### Documents
```
GET    /api/v1/documents      - List documents
GET    /api/v1/documents/:id  - Get document
POST   /api/v1/documents      - Upload document
PUT    /api/v1/documents/:id  - Update document
DELETE /api/v1/documents/:id  - Delete document
```

### Folders
```
GET    /api/v1/folders                    - List folders with pagination
GET    /api/v1/folders/:id               - Get folder details
POST   /api/v1/folders                   - Create new folder
PUT    /api/v1/folders/:id               - Update folder
DELETE /api/v1/folders/:id               - Delete folder
GET    /api/v1/folders/search            - Search folders
GET    /api/v1/folders/accessible        - Get user accessible folders
GET    /api/v1/folders/parent/:parentId  - Get subfolders by parent
GET    /api/v1/folders/:id/hierarchy     - Get folder breadcrumb hierarchy
GET    /api/v1/folders/:id/permissions   - Get folder permissions
POST   /api/v1/folders/permissions       - Grant folder permission
DELETE /api/v1/folders/:id/permissions   - Revoke folder permission
```

### Conversations
```
GET    /api/v1/conversations     - List conversations
GET    /api/v1/conversations/:id - Get conversation
POST   /api/v1/conversations     - Create conversation
PUT    /api/v1/conversations/:id - Update conversation
DELETE /api/v1/conversations/:id - Delete conversation
```

### Messages
```
GET    /api/v1/messages              - List messages
GET    /api/v1/messages/:id          - Get message
POST   /api/v1/messages              - Send message
PUT    /api/v1/messages/:id          - Edit message
DELETE /api/v1/messages/:id          - Delete message
POST   /api/v1/messages/:id/react    - React to message
```

## 🔧 Configuration

### Environment Variables

#### Server Configuration
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3000)
- `API_VERSION` - API version (default: v1)

#### Database Configuration
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_SSL` - Enable SSL connection
- `DB_MAX_CONNECTIONS` - Connection pool size

#### Security Configuration
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_EXPIRES_IN` - Access token expiry
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry
- `BCRYPT_ROUNDS` - Password hashing rounds

#### AI Provider Configuration
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_AI_API_KEY` - Google AI API key

## 🧪 Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test src/models/User.test.ts
```

## 📝 Logging

The application uses Winston for structured logging:

- **Console**: Development environment
- **File**: All environments (app.log, error.log)
- **Levels**: error, warn, info, debug

Log files are stored in the `logs/` directory with automatic rotation.

## 🚀 Deployment

### Docker (Recommended)

1. **Build the image**
   ```bash
   docker build -t ai-chat-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the application**
   ```bash
   bun start
   ```

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Database connection encryption
- [ ] Environment variable security

### Security Features
- Password hashing with bcrypt
- JWT with secure defaults
- SQL injection prevention
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers (Helmet)
- Audit trail logging

## 📊 Performance

### Database Optimization
- Comprehensive indexing strategy
- Connection pooling
- Query optimization
- Pagination for large datasets

### Caching Strategy
- Redis for session storage
- API response caching
- Permission caching

### Monitoring
- Request/response logging
- Performance metrics
- Error tracking
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write tests for new features
- Update documentation
- Follow SOLID principles
- Maintain clean code practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Examine the example requests

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Note**: This is a production-ready backend application. Ensure you follow security best practices and conduct proper testing before deploying to production environments. 