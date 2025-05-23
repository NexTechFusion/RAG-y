# Document API Documentation

## Overview
The Document API provides endpoints for managing documents and files within the AI chat application. All endpoints require authentication and appropriate permissions based on role-based access control.

## Base URL
```
/api/v1/documents
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Permissions Required
- **view_documents**: Can view all documents in the system
- **create_documents**: Can upload and create new documents
- **edit_documents**: Can edit and update documents
- **delete_documents**: Can delete documents
- **view_analytics**: Can view document statistics

**Note**: Users can always view, edit, and delete their own documents regardless of permissions.

---

## Endpoints

### 1. Get All Documents
**GET** `/documents`

**Description**: Retrieve a paginated list of documents with filtering options.

**Required Permission**: `view_documents` (or user sees only their own documents)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `folder_id` (optional): Filter by folder UUID
- `uploaded_by_user_id` (optional): Filter by uploader UUID
- `mime_type` (optional): Filter by MIME type
- `search` (optional): Search term for document name
- `is_active` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "document_id": "uuid",
        "document_name": "example.pdf",
        "file_path": "/uploads/documents/example.pdf",
        "folder_id": "uuid",
        "folder_name": "Public Documents",
        "uploaded_by_user_id": "uuid",
        "uploaded_by_name": "John Doe",
        "uploaded_by_email": "john@example.com",
        "file_size_bytes": 1024000,
        "mime_type": "application/pdf",
        "file_hash": "sha256hash",
        "version_number": 1,
        "is_active": true,
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

### 2. Get Document by ID
**GET** `/documents/:id`

**Description**: Retrieve detailed information about a specific document.

**Required Permission**: `view_documents` (or document owner)

**Parameters**:
- `id`: Document UUID

**Response**:
```json
{
  "success": true,
  "message": "Document retrieved successfully",
  "data": {
    "document": {
      "document_id": "uuid",
      "document_name": "example.pdf",
      "file_path": "/uploads/documents/example.pdf",
      "folder_id": "uuid",
      "folder_name": "Public Documents",
      "uploaded_by_user_id": "uuid",
      "uploaded_by_name": "John Doe",
      "uploaded_by_email": "john@example.com",
      "file_size_bytes": 1024000,
      "mime_type": "application/pdf",
      "file_hash": "sha256hash",
      "version_number": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. Create Document
**POST** `/documents`

**Description**: Create a new document record.

**Required Permission**: `create_documents`

**Request Body**:
```json
{
  "document_name": "example.pdf",
  "file_path": "/uploads/documents/example.pdf",
  "folder_id": "uuid",
  "file_size_bytes": 1024000,
  "mime_type": "application/pdf",
  "file_hash": "sha256hash"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "document": {
      "document_id": "uuid",
      "document_name": "example.pdf",
      "file_path": "/uploads/documents/example.pdf",
      "folder_id": "uuid",
      "uploaded_by_user_id": "uuid",
      "file_size_bytes": 1024000,
      "mime_type": "application/pdf",
      "file_hash": "sha256hash",
      "version_number": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 4. Update Document
**PUT** `/documents/:id`

**Description**: Update an existing document.

**Required Permission**: `edit_documents` (or document owner)

**Parameters**:
- `id`: Document UUID

**Request Body** (all fields optional):
```json
{
  "document_name": "updated-example.pdf",
  "file_path": "/uploads/documents/updated-example.pdf",
  "folder_id": "uuid",
  "file_size_bytes": 2048000,
  "mime_type": "application/pdf",
  "is_active": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "document": {
      "document_id": "uuid",
      "document_name": "updated-example.pdf",
      "file_path": "/uploads/documents/updated-example.pdf",
      "folder_id": "uuid",
      "uploaded_by_user_id": "uuid",
      "file_size_bytes": 2048000,
      "mime_type": "application/pdf",
      "file_hash": "sha256hash",
      "version_number": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Document
**DELETE** `/documents/:id`

**Description**: Soft delete a document (sets is_active to false).

**Required Permission**: `delete_documents` (or document owner)

**Parameters**:
- `id`: Document UUID

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": null
}
```

---

### 6. Search Documents
**GET** `/documents/search`

**Description**: Search documents by name with filtering options.

**Required Permission**: `view_documents` (or user sees only their own documents)

**Query Parameters**:
- `q` (required): Search query string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `folder_id` (optional): Filter by folder UUID
- `mime_type` (optional): Filter by MIME type

**Response**:
```json
{
  "success": true,
  "message": "Document search completed",
  "data": {
    "documents": [
      {
        "document_id": "uuid",
        "document_name": "example.pdf",
        "file_path": "/uploads/documents/example.pdf",
        "folder_id": "uuid",
        "folder_name": "Public Documents",
        "uploaded_by_user_id": "uuid",
        "uploaded_by_name": "John Doe",
        "file_size_bytes": 1024000,
        "mime_type": "application/pdf",
        "version_number": 1,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    },
    "query": "example"
  }
}
```

---

### 7. Get Documents by Folder
**GET** `/documents/folder/:folderId`

**Description**: Retrieve all documents within a specific folder.

**Required Permission**: `view_documents` (or user sees only their own documents)

**Parameters**:
- `folderId`: Folder UUID

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "document_id": "uuid",
        "document_name": "example.pdf",
        "file_path": "/uploads/documents/example.pdf",
        "folder_id": "uuid",
        "folder_name": "Public Documents",
        "uploaded_by_user_id": "uuid",
        "uploaded_by_name": "John Doe",
        "file_size_bytes": 1024000,
        "mime_type": "application/pdf",
        "version_number": 1,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    },
    "folder_id": "uuid"
  }
}
```

---

### 8. Get Document Statistics
**GET** `/documents/statistics`

**Description**: Retrieve system-wide document statistics and analytics.

**Required Permission**: `view_analytics`

**Response**:
```json
{
  "success": true,
  "message": "Document statistics retrieved successfully",
  "data": {
    "statistics": {
      "total_documents": 150,
      "active_documents": 142,
      "total_file_size": 1073741824,
      "unique_mime_types": 8,
      "unique_uploaders": 25,
      "average_file_size": 7158278
    }
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
      "field": "document_name",
      "message": "Document name is required"
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
  "message": "Permission 'create_documents' required",
  "statusCode": 403
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Document not found",
  "statusCode": 404
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Document with this name already exists in the folder",
  "statusCode": 409
}
```

---

## File Upload Integration

The Document API is designed to work with file upload endpoints. The typical workflow is:

1. **Upload File**: Use a file upload endpoint to store the physical file
2. **Create Document Record**: Use `POST /documents` to create the database record
3. **Link Document**: The `file_path` field links the database record to the physical file

### Supported File Types
Based on the default configuration:
- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Images**: PNG, JPG, JPEG, GIF

### File Size Limits
- Default maximum file size: 10MB (configurable via `UPLOAD_MAX_SIZE`)

---

## Security Features

### Access Control
- **Role-based permissions**: Different access levels based on user department
- **Owner-based access**: Users can always manage their own documents
- **Folder-based organization**: Documents can be organized in hierarchical folders

### Data Validation
- **File integrity**: Optional file hash validation
- **MIME type validation**: Ensures uploaded files match expected types
- **Size validation**: Prevents oversized file uploads

### Audit Trail
- **Creation tracking**: Records who uploaded each document
- **Modification history**: Tracks updates with timestamps
- **Soft deletion**: Documents are marked inactive rather than permanently deleted

---

## Best Practices

### Document Organization
1. Use folders to organize documents by department, project, or category
2. Use descriptive document names for better searchability
3. Include file extensions in document names for clarity

### Performance Optimization
1. Use pagination for large document lists
2. Apply filters to reduce result sets
3. Use search functionality for specific document discovery

### Security Considerations
1. Validate file types before upload
2. Scan uploaded files for malware
3. Implement proper access controls based on document sensitivity
4. Regular cleanup of inactive documents

---

## Integration Examples

### Upload and Create Document
```javascript
// 1. Upload file (separate endpoint)
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const uploadResponse = await fetch('/api/v1/upload', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': `Bearer ${token}` }
});
const { file_path, file_size, mime_type, file_hash } = await uploadResponse.json();

// 2. Create document record
const documentResponse = await fetch('/api/v1/documents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    document_name: 'My Document.pdf',
    file_path,
    folder_id: 'folder-uuid',
    file_size_bytes: file_size,
    mime_type,
    file_hash
  })
});
```

### Search Documents
```javascript
const searchResponse = await fetch('/api/v1/documents/search?q=report&folder_id=uuid&page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { documents, pagination } = await searchResponse.json();
``` 