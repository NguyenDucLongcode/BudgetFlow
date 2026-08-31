import type { ReactNode, CSSProperties } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: CSSProperties
}

export function Card({ children, className, hover = false, padding = 'md', style }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover',
        padding === 'sm' && 'card-pad-sm',
        padding === 'lg' && 'card-pad-lg',
        padding === 'none' && 'card-pad-none',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('card-header', className)}>
      <div className="card-header-text">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  )
}
