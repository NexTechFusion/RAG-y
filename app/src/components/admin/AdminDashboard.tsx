import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Shield, Activity, TrendingUp, ArrowUpRight, Zap, Clock, Eye } from 'lucide-react';
import { userApi, departmentApi } from '../../lib/adminApi';
import type { AdminUser, Department } from '../../types/admin';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  activeDepartments: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    activeDepartments: 0,
  });
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users with pagination
        const usersResponse = await userApi.getUsers(1, 50);
        const users = usersResponse.data.users;
        
        // Fetch departments
        const departmentsResponse = await departmentApi.getDepartments(1, 50);
        const departmentsList = departmentsResponse.data.departments;

        // Calculate stats
        const activeUsers = users.filter((user: AdminUser) => user.is_active).length;
        const activeDepartments = departmentsList.filter((dept: Department) => dept.is_active).length;

        setStats({
          totalUsers: users.length,
          activeUsers,
          totalDepartments: departmentsList.length,
          activeDepartments,
        });

        // Get recent users (last 5)
        const sortedUsers = [...users]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        setRecentUsers(sortedUsers);
        setDepartments(departmentsList.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50',
      link: '/admin/users',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      gradient: 'from-emerald-500 via-green-600 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50',
      link: '/admin/users?filter=active',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      gradient: 'from-purple-500 via-violet-600 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50',
      link: '/admin/departments',
      trend: '+2%',
      trendUp: true
    },
    {
      title: 'Active Departments',
      value: stats.activeDepartments,
      icon: Shield,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgGradient: 'from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50',
      link: '/admin/departments?filter=active',
      trend: '0%',
      trendUp: false
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-accent/30 p-6 animate-pulse">
              <div className="h-4 bg-muted rounded-full w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-4">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-green-500">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}></div>
              <div className="relative p-6 bg-card/80 backdrop-blur-sm border border-border/50">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    card.trendUp 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${card.trendUp ? '' : 'rotate-180'}`} />
                    {card.trend}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Recent Users</h2>
                  <p className="text-sm text-muted-foreground">Latest registrations</p>
                </div>
              </div>
              <Link
                to="/admin/users"
                className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent users</p>
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <div key={user.user_id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-accent/30 transition-colors"
                       style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="relative">
                      <div className="h-12 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.first_name[0]?.toUpperCase()}
                          {user.last_name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${user.is_active ? 'bg-green-500' : 'bg-gray-400'} border-2 border-background rounded-full`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.department_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-destructive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Departments Overview */}
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Departments</h2>
                  <p className="text-sm text-muted-foreground">Organization overview</p>
                </div>
              </div>
              <Link
                to="/admin/departments"
                className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {departments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No departments found</p>
                </div>
              ) : (
                departments?.map((department, index) => (
                  <div key={department.department_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors"
                       style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">
                          {department.department_name}
                        </h3>
                        {department.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {department.description}
                          </p>
                        )}
                        {department.user_count !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {department.user_count} members
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`badge ${department.is_active ? 'badge-success' : 'badge-destructive'}`}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 