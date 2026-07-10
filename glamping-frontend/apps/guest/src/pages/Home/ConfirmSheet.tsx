import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@glamping/ui'
import { SuccessScreen } from './SuccessScreen'

export type ConfirmSheetType = 'towels' | 'gates' | 'minibar'

const CONFIRM_ICONS: Record<ConfirmSheetType, React.ReactNode> = {
  towels: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>,
  gates: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  minibar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>,
}

interface ConfirmSheetProps { open: boolean; type: ConfirmSheetType; onClose: () => void; onConfirm: (type: ConfirmSheetType) => void }

export function ConfirmSheet({ open, type, onClose, onConfirm }: ConfirmSheetProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'confirm' | 'success'>('confirm')

  function handleConfirm() { onConfirm(type); setStep('success') }
  function handleClose() { setStep('confirm'); onClose() }

  return (
    <BottomSheet open={open} onClose={handleClose} title={step === 'confirm' ? t(`${type}.title`) : undefined}>
      {step === 'confirm' ? (
        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-glamp-100 dark:bg-glamp-500/20 rounded-full flex items-center justify-center text-glamp-600 dark:text-green-400 mx-auto mb-3">{CONFIRM_ICONS[type]}</div>
            <p className="text-gray-600 dark:text-gray-400">{t(`${type}.description`)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleClose} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-400 py-3 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95 text-sm">{t('confirm.cancel')}</button>
            <button onClick={handleConfirm} className="flex-1 bg-glamp-600 text-white py-3 rounded-2xl font-semibold hover:bg-glamp-700 transition-colors active:scale-95 shadow-sm text-sm">{t(`${type}.confirm`)}</button>
          </div>
        </div>
      ) : (
        <SuccessScreen title={t('confirm.close')} message={t(`${type}.success`)} onClose={handleClose} />
      )}
    </BottomSheet>
  )
}
