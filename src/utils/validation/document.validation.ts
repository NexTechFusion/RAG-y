import { z } from 'zod';

// Common validation rules
const uuidSchema = z.string().uuid('Invalid UUID format');
const documentNameSchema = z.string().min(1, 'Document name is required').max(255, 'Document name too long');
const filePathSchema = z.string().min(1, 'File path is required').max(1000, 'File path too long');
const fileSizeSchema = z.number().min(0, 'File size must be non-negative');
const mimeTypeSchema = z.string().max(255, 'MIME type too long').optional();

// Create document validation
export const createDocumentSchema = z.object({
  body: z.object({
    document_name: documentNameSchema,
    file_path: filePathSchema,
    folder_id: uuidSchema.optional(),
    file_size_bytes: fileSizeSchema,
    mime_type: mimeTypeSchema,
    file_hash: z.string().max(128, 'File hash too long').optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Update document validation
export const updateDocumentSchema = z.object({
  body: z.object({
    document_name: documentNameSchema.optional(),
    file_path: filePathSchema.optional(),
    folder_id: uuidSchema.nullable().optional(),
    file_size_bytes: fileSizeSchema.optional(),
    mime_type: mimeTypeSchema,
    is_active: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get document by ID validation
export const getDocumentByIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Get documents list validation
export const getDocumentsListSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    folder_id: uuidSchema.optional(),
    uploaded_by_user_id: uuidSchema.optional(),
    mime_type: z.string().optional(),
    search: z.string().optional(),
    is_active: z.string().transform(val => val === 'true').optional(),
  }),
  params: z.object({}),
});

// Delete document validation
export const deleteDocumentSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: uuidSchema,
  }),
});

// Upload document validation
export const uploadDocumentSchema = z.object({
  body: z.object({
    document_name: documentNameSchema.optional(), // Can be derived from file name
    folder_id: uuidSchema.optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Search documents validation
export const searchDocumentsSchema = z.object({
  body: z.object({}),
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(255, 'Search query too long'),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    folder_id: uuidSchema.optional(),
    mime_type: z.string().optional(),
  }),
  params: z.object({}),
});

// Get documents by folder validation
export const getDocumentsByFolderSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  }),
  params: z.object({
    folderId: uuidSchema,
  }),
});

// Get documents statistics validation
export const getDocumentsStatsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({}),
});

// Export validation object
export const documentValidation = {
  createDocument: createDocumentSchema,
  updateDocument: updateDocumentSchema,
  getDocumentById: getDocumentByIdSchema,
  getDocumentsList: getDocumentsListSchema,
  deleteDocument: deleteDocumentSchema,
  uploadDocument: uploadDocumentSchema,
  searchDocuments: searchDocumentsSchema,
  getDocumentsByFolder: getDocumentsByFolderSchema,
  getDocumentsStats: getDocumentsStatsSchema,
}; 