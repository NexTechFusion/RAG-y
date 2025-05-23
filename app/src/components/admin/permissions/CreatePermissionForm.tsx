import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { permissionApi } from '../../../lib/adminApi';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, Label, Textarea } from '../../ui';
import { useToast } from '../../../hooks/useToast';

const createPermissionSchema = z.object({
  permission_name: z.string()
    .min(1, 'Permission name is required')
    .max(100, 'Permission name must be less than 100 characters')
    .regex(/^[a-z_]+$/, 'Permission name must contain only lowercase letters and underscores'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
});

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;

const CreatePermissionForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      permission_name: '',
      description: '',
      category: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await permissionApi.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = handleSubmit(async (data: CreatePermissionFormData) => {
    try {
      await permissionApi.createPermission(data);
      toast.success('Permission created successfully', 'The new permission has been added to the system.');
      navigate('/admin/permissions');
    } catch (error: any) {
      console.error('Failed to create permission:', error);
      const message = error.response?.data?.message || 'Failed to create permission';
      toast.error('Creation failed', message);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/permissions')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create Permission</h1>
                <p className="text-lg text-muted-foreground">Add a new system permission</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Information</CardTitle>
          <CardDescription>Define the details for the new permission</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Permission Name */}
            <div>
              <Label htmlFor="permission_name" required>Permission Name</Label>
              <Input
                type="text"
                id="permission_name"
                {...register('permission_name')}
                placeholder="e.g., view_documents, create_users"
                error={!!errors.permission_name}
              />
              {errors.permission_name && (
                <p className="mt-1 text-sm text-destructive">{errors.permission_name.message}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Use lowercase letters and underscores only. This will be used internally by the system.
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" required>Category</Label>
              <Select
                id="category"
                {...register('category')}
                error={!!errors.category}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
                <option value="documents">Documents</option>
                <option value="users">Users</option>
                <option value="permissions">Permissions</option>
                <option value="admin">Admin</option>
                <option value="chat">Chat</option>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Group related permissions together for better organization.
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what this permission allows users to do..."
                rows={3}
                error={!!errors.description}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Provide a clear description of what this permission grants access to.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/permissions')}
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
                <span>{isSubmitting ? 'Creating...' : 'Create Permission'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePermissionForm; 