import { useState } from 'react'
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
  const { data } = useApi<AndettaInfo>('/api/andetta')
  const hasPdf = !!data?.current || !!data?.previous

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
