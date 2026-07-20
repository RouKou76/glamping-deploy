import { useState, useRef } from 'react'
import { useApi, apiPost } from '@glamping/api'

export default function Andetta() {
  const { data, refetch } = useApi<{ filename: string | null }>('/api/andetta')
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await apiPost('/api/andetta/upload', formData)
      refetch()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      // ignore
    }
    setUploading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Продукция ANDETTA</h2>
        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Загрузите PDF-каталог для гостей</p>
      </div>

      {data?.filename && (
        <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{data.filename}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Загружен</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm transition-colors space-y-3">
        <p className="text-sm font-bold text-gray-800 dark:text-white">
          {data?.filename ? 'Заменить PDF' : 'Загрузить PDF'}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="w-full text-sm text-gray-600 dark:text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-glamp-600 file:text-white hover:file:bg-glamp-700 file:cursor-pointer"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-2.5 rounded-xl bg-glamp-600 hover:bg-glamp-700 disabled:opacity-50 text-white text-sm font-bold transition-colors active:scale-95"
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </button>
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
            ✓ PDF загружен
          </p>
        )}
      </div>
    </div>
  )
}
