import type { User } from "./auth";

export interface Department {
  department_id: string;
  department_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DepartmentPermission {
  id: string;
  department_id: string;
  permission_id: string;
  permission: Permission;
}

export interface DepartmentPermissionResponse {
  category: string;
  description: string;
  granted_at: string;
  permission_id: string;
  permission_name: string;
}

export interface AdminUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  department_name?: string;
  is_ai_user: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentRequest {
  department_name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  department_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department_id: string;
  is_ai_user?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  department_id?: string;
  is_active?: boolean;
  is_ai_user?: boolean;
}

export interface ChangePasswordRequest {
  new_password: string;
}

export interface PaginationResponseUsers<User> {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationResponseDepartment<Department> {
    departments: Department[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DepartmentStats {
  user_count: number;
  active_users: number;
  ai_users: number;
  recent_activity?: number;
} 