'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, X, Check, Trash2, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useNotifications,
  useNotificationPreferences,
  usePushNotifications,
  useRealTimeNotifications
} from '@/hooks/use-notifications'
import type { Notification, NotificationType } from '@/lib/greenscreens-api'

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const {
    notifications,
    unreadCount,
    totalCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refetch
  } = useNotifications()

  const {
    preferences,
    loading: preferencesLoading,
    error: preferencesError,
    updatePreferences
  } = useNotificationPreferences()

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    error: pushError,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush
  } = usePushNotifications()

  const { isPolling, startPolling, stopPolling } = useRealTimeNotifications()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    // Start real-time polling when component mounts
    startPolling()
    return () => stopPolling()
  }, [])

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  )

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'shipment_created':
      case 'shipment_picked_up':
      case 'shipment_in_transit':
      case 'shipment_delivered':
        return '📦'
      case 'shipment_delayed':
      case 'shipment_exception':
        return '⚠️'
      case 'route_optimized':
        return '🗺️'
      case 'carrier_assigned':
        return '🚛'
      case 'system_maintenance':
        return '🔔'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'shipment_created':
      case 'shipment_picked_up':
      case 'shipment_in_transit':
      case 'shipment_delivered':
        return 'bg-blue-100 text-blue-800'
      case 'shipment_delayed':
      case 'shipment_exception':
        return 'bg-red-100 text-red-800'
      case 'route_optimized':
        return 'bg-purple-100 text-purple-800'
      case 'carrier_assigned':
        return 'bg-orange-100 text-orange-800'
      case 'system_maintenance':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    onNotificationClick?.(notification)
  }

  const handlePreferenceChange = async (type: NotificationType, enabled: boolean) => {
    if (!preferences) return
    
    try {
      await updatePreferences({
        ...preferences,
        [type]: enabled
      })
    } catch (err) {
      console.error('Failed to update preferences:', err)
    }
  }

  const handlePushToggle = async () => {
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush()
      } else {
        await subscribeToPush()
      }
    } catch (err) {
      console.error('Failed to toggle push notifications:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'All' : 'Unread'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('unread')}>
                Unread Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>
                  Manage your notification preferences
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="push">Push Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preferences" className="space-y-4">
                  {preferencesLoading ? (
                    <div className="text-center py-4">Loading preferences...</div>
                  ) : preferencesError ? (
                    <Alert>
                      <AlertDescription>{preferencesError}</AlertDescription>
                    </Alert>
                  ) : preferences ? (
                    <div className="space-y-4">
                      {Object.entries(preferences).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Label htmlFor={type} className="text-sm font-medium">
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Switch
                            id={type}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              handlePreferenceChange(type as NotificationType, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </TabsContent>
                
                <TabsContent value="push" className="space-y-4">
                  {!pushSupported ? (
                    <Alert>
                      <AlertDescription>
                        Push notifications are not supported in this browser.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Browser Push Notifications
                        </Label>
                        <Switch
                          checked={pushSubscribed}
                          onCheckedChange={handlePushToggle}
                          disabled={pushLoading}
                        />
                      </div>
                      
                      {pushError && (
                        <Alert>
                          <AlertDescription>{pushError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Enable to receive notifications even when the app is closed.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      )}

      {/* Error Display - Only show if there's a real error, not just empty notifications */}
      {error && error !== 'Greenscreens.ai API not configured' && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filter === 'all' ? 'All Notifications' : 'Unread Notifications'}
          </CardTitle>
          <CardDescription>
            {filteredNotifications.length} of {totalCount} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center space-y-2">
                  <Bell className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p className="text-sm">
                    {filter === 'unread' 
                      ? 'All caught up! Check back later for new updates.'
                      : 'You\'ll see notifications here when shipments are created or updated.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-background'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getNotificationColor(notification.type)}`}
                              >
                                {notification.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleString()}
                              </span>
                              {!notification.read && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator />}
                  </div>
                ))}
                
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Real-time updates: {isPolling ? 'Active' : 'Inactive'}
        </span>
        <span>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      {/* API Configuration Notice */}
      {typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_GREENSCREENS_API_KEY && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-blue-800 font-medium">API Not Configured</p>
              <p className="text-blue-700">
                To see real notifications, configure the Greenscreens.ai API key in your environment variables.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}