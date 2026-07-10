import type { Service } from '@glamping/types'

export const mockServices: Service[] = [
  {
    id: 'cs1',
    name: 'Русская баня',
    requiresTime: true,
    priceInfo: '3 000 ₽ / час',
    icon: '🛁',
    active: true,
    assignedTo: 'admin',
    jsonSchema: {
      type: 'object',
      properties: {
        desiredAt: { type: 'string', title: 'Удобное время' },
        guestCount: { type: 'number', title: 'Количество человек', minimum: 1, maximum: 20 },
        comment: { type: 'string', title: 'Комментарий' },
      },
    },
  },
  {
    id: 'cs2',
    name: 'Прокат велосипедов',
    requiresTime: true,
    priceInfo: '500 ₽ / час',
    icon: '🚲',
    active: true,
    assignedTo: 'admin',
    jsonSchema: {
      type: 'object',
      properties: {
        desiredAt: { type: 'string', title: 'Время начала' },
        guestCount: { type: 'number', title: 'Количество велосипедов', minimum: 1, maximum: 10 },
      },
    },
  },
]
