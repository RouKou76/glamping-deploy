import React from 'react'

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline'
export interface ConnectionBannerProps { status: ConnectionStatus }

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status }) => {
  if (status === 'connected') return null
  const isReconnecting = status === 'reconnecting'
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium ${isReconnecting ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
      <span className={isReconnecting ? 'animate-spin' : ''}>{isReconnecting ? '↻' : '✕'}</span>
      {isReconnecting ? 'Переподключение...' : 'Нет соединения — отправка заявок недоступна'}
    </div>
  )
}
