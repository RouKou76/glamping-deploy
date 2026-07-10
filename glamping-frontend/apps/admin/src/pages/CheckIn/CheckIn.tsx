import { useState, useEffect } from 'react'
import { useApi, apiPost } from '@glamping/api'
import type { House, GuestSession, Lang } from '@glamping/types'
import { ConfirmDialog } from '@glamping/ui'

const LANG_OPTIONS: { value: Lang; label: string }[] = [{ value: 'ru', label: '🇷🇺 Русский' }, { value: 'en', label: '🇬🇧 English' }, { value: 'zh', label: '🇨🇳 中文' }]

export default function CheckIn() {
  const { data: apiHouses } = useApi<House[]>('/api/houses')
  const { data: apiSessions } = useApi<GuestSession[]>('/api/houses/sessions')
  const [houses, setHouses] = useState<House[]>([])
  const [sessions, setSessions] = useState<GuestSession[]>([])
  const [showForm, setShowForm] = useState(false); const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [formGuests, setFormGuests] = useState<number>(2); const [formLang, setFormLang] = useState<Lang>('ru')

  useEffect(() => { if (apiHouses) setHouses(apiHouses) }, [apiHouses])
  useEffect(() => { if (apiSessions) setSessions(apiSessions) }, [apiSessions])

  function openCheckIn(house: House) { setSelectedHouse(house); setFormGuests(2); setFormLang('ru'); setShowForm(true) }
  function handleCheckIn() { if (!selectedHouse) return; setHouses(prev => prev.map(h => h.id === selectedHouse.id ? { ...h, status: 'occupied' } : h)); apiPost(`/api/houses/${selectedHouse.id}/check-in`, { guestCount: formGuests, lang: formLang }).catch(() => {}); setShowForm(false) }
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  function handleCheckoutConfirm() { if (checkoutId) { setHouses(prev => prev.map(h => h.id === checkoutId ? { ...h, status: 'vacant' } : h)); apiPost(`/api/houses/${checkoutId}/check-out`, {}).catch(() => {}) }; setCheckoutId(null) }
  function formatCheckIn(iso: string): string { return new Date(iso).toLocaleString('ru', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) }

  const occupied = houses.filter(h => h.status === 'occupied')
  const vacant = houses.filter(h => h.status === 'vacant')

  return (
    <div className="p-4 space-y-4">
      <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Домики</h2><p className="text-xs text-gray-500 dark:text-white/50 mt-1">Заселено: {occupied.length} · Свободно: {vacant.length}</p></div>
      {occupied.length > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-600 dark:text-white/50 uppercase tracking-wider mb-2">Заселены</p>
          <div className="space-y-3">{occupied.map(house => {
            const session = sessions.find(s => s.houseId === house.id && s.isActive)
            return (
            <div key={house.id} className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-sm transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-white">Домик №{house.number}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">{session?.guestCount ?? '—'} гостей · {LANG_OPTIONS.find(l => l.value === session?.lang)?.label}</p>
                  {session?.checkInAt && <p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">Заезд: {formatCheckIn(session.checkInAt)}</p>}
                </div>
                <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">Занят</span>
              </div>
              <button onClick={() => setCheckoutId(house.id)} className="w-full py-2 rounded-xl border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400/70 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors active:scale-95">Выселить домик</button>
            </div>
          )})}</div>
        </section>
      )}
      {vacant.length > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-600 dark:text-white/50 uppercase tracking-wider mb-2">Свободны</p>
          <div className="space-y-3">{vacant.map(house => (
            <div key={house.id} className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors">
              <div><p className="text-base font-bold text-gray-800 dark:text-white">Домик №{house.number}</p><p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">Свободен</p></div>
              <button onClick={() => openCheckIn(house)} className="px-4 py-2 bg-glamp-600 text-white text-xs font-bold rounded-xl hover:bg-glamp-700 transition-colors active:scale-95">Заселить</button>
            </div>
          ))}</div>
        </section>
      )}
      {showForm && selectedHouse && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full bg-gray-50 dark:bg-[#1a1d27] rounded-t-3xl p-6 space-y-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Заселение — Домик №{selectedHouse.number}</h3>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-white/60 mb-2 block">Количество гостей</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setFormGuests(g => Math.max(2, g - 1))} className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-lg">−</button>
                <span className="text-2xl font-bold text-gray-800 dark:text-white w-8 text-center">{formGuests}</span>
                <button onClick={() => setFormGuests(g => Math.min(8, g + 1))} className="w-10 h-10 rounded-full bg-glamp-600 hover:bg-glamp-700 text-white flex items-center justify-center transition-colors text-lg">+</button>
                <span className="text-xs text-gray-500 dark:text-white/50">от 2 до 8</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-white/60 mb-2 block">Язык планшета</label>
              <div className="grid grid-cols-3 gap-2">{LANG_OPTIONS.map(opt => (<button key={opt.value} onClick={() => setFormLang(opt.value)} className={`py-2.5 rounded-xl text-xs font-medium border transition-colors ${formLang === opt.value ? 'bg-glamp-600 border-glamp-600 text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'}`}>{opt.label}</button>))}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Отмена</button>
              <button onClick={handleCheckIn} className="py-2.5 rounded-xl bg-glamp-600 hover:bg-glamp-700 text-white text-sm font-bold transition-colors active:scale-95">Заселить</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!checkoutId} title="Выселить домик?" message="Домик будет освобождён, чат очищен." confirmLabel="Выселить" onConfirm={handleCheckoutConfirm} onClose={() => setCheckoutId(null)} />
    </div>
  )
}
