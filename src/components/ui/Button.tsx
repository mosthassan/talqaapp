'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 font-bold',
        gold: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 font-bold',
        network: 'bg-[#0284C7] text-white hover:bg-[#0369A1] font-semibold shadow-sm',
        ink: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 font-bold',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        signal: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 font-semibold',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      fullWidth = false,
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(6);
        } catch {
          // ignore
        }
      }
      onClick?.(e);
    };

    if (asChild) {
      return (
        <Slot
          ref={ref as unknown as React.Ref<HTMLElement>}
          className={cn(
            buttonVariants({ variant, size }),
            fullWidth && 'w-full',
            className
          )}
          onClick={onClick}
          {...(disabled ? { 'aria-disabled': true } : {})}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </span>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
