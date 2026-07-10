import { useState, useRef, useEffect, useCallback } from 'react'
import { useApi, apiPost } from '@glamping/api'
import type { Message, House } from '@glamping/types'

export default function Chats() {
  const { data: apiHouses } = useApi<House[]>('/api/houses')
  const { data: apiMessages, refetch } = useApi<Message[]>('/api/messages')
  const [houses, setHouses] = useState<House[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const [activeHouseId, setActiveHouseId] = useState<string>('')

  useEffect(() => { if (apiHouses) { setHouses(apiHouses); if (!activeHouseId && apiHouses.length > 0) setActiveHouseId(apiHouses[0].id) } }, [apiHouses, activeHouseId])
  useEffect(() => { if (apiMessages) setMessages(apiMessages) }, [apiMessages])

  const activeMessages = messages.filter(m => m.houseId === activeHouseId)

  useEffect(() => {
    if (!activeHouseId) return
    const interval = setInterval(() => { refetch() }, 5000)
    return () => clearInterval(interval)
  }, [activeHouseId, refetch])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeMessages.length])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !activeHouseId) return
    setInput('')
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, { id: tempId, houseId: activeHouseId, sender: 'STAFF', text, timestamp: new Date().toISOString(), read: true }])
    try {
      const result = await apiPost<{ id: string }>('/api/messages', { houseId: activeHouseId, text, sender: 'STAFF' })
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: result.id } : m))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }, [input, activeHouseId])

  const occupied = houses.filter(h => h.status === 'occupied')
  const activeHouse = houses.find(h => h.id === activeHouseId)

  const unreadCount = (houseId: string) => messages.filter(m => m.houseId === houseId && !m.read && m.sender === 'GUEST').length

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-white/10 shadow-sm flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Чат с гостями</h2>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {occupied.map(house => {
            const unread = unreadCount(house.id)
            const isActive = house.id === activeHouseId
            return (
              <button key={house.id} onClick={() => setActiveHouseId(house.id)}
                className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? 'bg-black dark:bg-white dark:text-gray-900 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50'}`}>
                Домик #{house.number}
                {unread > 0 && !isActive && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1a1d27] rounded-full"></span>}
              </button>
            )
          })}
          {occupied.length === 0 && <p className="text-xs text-gray-400 dark:text-white/40">Нет заселённых домиков</p>}
        </div>
      </div>
      {activeHouse && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0f1117]">
          <p className="text-xs text-gray-600 dark:text-white/60">Домик #{activeHouse.number}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0f1117]">
        {activeMessages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-white/50 text-sm mt-10">История сообщений пуста</p>
        ) : activeMessages.map(msg => {
          const isAdmin = msg.sender === 'STAFF'
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isAdmin ? 'bg-glamp-600 dark:text-white text-white rounded-br-sm' : 'bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-bl-sm shadow-sm'}`}>
                <p>{msg.text}</p>
                <span className="text-[10px] mt-1 block text-right text-gray-500 dark:text-white/50">{new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 bg-white dark:bg-[#1a1d27] border-t border-gray-200 dark:border-white/10 flex gap-2 items-center">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={activeHouse ? `Сообщение в Домик #${activeHouse.number}...` : 'Выберите домик'}
          className="flex-1 bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-full outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30" />
        <button onClick={handleSend} disabled={!input.trim() || !activeHouseId} className="w-10 h-10 bg-glamp-600 hover:bg-glamp-700 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  )
}
