import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    
    const baseClasses = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium',
      'transition-all duration-200 ease-in-out transform',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'active:scale-[0.98] hover:scale-[1.02]',
      'shadow-sm hover:shadow-md'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-primary to-primary/90',
        'text-primary-foreground shadow-primary/20',
        'hover:shadow-primary/30 hover:shadow-lg',
        'border border-primary/20'
      ),
      secondary: cn(
        'bg-gradient-to-r from-secondary to-secondary/90',
        'text-secondary-foreground border border-border/50',
        'hover:bg-secondary/80 hover:border-border/80',
        'backdrop-blur-sm'
      ),
      outline: cn(
        'border-2 border-border/50 bg-background/80 backdrop-blur-sm',
        'text-foreground hover:bg-accent/50 hover:text-accent-foreground',
        'hover:border-border/80 hover:shadow-md'
      ),
      ghost: cn(
        'text-foreground hover:bg-accent/30 hover:text-accent-foreground',
        'hover:backdrop-blur-sm'
      ),
      destructive: cn(
        'bg-gradient-to-r from-destructive to-destructive/90',
        'text-destructive-foreground shadow-destructive/20',
        'hover:shadow-destructive/30 hover:shadow-lg',
        'border border-destructive/20'
      ),
      gradient: cn(
        'bg-gradient-to-r from-primary via-purple-500 to-pink-500',
        'text-white shadow-lg shadow-primary/30',
        'hover:shadow-xl hover:shadow-primary/40',
        'border border-white/20'
      )
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-base'
    };
    
    return (
      <Comp
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button'; 