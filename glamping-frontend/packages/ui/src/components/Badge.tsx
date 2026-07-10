import React from 'react'
import type { TaskStatus } from '@glamping/types'

export interface BadgeProps { status: TaskStatus }

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  new: { label: 'Новая', className: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  in_progress: { label: 'В работе', className: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' },
  done: { label: 'Выполнена', className: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' },
  cancelled: { label: 'Отменена', className: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40' },
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const { label, className } = statusConfig[status]
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${className}`}>{label}</span>
}
