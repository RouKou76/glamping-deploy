import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import i18n from '@glamping/utils'

interface DeviceInfo {
  houseId: string | null
  houseNumber: number | null
  deviceToken: string | null
  isInitialized: boolean
}

const DeviceContext = createContext<DeviceInfo>({
  houseId: null,
  houseNumber: null,
  deviceToken: null,
  isInitialized: false,
})

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DeviceInfo>({
    houseId: null,
    houseNumber: null,
    deviceToken: null,
    isInitialized: false,
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const urlHid = urlParams.get('hid')

    if (urlToken) {
      localStorage.setItem('glamp-device-token', urlToken)
      if (urlHid) localStorage.setItem('glamp-house-id', urlHid)
      window.history.replaceState({}, '', window.location.pathname)
    }

    const token = localStorage.getItem('glamp-device-token')
    const houseId = localStorage.getItem('glamp-house-id')
    setInfo({
      houseId: houseId || null,
      houseNumber: null,
      deviceToken: token || null,
      isInitialized: true,
    })

    if (houseId) {
      fetch('/api/houses')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const houses = data?.data
          if (Array.isArray(houses)) {
            const house = houses.find((h: { id: string }) => h.id === houseId)
            if (house) setInfo(prev => ({ ...prev, houseNumber: house.number }))
          }
        })
        .catch(() => {})

      fetch('/api/houses/sessions')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const sessions = data?.data
          if (Array.isArray(sessions)) {
            const session = sessions.find((s: { houseId: string; isActive: boolean }) => s.houseId === houseId && s.isActive)
            if (session?.lang) {
              i18n.changeLanguage(session.lang)
              localStorage.setItem('glamp-lang', session.lang)
            }
          }
        })
        .catch(() => {})
    }
  }, [])

  return (
    <DeviceContext.Provider value={info}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevice() {
  return useContext(DeviceContext)
}
