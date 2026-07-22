import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

interface PdfViewerProps {
  url: string
  className?: string
}

export function PdfViewer({ url, className = '' }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const docRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const loadingTask = pdfjsLib.getDocument(url as any)
        const doc = await loadingTask.promise
        if (cancelled) return
        docRef.current = doc
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
        renderPage(doc, 1, 1)
      } catch {
        if (!cancelled) setError('Не удалось загрузить PDF')
      }
    }
    load()
    return () => { cancelled = true; docRef.current?.destroy() }
  }, [url])

  useEffect(() => {
    if (docRef.current && !loading) {
      renderPage(docRef.current, currentPage, scale)
    }
  }, [currentPage, scale])

  function renderPage(doc: pdfjsLib.PDFDocumentProxy, pageNum: number, s: number) {
    const container = containerRef.current
    if (!container) return
    doc.getPage(pageNum).then(page => {
      const viewport = page.getViewport({ scale: s })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      page.render({ canvasContext: ctx, viewport } as any).promise.then(() => {
        container.innerHTML = ''
        canvas.style.maxWidth = '100%'
        canvas.style.height = 'auto'
        container.appendChild(canvas)
      })
    })
  }

  function zoomIn() { setScale(s => Math.min(s + 0.25, 3)) }
  function zoomOut() { setScale(s => Math.max(s - 0.25, 0.5)) }
  function fitWidth() { setScale(1) }

  if (error) return <div className="flex items-center justify-center h-full text-red-500 text-sm">{error}</div>
  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Загрузка...</div>

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-white/10 shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">−</button>
          <span className="text-xs text-gray-600 dark:text-white/60 min-w-[60px] text-center">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">+</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">−</button>
          <span className="text-xs text-gray-600 dark:text-white/60 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">+</button>
          <button onClick={fitWidth} className="text-[10px] px-2 py-1 rounded-lg text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-1">Ширина</button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 dark:bg-[#0a0c10] p-4" />
    </div>
  )
}
