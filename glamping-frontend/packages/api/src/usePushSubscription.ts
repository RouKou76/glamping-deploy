import { useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function subscribeToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const reg = await navigator.serviceWorker.ready

    const existing = await reg.pushManager.getSubscription()
    if (existing) return true

    const keyRes = await fetch(`${API_BASE}/api/push/vapid-key`)
    const { publicKey } = await keyRes.json()
    if (!publicKey) return false

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    const sub = subscription.toJSON()
    await fetch(`${API_BASE}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: sub.keys?.p256dh ?? '',
        p256da: sub.keys?.p256da ?? '',
      }),
    })

    return true
  } catch {
    return false
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.getSubscription()
    if (!subscription) return

    await fetch(`${API_BASE}/api/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })

    await subscription.unsubscribe()
  } catch {
    // ignore
  }
}

export function usePushSubscription() {
  const subscribe = useCallback(async () => {
    await subscribeToPush()
  }, [])

  const unsubscribe = useCallback(async () => {
    await unsubscribeFromPush()
  }, [])

  useEffect(() => {
    subscribe()
  }, [subscribe])

  return { subscribe, unsubscribe }
}
