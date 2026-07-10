import { describe, it, expect } from 'vitest'

describe('GlampInfoContext', () => {
  it('has default info values', () => {
    const DEFAULT_INFO = {
      phone: '+7 (999) 123-45-67',
      wifiName: 'Glamp_Guest',
      wifiPassword: 'forest2026',
      rules: 'Тихий час с 23:00 до 8:00',
      description: 'Добро пожаловать!',
      servicesText: 'Мы предоставляем питание.',
    }
    expect(DEFAULT_INFO.phone).toBeTruthy()
    expect(DEFAULT_INFO.wifiName).toBeTruthy()
    expect(DEFAULT_INFO.wifiPassword).toBeTruthy()
  })

  it('updateInfo merges patch with existing', () => {
    const info = { phone: '123', wifiName: 'test', wifiPassword: 'pass', rules: '', description: '', servicesText: '' }
    const patch = { phone: '456' }
    const next = { ...info, ...patch }
    expect(next.phone).toBe('456')
    expect(next.wifiName).toBe('test')
  })
})
