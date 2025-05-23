import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  FileText,
  Grid3X3,
  List,
  Sparkles
} from 'lucide-react';
import { departmentApi } from '../../../lib/adminApi';
import type { Department } from '../../../types/admin';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 12;

  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      
      const response = await departmentApi.getDepartments(currentPage, limit);
      let filteredDepartments = response.data.departments;

      // Client-side search filtering since the API doesn't support search
      if (searchQuery) {
        filteredDepartments = filteredDepartments?.filter(dept =>
          dept.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setDepartments(filteredDepartments);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDepartments();
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to deactivate this department?')) {
      return;
    }

    try {
      await departmentApi.deleteDepartment(departmentId);
      fetchDepartments(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to deactivate department', 'Please try again later.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading && departments?.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Departments</h1>
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Departments
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage organizational departments and their permissions
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
              <Link to="/admin/departments/new">
                <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Department</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Search & Filter</h2>
              <p className="text-sm text-muted-foreground">Find departments by name or description</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Search */}
              <div className="lg:col-span-1">
                <Label>Search Departments</Label>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  icon={<Search className="h-5 w-5 text-muted-foreground" />}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{departments?.length} departments found</span>
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

      {/* Departments Display */}
      {departments?.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-12">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-accent/20 rounded-full blur"></div>
              <div className="relative h-24 w-24 mx-auto bg-gradient-to-r from-muted to-accent rounded-full flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No departments found</h3>
            <p className="text-muted-foreground mb-8">
              Get started by creating a new department or adjust your search.
            </p>
            <Link to="/admin/departments/new">
              <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>New Department</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments?.map((department, index) => (
            <div
              key={department.department_id}
              className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              
              {/* Department Icon & Status */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${department.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full flex items-center justify-center`}>
                    <div className={`w-2 h-2 ${department.is_active ? 'bg-white' : 'bg-white'} rounded-full`}></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">
                    {department.department_name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{department.user_count || 0} users</span>
                  </div>
                </div>
              </div>

              {/* Department Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start text-sm">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-foreground line-clamp-2">
                    {department.description || 'No description available'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={department.is_active ? 'success' : 'destructive'}>
                    {department.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(department.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Link
                  to={`/admin/departments/${department.department_id}`}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-200"
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  View
                </Link>
                <Link
                  to={`/admin/departments/${department.department_id}/edit`}
                  className="flex items-center justify-center p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                  title="Edit department"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteDepartment(department.department_id)}
                  className="flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Deactivate department"
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <div className="p-6">
            <div className="space-y-4">
              {departments?.map((department, index) => (
                <div
                  key={department.department_id}
                  className="flex items-center space-x-6 p-4 rounded-xl hover:bg-accent/30 transition-colors group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${department.is_active ? 'bg-green-500' : 'bg-red-500'} border-2 border-background rounded-full`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {department.department_name}
                      </h3>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-3 w-3 mr-1" />
                      <span className="mr-4 truncate">
                        {department.description || 'No description available'}
                      </span>
                      <Users className="h-3 w-3 mr-1" />
                      <span>{department.user_count || 0} users</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge variant={department.is_active ? 'success' : 'destructive'}>
                      {department.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(department.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/departments/${department.department_id}`}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Building2 className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/departments/${department.department_id}/edit`}
                        className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="Edit department"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDepartment(department.department_id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Deactivate department"
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
            {Math.min(currentPage * limit, total)} of {total} departments
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

export default DepartmentsList; 