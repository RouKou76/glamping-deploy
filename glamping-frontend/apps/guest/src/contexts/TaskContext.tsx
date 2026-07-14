import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiPost } from '@glamping/api'
import type { Task } from '@glamping/types'

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  addTask: (data: Record<string, unknown>) => Promise<void>
  updateTask: (id: string, data: Record<string, unknown>) => Promise<void>
  cancelTask: (id: string) => Promise<void>
  refetch: () => void
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  addTask: async () => {},
  updateTask: async () => {},
  cancelTask: async () => {},
  refetch: () => {},
})

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(() => {
    const token = localStorage.getItem('glamp-token')
    if (!token) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data) setTasks(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function addTask(data: Record<string, unknown>) {
    const result = await apiPost<Task>('/api/tasks', data)
    setTasks(prev => [result, ...prev])
  }

  async function updateTask(id: string, data: Record<string, unknown>) {
    const result = await apiPost<Task>(`/api/tasks/${id}`, data)
    setTasks(prev => prev.map(t => t.id === id ? result : t))
  }

  async function cancelTask(id: string) {
    await apiPost(`/api/tasks/${id}/cancel`, {})
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' } : t))
  }

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, cancelTask, refetch: fetchTasks }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  return useContext(TaskContext)
}
