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
  Plus
} from 'lucide-react';
import { departmentApi } from '../../../lib/adminApi';
import type { Department, AdminUser, DepartmentPermission } from '../../../types/admin';
import { Button, Badge } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const DepartmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<DepartmentPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'permissions'>('overview');
  const { toast } = useToast();

  useEffect(() => {
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

    fetchDepartmentData();
  }, [id]);

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
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Permission</span>
                </Button>
              </div>
              
              {permissions.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No permissions assigned</h3>
                  <p className="text-muted-foreground">This department doesn't have any specific permissions assigned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-4 bg-accent/10 rounded-xl border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{permission.permission.name}</h4>
                        <Badge variant="outline">Permission</Badge>
                      </div>
                      {permission.permission.description && (
                        <p className="text-sm text-muted-foreground">
                          {permission.permission.description}
                        </p>
                      )}
                    </div>
                  ))}
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