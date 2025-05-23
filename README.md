# AI Chat Application Backend

A comprehensive Node.js backend built with Bun, TypeScript, and PostgreSQL for an AI-powered chat application with document management and role-based access control.

## 🚀 Features

- **AI-Powered Chat**: Integrate with multiple AI providers (OpenAI, Anthropic, Google)
- **Document Management**: Upload, organize, and manage documents with folder structure
- **Role-Based Access Control**: Department-based permissions system
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
- `documents` - File metadata and references

### AI Chat System
- `aimodels` - AI model configurations
- `conversations` - Chat sessions
- `conversationparticipants` - Conversation membership
- `messages` - Chat messages with AI metadata
- `messagereactions` - User feedback on messages

### Audit & Security
- `auditlog` - System change tracking

## 🔐 Authentication & Authorization

### JWT Authentication
- Access tokens (15 minutes default)
- Refresh tokens (7 days default)
- Secure token storage and rotation

### Role-Based Access Control
Users are assigned to departments, which have specific permissions:

#### Default Departments & Permissions
- **Admin**: Full system access
- **IT**: Technical management and user administration
- **HR**: User management and document access
- **Finance**: Document access and analytics
- **Marketing**: Basic document and chat access
- **Operations**: Document management and analytics

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
- [ ] Regular security updates
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