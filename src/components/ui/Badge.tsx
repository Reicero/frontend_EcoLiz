import React from 'react';
type BadgeTone = 'brand' | 'accent' | 'neutral' | 'warning' | 'success';
type BadgeSize = 'sm' | 'md';
interface BadgeProps {
  tone?: BadgeTone;
  size?: BadgeSize;
  outline?: boolean;
  children: React.ReactNode;
  className?: string;
}
const toneStyles: Record<
  BadgeTone,
  {
    solid: string;
    outline: string;
  }> =
{
  brand: {
    solid: 'bg-brand-100 text-brand-800',
    outline: 'border border-brand-200 text-brand-700 bg-white'
  },
  accent: {
    solid: 'bg-accent-100 text-accent-800',
    outline: 'border border-accent-200 text-accent-700 bg-white'
  },
  neutral: {
    solid: 'bg-gray-100 text-gray-700',
    outline: 'border border-gray-200 text-gray-700 bg-white'
  },
  warning: {
    solid: 'bg-amber-50 text-amber-700',
    outline: 'border border-amber-200 text-amber-700 bg-white'
  },
  success: {
    solid: 'bg-brand-50 text-brand-700',
    outline: 'border border-brand-200 text-brand-700 bg-white'
  }
};
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1'
};
export function Badge({
  tone = 'brand',
  size = 'md',
  outline = false,
  className = '',
  children
}: BadgeProps) {
  const styles = outline ? toneStyles[tone].outline : toneStyles[tone].solid;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${styles} ${sizeStyles[size]} ${className}`}>
      
      {children}
    </span>);

}