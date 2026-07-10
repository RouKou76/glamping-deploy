interface GateAlertBannerProps { houseNumber: number; onConfirm: () => void; onDismiss: () => void }

export function GateAlertBanner({ houseNumber, onConfirm, onDismiss }: GateAlertBannerProps) {
  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-4 animate-pulse-alert">
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        <div><p className="font-bold text-sm">Запрос открытия ворот</p><p className="text-xs text-red-200">Домик №{houseNumber}</p></div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onDismiss} className="px-3 py-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">Отклонить</button>
        <button onClick={onConfirm} className="px-4 py-1.5 bg-white text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">Открыть</button>
      </div>
    </div>
  )
}
