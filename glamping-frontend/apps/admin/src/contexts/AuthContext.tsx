import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiPost, apiGet } from '@glamping/api'

interface User {
  id: string
  email: string
  name: string
  role: { name: string; permissions: string[] }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('glamp-token')
    if (!token) {
      setLoading(false)
      return
    }
    apiGet<{ data: User }>('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('glamp-token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>('/api/auth/login', { email, password })
    const { accessToken, refreshToken, user } = res.data
    localStorage.setItem('glamp-token', accessToken)
    localStorage.setItem('glamp-refresh-token', refreshToken)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('glamp-token')
    localStorage.removeItem('glamp-refresh-token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiGet<{ data: User }>('/api/auth/me')
      setUser(res.data)
    } catch { /* ignore */ }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
