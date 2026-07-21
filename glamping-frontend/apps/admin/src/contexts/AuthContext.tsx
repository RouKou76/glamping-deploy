import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiPost, apiGet, subscribeToPush, unsubscribeFromPush } from '@glamping/api'

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
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
      .then(res => {
        setUser(res.data)
        subscribeToPush()
      })
      .catch(() => localStorage.removeItem('glamp-token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ accessToken: string; user: User }>('/api/auth/login', { email, password })
    localStorage.setItem('glamp-token', res.accessToken)
    setUser(res.user)
    subscribeToPush()
  }, [])

  const logout = useCallback(() => {
    unsubscribeFromPush()
    apiPost('/api/auth/logout', {}).catch(() => {})
    localStorage.removeItem('glamp-token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
