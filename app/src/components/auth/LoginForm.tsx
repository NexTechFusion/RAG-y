import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../../lib/validations';
import { ThemeToggle } from '../ThemeToggle';

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError('');
      await login(data);
      
      // Navigate to admin panel if admin user, otherwise dashboard
      if (data.email === 'admin@example.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setApiError(message);
    }
  };

  const useAdminCredentials = () => {
    setValue('email', 'admin@example.com');
    setValue('password', 'Admin123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle variant="default" />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient">
            Welcome to RAG-Y
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Admin Credentials Info */}
        <div className="alert alert-info">
          <div className="flex">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                Admin Access
              </h3>
              <div className="mt-2 text-sm">
                <p>Use these credentials to access the admin panel:</p>
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                  Email: admin@example.com<br />
                  Password: Admin123!
                </div>
                <button
                  type="button"
                  onClick={useAdminCredentials}
                  className="mt-2 text-xs text-primary hover:text-primary/80 underline"
                >
                  Click to fill admin credentials
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="alert alert-error">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-error-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">
                        {apiError}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      className={`input pl-10 ${
                        errors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="form-message mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`input pl-10 pr-10 ${
                        errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-message mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="btn btn-primary btn-md w-full"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 