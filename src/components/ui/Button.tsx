import React from 'react';
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: 'button' | 'a';
  href?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}
const variantStyles: Record<ButtonVariant, string> = {
  primary:
  'bg-brand-700 hover:bg-brand-800 text-white shadow-lg shadow-brand-900/20',
  secondary:
  'bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 hover:border-brand-300',
  ghost: 'bg-transparent hover:bg-brand-50 text-brand-900',
  link: 'bg-transparent text-brand-900 border-b-2 border-transparent hover:border-accent-500 rounded-none px-0'
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-4 text-base'
};
export function Button({
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all',
  variantStyles[variant],
  variant !== 'link' ? sizeStyles[size] : 'py-4',
  fullWidth ? 'w-full' : '',
  className].
  join(' ');
  if (as === 'a' && href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>);

  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>);

}