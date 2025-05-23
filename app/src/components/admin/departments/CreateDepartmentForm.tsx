import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Building2, Sparkles } from 'lucide-react';
import { departmentApi } from '../../../lib/adminApi';
import type { CreateDepartmentRequest } from '../../../types/admin';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const createDepartmentSchema = z.object({
  department_name: z.string().min(1, 'Department name is required').max(100, 'Department name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

const CreateDepartmentForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      department_name: '',
      description: '',
    },
  });

  const onSubmit = handleSubmit(async (data: CreateDepartmentFormData) => {
    try {
      setIsSubmitting(true);
      await departmentApi.createDepartment(data as CreateDepartmentRequest);
      toast.success('Department created successfully', 'The new department has been added to your organization.');
      navigate('/admin/departments');
    } catch (error: any) {
      console.error('Failed to create department:', error);
      const message = error.response?.data?.message || 'Failed to create department';
      toast.error('Creation failed', message);
    } finally {
      setIsSubmitting(false);
    }
  });

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
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Create Department
                </h1>
                <p className="text-lg text-muted-foreground">
                  Add a new department to your organization
                </p>
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
              <p className="text-muted-foreground">Enter the details for the new department</p>
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Department</span>
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

export default CreateDepartmentForm; 