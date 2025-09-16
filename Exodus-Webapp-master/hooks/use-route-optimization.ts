'use client'

import { useState, useEffect } from 'react'
import { 
  RouteOptimizationRequest, 
  OptimizedRoute, 
  RouteAnalytics, 
  MultiRouteOptimization,
  RouteWaypoint 
} from '@/lib/greenscreens-api'

export function useRouteOptimization() {
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimizeRoute = async (request: RouteOptimizationRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/routes/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize route')
      }

      setOptimizedRoute(data.data)
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const clearRoute = () => {
    setOptimizedRoute(null)
    setError(null)
  }

  return {
    optimizedRoute,
    loading,
    error,
    optimizeRoute,
    clearRoute
  }
}

export function useMultiRouteOptimization() {
  const [optimization, setOptimization] = useState<MultiRouteOptimization | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimizeMultipleRoutes = async (requests: RouteOptimizationRequest[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/routes/optimize/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeRequests: requests }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize multiple routes')
      }

      setOptimization(data.data)
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    optimization,
    loading,
    error,
    optimizeMultipleRoutes
  }
}

export function useRouteAnalytics(routeId?: string) {
  const [analytics, setAnalytics] = useState<RouteAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/greenscreens/routes/${id}/analytics`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch route analytics')
      }

      setAnalytics(data.data)
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (routeId) {
      fetchAnalytics(routeId)
    }
  }, [routeId])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics
  }
}

export function useSavedRoutes() {
  const [routes, setRoutes] = useState<OptimizedRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedRoutes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/routes/saved')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved routes')
      }

      setRoutes(data.data || [])
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const saveRoute = async (route: OptimizedRoute, name?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/routes/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save route')
      }

      // Refresh the saved routes list
      await fetchSavedRoutes()
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedRoutes()
  }, [])

  return {
    routes,
    loading,
    error,
    fetchSavedRoutes,
    saveRoute
  }
}

export function useWaypointManager() {
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([])

  const addWaypoint = (waypoint: Omit<RouteWaypoint, 'id'>) => {
    const newWaypoint: RouteWaypoint = {
      ...waypoint,
      id: `waypoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setWaypoints(prev => [...prev, newWaypoint])
    return newWaypoint
  }

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }

  const updateWaypoint = (id: string, updates: Partial<RouteWaypoint>) => {
    setWaypoints(prev => prev.map(wp => 
      wp.id === id ? { ...wp, ...updates } : wp
    ))
  }

  const reorderWaypoints = (startIndex: number, endIndex: number) => {
    setWaypoints(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  const clearWaypoints = () => {
    setWaypoints([])
  }

  return {
    waypoints,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    reorderWaypoints,
    clearWaypoints,
    setWaypoints
  }
}