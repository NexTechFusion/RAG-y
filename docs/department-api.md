# Department API Documentation

## Overview
The Department API provides endpoints for managing organizational departments, their users, and permission assignments. All endpoints require authentication and appropriate permissions.

## Base URL
```
/api/v1/departments
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Permissions Required
- **view_users**: Can view departments and their users
- **manage_permissions**: Can create, update, delete departments and manage permissions

---

## Endpoints

### 1. Get All Departments
**GET** `/departments`

**Description**: Retrieve a paginated list of departments with user and permission counts.

**Required Permission**: `view_users`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for department name or description
- `is_active` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "department_id": "uuid",
        "department_name": "IT",
        "description": "Information Technology department",
        "is_active": true,
        "user_count": 5,
        "permission_count": 12,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Department by ID
**GET** `/departments/:id`

**Description**: Retrieve detailed information about a specific department.

**Required Permission**: `view_users`

**Parameters**:
- `id`: Department UUID

**Response**:
```json
{
  "success": true,
  "message": "Department retrieved successfully",
  "data": {
    "department": {
      "department_id": "uuid",
      "department_name": "IT",
      "description": "Information Technology department",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. Create Department
**POST** `/departments`

**Description**: Create a new department.

**Required Permission**: `manage_permissions`

**Request Body**:
```json
{
  "department_name": "New Department",
  "description": "Department description (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "department": {
      "department_id": "uuid",
      "department_name": "New Department",
      "description": "Department description",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 4. Update Department
**PUT** `/departments/:id`

**Description**: Update an existing department.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID

**Request Body** (all fields optional):
```json
{
  "department_name": "Updated Department Name",
  "description": "Updated description",
  "is_active": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "department": {
      "department_id": "uuid",
      "department_name": "Updated Department Name",
      "description": "Updated description",
      "is_active": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Department
**DELETE** `/departments/:id`

**Description**: Soft delete a department (sets is_active to false). Cannot delete departments with active users.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID

**Response**:
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Error Response** (if department has active users):
```json
{
  "success": false,
  "message": "Cannot delete department with active users",
  "statusCode": 400
}
```

---

### 6. Get Department Users
**GET** `/departments/:id/users`

**Description**: Retrieve all users in a specific department.

**Required Permission**: `view_users`

**Parameters**:
- `id`: Department UUID

**Response**:
```json
{
  "success": true,
  "message": "Department users retrieved successfully",
  "data": {
    "department_id": "uuid",
    "department_name": "IT",
    "users": [
      {
        "user_id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "is_ai_user": false,
        "is_active": true,
        "last_login_at": "2024-01-01T12:00:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 7. Get Department Permissions
**GET** `/departments/:id/permissions`

**Description**: Retrieve all permissions assigned to a department.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID

**Response**:
```json
{
  "success": true,
  "message": "Department permissions retrieved successfully",
  "data": {
    "department_id": "uuid",
    "department_name": "IT",
    "permissions": [
      {
        "permission_id": "uuid",
        "permission_name": "view_users",
        "description": "View user profiles and lists",
        "category": "users",
        "granted_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 8. Get Available Permissions for Department
**GET** `/departments/:id/permissions/available`

**Description**: Retrieve all permissions that are not yet assigned to a department.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID

**Response**:
```json
{
  "success": true,
  "message": "Available permissions for department retrieved successfully",
  "data": {
    "department_id": "uuid",
    "department_name": "IT",
    "available_permissions": [
      {
        "permission_id": "uuid",
        "permission_name": "system_settings",
        "description": "Modify system-wide settings",
        "category": "admin",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 9. Add Permission to Department
**POST** `/departments/:id/permissions`

**Description**: Grant a permission to a department.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID

**Request Body**:
```json
{
  "permission_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Permission added to department successfully",
  "data": {
    "department_id": "uuid",
    "permission_id": "uuid",
    "granted_by": "uuid",
    "granted_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 10. Remove Permission from Department
**DELETE** `/departments/:id/permissions/:permission_id`

**Description**: Revoke a permission from a department.

**Required Permission**: `manage_permissions`

**Parameters**:
- `id`: Department UUID
- `permission_id`: Permission UUID

**Response**:
```json
{
  "success": true,
  "message": "Permission removed from department successfully"
}
```

---

### 11. Get All Available Permissions
**GET** `/departments/permissions`

**Description**: Retrieve all available permissions in the system, optionally filtered by category.

**Required Permission**: `manage_permissions`

**Query Parameters**:
- `category` (optional): Filter permissions by category (users, documents, chat, admin)

**Response**:
```json
{
  "success": true,
  "message": "Available permissions retrieved successfully",
  "data": {
    "permissions": [
      {
        "permission_id": "uuid",
        "permission_name": "view_users",
        "description": "View user profiles and lists",
        "category": "users",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "department_name",
      "message": "Department name is required"
    }
  ],
  "statusCode": 400
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token required",
  "statusCode": 401
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Permission 'manage_permissions' required",
  "statusCode": 403
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Department not found",
  "statusCode": 404
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Department name already exists",
  "statusCode": 409
}
```

---

## Permission Categories

The system includes the following permission categories:

- **documents**: Document management permissions
- **chat**: Chat and conversation permissions  
- **users**: User management permissions
- **admin**: Administrative permissions

## Default Departments

The system comes with these default departments:

1. **Admin**: Full system access
2. **IT**: Technical management and user administration
3. **HR**: User management and document access
4. **Finance**: Document access and analytics
5. **Marketing**: Basic document and chat access
6. **Operations**: Document management and analytics
7. **AI Assistant**: Department for AI users

## Usage Examples

### Create a new department
```bash
curl -X POST /api/v1/departments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "department_name": "Customer Support",
    "description": "Customer service and support team"
  }'
```

### Assign permission to department
```bash
curl -X POST /api/v1/departments/<dept-id>/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_id": "<permission-uuid>"
  }'
```

### Get department with users
```bash
curl -X GET /api/v1/departments/<dept-id>/users \
  -H "Authorization: Bearer <token>"
``` 