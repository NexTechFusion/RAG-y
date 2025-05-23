import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Shield, Activity } from 'lucide-react';
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
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'bg-green-500',
      link: '/admin/users?filter=active',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'bg-purple-500',
      link: '/admin/departments',
    },
    {
      title: 'Active Departments',
      value: stats.activeDepartments,
      icon: Shield,
      color: 'bg-indigo-500',
      link: '/admin/departments?filter=active',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
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
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    {card.title}
                  </p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.user_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.first_name[0]?.toUpperCase()}
                        {user.last_name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user.department_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departments Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Departments</h2>
              <Link
                to="/admin/departments"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {departments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No departments found
              </div>
            ) : (
              departments.map((department) => (
                <div key={department.department_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {department.department_name}
                      </h3>
                      {department.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {department.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          department.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {department.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {department.user_count !== undefined && (
                        <span className="text-xs text-gray-400 mt-1">
                          {department.user_count} users
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 