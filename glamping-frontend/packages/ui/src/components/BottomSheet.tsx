import React from 'react'
import { createPortal } from 'react-dom'

export interface BottomSheetProps { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }

export const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full pb-20 bg-gray-50 dark:bg-[#1a1d27] rounded-t-3xl shadow-2xl animate-slide-up transition-colors" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 bg-white dark:bg-[#1a1d27] rounded-t-3xl border-b border-gray-100 dark:border-white/10 transition-colors">
          {title && <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>}
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
