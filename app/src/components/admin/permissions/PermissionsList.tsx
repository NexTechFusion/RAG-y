import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Key,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  ShieldX,
  Grid3X3,
  List,
  Tag
} from 'lucide-react';
import { permissionApi } from '../../../lib/adminApi';
import type { Permission } from '../../../types/admin';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const PermissionsList = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;

      const response = await permissionApi.getPermissions(filters);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      toast.error('Failed to load permissions', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await permissionApi.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter permissions locally by search query
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to deactivate this permission?')) {
      return;
    }

    try {
      await permissionApi.deletePermission(permissionId);
      fetchPermissions(); // Refresh the list
      toast.success('Permission deactivated successfully');
    } catch (error) {
      console.error('Failed to delete permission:', error);
      toast.error('Failed to deactivate permission', 'Please try again later.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  // Filter permissions by search query
  const filteredPermissions = permissions.filter(permission =>
    permission.permission_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return Building2;
      case 'users': return Users;
      case 'permissions': return Shield;
      case 'admin': return Key;
      case 'chat': return Users;
      default: return Tag;
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

  if (loading && permissions?.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Permissions</h1>
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
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Permissions
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage system permissions and access controls
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
              <Link to="/admin/permissions/new">
                <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Permission</span>
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label>Search Permissions</Label>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  icon={<Search className="h-5 w-5 text-muted-foreground" />}
                />
              </div>

              {/* Category Filter */}
              <div>
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{filteredPermissions.length} permissions found</span>
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

      {/* Permissions Display */}
      {filteredPermissions?.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-12">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-accent/20 rounded-full blur"></div>
              <div className="relative h-24 w-24 mx-auto bg-gradient-to-r from-muted to-accent rounded-full flex items-center justify-center">
                <ShieldX className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No permissions found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your filters or create a new permission to get started.
            </p>
            <Link to="/admin/permissions/new">
              <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Permission</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPermissions?.map((permission, index) => {
            const CategoryIcon = getCategoryIcon(permission.category || '');
            const categoryColor = getCategoryColor(permission.category || '');
            
            return (
              <div
                key={permission.permission_id}
                className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColor}`}></div>
                
                {/* Permission Icon & Status */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className={`h-16 w-16 bg-gradient-to-r ${categoryColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <CategoryIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${permission.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full flex items-center justify-center`}>
                      {permission.is_active ? (
                        <ShieldCheck className="h-3 w-3 text-white" />
                      ) : (
                        <ShieldX className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {permission.permission_name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Key className="h-3 w-3 mr-1" />
                      <span className="truncate">{permission.category}</span>
                    </div>
                  </div>
                </div>

                {/* Permission Details */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {permission.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={permission.category === 'admin' ? 'destructive' : 'default'}>
                      {permission.category ? permission.category.charAt(0).toUpperCase() + permission.category.slice(1) : 'Uncategorized'}
                    </Badge>
                    <Badge variant={permission.is_active ? 'success' : 'destructive'}>
                      {permission.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created: {new Date(permission.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/permissions/${permission.permission_id}/edit`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeletePermission(permission.permission_id)}
                    className="flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Deactivate permission"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredPermissions?.map((permission, index) => {
                const CategoryIcon = getCategoryIcon(permission.category || '');
                const categoryColor = getCategoryColor(permission.category || '');
                
                return (
                  <div
                    key={permission.permission_id}
                    className="flex items-center space-x-6 p-4 rounded-xl hover:bg-accent/30 transition-colors group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="relative">
                      <div className={`h-12 w-12 bg-gradient-to-r ${categoryColor} rounded-xl flex items-center justify-center`}>
                        <CategoryIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${permission.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-foreground">
                          {permission.permission_name}
                        </h3>
                        <Badge variant={permission.category === 'admin' ? 'destructive' : 'default'} size="sm">
                          {permission.category ? permission.category.charAt(0).toUpperCase() + permission.category.slice(1) : 'Uncategorized'}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-4">{permission.description || 'No description'}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(permission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={permission.is_active ? 'success' : 'destructive'} size="sm">
                        {permission.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Link
                        to={`/admin/permissions/${permission.permission_id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePermission(permission.permission_id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsList; 