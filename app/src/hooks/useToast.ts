import { useToast as useToastContext } from '../components/ui/Toast';
import type { Toast, ToastVariant } from '../components/ui/Toast';

export const useToast = () => {
  const { addToast, dismissToast, dismissAll, toasts } = useToastContext();

  const showToast = (
    variant: ToastVariant,
    title: string,
    description?: string,
    options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>
  ) => {
    return addToast({
      variant,
      title,
      description,
      ...options,
    });
  };

  return {
    toast: {
      success: (title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>) =>
        showToast('success', title, description, options),
      
      error: (title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>) =>
        showToast('error', title, description, options),
      
      warning: (title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>) =>
        showToast('warning', title, description, options),
      
      info: (title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>) =>
        showToast('info', title, description, options),
      
      default: (title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'title' | 'description'>>) =>
        showToast('default', title, description, options),
    },
    dismiss: dismissToast,
    dismissAll,
    toasts,
  };
}; 