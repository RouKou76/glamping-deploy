import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@glamping/ui'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login/Login'
import Tickets from './pages/Tickets/Tickets'
import Chats from './pages/Chats/Chats'
import Management from './pages/Management/Management'
import CheckIn from './pages/CheckIn/CheckIn'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-glamp-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/" element={<Tickets />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/manage" element={<Management />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
