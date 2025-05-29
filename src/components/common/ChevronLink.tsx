import React from 'react';
import { Link } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Assuming you have a cn utility
import { ChevronRight } from 'lucide-react'; // Or your preferred icon library

const chevronLinkVariants = cva(
  'inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative',
  {
    variants: {
      variant: {
        primary: 'text-spice-600 hover:text-spice-700',
        secondary: 'text-sand-700 hover:text-sand-800',
        ghost: 'text-night-600 hover:text-night-700',
      },
      size: {
        default: 'text-base h-10 py-2',
        sm: 'text-sm h-9 py-1.5',
        lg: 'text-lg h-11 py-2.5',
      },
      direction: {
        left: 'flex-row-reverse',
        right: 'flex-row'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      direction: 'right'
    },
  }
);

// Define the shape of the chevron using clip-path
// This is a conceptual example. Fine-tuning the clip-path will be needed for the desired aesthetic.
const chevronShapeBase = "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)";
const chevronShapeLeft = "polygon(20px 0%, 100% 0%, 100% 100%, 20px 100%, 0% 50%)";

export interface ChevronLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof chevronLinkVariants> {
  to: string;
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  applyChevronShape?: boolean; // New prop to toggle chevron shape
}

const ChevronLink = React.forwardRef<HTMLAnchorElement, ChevronLinkProps>(
  ({ className, children, variant, size, direction, to, icon, iconSide = 'right', applyChevronShape = true, ...props }, ref) => {
    
    const shapeStyle = applyChevronShape ? {
      clipPath: direction === 'left' ? chevronShapeLeft : chevronShapeBase,
      paddingRight: direction === 'right' && applyChevronShape ? '30px' : undefined, // Extra padding for the pointy end
      paddingLeft: direction === 'left' && applyChevronShape ? '30px' : undefined,
    } : {};

    const iconElement = icon || <ChevronRight size={size ==='sm' ? 16 : size === 'lg' ? 22 : 20} />;

    return (
      <Link
        to={to}
        className={cn(chevronLinkVariants({ variant, size, direction }), className)}
        style={shapeStyle}
        ref={ref}
        {...props}
      >
        {direction === 'left' && iconSide === 'left' && <span className={cn("mr-2", applyChevronShape && 'ml-1')}>{iconElement}</span>}
        {children}
        {direction === 'right' && iconSide === 'right' && <span className={cn("ml-2", applyChevronShape && 'mr-1')}>{iconElement}</span>}
      </Link>
    );
  }
);
ChevronLink.displayName = 'ChevronLink';

export default ChevronLink; 