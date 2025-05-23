import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { userApi, departmentApi } from '../../../lib/adminApi';
import type { UpdateUserRequest, Department } from '../../../types/admin';
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
  }, [id, setValue, navigate, toast]);

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
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
          <p className="mt-1 text-sm text-gray-600">Update user information and settings</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                {...register('first_name')}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.first_name ? 'border-red-300' : ''
                }`}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                {...register('last_name')}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.last_name ? 'border-red-300' : ''
                }`}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.email ? 'border-red-300' : ''
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
              Department *
            </label>
            <select
              id="department_id"
              {...register('department_id')}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.department_id ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select a department</option>
              {departments?.map((department) => (
                <option key={department.department_id} value={department.department_id}>
                  {department.department_name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
            )}
          </div>

          {/* User Type and Status */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="is_ai_user"
                type="checkbox"
                {...register('is_ai_user')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_ai_user" className="ml-2 block text-sm text-gray-900">
                AI User
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                {...register('is_active')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active User
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm; 