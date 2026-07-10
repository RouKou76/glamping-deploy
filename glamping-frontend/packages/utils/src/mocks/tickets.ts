import type { Ticket } from '@glamping/types'

export const mockTickets: Ticket[] = [
  {
    id: 't1', houseId: 'h1', type: 'food', status: 'new',
    sentAt: '2026-06-15T08:12:00Z', desiredAt: '2026-06-15T08:30:00Z',
    items: [
      { menuItemId: 'm1', name: 'Сырники из фермерского творога', price: 450, quantity: 2 },
      { menuItemId: 'm2', name: 'Овсяная каша с ягодами', price: 320, quantity: 1 },
    ],
    location: 'cabin', assignedTo: 'cook',
  },
  {
    id: 't2', houseId: 'h2', type: 'transfer', status: 'accepted',
    sentAt: '2026-06-15T09:00:00Z', desiredAt: '2026-06-15T11:00:00Z',
    geo: 'suzdal', assignedTo: 'driver',
  },
  {
    id: 't3', houseId: 'h1', type: 'cleaning', status: 'in_progress',
    sentAt: '2026-06-15T07:30:00Z', desiredAt: '2026-06-15T10:00:00Z',
    assignedTo: 'cleaning',
  },
  {
    id: 't4', houseId: 'h3', type: 'towels', status: 'done',
    sentAt: '2026-06-14T16:20:00Z', assignedTo: 'cleaning',
  },
  {
    id: 't5', houseId: 'h4', type: 'minibar', status: 'new',
    sentAt: '2026-06-16T11:00:00Z',
    items: [
      { menuItemId: 'm9', name: 'Кока-кола 0.33', price: 150, quantity: 2 },
      { menuItemId: 'm12', name: 'Чипсы Lays', price: 180, quantity: 1 },
    ],
  },
  {
    id: 't6', houseId: 'h6', type: 'custom', status: 'new',
    sentAt: '2026-06-16T14:00:00Z', description: 'Хотим заказать баню на вечер',
    guestCount: 4,
  },
  {
    id: 't7', houseId: 'h2', type: 'food', status: 'done',
    sentAt: '2026-06-15T13:05:00Z', desiredAt: '2026-06-15T13:30:00Z',
    items: [
      { menuItemId: 'm4', name: 'Борщ со сметаной', price: 420, quantity: 2 },
    ],
    location: 'terrace', assignedTo: 'cook',
  },
]
