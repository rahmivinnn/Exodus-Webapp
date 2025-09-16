import { useState, useEffect } from 'react'
import type { ShipmentTracking, CreateShipmentRequest } from '@/lib/greenscreens-api'

interface UseShipmentTrackingResult {
  shipment: ShipmentTracking | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useShipmentTracking(shipmentId: string): UseShipmentTrackingResult {
  const [shipment, setShipment] = useState<ShipmentTracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShipmentTracking = async () => {
    if (!shipmentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/greenscreens/shipments/${shipmentId}/tracking`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch shipment tracking')
      }

      if (data.success) {
        setShipment(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch shipment tracking')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShipmentTracking()
  }, [shipmentId])

  return {
    shipment,
    loading,
    error,
    refetch: fetchShipmentTracking
  }
}

interface UseShipmentsResult {
  shipments: ShipmentTracking[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface ShipmentFilters {
  status?: ShipmentTracking['status']
  origin?: string
  destination?: string
  dateFrom?: string
  dateTo?: string
}

export function useShipments(filters?: ShipmentFilters): UseShipmentsResult {
  const [shipments, setShipments] = useState<ShipmentTracking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShipments = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.origin) params.append('origin', filters.origin)
      if (filters?.destination) params.append('destination', filters.destination)
      if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters?.dateTo) params.append('date_to', filters.dateTo)

      const url = `/api/greenscreens/shipments${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch shipments')
      }

      if (data.success) {
        setShipments(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch shipments')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [filters?.status, filters?.origin, filters?.destination, filters?.dateFrom, filters?.dateTo])

  return {
    shipments,
    loading,
    error,
    refetch: fetchShipments
  }
}

interface UseCreateShipmentResult {
  createShipment: (shipmentData: CreateShipmentRequest) => Promise<ShipmentTracking | null>
  loading: boolean
  error: string | null
}

export function useCreateShipment(): UseCreateShipmentResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createShipment = async (shipmentData: CreateShipmentRequest): Promise<ShipmentTracking | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/greenscreens/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shipment')
      }

      if (data.success) {
        return data.data
      } else {
        throw new Error(data.error || 'Failed to create shipment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createShipment,
    loading,
    error
  }
}

interface UseUpdateShipmentStatusResult {
  updateStatus: (shipmentId: string, status: ShipmentTracking['status'], location?: string) => Promise<ShipmentTracking | null>
  loading: boolean
  error: string | null
}

export function useUpdateShipmentStatus(): UseUpdateShipmentStatusResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (
    shipmentId: string, 
    status: ShipmentTracking['status'], 
    location?: string
  ): Promise<ShipmentTracking | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/greenscreens/shipments/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, location }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update shipment status')
      }

      if (data.success) {
        return data.data
      } else {
        throw new Error(data.error || 'Failed to update shipment status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateStatus,
    loading,
    error
  }
}