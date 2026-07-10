import type { Message } from '@glamping/types'

export const mockMessages: Message[] = [
  { id: 'msg1', houseId: 'h1', sender: 'GUEST', text: 'Добрый день! Можно заказать ещё одно полотенце?', timestamp: '2026-06-15T08:00:00Z', read: true },
  { id: 'msg2', houseId: 'h1', sender: 'STAFF', text: 'Конечно, принесём в течение 15 минут!', timestamp: '2026-06-15T08:01:00Z', read: true },
  { id: 'msg3', houseId: 'h1', sender: 'GUEST', text: 'Спасибо большое!', timestamp: '2026-06-15T08:02:00Z', read: true },
  { id: 'msg4', houseId: 'h2', sender: 'GUEST', text: 'Hello! What time is checkout?', timestamp: '2026-06-15T09:15:00Z', read: false },
  { id: 'msg5', houseId: 'h2', sender: 'STAFF', text: 'Hi! Checkout is at 12:00. Let us know if you need a later time.', timestamp: '2026-06-15T09:16:00Z', read: false },
]
