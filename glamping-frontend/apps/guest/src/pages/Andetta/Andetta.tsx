import { useTranslation } from 'react-i18next'
import { useApi } from '@glamping/api'

export default function Andetta() {
  const { t } = useTranslation()
  const { data } = useApi<{ filename: string | null }>('/api/andetta')

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a1d27] p-4 border-b border-gray-100 dark:border-white/10 shadow-sm transition-colors">
        <h2 className="font-bold text-base text-gray-800 dark:text-gray-200">{t('andetta.title')}</h2>
      </div>

      <div className="flex-1 bg-glamp-50 dark:bg-[#0f1117] transition-colors">
        {data?.filename ? (
          <iframe
            src={`/api/andetta/pdf`}
            className="w-full h-full border-0"
            title="ANDITTA catalog"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-white/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('andetta.noCatalog')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
