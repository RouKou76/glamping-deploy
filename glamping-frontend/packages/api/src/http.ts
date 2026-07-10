import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

interface ApiResponse<T> {
  data: T
  timestamp: string
}

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T>(path: string, options: UseApiOptions = {}) {
  const { immediate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('glamp-token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await fetch(`${API_BASE}${path}`, { headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result: ApiResponse<T> = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => { if (immediate) fetchData() }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem('glamp-token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result: ApiResponse<T> = await response.json()
  return result.data
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem('glamp-token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT', headers, body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result: ApiResponse<T> = await response.json()
  return result.data
}

export async function apiDelete(path: string): Promise<void> {
  const token = localStorage.getItem('glamp-token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
