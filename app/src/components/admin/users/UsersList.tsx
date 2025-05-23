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
  Calendar,
  Users,
  UserCheck,
  UserX,
  Sparkles,
  Grid3X3,
  List
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 12;

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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Users</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Users
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-accent/30 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Link
                to="/admin/users/new"
                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Add User</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Filters</h2>
              <p className="text-sm text-muted-foreground">Refine your search</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  User Type
                </label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">All Users</option>
                  <option value="human">Human Users</option>
                  <option value="ai">AI Users</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{total} users found</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Users Display */}
      {users?.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-12">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-accent/20 rounded-full blur"></div>
              <div className="relative h-24 w-24 mx-auto bg-gradient-to-r from-muted to-accent rounded-full flex items-center justify-center">
                <UserX className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your filters or create a new user to get started.
            </p>
            <Link
              to="/admin/users/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create User</span>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users?.map((user, index) => (
            <div
              key={user.user_id}
              className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              
              {/* User Avatar & Status */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {user.first_name[0]?.toUpperCase()}
                      {user.last_name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${user.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full flex items-center justify-center`}>
                    {user.is_active ? (
                      <UserCheck className="h-3 w-3 text-white" />
                    ) : (
                      <UserX className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-foreground truncate">
                    {user.department_name || 'No Department'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`badge ${user.is_ai_user ? 'badge-secondary' : 'badge-default'}`}>
                    {user.is_ai_user ? 'AI User' : 'Human'}
                  </span>
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-destructive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last login: {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Link
                  to={`/admin/users/${user.user_id}/edit`}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteUser(user.user_id)}
                  className="flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Deactivate user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="p-6">
            <div className="space-y-4">
              {users?.map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center space-x-6 p-4 rounded-xl hover:bg-accent/30 transition-colors group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="h-12 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.first_name[0]?.toUpperCase()}
                        {user.last_name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${user.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`badge badge-sm ${user.is_ai_user ? 'badge-secondary' : 'badge-default'}`}>
                        {user.is_ai_user ? 'AI' : 'Human'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="mr-4">{user.email}</span>
                      <Building2 className="h-3 w-3 mr-1" />
                      <span>{user.department_name || 'No Department'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-destructive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/users/${user.user_id}/edit`}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Deactivate user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to{' '}
            {Math.min(currentPage * limit, total)} of {total} users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background/50 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-foreground px-4 py-2 bg-primary/10 rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background/50 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 