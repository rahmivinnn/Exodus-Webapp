'use client'

import { useState, useEffect } from 'react'
import { CarrierProfile, CarrierQuote, CarrierQuoteRequest } from '@/lib/greenscreens-api'

interface UseCarrierProfilesOptions {
  serviceArea?: string
  equipmentType?: string
  minRating?: number
}

export function useCarrierProfiles(options: UseCarrierProfilesOptions = {}) {
  const [carriers, setCarriers] = useState<CarrierProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCarriers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (options.serviceArea) params.append('service_area', options.serviceArea)
      if (options.equipmentType) params.append('equipment_type', options.equipmentType)
      if (options.minRating) params.append('min_rating', options.minRating.toString())

      const response = await fetch(`/api/greenscreens/carriers?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch carriers')
      }

      setCarriers(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarriers()
  }, [options.serviceArea, options.equipmentType, options.minRating])

  return {
    carriers,
    loading,
    error,
    refetch: fetchCarriers
  }
}

export function useCarrierQuotes() {
  const [quotes, setQuotes] = useState<CarrierQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQuotes = async (request: CarrierQuoteRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/carriers/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get quotes')
      }

      setQuotes(data.data || [])
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
    quotes,
    loading,
    error,
    getQuotes
  }
}

export function useCarrierSelection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectCarrier = async (carrierId: string, quoteId: string, shipmentDetails?: any, notes?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/greenscreens/carriers/${carrierId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          shipmentDetails,
          notes
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to select carrier')
      }

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
    loading,
    error,
    selectCarrier
  }
}

export function useCarrierBids() {
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBids = async (request: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/carriers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get carrier bids')
      }

      setBids(data.data || [])
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
    bids,
    loading,
    error,
    getBids
  }
}