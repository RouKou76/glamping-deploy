import { useState, useRef, useEffect } from 'react'
import { useApi, useWebSocket, useNotifications } from '@glamping/api'
import { mockHouses } from '@glamping/utils'
import type { Message, House } from '@glamping/types'

export default function Chats() {
  const { data: apiMessages } = useApi<Message[]>('/api/messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const occupiedHouses = mockHouses.filter(h => h.status === 'occupied')
  const [activeHouseId, setActiveHouseId] = useState<string>(occupiedHouses[0]?.id ?? 'h1')
  const activeMessages = messages.filter(m => m.houseId === activeHouseId)

  useEffect(() => { if (apiMessages) setMessages(apiMessages) }, [apiMessages])

  const { notify } = useNotifications()

  const { send, isConnected } = useWebSocket({
    onMessage: (event) => {
      if (event.type === 'server:message:received') {
        const msg = event.payload as Message
        setMessages(prev => [...prev, msg])
        notify('Новое сообщение', `Домик: ${msg.houseId}`)
      }
    },
  })

  const unreadCount = (houseId: string) => messages.filter(m => m.houseId === houseId && !m.read && m.sender === 'GUEST').length

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeMessages.length])
  useEffect(() => { setMessages(prev => prev.map(m => m.houseId === activeHouseId && !m.read ? { ...m, read: true } : m)) }, [activeHouseId])

  function handleSend() {
    const text = input.trim(); if (!text) return
    send('client:message:send', { houseId: activeHouseId, text })
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, houseId: activeHouseId, sender: 'STAFF', text, timestamp: new Date().toISOString(), read: true }])
    setInput('')
  }

  const activeHouse = mockHouses.find(h => h.id === activeHouseId) as House

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-white/10 shadow-sm flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Чат с гостями</h2>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {occupiedHouses.map(house => {
            const unread = unreadCount(house.id); const isActive = house.id === activeHouseId
            return (
              <button key={house.id} onClick={() => setActiveHouseId(house.id)}
                className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? 'bg-black dark:bg-white dark:text-gray-900 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50'}`}>
                Домик #{house.number}
                {unread > 0 && !isActive && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1a1d27] rounded-full"></span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0f1117]">
        <p className="text-xs text-gray-600 dark:text-white/60">Домик #{activeHouse.number}</p>
      </div>
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
          placeholder={`Сообщение в Домик #${activeHouse.number}...`} className="flex-1 bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-full outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30" />
        <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 bg-glamp-600 hover:bg-glamp-700 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  )
}
