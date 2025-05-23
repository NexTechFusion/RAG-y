export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend user structure (as received from API)
export interface BackendUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  department_id: string;
  is_ai_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: string;
}

// Backend response structure
export interface AuthResponse {
  success: boolean;
  data: {
    user: BackendUser;
    access_token: string;
    refresh_token: string;
  };
  message: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
} 