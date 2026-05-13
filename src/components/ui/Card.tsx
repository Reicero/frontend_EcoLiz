import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  hoverable?: boolean;
  children: React.ReactNode;
}
const variantStyles = {
  default: 'bg-white border border-brand-100 shadow-sm',
  bordered: 'bg-white border border-brand-200',
  elevated: 'bg-white border border-brand-100 shadow-lg shadow-brand-900/5'
};
export function Card({
  variant = 'default',
  hoverable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const classes = [
  'rounded-2xl p-6',
  variantStyles[variant],
  hoverable ?
  'transition-all hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5' :
  '',
  className].
  join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>);

}