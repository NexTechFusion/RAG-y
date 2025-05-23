import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building2,
  Calendar
} from 'lucide-react';
import { userApi, departmentApi } from '../../../lib/adminApi';
import type { AdminUser, Department } from '../../../types/admin';

const UsersList = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (selectedDepartment) filters.department_id = selectedDepartment;
      if (selectedUserType !== '') filters.is_ai_user = selectedUserType === 'ai';
      if (searchQuery) filters.search = searchQuery;

      const response = await userApi.getUsers(currentPage, limit, filters);
      setUsers(response.data.users);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getDepartments(1, 100);
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedDepartment, selectedUserType, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to deactivate user');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedUserType('');
    setCurrentPage(1);
  };

  if (loading && users?.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gradient">Users</h1>
        </div>
        <div className="card animate-pulse">
          <div className="card-content p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Users</h1>
          <p className="mt-1 text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Link
          to="/admin/users/new"
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Search & Filter</h2>
          <p className="card-description">Find users by name, email, or department</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="form-label">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="form-label">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="select"
                >
                  <option value="">All Departments</option>
                  {departments?.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Type Filter */}
              <div>
                <label className="form-label">
                  User Type
                </label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="select"
                >
                  <option value="">All Users</option>
                  <option value="human">Human Users</option>
                  <option value="ai">AI Users</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-outline btn-md"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Users ({total} total)
          </h2>
        </div>

        {users?.length === 0 ? (
          <div className="card-content">
            <div className="text-center py-12">
              <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating a new user or adjust your filters.
              </p>
              <Link
                to="/admin/users/new"
                className="btn btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                New User
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.user_id} className="border-b border-border hover:bg-accent transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center ring-2 ring-primary/20">
                              <span className="text-sm font-medium text-primary-foreground">
                                {user.first_name[0]?.toUpperCase()}
                                {user.last_name[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            {user.department_name || 'No Department'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${
                              user.is_ai_user
                                ? 'badge-secondary'
                                : 'badge-default'
                            }`}
                          >
                            {user.is_ai_user ? 'AI User' : 'Human'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${
                              user.is_active
                                ? 'badge-success'
                                : 'badge-destructive'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString()
                              : 'Never'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/users/${user.user_id}/edit`}
                              className="btn btn-ghost btn-sm"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="btn btn-ghost btn-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Deactivate user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * limit + 1} to{' '}
                    {Math.min(currentPage * limit, total)} of {total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline btn-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-muted-foreground px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="btn btn-outline btn-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList; 