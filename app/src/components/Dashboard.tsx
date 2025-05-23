import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Building } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                AI Chat Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2 px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="card p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Welcome back!
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Department Card */}
            <div className="card p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Department
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user?.department?.name || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Status
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-8">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Chat Features Coming Soon
              </h3>
              <p className="text-sm text-gray-500">
                Document management, AI conversations, and more features will be available soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 