import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@glamping/ui'
import { i18n } from '@glamping/utils'
import { GlampInfoProvider } from './contexts/GlampInfoContext'
import { TaskProvider } from './contexts/TaskContext'
import { DeviceProvider, useDevice } from './contexts/DeviceContext'
import GuestLayout from './layouts/GuestLayout'
import Home from './pages/Home/Home'
import Chat from './pages/Chat/Chat'
import Info from './pages/Info/Info'
import Setup from './pages/Setup/Setup'

function SetupGate() {
  const { deviceToken, isInitialized } = useDevice()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(deviceToken)
  }, [deviceToken])

  if (!isInitialized) return null

  if (!token) {
    return <Setup onSubmit={(t) => {
      localStorage.setItem('glamp-device-token', t)
      const match = t.match(/^glamp-(\d+)-/)
      if (match) localStorage.setItem('glamp-house-id', match[1])
      setToken(t)
    }} />
  }

  return null
}

function AppRoutes() {
  const { deviceToken } = useDevice()
  if (!deviceToken) return <SetupGate />
  return (
    <GlampInfoProvider>
      <TaskProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/info" element={<Info />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TaskProvider>
    </GlampInfoProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <DeviceProvider>
        <AppRoutes />
      </DeviceProvider>
    </ThemeProvider>
  )
}
