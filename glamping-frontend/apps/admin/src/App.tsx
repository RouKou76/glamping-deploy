import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@glamping/ui'
import AdminLayout from './layouts/AdminLayout'
import Tickets from './pages/Tickets/Tickets'
import Chats from './pages/Chats/Chats'
import Management from './pages/Management/Management'
import CheckIn from './pages/CheckIn/CheckIn'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Tickets />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/manage" element={<Management />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
