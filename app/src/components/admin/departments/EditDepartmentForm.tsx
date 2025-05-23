import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Building2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { departmentApi } from '../../../lib/adminApi';
import type { UpdateDepartmentRequest, Department } from '../../../types/admin';
import { Button, Input, Label, Badge } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const updateDepartmentSchema = z.object({
  department_name: z.string().min(1, 'Department name is required').max(100, 'Department name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  is_active: z.boolean(),
});

type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;

const EditDepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDepartmentFormData>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      department_name: '',
      description: '',
      is_active: true,
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!id) {
        setError('Department ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await departmentApi.getDepartmentById(id);
        const departmentData = response.data.department;
        
        setDepartment(departmentData);
        reset({
          department_name: departmentData.department_name,
          description: departmentData.description || '',
          is_active: departmentData.is_active,
        });
      } catch (error: any) {
        console.error('Failed to fetch department:', error);
        setError(error.response?.data?.message || 'Failed to load department data');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id, reset]);

  const onSubmit = handleSubmit(async (data: UpdateDepartmentFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await departmentApi.updateDepartment(id, data as UpdateDepartmentRequest);
      toast.success('Department updated successfully', 'The department information has been updated.');
      navigate('/admin/departments');
    } catch (error: any) {
      console.error('Failed to update department:', error);
      const message = error.response?.data?.message || 'Failed to update department';
      toast.error('Update failed', message);
    } finally {
      setIsSubmitting(false);
    }
  });

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground">
                  Edit Department
                </h1>
                <p className="text-lg text-muted-foreground">
                  Update {department?.department_name} information
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={department?.is_active ? 'success' : 'destructive'} size="lg">
                  {department?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Department Information</h2>
              <p className="text-muted-foreground">Update the department details</p>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Department Name */}
            <div className="space-y-2">
              <Label htmlFor="department_name" required className="text-base font-medium">
                Department Name
              </Label>
              <Input
                type="text"
                id="department_name"
                {...register('department_name')}
                placeholder="e.g., Human Resources, Engineering, Marketing"
                error={!!errors.department_name}
                className="text-base"
              />
              {errors.department_name && (
                <p className="text-sm text-destructive flex items-center mt-2">
                  <span className="w-1 h-1 rounded-full bg-destructive mr-2"></span>
                  {errors.department_name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description
                <span className="text-sm text-muted-foreground font-normal ml-2">(Optional)</span>
              </Label>
              <div className="relative">
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Provide a brief description of this department's role and responsibilities..."
                  rows={4}
                  className={`
                    w-full px-4 py-3 text-base bg-background border rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder:text-muted-foreground
                    resize-none
                    ${errors.description ? 'border-destructive focus:ring-destructive focus:border-destructive' : 'border-border'}
                  `}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  Max 500 characters
                </div>
              </div>
              {errors.description && (
                <p className="text-sm text-destructive flex items-center mt-2">
                  <span className="w-1 h-1 rounded-full bg-destructive mr-2"></span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Department Status
              </Label>
              <div className="flex items-center space-x-3 p-4 bg-accent/20 rounded-xl border border-border">
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  className="h-5 w-5 text-primary focus:ring-primary border-border rounded"
                />
                <div className="flex-1">
                  <Label htmlFor="is_active" className="!mb-0 text-base font-medium">
                    Active Department
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive departments cannot have new users assigned
                  </p>
                </div>
              </div>
            </div>

            {/* Department Stats */}
            {department && (
              <div className="bg-accent/10 rounded-xl p-6 border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4">Department Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{department.user_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {new Date(department.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Date(department.updated_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/departments')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
                className="flex items-center space-x-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Department</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDepartmentForm; 