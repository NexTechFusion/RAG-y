import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { userApi, departmentApi } from '../../../lib/adminApi';
import type { UpdateUserRequest, Department } from '../../../types/admin';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const updateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  department_id: z.string().min(1, 'Department is required'),
  is_active: z.boolean(),
  is_ai_user: z.boolean(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const EditUserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      department_id: '',
      is_active: true,
      is_ai_user: false,
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getDepartments(1, 100);
        setDepartments(response.data.departments.filter(dept => dept.is_active));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await userApi.getUserById(id);
          const user = response.data.user;

          setValue('first_name', user.first_name);
          setValue('last_name', user.last_name);
          setValue('email', user.email);
          setValue('department_id', user.department_id);
          setValue('is_ai_user', user.is_ai_user);
          setValue('is_active', user.is_active);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          toast.error('Failed to load user data', 'Unable to retrieve user information.');
          navigate('/admin/users');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, setValue]);

  const onSubmit = handleSubmit(async (data: UpdateUserFormData) => {
    try {
      if (!id) return;
      await userApi.updateUser(id, data as UpdateUserRequest);
      toast.success('User updated successfully', 'The user information has been updated.');
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error('Update failed', message);
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/users')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Edit User</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/users')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit User</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update user information and settings</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update the user details and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <Label htmlFor="first_name" required>First Name</Label>
                <Input
                  type="text"
                  id="first_name"
                  {...register('first_name')}
                  placeholder="Enter first name"
                  error={!!errors.first_name}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="last_name" required>Last Name</Label>
                <Input
                  type="text"
                  id="last_name"
                  {...register('last_name')}
                  placeholder="Enter last name"
                  error={!!errors.last_name}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" required>Email Address</Label>
              <Input
                type="email"
                id="email"
                {...register('email')}
                placeholder="Enter email address"
                error={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department_id" required>Department</Label>
              <Select
                id="department_id"
                {...register('department_id')}
                error={!!errors.department_id}
              >
                <option value="">Select a department</option>
                {departments?.map((department) => (
                  <option key={department.department_id} value={department.department_id}>
                    {department.department_name}
                  </option>
                ))}
              </Select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-destructive">{errors.department_id.message}</p>
              )}
            </div>

            {/* User Type and Status */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="is_ai_user"
                  type="checkbox"
                  {...register('is_ai_user')}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <Label htmlFor="is_ai_user" className="!mb-0">AI User</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <Label htmlFor="is_active" className="!mb-0">Active User</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Updating...' : 'Update User'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserForm; 