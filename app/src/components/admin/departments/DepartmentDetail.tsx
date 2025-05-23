import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Calendar, 
  FileText,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  BarChart3,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Search,
  Key,
  CheckCircle
} from 'lucide-react';
import { departmentApi, permissionApi } from '../../../lib/adminApi';
import type { Department, AdminUser, DepartmentPermissionResponse, Permission } from '../../../types/admin';
import { Button, Badge, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const DepartmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<DepartmentPermissionResponse[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'permissions'>('overview');
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  const [addingPermission, setAddingPermission] = useState<string | null>(null);
  const [removingPermission, setRemovingPermission] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDepartmentData = async () => {
    if (!id) {
      setError('Department ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch department details
      const [departmentResponse, usersResponse, permissionsResponse] = await Promise.all([
        departmentApi.getDepartmentById(id),
        departmentApi.getDepartmentUsers(id, 1, 50),
        departmentApi.getDepartmentPermissions(id)
      ]);

      setDepartment(departmentResponse.data.department);
      setUsers(usersResponse.data.users);
      setPermissions(permissionsResponse.data.permissions);
    } catch (error: any) {
      console.error('Failed to fetch department data:', error);
      setError(error.response?.data?.message || 'Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    if (!id) return;

    try {
      const response = await departmentApi.getAvailablePermissionsForDepartment(id);
      setAvailablePermissions((response.data as any).available_permissions);
    } catch (error) {
      console.error('Failed to fetch available permissions:', error);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'permissions' && id) {
      fetchAvailablePermissions();
    }
  }, [activeTab, id]);

  const handleAddPermission = async (permissionId: string) => {
    if (!id) return;

    try {
      setAddingPermission(permissionId);
      await departmentApi.addDepartmentPermission(id, permissionId);
      
      // Refresh both permissions and available permissions
      await Promise.all([
        fetchDepartmentData(),
        fetchAvailablePermissions()
      ]);
      
      toast.success('Permission added successfully', 'The permission has been assigned to this department.');
    } catch (error: any) {
      console.error('Failed to add permission:', error);
      toast.error('Failed to add permission', error.response?.data?.message || 'Please try again.');
    } finally {
      setAddingPermission(null);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!id) return;

    if (!confirm('Are you sure you want to remove this permission from the department?')) {
      return;
    }

    try {
      setRemovingPermission(permissionId);
      await departmentApi.removeDepartmentPermission(id, permissionId);
      
      // Refresh both permissions and available permissions
      await Promise.all([
        fetchDepartmentData(),
        fetchAvailablePermissions()
      ]);
      
      toast.success('Permission removed successfully', 'The permission has been removed from this department.');
    } catch (error: any) {
      console.error('Failed to remove permission:', error);
      toast.error('Failed to remove permission', error.response?.data?.message || 'Please try again.');
    } finally {
      setRemovingPermission(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return Building2;
      case 'users': return Users;
      case 'permissions': return Shield;
      case 'admin': return Key;
      case 'chat': return Users;
      default: return Shield;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'documents': return 'from-blue-500 to-cyan-500';
      case 'users': return 'from-green-500 to-emerald-500';
      case 'permissions': return 'from-purple-500 to-pink-500';
      case 'admin': return 'from-red-500 to-orange-500';
      case 'chat': return 'from-indigo-500 to-blue-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const filteredAvailablePermissions = availablePermissions.filter(permission =>
    permission.permission_name?.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
    permission.description?.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
    permission.category?.toLowerCase().includes(permissionSearchQuery.toLowerCase())
  );

  const handleDeleteDepartment = async () => {
    if (!id || !department) return;

    if (!confirm(`Are you sure you want to deactivate the ${department.department_name} department?`)) {
      return;
    }

    try {
      await departmentApi.deleteDepartment(id);
      toast.success('Department deactivated successfully', `${department.department_name} has been deactivated.`);
      navigate('/admin/departments');
    } catch (error: any) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to deactivate department', error.response?.data?.message || 'Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <div className="h-8 bg-muted rounded-lg w-48 animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded-lg w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/departments')}
                className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Error Loading Department</h1>
                  <p className="text-lg text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!department) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/departments')}
                className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-75"></div>
                  <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    {department.department_name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Department Details & Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={department.is_active ? 'success' : 'destructive'} size="lg">
                {department.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Link to={`/admin/departments/${department.department_id}/edit`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDeleteDepartment}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Deactivate</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{department.user_count || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{permissions.length}</div>
              <div className="text-sm text-muted-foreground">Permissions</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {new Date(department.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Info */}
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Description</h2>
            </div>
          </div>
          <div className="bg-accent/10 rounded-xl p-6 border border-border/50">
            <p className="text-foreground leading-relaxed">
              {department.description || 'No description provided for this department.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        
        {/* Tab Navigation */}
        <div className="border-b border-border/50 px-8 pt-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'permissions', label: 'Permissions', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-accent/10 rounded-xl p-6 border border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Department Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground font-medium">{department.department_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={department.is_active ? 'success' : 'destructive'}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground">{new Date(department.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="text-foreground">{new Date(department.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-xl p-6 border border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Users:</span>
                      <span className="text-foreground font-medium">{department.user_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users:</span>
                      <span className="text-foreground font-medium">
                        {users.filter(user => user.is_active).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Users:</span>
                      <span className="text-foreground font-medium">
                        {users.filter(user => user.is_ai_user).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Permissions:</span>
                      <span className="text-foreground font-medium">{permissions.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Department Users</h3>
                <Link to="/admin/users/new">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                  </Button>
                </Link>
              </div>
              
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                  <p className="text-muted-foreground">This department doesn't have any users assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center space-x-4 p-4 bg-accent/10 rounded-xl border border-border/50"
                    >
                      <div className="h-12 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {user.first_name} {user.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.is_ai_user ? 'secondary' : 'default'}>
                          {user.is_ai_user ? 'AI' : 'Human'}
                        </Badge>
                        <Badge variant={user.is_active ? 'success' : 'destructive'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Department Permissions</h3>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => setShowAddPermissionModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Permission</span>
                </Button>
              </div>
              
              {permissions.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No permissions assigned</h3>
                  <p className="text-muted-foreground">This department doesn't have any specific permissions assigned.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 flex items-center space-x-2"
                    onClick={() => setShowAddPermissionModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Permission</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission: DepartmentPermissionResponse) => {
                    const CategoryIcon = getCategoryIcon(permission.category || '');
                    const categoryColor = getCategoryColor(permission.category || '');
                    
                    return (
                      <div
                        key={permission.permission_id}
                        className="group relative overflow-hidden rounded-xl bg-accent/10 border border-border/50 p-4 hover:shadow-lg transition-all duration-200"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColor}`}></div>
                        
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColor} flex-shrink-0`}>
                            <CategoryIcon className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-foreground truncate">
                                {permission.permission_name}
                              </h4>
                              <button
                                onClick={() => handleRemovePermission(permission.permission_id)}
                                disabled={removingPermission === permission.permission_id}
                                className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                                title="Remove permission"
                              >
                                {removingPermission === permission.permission_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={permission.category === 'admin' ? 'destructive' : 'default'} size="sm">
                                {permission.category ? 
                                  permission.category.charAt(0).toUpperCase() + permission.category.slice(1) : 
                                  'Uncategorized'
                                }
                              </Badge>
                            </div>
                            
                            {permission.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Permission Modal */}
              {showAddPermissionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="relative bg-background rounded-2xl border border-border/50 max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    
                    {/* Modal Header */}
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Add Permissions</h2>
                            <p className="text-sm text-muted-foreground">
                              Assign permissions to {department?.department_name}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddPermissionModal(false);
                            setPermissionSearchQuery('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="p-6 border-b border-border">
                      <Label htmlFor="search">Search Permissions</Label>
                      <Input
                        id="search"
                        type="text"
                        placeholder="Search by name, description, or category..."
                        value={permissionSearchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissionSearchQuery(e.target.value)}
                        icon={<Search className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>

                    {/* Available Permissions */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                      {filteredAvailablePermissions.length === 0 ? (
                        <div className="text-center py-8">
                          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                          <h3 className="font-medium text-foreground mb-1">No available permissions</h3>
                          <p className="text-sm text-muted-foreground">
                            {permissionSearchQuery ? 'No permissions match your search.' : 'All permissions are already assigned to this department.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredAvailablePermissions.map((permission) => {
                            const CategoryIcon = getCategoryIcon(permission.category || '');
                            const categoryColor = getCategoryColor(permission.category || '');
                            
                            return (
                              <div
                                key={permission.permission_id}
                                className="flex items-center space-x-3 p-3 rounded-xl border border-border hover:bg-accent/20 transition-colors"
                              >
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColor} flex-shrink-0`}>
                                  <CategoryIcon className="h-4 w-4 text-white" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-foreground">{permission.permission_name}</h4>
                                    <Badge variant={permission.category === 'admin' ? 'destructive' : 'default'} size="sm">
                                      {permission.category ? 
                                        permission.category.charAt(0).toUpperCase() + permission.category.slice(1) : 
                                        'Uncategorized'
                                      }
                                    </Badge>
                                  </div>
                                  {permission.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddPermission(permission.permission_id)}
                                  disabled={addingPermission === permission.permission_id}
                                  className="flex items-center space-x-1"
                                >
                                  {addingPermission === permission.permission_id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Plus className="h-3 w-3" />
                                  )}
                                  <span>Add</span>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail; 