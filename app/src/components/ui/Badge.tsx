import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-full font-medium',
      'transition-all duration-200 ease-in-out',
      'border backdrop-blur-sm',
      'hover:scale-105 active:scale-95'
    );

    const variants = {
      default: cn(
        'bg-primary/10 text-primary border-primary/20',
        'hover:bg-primary/20 hover:border-primary/30',
        'shadow-sm shadow-primary/10'
      ),
      secondary: cn(
        'bg-secondary/50 text-secondary-foreground border-border/50',
        'hover:bg-secondary/70 hover:border-border/70',
        'backdrop-blur-sm'
      ),
      destructive: cn(
        'bg-destructive/10 text-destructive border-destructive/20',
        'hover:bg-destructive/20 hover:border-destructive/30',
        'shadow-sm shadow-destructive/10'
      ),
      outline: cn(
        'bg-background/50 text-foreground border-border',
        'hover:bg-accent/50 hover:text-accent-foreground',
        'backdrop-blur-sm'
      ),
      success: cn(
        'bg-green-500/10 text-green-600 border-green-500/20',
        'hover:bg-green-500/20 hover:border-green-500/30',
        'shadow-sm shadow-green-500/10',
        'dark:text-green-400 dark:border-green-400/20'
      ),
      warning: cn(
        'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'hover:bg-yellow-500/20 hover:border-yellow-500/30',
        'shadow-sm shadow-yellow-500/10',
        'dark:text-yellow-400 dark:border-yellow-400/20'
      ),
      gradient: cn(
        'bg-gradient-to-r from-primary via-purple-500 to-pink-500',
        'text-white border-white/20',
        'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
      )
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs h-5',
      md: 'px-2.5 py-1 text-xs h-6',
      lg: 'px-3 py-1.5 text-sm h-7'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge'; 