/**
 * Clean and minimal TypeScript types for the logistics application
 */

// Base API response structure
export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Equipment types
export type EquipmentType = 
  | 'dry_van'
  | 'reefer'
  | 'flatbed'
  | 'step_deck'
  | 'van';

// Shipment status
export type ShipmentStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'delayed'
  | 'cancelled';

// Market activity levels
export type MarketActivity = 'high' | 'medium' | 'low';

// Rate trends
export type RateTrend = 'increasing' | 'decreasing' | 'stable';

// Rate prediction response
export interface RatePrediction {
  lane: string;
  origin: string;
  destination: string;
  predictedRate: number;
  networkRate: number;
  confidence: number;
  marketActivity: MarketActivity;
  lastUpdated: string;
  equipment?: EquipmentType;
}

// Market intelligence response
export interface MarketIntelligence {
  lane: string;
  averageRate7Days: number;
  averageRate15Days: number;
  averageRate30Days: number;
  trend: RateTrend;
  volume: number;
  marketActivity: MarketActivity;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Component props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: any;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
  refetch?: () => Promise<void>;
}