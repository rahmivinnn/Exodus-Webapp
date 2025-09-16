/**
 * Comprehensive TypeScript types for the logistics application
 */

// Base API response structure
export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Common pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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

// Contact information
export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

// Equipment types
export type EquipmentType = 
  | 'dry_van'
  | 'reefer'
  | 'flatbed'
  | 'step_deck'
  | 'lowboy'
  | 'tanker'
  | 'container'
  | 'van';

// Service types
export type ServiceType = 
  | 'standard'
  | 'expedited'
  | 'overnight'
  | 'white_glove'
  | 'dedicated';

// Shipment status
export type ShipmentStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'delayed'
  | 'cancelled'
  | 'exception';

// Market activity levels
export type MarketActivity = 'high' | 'medium' | 'low';

// Rate trends
export type RateTrend = 'increasing' | 'decreasing' | 'stable';

// Notification types
export type NotificationType = 
  | 'shipment_created'
  | 'shipment_picked_up'
  | 'shipment_in_transit'
  | 'shipment_delivered'
  | 'shipment_delayed'
  | 'shipment_exception'
  | 'carrier_assigned'
  | 'route_optimized'
  | 'cost_alert'
  | 'performance_alert'
  | 'system_maintenance'
  | 'document_required';

// Document types
export type DocumentType = 
  | 'bill_of_lading'
  | 'commercial_invoice'
  | 'packing_list'
  | 'customs_declaration'
  | 'certificate_of_origin'
  | 'insurance_certificate'
  | 'delivery_receipt'
  | 'proof_of_delivery'
  | 'other';

// Document status
export type DocumentStatus = 
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'expired';

// Cargo information
export interface CargoInfo {
  description: string;
  weight: number; // in pounds
  dimensions: {
    length: number; // in feet
    width: number;  // in feet
    height: number; // in feet
  };
  value: number; // in USD
  specialInstructions?: string;
  commodity?: string;
}

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

// Carrier information
export interface CarrierInfo {
  carrierId: string;
  name: string;
  logoUrl?: string;
  rating: number;
  totalReviews: number;
  serviceAreas: string[];
  equipmentTypes: EquipmentType[];
  specialties: string[];
  contact: ContactInfo;
  insurance: {
    coverageAmount: number;
    provider: string;
    policyNumber: string;
  };
  certifications: string[];
  performanceMetrics: {
    onTimeDelivery: number;
    damageRate: number;
    customerSatisfaction: number;
    responseTime: number;
  };
}

// Quote request
export interface QuoteRequest {
  origin: Address;
  destination: Address;
  cargo: CargoInfo;
  serviceType: ServiceType;
  pickupDate: string;
  deliveryDate: string;
  equipmentType?: EquipmentType;
  carrierId?: string;
}

// Quote response
export interface QuoteResponse {
  quoteId: string;
  carrier: CarrierInfo;
  totalCost: number;
  breakdown: {
    baseRate: number;
    fuelSurcharge: number;
    additionalFees: number;
    taxes: number;
    insurance: number;
  };
  transitTime: {
    estimatedDays: number;
    pickupWindow: string;
    deliveryWindow: string;
  };
  serviceLevel: string;
  equipmentType: EquipmentType;
  termsAndConditions: string[];
  validUntil: string;
  specialNotes?: string;
}

// Shipment tracking
export interface ShipmentTracking {
  shipmentId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  currentLocation: Address;
  origin: Address;
  destination: Address;
  carrier: CarrierInfo;
  timeline: {
    pickupScheduled: string;
    pickupActual?: string;
    deliveryScheduled: string;
    deliveryEstimated: string;
    deliveryActual?: string;
  };
  milestones: ShipmentMilestone[];
  documents: ShipmentDocument[];
  alerts: ShipmentAlert[];
}

// Shipment milestone
export interface ShipmentMilestone {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Shipment document
export interface ShipmentDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  status: DocumentStatus;
}

// Shipment alert
export interface ShipmentAlert {
  id: string;
  type: 'delay' | 'weather' | 'traffic' | 'breakdown' | 'delivery_exception';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Route optimization
export interface RouteWaypoint {
  id: string;
  address: Address;
  type: 'pickup' | 'delivery' | 'stop';
  timeWindow?: {
    start: string;
    end: string;
  };
  serviceTime?: number; // minutes
  priority?: number;
}

export interface RouteOptimizationRequest {
  waypoints: RouteWaypoint[];
  vehicleType: string;
  constraints?: {
    maxDistance?: number;
    maxDuration?: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  };
  optimization?: 'distance' | 'time' | 'fuel' | 'cost';
}

export interface OptimizedRoute {
  id: string;
  waypoints: RouteWaypoint[];
  totalDistance: number; // miles
  totalDuration: number; // minutes
  estimatedFuel: number; // gallons
  estimatedCost: number;
  routeGeometry: string; // encoded polyline
  instructions: RouteInstruction[];
  alternatives?: OptimizedRoute[];
}

export interface RouteInstruction {
  step: number;
  instruction: string;
  distance: number;
  duration: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Analytics interfaces
export interface ShippingMetrics {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  delayedShipments: number;
  totalRevenue: number;
  averageTransitTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore: number;
}

export interface CarrierPerformance {
  carrierId: string;
  carrierName: string;
  totalShipments: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  averageRating: number;
  totalCost: number;
  averageCost: number;
  issues: number;
}

// Notification interfaces
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  types: NotificationType[];
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule;
}

// API endpoint types
export type ApiEndpoint = 
  | '/api/greenscreens/rates'
  | '/api/greenscreens/market'
  | '/api/greenscreens/carriers'
  | '/api/greenscreens/shipments'
  | '/api/greenscreens/health'
  | '/api/greenscreens/analytics'
  | '/api/greenscreens/routes'
  | '/api/greenscreens/notifications'
  | '/api/greenscreens/documents';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API request configuration
export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  duration: number; // in milliseconds
  maxSize: number;
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
}

// Environment configuration
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiBaseUrl: string;
  apiKey: string;
  timeout: number;
  cache: CacheConfig;
}

// Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface ValidationError extends Error {
  field: string;
  value: any;
  rule: string;
}

// Component props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
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