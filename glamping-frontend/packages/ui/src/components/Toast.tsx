import React, { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'
export interface ToastProps { message: string; type?: ToastType; duration?: number; onClose: () => void }

const typeClasses: Record<ToastType, string> = {
  success: 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-700 dark:bg-white/10 text-white',
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, duration); return () => clearTimeout(timer) }, [duration, onClose])
  return <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl text-sm font-medium animate-slide-up ${typeClasses[type]}`}>{message}</div>
}
