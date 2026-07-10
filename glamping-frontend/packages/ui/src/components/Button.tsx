import React from 'react'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; fullWidth?: boolean }

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-glamp-600 hover:bg-glamp-700 text-white shadow-sm',
  ghost: 'bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white/60 border border-gray-200 dark:border-white/20',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3.5 text-lg rounded-2xl',
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, children, className = '', ...props }) => {
  return (
    <button disabled={disabled || loading} className={['font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed', variantClasses[variant], sizeClasses[size], fullWidth ? 'w-full' : '', className].join(' ')} {...props}>
      {loading ? <span className="flex items-center justify-center gap-2"><Spinner size={16} />{children}</span> : children}
    </button>
  )
}
