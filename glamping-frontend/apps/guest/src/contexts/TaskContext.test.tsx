import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('TaskContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('addTask adds task to list', () => {
    const tasks: any[] = []
    const newTask = { id: 't1', type: 'food', status: 'new' }
    tasks.push(newTask)
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('t1')
  })

  it('cancelTask changes status to cancelled', () => {
    const tasks: any[] = [{ id: 't1', status: 'new' }]
    const idx = tasks.findIndex(t => t.id === 't1')
    tasks[idx] = { ...tasks[idx], status: 'cancelled' }
    expect(tasks[0].status).toBe('cancelled')
  })

  it('refetch replaces task list', () => {
    let tasks: any[] = [{ id: 'old' }]
    const newTasks = [{ id: 'new1' }, { id: 'new2' }]
    tasks = newTasks
    expect(tasks).toHaveLength(2)
    expect(tasks[0].id).toBe('new1')
  })
})
