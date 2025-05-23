import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-card/80 backdrop-blur-sm border border-border/50',
        'shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10',
        'transition-all duration-300 ease-in-out',
        'hover:border-border/80',
        className
      )} 
      {...props} 
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'flex flex-col space-y-2 p-6 pb-4',
        'relative',
        className
      )} 
      {...props} 
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 
      ref={ref} 
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight text-foreground',
        'bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text',
        className
      )} 
      {...props} 
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        'text-sm text-muted-foreground leading-relaxed',
        className
      )} 
      {...props} 
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props} 
    />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'flex items-center p-6 pt-0 mt-auto',
        'border-t border-border/30 bg-muted/20',
        className
      )} 
      {...props} 
    />
  )
);
CardFooter.displayName = 'CardFooter'; 