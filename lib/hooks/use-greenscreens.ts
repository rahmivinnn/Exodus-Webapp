'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RatePrediction, MarketIntelligence, CarrierBid, QuoteRequest } from '@/lib/greenscreens-api';

interface UseRatePredictionOptions {
  origin: string;
  destination: string;
  equipment?: string;
  enabled?: boolean;
}

interface UseMarketIntelligenceOptions {
  origin: string;
  destination: string;
  enabled?: boolean;
}

interface UseCarrierBidsOptions {
  quoteRequest: QuoteRequest;
  enabled?: boolean;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching rate predictions from Greenscreens.ai
 */
export function useRatePrediction(options: UseRatePredictionOptions = {}) {
  const [state, setState] = useState<ApiState<RatePrediction>>({
    data: null,
    loading: false,
    error: null,
  });

  const { origin = '', destination = '', equipment = 'van', enabled = true } = options;

  const fetchRatePrediction = useCallback(async () => {
    if (!enabled || !origin || !destination) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        equipment,
      });

      const response = await fetch(`/api/greenscreens/rates?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rate prediction');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [origin, destination, equipment, enabled]);

  useEffect(() => {
    fetchRatePrediction();
  }, [fetchRatePrediction]);

  return {
    ...state,
    refetch: fetchRatePrediction,
  };
}

/**
 * Hook for fetching market intelligence from Greenscreens.ai
 */
export function useMarketIntelligence(options: UseMarketIntelligenceOptions = {}) {
  const [state, setState] = useState<ApiState<MarketIntelligence>>({
    data: null,
    loading: false,
    error: null,
  });

  const { origin = '', destination = '', enabled = true } = options;

  const fetchMarketIntelligence = useCallback(async () => {
    if (!enabled || !origin || !destination) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        type: 'intelligence',
      });

      const response = await fetch(`/api/greenscreens/market?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market intelligence');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [origin, destination, enabled]);

  useEffect(() => {
    fetchMarketIntelligence();
  }, [fetchMarketIntelligence]);

  return {
    ...state,
    refetch: fetchMarketIntelligence,
  };
}

/**
 * Hook for fetching carrier bids from Greenscreens.ai
 */
export function useCarrierBids(options: UseCarrierBidsOptions) {
  const [state, setState] = useState<ApiState<CarrierBid[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const { quoteRequest, enabled = true } = options;

  const fetchCarrierBids = useCallback(async () => {
    if (!enabled || !quoteRequest.origin || !quoteRequest.destination) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/greenscreens/carriers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch carrier bids');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [quoteRequest, enabled]);

  const requestBids = useCallback(() => {
    fetchCarrierBids();
  }, [fetchCarrierBids]);

  return {
    ...state,
    requestBids,
    refetch: fetchCarrierBids,
  };
}

/**
 * Hook for fetching market trends from Greenscreens.ai
 */
export function useMarketTrends(options: UseMarketIntelligenceOptions = {}) {
  const [state, setState] = useState<ApiState<{ trends: MarketIntelligence[] }>>({
    data: null,
    loading: false,
    error: null,
  });

  const { region = '', enabled = true } = options;
  
  const fetchMarketTrends = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        type: 'trends',
        ...(region && { region }),
      });

      const response = await fetch(`/api/greenscreens/market?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market trends');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [region, enabled]);

  useEffect(() => {
    fetchMarketTrends();
  }, [fetchMarketTrends]);

  return {
    ...state,
    refetch: fetchMarketTrends,
  };
}

/**
 * Hook for checking Greenscreens.ai API health
 */
export function useGreenscreensHealth() {
  const [state, setState] = useState<ApiState<{ status: string; connected: boolean }>>({
    data: null,
    loading: false,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/greenscreens/health');
      const data = await response.json();
      
      setState({ 
        data, 
        loading: false, 
        error: response.ok ? null : data.message 
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...state,
    checkHealth,
  };
}