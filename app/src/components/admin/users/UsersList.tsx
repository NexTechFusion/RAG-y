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
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

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

  const { toast } = useToast();

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
      toast.error('Failed to deactivate user', 'Please try again later.');
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
          <h1 className="text-4xl font-bold text-foreground">Users</h1>
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
                <h1 className="text-4xl font-bold text-foreground">
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
              <Link to="/admin/users/new">
                <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add User</span>
                </Button>
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
                <Label>Search Users</Label>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  icon={<Search className="h-5 w-5 text-muted-foreground" />}
                />
              </div>

              {/* Department Filter */}
              <div>
                <Label>Department</Label>
                <Select
                  value={selectedDepartment}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments?.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* User Type Filter */}
              <div>
                <Label>User Type</Label>
                <Select
                  value={selectedUserType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserType(e.target.value)}
                >
                  <option value="">All Users</option>
                  <option value="human">Human Users</option>
                  <option value="ai">AI Users</option>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{total} users found</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                >
                  Clear
                </Button>
                <Button type="submit" variant="secondary">
                  Apply Filters
                </Button>
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
            <Link to="/admin/users/new">
              <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create User</span>
              </Button>
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
                  <Badge variant={user.is_ai_user ? 'secondary' : 'default'}>
                    {user.is_ai_user ? 'AI User' : 'Human'}
                  </Badge>
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
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
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200"
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
                      <Badge variant={user.is_ai_user ? 'secondary' : 'default'} size="sm">
                        {user.is_ai_user ? 'AI' : 'Human'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="mr-4">{user.email}</span>
                      <Building2 className="h-3 w-3 mr-1" />
                      <span>{user.department_name || 'No Department'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-foreground px-4 py-2 bg-primary/10 rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 