import { cn } from '~/lib/utils';

const badgeVariants = {
  gray: 'bg-gray-100 text-gray-600',
  orange: 'bg-orange-50 text-orange-600 border border-orange-200',
  green: 'bg-green-50 text-green-600 border border-green-200',
  red: 'bg-red-50 text-red-600 border border-red-200',
  blue: 'bg-blue-50 text-blue-600 border border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border border-purple-200',
  dark: 'bg-[#0d0c22] text-white',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  );
}
