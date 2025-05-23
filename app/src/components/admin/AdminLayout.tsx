import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { 
  Users, 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Home,
  Shield,
  Sparkles,
  User,
  Bell,
  Search
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: Home, 
      color: 'from-blue-500 to-cyan-400',
      description: 'Overview & stats'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: Users, 
      color: 'from-purple-500 to-pink-400',
      description: 'Manage accounts'
    },
    { 
      name: 'Departments', 
      href: '/admin/departments', 
      icon: Building2, 
      color: 'from-green-500 to-emerald-400',
      description: 'Organize teams'
    },
    { 
      name: 'Permissions', 
      href: '/admin/permissions', 
      icon: Shield, 
      color: 'from-orange-500 to-red-400',
      description: 'Access control'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings, 
      color: 'from-gray-500 to-slate-400',
      description: 'System config'
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-xl border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-xl blur opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-primary to-purple-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Admin</h1>
              <p className="text-xs text-muted-foreground">Control Panel</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`relative p-2 rounded-lg bg-gradient-to-r ${item.color} ${isActive ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-muted/50 to-accent/30 backdrop-blur-sm">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.firstName?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center p-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all duration-200 group"
          >
            <LogOut className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-background/60 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-3 bg-accent/30 rounded-xl px-4 py-2 min-w-[300px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Profile */}
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors">
                <div className="h-8 w-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </button>
              
              <ThemeToggle variant="minimal" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 