'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RatePrediction, MarketIntelligence, QuoteRequest } from '@/lib/greenscreens-api';

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

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for fetching rate predictions from Greenscreens.ai
 */
export function useRatePrediction(options: UseRatePredictionOptions) {
  const [state, setState] = useState<ApiState<RatePrediction>>({
    data: null,
    loading: false,
    error: null,
  });

  const { origin, destination, equipment = 'van', enabled = true } = options;
  
  // Debounce the parameters to avoid excessive API calls
  const debouncedOrigin = useDebounce(origin, 500);
  const debouncedDestination = useDebounce(destination, 500);
  const debouncedEquipment = useDebounce(equipment, 300);

  const fetchRatePrediction = useCallback(async () => {
    if (!enabled || !debouncedOrigin || !debouncedDestination) return;

    const cacheKey = `rate-${debouncedOrigin}-${debouncedDestination}-${debouncedEquipment}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState({ data: cached.data, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        origin: debouncedOrigin,
        destination: debouncedDestination,
        equipment: debouncedEquipment,
      });

      const response = await fetch(`/api/greenscreens/rates?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rate prediction');
      }

      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, { data, timestamp: Date.now() });
      
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [debouncedOrigin, debouncedDestination, debouncedEquipment, enabled]);

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
export function useMarketIntelligence(options: UseMarketIntelligenceOptions) {
  const [state, setState] = useState<ApiState<MarketIntelligence>>({
    data: null,
    loading: false,
    error: null,
  });

  const { origin, destination, enabled = true } = options;
  
  // Debounce the parameters
  const debouncedOrigin = useDebounce(origin, 500);
  const debouncedDestination = useDebounce(destination, 500);

  const fetchMarketIntelligence = useCallback(async () => {
    if (!enabled || !debouncedOrigin || !debouncedDestination) return;

    const cacheKey = `market-${debouncedOrigin}-${debouncedDestination}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState({ data: cached.data, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        origin: debouncedOrigin,
        destination: debouncedDestination,
        type: 'intelligence',
      });

      const response = await fetch(`/api/greenscreens/market?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market intelligence');
      }

      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, { data, timestamp: Date.now() });
      
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [debouncedOrigin, debouncedDestination, enabled]);

  useEffect(() => {
    fetchMarketIntelligence();
  }, [fetchMarketIntelligence]);

  return {
    ...state,
    refetch: fetchMarketIntelligence,
  };
}

/**
 * Hook for fetching market trends from Greenscreens.ai
 */
export function useMarketTrends(region?: string, enabled = true) {
  const [state, setState] = useState<ApiState<{ trends: MarketIntelligence[] }>>({
    data: null,
    loading: false,
    error: null,
  });

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