import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Building, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gradient">
                RAG-Y Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="default" />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm flex items-center space-x-2"
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
            <div className="card">
              <div className="card-content">
                <div className="flex items-center p-6">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="card-title text-lg">
                      Welcome back!
                    </h3>
                    <p className="text-muted-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Card */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center p-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Building className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="card-title text-lg">
                      Department
                    </h3>
                    <p className="text-muted-foreground">
                      {user?.department?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center p-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="h-8 w-8 flex items-center justify-center">
                      <div className={`h-3 w-3 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="card-title text-lg">
                      Status
                    </h3>
                    <p className="text-muted-foreground">
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Account Information
                </h3>
                <p className="card-description">
                  Your personal account details and information.
                </p>
              </div>
              <div className="card-content">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="form-label">Email</dt>
                    <dd className="mt-1 text-sm text-foreground">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="form-label">User ID</dt>
                    <dd className="mt-1 text-sm text-foreground font-mono">{user?.id}</dd>
                  </div>
                  <div>
                    <dt className="form-label">Created</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="form-label">Last Updated</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  🚀 Coming Soon
                </h3>
                <p className="card-description">
                  Exciting AI features are on the way!
                </p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">📄 Document Management</h4>
                    <p className="text-sm text-muted-foreground">Upload, organize, and manage your documents with AI-powered insights.</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">💬 AI Conversations</h4>
                    <p className="text-sm text-muted-foreground">Chat with your documents using advanced AI language models.</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">🔍 Smart Search</h4>
                    <p className="text-sm text-muted-foreground">Find information across all your documents with semantic search.</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">📊 Analytics</h4>
                    <p className="text-sm text-muted-foreground">Get insights into your document usage and AI interactions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 