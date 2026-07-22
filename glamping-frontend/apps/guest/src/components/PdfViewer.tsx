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
  const renderedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const doc = await (pdfjsLib as any).getDocument({ url }).promise
        if (cancelled) return
        setPageCount(doc.numPages)
        setLoading(false)
        renderAllPages(doc)
      } catch (e: any) {
        if (!cancelled) setError(`PDF: ${e?.message || 'ошибка'}`)
      }
    }
    load()
    return () => { cancelled = true }
  }, [url])

  function renderAllPages(doc: any) {
    const container = containerRef.current
    if (!container || renderedRef.current) return
    renderedRef.current = true
    container.innerHTML = ''

    for (let i = 1; i <= doc.numPages; i++) {
      const pageDiv = document.createElement('div')
      pageDiv.className = 'pdf-page'
      pageDiv.dataset.page = String(i)
      container.appendChild(pageDiv)

      doc.getPage(i).then((page: any) => {
        const viewport = page.getViewport({ scale: 1.5 })
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
  }

  if (error) return <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">{error}</div>
  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Загрузка...</div>

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center px-3 py-2 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-white/10 shrink-0 transition-colors">
        <span className="text-xs text-gray-600 dark:text-white/60">{pageCount} стр.</span>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-100 dark:bg-[#0a0c10] p-2 space-y-2" />
    </div>
  )
}
