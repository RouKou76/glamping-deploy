import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiPost } from '@glamping/api'

interface DeviceInfo {
  houseId: string | null
  deviceToken: string | null
  isInitialized: boolean
}

const DeviceContext = createContext<DeviceInfo>({
  houseId: null,
  deviceToken: null,
  isInitialized: false,
})

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DeviceInfo>({
    houseId: null,
    deviceToken: null,
    isInitialized: false,
  })

  useEffect(() => {
    const token = localStorage.getItem('glamp-device-token')
    const houseId = localStorage.getItem('glamp-house-id')
    setInfo({
      houseId: houseId || null,
      deviceToken: token || null,
      isInitialized: true,
    })
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

export function useDeviceSetup() {
  const setup = useCallback(async (token: string) => {
    // Validate token by making a request with it
    const response = await fetch('/api/houses', {
      headers: { 'X-Device-Token': token, 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Invalid token')

    // Get house info from device guard — use a simple endpoint
    const res = await apiPost<{ houseId: string; number: number }>('/api/auth/me', {}).catch(() => null)
    // Since we can't call /api/auth/me with device token, we extract houseId from token format: glamp-{number}-{hex}
    const match = token.match(/^glamp-(\d+)-/)
    if (!match) throw new Error('Invalid token format')

    localStorage.setItem('glamp-device-token', token)
    // We'll set houseId from the token number
    window.location.reload()
  }, [])

  return { setup }
}

export function setDeviceToken(token: string, houseId: string) {
  localStorage.setItem('glamp-device-token', token)
  localStorage.setItem('glamp-house-id', houseId)
}

export function clearDevice() {
  localStorage.removeItem('glamp-device-token')
  localStorage.removeItem('glamp-house-id')
}
