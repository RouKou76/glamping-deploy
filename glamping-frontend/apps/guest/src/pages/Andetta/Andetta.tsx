import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApi } from '@glamping/api'
import { PdfViewer } from '../../components/PdfViewer'

interface AndettaInfo {
  current: string | null
  previous: string | null
  active: 'current' | 'previous'
}

export default function Andetta() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useApi<AndettaInfo>('/api/andetta')
  const [confirmed, setConfirmed] = useState(false)

  const hasPdf = !!data?.current || !!data?.previous

  if (!confirmed) {
    return (
      <div className="flex flex-col h-full bg-glamp-50 dark:bg-[#0f1117] transition-colors">
        <div className="bg-white dark:bg-[#1a1d27] p-4 border-b border-gray-100 dark:border-white/10 shadow-sm transition-colors">
          <h2 className="font-bold text-base text-gray-800 dark:text-gray-200">{t('andetta.title')}</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-glamp-100 dark:bg-glamp-500/20 rounded-full flex items-center justify-center text-glamp-600 dark:text-green-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t('andetta.confirmTitle')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t('andetta.confirmMessage')}</p>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors active:scale-95">{t('andetta.back')}</button>
            <button onClick={() => setConfirmed(true)} disabled={!hasPdf} className="flex-1 py-3 rounded-2xl bg-glamp-600 text-white text-sm font-semibold hover:bg-glamp-700 transition-colors active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">{t('andetta.open')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a1d27] p-4 border-b border-gray-100 dark:border-white/10 shadow-sm transition-colors">
        <h2 className="font-bold text-base text-gray-800 dark:text-gray-200">{t('andetta.title')}</h2>
      </div>
      <div className="flex-1">
        {hasPdf ? (
          <PdfViewer url={`/api/andetta/pdf?v=${Date.now()}`} className="h-full" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('andetta.noCatalog')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
