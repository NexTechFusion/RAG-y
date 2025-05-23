import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Shield, Activity, TrendingUp } from 'lucide-react';
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      link: '/admin/users',
      trend: '+12%'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      link: '/admin/users?filter=active',
      trend: '+5%'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      link: '/admin/departments',
      trend: '+2%'
    },
    {
      title: 'Active Departments',
      value: stats.activeDepartments,
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      link: '/admin/departments?filter=active',
      trend: '0%'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-content p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your admin panel statistics and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="card hover:shadow-lg transition-all duration-200 hover:scale-105 group"
            >
              <div className="card-content p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex items-center text-sm text-success-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {card.trend}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Recent Users</h2>
              <Link
                to="/admin/users"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <p className="card-description">Latest user registrations</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.first_name[0]?.toUpperCase()}
                        {user.last_name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.department_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`badge ${
                          user.is_active
                            ? 'badge-success'
                            : 'badge-destructive'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Departments Overview */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Departments</h2>
              <Link
                to="/admin/departments"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <p className="card-description">Active departments overview</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {departments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No departments found
                </div>
              ) : (
                departments?.map((department) => (
                  <div key={department.department_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">
                        {department.department_name}
                      </h3>
                      {department.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {department.description}
                        </p>
                      )}
                      {department.user_count !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {department.user_count} users
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`badge ${
                          department.is_active
                            ? 'badge-success'
                            : 'badge-destructive'
                        }`}
                      >
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