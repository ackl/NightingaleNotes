import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps, cx } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm',
    'font-medium transition-colors focus-visible:outline-none',
    'border border-slate-600',
    'text-white',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden transition-all duration-200',
    'shadow-sm hover:shadow-md',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-slate-900 hover:bg-slate-800',
        destructive: 'bg-red-400 hover:bg-red-300',
        outline: 'border-slate-300 bg-transparent hover:bg-slate-100 hover:text-slate-900',
        secondary: 'bg-slate-400 text-slate-900 hover:bg-slate-500',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        selected: 'bg-slate-900 hover:bg-slate-800 ring-2 ring-teal-600',
      },
      size: {
        default: 'h-10 px-4 py-2 min-w-[60px]',
        sm: 'h-9 px-3 min-w-[40px]',
        lg: 'h-11 px-8',
        on: 'h-10 w-10',
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const BaseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className, variant, size, asChild = false, loading = false, disabled, children, ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cx(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
BaseButton.displayName = 'Button';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className, variant = 'default', size = 'default', ...props
  }, ref) => (
    <BaseButton
      ref={ref}
      variant={variant}
      size={size}
      className={cx(
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'NightingaleButton';

export { Button };
