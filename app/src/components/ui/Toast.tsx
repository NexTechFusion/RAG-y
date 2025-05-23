import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
  toast: Toast;
  onDismiss: (id: string) => void;
}

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component
export const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onDismiss, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
      // Enter animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    }, [toast.duration]);

    const handleDismiss = useCallback(() => {
      setIsLeaving(true);
      setTimeout(() => {
        onDismiss(toast.id);
        toast.onDismiss?.();
      }, 150);
    }, [toast.id, onDismiss, toast.onDismiss]);

    const variants = {
      default: 'bg-background border-border text-foreground',
      success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
      error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
      info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    };

    const icons = {
      default: null,
      success: (
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto w-full max-w-sm rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out',
          'transform-gpu translate-x-0 translate-y-0',
          variants[toast.variant || 'default'],
          isVisible && !isLeaving 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95',
          isLeaving && 'translate-x-full opacity-0 scale-95',
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {icons[toast.variant || 'default'] && (
              <div className="flex-shrink-0">
                {icons[toast.variant || 'default']}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-semibold mb-1 leading-tight">
                  {toast.title}
                </h4>
              )}
              {toast.description && (
                <p className="text-sm opacity-90 leading-relaxed">
                  {toast.description}
                </p>
              )}
              {toast.action && (
                <div className="mt-3">
                  {toast.action}
                </div>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-1"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ToastComponent.displayName = 'Toast';

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

// Helper function for easy toast creation
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => {
    // This will be implemented with the hook context
    console.warn('toast.success called outside of ToastProvider context');
  },
  error: (title: string, description?: string, options?: Partial<Toast>) => {
    console.warn('toast.error called outside of ToastProvider context');
  },
  warning: (title: string, description?: string, options?: Partial<Toast>) => {
    console.warn('toast.warning called outside of ToastProvider context');
  },
  info: (title: string, description?: string, options?: Partial<Toast>) => {
    console.warn('toast.info called outside of ToastProvider context');
  },
  default: (title: string, description?: string, options?: Partial<Toast>) => {
    console.warn('toast.default called outside of ToastProvider context');
  },
}; 