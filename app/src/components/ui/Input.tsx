import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, error, ...props }, ref) => {
    const baseClasses = cn(
      'flex h-11 w-full rounded-xl px-4 py-3 text-sm',
      'bg-background/60 backdrop-blur-sm border border-border/50',
      'text-foreground placeholder:text-muted-foreground',
      'transition-all duration-200 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1',
      'focus-visible:border-ring/50 focus-visible:bg-background/80',
      'hover:border-border/80 hover:bg-background/70',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'shadow-sm hover:shadow-md focus-visible:shadow-md',
      error && 'border-destructive/50 focus-visible:ring-destructive/30 focus-visible:border-destructive/50'
    );

    if (icon) {
      return (
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="text-muted-foreground group-focus-within:text-ring/70 transition-colors duration-200">
              {icon}
            </div>
          </div>
          <input
            type={type}
            className={cn(baseClasses, 'pl-12', className)}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(baseClasses, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input'; 