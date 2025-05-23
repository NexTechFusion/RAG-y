import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { userApi, departmentApi } from '../../../lib/adminApi';
import type { CreateUserRequest, Department } from '../../../types/admin';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, Label } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const createUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(2, 'Password must be at least 6 characters'),
  department_id: z.string().min(1, 'Department is required'),
  is_ai_user: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const CreateUserForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      department_id: '',
      is_ai_user: false,
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getDepartments(1, 100);
        setDepartments(response.data.departments?.filter((dept: Department) => dept.is_active));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const onSubmit = handleSubmit(async (data: CreateUserFormData) => {
    try {
      await userApi.createUser(data as CreateUserRequest);
      toast.success('User created successfully', 'The new user has been added to the system.');
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error('Creation failed', message);
    }
  });

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
          <h1 className="text-2xl font-semibold text-foreground">Create User</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the details for the new user</CardDescription>
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

            {/* Password */}
            <div>
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  placeholder="Enter password"
                  error={!!errors.password}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 px-3 py-0 h-full rounded-l-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
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

            {/* User Type */}
            <div className="flex items-center space-x-2">
              <input
                id="is_ai_user"
                type="checkbox"
                {...register('is_ai_user')}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <Label htmlFor="is_ai_user" className="!mb-0">AI User</Label>
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
                <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserForm; 