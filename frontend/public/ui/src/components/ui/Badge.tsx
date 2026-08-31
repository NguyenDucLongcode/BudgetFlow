import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate'
type Size = 'sm' | 'md'

interface BadgeProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  dot?: boolean
  className?: string
}

const VARIANTS: Record<Variant, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  slate: 'bg-slate-800 text-slate-100',
}

const DOTS: Record<Variant, string> = {
  neutral: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  slate: '#cbd5e1',
}

export function Badge({ children, variant = 'neutral', size = 'md', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        VARIANTS[variant],
        size === 'sm' && 'badge-sm',
        className,
      )}
    >
      {dot && <span className="badge-dot" style={{ background: DOTS[variant] }} />}
      {children}
    </span>
  )
}
