import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@glamping/ui'
import { i18n } from '@glamping/utils'
import { GlampInfoProvider } from './contexts/GlampInfoContext'
import { TaskProvider } from './contexts/TaskContext'
import { DeviceProvider } from './contexts/DeviceContext'
import GuestLayout from './layouts/GuestLayout'
import Home from './pages/Home/Home'
import Chat from './pages/Chat/Chat'
import Info from './pages/Info/Info'
import Andetta from './pages/Andetta/Andetta'

export default function App() {
  return (
    <ThemeProvider>
      <DeviceProvider>
        <GlampInfoProvider>
          <TaskProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<GuestLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/info" element={<Info />} />
                  <Route path="/andetta" element={<Andetta />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TaskProvider>
        </GlampInfoProvider>
      </DeviceProvider>
    </ThemeProvider>
  )
}
