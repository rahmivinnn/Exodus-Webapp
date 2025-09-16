import { useState, useEffect } from 'react'
import type {
  ShippingMetrics,
  CarrierPerformance,
  RouteEfficiency,
  AnalyticsReport,
  CustomDashboard
} from '@/lib/greenscreens-api'

interface DateRange {
  start: string
  end: string
}

// Hook for shipping metrics
export function useShippingMetrics(dateRange?: DateRange) {
  const [metrics, setMetrics] = useState<ShippingMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('start_date', dateRange.start)
        params.append('end_date', dateRange.end)
      }

      const response = await fetch(`/api/greenscreens/analytics/metrics?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shipping metrics')
      }

      setMetrics(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [dateRange?.start, dateRange?.end])

  return { metrics, loading, error, refetch: fetchMetrics }
}

// Hook for carrier performance
export function useCarrierPerformance(dateRange?: DateRange) {
  const [performance, setPerformance] = useState<CarrierPerformance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformance = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('start_date', dateRange.start)
        params.append('end_date', dateRange.end)
      }

      const response = await fetch(`/api/greenscreens/analytics/carriers?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch carrier performance')
      }

      setPerformance(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
  }, [dateRange?.start, dateRange?.end])

  return { performance, loading, error, refetch: fetchPerformance }
}

// Hook for route efficiency
export function useRouteEfficiency(dateRange?: DateRange) {
  const [efficiency, setEfficiency] = useState<RouteEfficiency[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEfficiency = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('start_date', dateRange.start)
        params.append('end_date', dateRange.end)
      }

      const response = await fetch(`/api/greenscreens/analytics/routes?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch route efficiency')
      }

      setEfficiency(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEfficiency()
  }, [dateRange?.start, dateRange?.end])

  return { efficiency, loading, error, refetch: fetchEfficiency }
}

// Hook for analytics reports
export function useAnalyticsReports() {
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (dateRange: DateRange, reportType?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date_range: dateRange,
          report_type: reportType || 'comprehensive'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate analytics report')
      }

      setReport(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { report, loading, error, generateReport }
}

// Hook for custom dashboards
export function useCustomDashboards() {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboards = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/analytics/dashboards')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch custom dashboards')
      }

      setDashboards(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const saveDashboard = async (dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/analytics/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboard)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save custom dashboard')
      }

      await fetchDashboards() // Refresh the list
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDashboard = async (dashboardId: string, updates: Partial<CustomDashboard>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/greenscreens/analytics/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update custom dashboard')
      }

      await fetchDashboards() // Refresh the list
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboards()
  }, [])

  return {
    dashboards,
    loading,
    error,
    refetch: fetchDashboards,
    saveDashboard,
    updateDashboard
  }
}

// Hook for date range management
export function useDateRange(defaultRange?: DateRange) {
  const [dateRange, setDateRange] = useState<DateRange>(
    defaultRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    }
  )

  const updateDateRange = (newRange: Partial<DateRange>) => {
    setDateRange(prev => ({ ...prev, ...newRange }))
  }

  const setPresetRange = (preset: 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth') => {
    const now = new Date()
    let start: Date
    let end: Date = new Date()

    switch (preset) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    })
  }

  return { dateRange, updateDateRange, setPresetRange }
}