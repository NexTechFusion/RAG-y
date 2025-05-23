import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl px-4 py-3 text-sm',
          'bg-background/60 backdrop-blur-sm border border-border/50',
          'text-foreground',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-1',
          'focus:border-ring/50 focus:bg-background/80',
          'hover:border-border/80 hover:bg-background/70',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'shadow-sm hover:shadow-md focus:shadow-md',
          'appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-10',
          'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]',
          error && 'border-destructive/50 focus:ring-destructive/30 focus:border-destructive/50',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select'; 