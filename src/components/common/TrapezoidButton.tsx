import React from 'react';
import { Link } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Assuming you have a cn utility

const trapezoidButtonVariants = cva(
  'inline-flex items-center justify-center relative group text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-spice-600 text-white hover:bg-spice-700',
        secondary: 'bg-sand-700 text-white hover:bg-sand-800',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 py-2 px-6',
        sm: 'h-9 px-4',
        lg: 'h-11 px-10',
      },
      skew: {
        left: '[clip-path:polygon(20%_0%,_100%_0%,_80%_100%,_0%_100%)]',
        right: '[clip-path:polygon(0%_0%,_80%_0%,_100%_100%,_20%_100%)]',
        none: '' // For a more regular button shape but with the same style
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      skew: 'left',
    },
  }
);

export interface TrapezoidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof trapezoidButtonVariants> {
  to?: string;
  icon?: React.ReactNode;
}

const TrapezoidButton = React.forwardRef<HTMLButtonElement, TrapezoidButtonProps>(
  ({ className, children, variant, size, skew, to, icon, ...props }, ref) => {
    const Comp = to ? Link : 'button';
    // Adjust padding if skewed to prevent text cutoff, especially for 'skew-right'
    const dynamicPadding = skew === 'right' ? 'pr-8 pl-6' : skew === 'left' ? 'pl-8 pr-6' : '';

    return (
      <Comp
        className={cn(trapezoidButtonVariants({ variant, size, skew }), dynamicPadding, className)}
        ref={ref as any} // Type assertion for Link component
        to={to as any} // Type assertion for Link component
        {...props}
      >
        {icon && <span className={cn("mr-2 h-4 w-4", skew === 'right' ? "ml-2" : skew === 'left' ? "mr-2": "")}>{icon}</span>}
        <span className={cn(skew !== 'none' ? "block" : "")}>{children}</span>
      </Comp>
    );
  }
);
TrapezoidButton.displayName = 'TrapezoidButton';

export default TrapezoidButton; 