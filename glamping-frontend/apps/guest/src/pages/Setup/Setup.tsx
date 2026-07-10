import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SetupProps {
  onSubmit: (token: string) => void
}

export default function Setup({ onSubmit }: SetupProps) {
  const { t } = useTranslation()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) return
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(token.trim())
    } catch {
      setError('Неверный код. Попробуйте ещё раз.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-glamp-50 dark:bg-[#0f1117] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 p-6 transition-colors">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-glamp-100 dark:bg-glamp-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-glamp-600 dark:text-green-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Настройка планшета</h1>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Введите код, полученный от администратора</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-white/60 uppercase tracking-wider mb-1.5 block">Код устройства</label>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} required placeholder="glamp-1-..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-glamp-500 transition-colors" />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={submitting || !token.trim()}
              className="w-full py-2.5 rounded-xl bg-glamp-600 hover:bg-glamp-700 disabled:opacity-50 text-white text-sm font-bold transition-colors active:scale-95">
              {submitting ? 'Настройка...' : 'Подключить'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
