import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiPost } from '@glamping/api'

export interface GlampInfo {
  title: string
  phone: string
  wifiName: string
  wifiPassword: string
  rules: string
  description: string
  servicesText: string
}

const DEFAULT_INFO: GlampInfo = {
  title: 'Глэмпинг "Пример названия"',
  phone: '+7 (999) 123-45-67',
  wifiName: 'Glamp_Guest',
  wifiPassword: 'forest2026',
  rules: '• Тихий час с 23:00 до 8:00\n• Курение только в отведённых местах\n• Выезд до 12:00',
  description: 'Добро пожаловать в наш глэмпинг! Здесь вы сможете насладиться природой без отрыва от комфорта. Наша команда всегда готова помочь вам. Обратите внимание, что заказ еды необходимо делать минимум за 1 час.',
  servicesText: 'Мы предоставляем: питание по меню, услуги трансфера, уборку домиков, пополнение мини-бара и свежие полотенца по запросу.',
}

interface GlampInfoContextType {
  info: GlampInfo
  loading: boolean
  updateInfo: (patch: Partial<GlampInfo>) => void
}

const GlampInfoContext = createContext<GlampInfoContextType>({
  info: DEFAULT_INFO,
  loading: false,
  updateInfo: () => {},
})

export function GlampInfoProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<GlampInfo>(DEFAULT_INFO)
  const [loading, setLoading] = useState(true)

  const fetchInfo = useCallback(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) setInfo(data.data)
        else {
          const saved = localStorage.getItem('glamp-info')
          if (saved) setInfo({ ...DEFAULT_INFO, ...JSON.parse(saved) })
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('glamp-info')
        if (saved) setInfo({ ...DEFAULT_INFO, ...JSON.parse(saved) })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchInfo() }, [fetchInfo])

  useEffect(() => {
    const handler = () => fetchInfo()
    window.addEventListener('glamp:data:refresh', handler)
    return () => window.removeEventListener('glamp:data:refresh', handler)
  }, [fetchInfo])

  function updateInfo(patch: Partial<GlampInfo>) {
    setInfo(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('glamp-info', JSON.stringify(next))
      apiPost('/api/settings', next).catch(() => {})
      return next
    })
  }

  return (
    <GlampInfoContext.Provider value={{ info, loading, updateInfo }}>
      {children}
    </GlampInfoContext.Provider>
  )
}

export function useGlampInfo() {
  return useContext(GlampInfoContext)
}
