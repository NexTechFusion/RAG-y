import { api } from './api';
import type {
  Department,
  Permission,
  DepartmentPermission,
  AdminUser,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ApiResponse,
  DepartmentStats,
  PaginationResponseDepartment,
  PaginationResponseUsers,
} from '../types/admin';

// Department API
export const departmentApi = {
  // Get all departments with pagination
  getDepartments: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginationResponseDepartment<Department>>> => {
    const response = await api.get(`/departments?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id: string): Promise<ApiResponse<{ department: Department }>> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Get department statistics
  getDepartmentStats: async (id: string): Promise<ApiResponse<DepartmentStats>> => {
    const response = await api.get(`/departments/${id}/stats`);
    return response.data;
  },

  // Create new department
  createDepartment: async (
    data: CreateDepartmentRequest
  ): Promise<ApiResponse<{ department: Department }>> => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  // Update department
  updateDepartment: async (
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<ApiResponse<{ department: Department }>> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // Get department users
  getDepartmentUsers: async (
    id: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginationResponseUsers<AdminUser>>> => {
    const response = await api.get(`/departments/${id}/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get available permissions
  getAvailablePermissions: async (): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get('/departments/permissions');
    return response.data;
  },

  // Get department permissions
  getDepartmentPermissions: async (
    id: string
  ): Promise<ApiResponse<{ permissions: DepartmentPermission[] }>> => {
    const response = await api.get(`/departments/${id}/permissions`);
    return response.data;
  },

  // Get available permissions for department (not already assigned)
  getAvailablePermissionsForDepartment: async (
    id: string
  ): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get(`/departments/${id}/permissions/available`);
    return response.data;
  },

  // Add permission to department
  addDepartmentPermission: async (
    id: string,
    permissionId: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.post(`/departments/${id}/permissions`, {
      permission_id: permissionId,
    });
    return response.data;
  },

  // Remove permission from department
  removeDepartmentPermission: async (
    id: string,
    permissionId: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/departments/${id}/permissions/${permissionId}`);
    return response.data;
  },
};

// User API
export const userApi = {
  // Get all users with pagination and filtering
  getUsers: async (
    page = 1,
    limit = 10,
    filters?: {
      department_id?: string;
      is_ai_user?: boolean;
      search?: string;
    }
  ): Promise<ApiResponse<PaginationResponseUsers<AdminUser>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.department_id) {
      params.append('department_id', filters.department_id);
    }
    if (filters?.is_ai_user !== undefined) {
      params.append('is_ai_user', filters.is_ai_user.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<{ user: AdminUser }>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<ApiResponse<{ user: AdminUser }>> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<{ user: AdminUser }>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (deactivate)
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change user password
  changeUserPassword: async (
    id: string,
    data: ChangePasswordRequest
  ): Promise<ApiResponse<null>> => {
    const response = await api.put(`/users/${id}/password`, data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: AdminUser & { permissions: string[] } }>> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Permission API
export const permissionApi = {
  // Get all permissions with optional category filtering
  getPermissions: async (filters?: {
    category?: string;
  }): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const params = new URLSearchParams();
    if (filters?.category) {
      params.append('category', filters.category);
    }
    const response = await api.get(`/permissions?${params.toString()}`);
    return response.data;
  },

  // Get permission by ID
  getPermissionById: async (id: string): Promise<ApiResponse<{ permission: Permission }>> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  // Get all permission categories
  getCategories: async (): Promise<ApiResponse<{ categories: string[] }>> => {
    const response = await api.get('/permissions/categories');
    return response.data;
  },

  // Get permissions by category
  getPermissionsByCategory: async (category: string): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get(`/permissions/category/${category}`);
    return response.data;
  },

  // Create new permission
  createPermission: async (data: {
    permission_name: string;
    description?: string;
    category: string;
  }): Promise<ApiResponse<{ permission: Permission }>> => {
    const response = await api.post('/permissions', data);
    return response.data;
  },

  // Update permission
  updatePermission: async (
    id: string,
    data: {
      permission_name?: string;
      description?: string;
      category?: string;
      is_active?: boolean;
    }
  ): Promise<ApiResponse<{ permission: Permission }>> => {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },

  // Delete permission (deactivate)
  deletePermission: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },

  // Get permissions for a specific department
  getDepartmentPermissions: async (
    departmentId: string
  ): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get(`/permissions/department/${departmentId}`);
    return response.data;
  },

  // Get available permissions for a department (not yet assigned)
  getAvailablePermissionsForDepartment: async (
    departmentId: string
  ): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get(`/permissions/department/${departmentId}/available`);
    return response.data;
  },

  // Get permissions for a specific user
  getUserPermissions: async (
    userId: string
  ): Promise<ApiResponse<{ permissions: Permission[] }>> => {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data;
  },

  // Assign permission to department
  assignPermissionToDepartment: async (
    departmentId: string,
    permissionId: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.post(`/permissions/department/${departmentId}/assign`, {
      permission_id: permissionId,
    });
    return response.data;
  },

  // Remove permission from department
  removePermissionFromDepartment: async (
    departmentId: string,
    permissionId: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/permissions/department/${departmentId}/permission/${permissionId}`);
    return response.data;
  },
}; 