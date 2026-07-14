import { useState, useEffect, useCallback } from 'react'
import type { MealPeriod, Task } from '@glamping/types'

interface TimeSlot {
  period: MealPeriod
  slotStart: number
  slotEnd: number
  bufferEnd: number
}

export const SLOTS: TimeSlot[] = [
  { period: 'breakfast', slotStart: 8, slotEnd: 10, bufferEnd: 12 },
  { period: 'lunch', slotStart: 13, slotEnd: 15, bufferEnd: 17 },
  { period: 'dinner', slotStart: 19, slotEnd: 21, bufferEnd: 23 },
]

interface MealPeriodState {
  currentPeriod: MealPeriod
  isInBuffer: boolean
  nextPeriod: MealPeriod
  bufferEndsAt: Date | null
  draft: Task | null
  saveDraft: (ticket: Task) => void
  clearDraft: () => void
}

function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function computePeriodInfo(now: Date): {
  currentPeriod: MealPeriod
  isInBuffer: boolean
  nextPeriod: MealPeriod
  bufferEndsAt: Date | null
} {
  const minutes = getMinutesFromMidnight(now)

  for (let i = 0; i < SLOTS.length; i++) {
    const slot = SLOTS[i]
    const slotStartMin = slot.slotStart * 60
    const slotEndMin = slot.slotEnd * 60
    const bufferEndMin = slot.bufferEnd * 60

    if (minutes >= slotStartMin && minutes < slotEndMin) {
      const nextSlot = SLOTS[i + 1]
      return {
        currentPeriod: slot.period,
        isInBuffer: false,
        nextPeriod: nextSlot ? nextSlot.period : 'none',
        bufferEndsAt: null,
      }
    }

    if (minutes >= slotEndMin && minutes < bufferEndMin) {
      const bufferEndsAt = new Date(now)
      bufferEndsAt.setHours(slot.bufferEnd, 0, 0, 0)
      const nextSlot = SLOTS[i + 1]
      return {
        currentPeriod: slot.period,
        isInBuffer: true,
        nextPeriod: nextSlot ? nextSlot.period : 'none',
        bufferEndsAt,
      }
    }
  }

  return { currentPeriod: 'none', isInBuffer: false, nextPeriod: 'none', bufferEndsAt: null }
}

export function useMealPeriod(): MealPeriodState {
  const [now, setNow] = useState(() => new Date())
  const [draft, setDraft] = useState<Task | null>(null)
  const [prevPeriod, setPrevPeriod] = useState<MealPeriod>('none')

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const { currentPeriod, isInBuffer, nextPeriod, bufferEndsAt } = computePeriodInfo(now)

  useEffect(() => {
    if (prevPeriod !== 'none' && prevPeriod !== currentPeriod) {
      setPrevPeriod(currentPeriod)
    } else if (prevPeriod === 'none') {
      setPrevPeriod(currentPeriod)
    }
  }, [currentPeriod, prevPeriod])

  const saveDraft = useCallback((ticket: Task) => { setDraft(ticket) }, [])
  const clearDraft = useCallback(() => { setDraft(null) }, [])

  return { currentPeriod, isInBuffer, nextPeriod, bufferEndsAt, draft, saveDraft, clearDraft }
}
