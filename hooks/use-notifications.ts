import { useState, useEffect, useCallback } from 'react'
import type {
  Notification,
  NotificationPreferences,
  NotificationType
} from '@/lib/greenscreens-api'

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotifications = useCallback(async (pageNum = 1, unreadOnly = false, append = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/greenscreens/notifications?page=${pageNum}&limit=20&unread_only=${unreadOnly}`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch notifications')
      }

      const { notifications: newNotifications, total, unread } = result.data
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications])
      } else {
        setNotifications(newNotifications)
      }
      
      setTotalCount(total)
      setUnreadCount(unread)
      setHasMore(newNotifications.length === 20)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/greenscreens/notifications/${notificationId}/read`,
        { method: 'PUT' }
      )
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to mark notification as read')
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/greenscreens/notifications/read-all', {
        method: 'PUT'
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to mark all notifications as read')
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/greenscreens/notifications/${notificationId}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete notification')
      }

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setTotalCount(prev => prev - 1)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, false, true)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    unreadCount,
    totalCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refetch: () => fetchNotifications(1)
  }
}

// Hook for notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/notifications/preferences')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch notification preferences')
      }

      setPreferences(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update notification preferences')
      }

      setPreferences(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  }
}

// Hook for push notification subscription
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch (err) {
      console.error('Error checking push subscription:', err)
    }
  }

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    setLoading(true)
    setError(null)

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      const response = await fetch('/api/greenscreens/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)))
          }
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to subscribe to push notifications')
      }

      setSubscription(sub)
      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!subscription) return

    setLoading(true)
    setError(null)

    try {
      await subscription.unsubscribe()
      
      // Notify server (optional - server can handle expired subscriptions)
      // await fetch('/api/greenscreens/notifications/unsubscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ endpoint: subscription.endpoint })
      // })

      setSubscription(null)
      setIsSubscribed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscription
  }
}

// Hook for real-time notifications (using polling or WebSocket)
export function useRealTimeNotifications(interval = 30000) {
  const { fetchNotifications, unreadCount } = useNotifications()
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(() => {
      fetchNotifications(1, true) // Fetch only unread notifications
    }, interval)

    return () => clearInterval(pollInterval)
  }, [isPolling, interval, fetchNotifications])

  const startPolling = () => setIsPolling(true)
  const stopPolling = () => setIsPolling(false)

  return {
    isPolling,
    unreadCount,
    startPolling,
    stopPolling
  }
}