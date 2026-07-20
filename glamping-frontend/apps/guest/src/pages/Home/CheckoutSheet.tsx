import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@glamping/ui'

interface CheckoutSheetProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CheckoutSheet({ open, onClose, onConfirm }: CheckoutSheetProps) {
  const { t } = useTranslation()

  return (
    <BottomSheet open={open} onClose={onClose} title={t('checkout.confirmTitle')}>
      <div className="p-5 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('checkout.confirmMessage')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-400 py-3 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95 text-sm">{t('confirm.cancel')}</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors active:scale-95 shadow-sm text-sm">{t('checkout.submit')}</button>
        </div>
      </div>
    </BottomSheet>
  )
}
