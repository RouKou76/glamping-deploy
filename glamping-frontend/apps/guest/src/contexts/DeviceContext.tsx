import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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
