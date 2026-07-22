import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker

interface PdfViewerProps {
  url: string
  className?: string
}

export function PdfViewer({ url, className = '' }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [scale, setScale] = useState(1.5)
  const docRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const doc = await (pdfjsLib as any).getDocument({ url }).promise
        if (cancelled) return
        docRef.current = doc
        setPageCount(doc.numPages)
        setLoading(false)
      } catch (e: any) {
        if (!cancelled) setError(`PDF: ${e?.message || 'ошибка'}`)
      }
    }
    load()
    return () => { cancelled = true; docRef.current = null }
  }, [url])

  useEffect(() => {
    if (loading || !docRef.current || !containerRef.current) return
    const doc = docRef.current
    const container = containerRef.current
    container.innerHTML = ''

    for (let i = 1; i <= doc.numPages; i++) {
      const pageDiv = document.createElement('div')
      pageDiv.className = 'flex justify-center mb-2'
      container.appendChild(pageDiv)

      doc.getPage(i).then((page: any) => {
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        page.render({ canvasContext: ctx, viewport } as any).promise.then(() => {
          pageDiv.appendChild(canvas)
        })
      })
    }
  }, [loading, pageCount, scale])

  if (error) return <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">{error}</div>
  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Загрузка...</div>

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-white/10 shrink-0 transition-colors">
        <span className="text-xs text-gray-600 dark:text-white/60">{pageCount} стр.</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">−</button>
          <span className="text-xs text-gray-600 dark:text-white/60 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">+</button>
          <button onClick={() => setScale(1)} className="text-[10px] px-2 py-1 rounded-lg text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-1">100%</button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 dark:bg-[#0a0c10] p-2" />
    </div>
  )
}
