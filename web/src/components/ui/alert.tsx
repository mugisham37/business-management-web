/**
 * Alert UI Component
 * Alert and notification component
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'bg-background text-foreground': variant === 'default',
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  );
}