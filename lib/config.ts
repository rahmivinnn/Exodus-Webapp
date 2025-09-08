/**
 * Configuration for Greenscreens.ai API integration
 */

import { GreenscreensConfig } from './greenscreens-api';

// Environment variables for Greenscreens.ai API
const GREENSCREENS_API_KEY = process.env.GREENSCREENS_API_KEY || process.env.NEXT_PUBLIC_GREENSCREENS_API_KEY;
const GREENSCREENS_BASE_URL = process.env.GREENSCREENS_BASE_URL || 'https://connect.greenscreens.ai';
const GREENSCREENS_TIMEOUT = parseInt(process.env.GREENSCREENS_TIMEOUT || '10000');

// Validate required environment variables
if (!GREENSCREENS_API_KEY) {
  console.warn('Warning: GREENSCREENS_API_KEY environment variable is not set');
}

// Default configuration for Greenscreens.ai API
export const greenscreensConfig: GreenscreensConfig = {
  apiKey: GREENSCREENS_API_KEY || '',
  baseUrl: GREENSCREENS_BASE_URL,
  timeout: GREENSCREENS_TIMEOUT,
};

// API endpoints configuration
export const API_ENDPOINTS = {
  RATE_PREDICTION: '/api/v1/rates/predict',
  MARKET_INTELLIGENCE: '/api/v1/market/intelligence',
  CARRIER_BIDS: '/api/v1/carriers/bids',
  BATCH_RATES: '/api/v1/rates/batch',
  MARKET_TRENDS: '/api/v1/market/trends',
  HEALTH_CHECK: '/api/v1/health',
} as const;

// Default request configuration
export const DEFAULT_REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: GREENSCREENS_TIMEOUT,
};

// Equipment types supported by Greenscreens.ai
export const EQUIPMENT_TYPES = {
  VAN: 'van',
  REEFER: 'reefer',
  FLATBED: 'flatbed',
  STEP_DECK: 'step_deck',
  LOWBOY: 'lowboy',
  TANKER: 'tanker',
  CONTAINER: 'container',
} as const;

// Market activity levels
export const MARKET_ACTIVITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// Rate trend directions
export const RATE_TRENDS = {
  INCREASING: 'increasing',
  DECREASING: 'decreasing',
  STABLE: 'stable',
} as const;

// Validation function for API configuration
export function validateConfig(): boolean {
  if (!greenscreensConfig.apiKey) {
    console.error('Greenscreens.ai API key is required but not provided');
    return false;
  }
  
  if (!greenscreensConfig.baseUrl) {
    console.error('Greenscreens.ai base URL is required but not provided');
    return false;
  }
  
  return true;
}

// Helper function to get environment-specific configuration
export function getEnvironmentConfig(): {
  isDevelopment: boolean;
  isProduction: boolean;
  apiKey: string;
  baseUrl: string;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    isDevelopment,
    isProduction,
    apiKey: greenscreensConfig.apiKey,
    baseUrl: greenscreensConfig.baseUrl,
  };
}

export type EquipmentType = typeof EQUIPMENT_TYPES[keyof typeof EQUIPMENT_TYPES];
export type MarketActivity = typeof MARKET_ACTIVITY[keyof typeof MARKET_ACTIVITY];
export type RateTrend = typeof RATE_TRENDS[keyof typeof RATE_TRENDS];

// Export getConfig function for backward compatibility
export const getConfig = () => greenscreensConfig;