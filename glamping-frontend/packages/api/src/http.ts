import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

interface ApiResponse<T> {
  data: T
  timestamp: string
}

interface UseApiOptions {
  immediate?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('glamp-refresh-token')
  if (!refreshToken) return false
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) return false
      const result: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json()
      localStorage.setItem('glamp-token', result.data.accessToken)
      localStorage.setItem('glamp-refresh-token', result.data.refreshToken)
      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('glamp-token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function fetchWithRefresh<T>(url: string, options: RequestInit): Promise<T> {
  let response = await fetch(url, { ...options, headers: { ...options.headers as Record<string, string>, ...getAuthHeaders() } })

  if (response.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      response = await fetch(url, { ...options, headers: { ...options.headers as Record<string, string>, ...getAuthHeaders() } })
    }
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result: ApiResponse<T> = await response.json()
  return result.data
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
      const result = await fetchWithRefresh<T>(`${API_BASE}${path}`, { method: 'GET' })
      setData(result)
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
  return fetchWithRefresh<T>(`${API_BASE}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return fetchWithRefresh<T>(`${API_BASE}${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path: string): Promise<void> {
  const token = localStorage.getItem('glamp-token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}
