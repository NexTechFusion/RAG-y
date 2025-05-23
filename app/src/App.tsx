import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UsersList from './components/admin/users/UsersList';
import CreateUserForm from './components/admin/users/CreateUserForm';
import EditUserForm from './components/admin/users/EditUserForm';
import DepartmentsList from './components/admin/departments/DepartmentsList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin Dashboard */}
              <Route index element={<AdminDashboard />} />
              
              {/* User Management */}
              <Route path="users" element={<UsersList />} />
              <Route path="users/new" element={<CreateUserForm />} />
              <Route path="users/:id/edit" element={<EditUserForm />} />
              
              {/* Department Management */}
              <Route path="departments" element={<DepartmentsList />} />
              {/* <Route path="departments/new" element={<CreateDepartmentForm />} />
              <Route path="departments/:id" element={<DepartmentDetail />} />
              <Route path="departments/:id/edit" element={<EditDepartmentForm />} /> */}
              
              {/* Permissions Management */}
              {/* <Route path="permissions" element={<PermissionsList />} /> */}
              
              {/* Settings */}
              {/* <Route path="settings" element={<AdminSettings />} /> */}
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
