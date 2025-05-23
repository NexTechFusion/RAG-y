import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-xl px-4 py-3 text-sm resize-none',
          'bg-background/60 backdrop-blur-sm border border-border/50',
          'text-foreground placeholder:text-muted-foreground',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1',
          'focus-visible:border-ring/50 focus-visible:bg-background/80',
          'hover:border-border/80 hover:bg-background/70',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'shadow-sm hover:shadow-md focus-visible:shadow-md',
          error && 'border-destructive/50 focus-visible:ring-destructive/30 focus-visible:border-destructive/50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea'; 