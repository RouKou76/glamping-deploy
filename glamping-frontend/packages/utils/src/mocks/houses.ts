import type { House, GuestSession } from '@glamping/types'

export const mockHouses: House[] = [
  { id: 'h1', number: 1, status: 'occupied' },
  { id: 'h2', number: 2, status: 'occupied' },
  { id: 'h3', number: 3, status: 'vacant' },
  { id: 'h4', number: 4, status: 'occupied' },
  { id: 'h5', number: 5, status: 'vacant' },
  { id: 'h6', number: 6, status: 'occupied' },
]

export const mockGuestSessions: GuestSession[] = [
  { id: 's1', houseId: 'h1', guestCount: 2, lang: 'ru', checkInAt: '2026-06-15T14:00:00Z', isActive: true },
  { id: 's2', houseId: 'h2', guestCount: 4, lang: 'en', checkInAt: '2026-06-14T12:00:00Z', isActive: true },
  { id: 's3', houseId: 'h4', guestCount: 3, lang: 'ru', checkInAt: '2026-06-16T10:00:00Z', isActive: true },
  { id: 's4', houseId: 'h6', guestCount: 2, lang: 'zh', checkInAt: '2026-06-13T15:00:00Z', isActive: true },
]
