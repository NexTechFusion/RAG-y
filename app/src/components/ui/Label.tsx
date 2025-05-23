import React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium leading-none mb-2',
        'text-foreground/90',
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-destructive text-xs">*</span>
      )}
    </label>
  )
);

Label.displayName = 'Label'; 