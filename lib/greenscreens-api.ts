/**
 * Greenscreens.ai API Service
 * Provides freight intelligence, rate predictions, and market data
 */

interface GreenscreensConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

interface RatePrediction {
  lane: string;
  origin: string;
  destination: string;
  predictedRate: number;
  networkRate: number;
  confidence: number;
  marketActivity: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface MarketIntelligence {
  lane: string;
  averageRate7Days: number;
  averageRate15Days: number;
  averageRate30Days: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volume: number;
}

interface CarrierBid {
  carrierId: string;
  carrierName: string;
  bidAmount: number;
  equipment: string;
  estimatedPickup: string;
  estimatedDelivery: string;
}

interface ShipmentTracking {
  shipment_id: string;
  tracking_number: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  current_location: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  origin: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  carrier: {
    name: string;
    contact: string;
    driver_name?: string;
    driver_phone?: string;
  };
  timeline: {
    pickup_scheduled: string;
    pickup_actual?: string;
    delivery_scheduled: string;
    delivery_estimated: string;
    delivery_actual?: string;
  };
  milestones: ShipmentMilestone[];
  documents: ShipmentDocument[];
  alerts: ShipmentAlert[];
}

interface ShipmentMilestone {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ShipmentDocument {
  id: string;
  type: 'bill_of_lading' | 'delivery_receipt' | 'invoice' | 'pod' | 'other';
  name: string;
  url: string;
  uploaded_at: string;
}

interface ShipmentAlert {
  id: string;
  type: 'delay' | 'weather' | 'traffic' | 'breakdown' | 'delivery_exception';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface CreateShipmentRequest {
  origin: {
    address: string;
    city: string;
    state: string;
    zip: string;
    contact_name: string;
    contact_phone: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    zip: string;
    contact_name: string;
    contact_phone: string;
  };
  cargo: {
    description: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    special_instructions?: string;
  };
  service_type: string;
  pickup_date: string;
  delivery_date: string;
  carrier_id?: string;
}

interface CarrierProfile {
  carrier_id: string;
  name: string;
  logo_url?: string;
  rating: number;
  total_reviews: number;
  service_areas: string[];
  equipment_types: string[];
  specialties: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  insurance: {
    coverage_amount: number;
    provider: string;
    policy_number: string;
  };
  certifications: string[];
  performance_metrics: {
    on_time_delivery: number;
    damage_rate: number;
    customer_satisfaction: number;
    response_time: number;
  };
  pricing: {
    base_rate_per_mile: number;
    fuel_surcharge: number;
    additional_fees: {
      name: string;
      amount: number;
      description: string;
    }[];
  };
}

interface CarrierQuoteRequest {
  origin: {
    city: string;
    state: string;
    zip: string;
  };
  destination: {
    city: string;
    state: string;
    zip: string;
  };
  cargo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    type: string;
    value?: number;
  };
  service_type: 'standard' | 'expedited' | 'overnight' | 'white_glove';
  pickup_date: string;
  delivery_date: string;
  equipment_type?: string;
  special_requirements?: string[];
}

interface CarrierQuote {
  quote_id: string;
  carrier: CarrierProfile;
  total_cost: number;
  breakdown: {
    base_rate: number;
    fuel_surcharge: number;
    additional_fees: number;
    taxes: number;
    insurance: number;
  };
  transit_time: {
    estimated_days: number;
    pickup_window: string;
    delivery_window: string;
  };
  service_level: string;
  equipment_type: string;
  terms_and_conditions: string[];
  valid_until: string;
  special_notes?: string;
}

interface CarrierComparison {
  quotes: CarrierQuote[];
  recommendations: {
    best_price: string;
    fastest_delivery: string;
    highest_rated: string;
    best_value: string;
  };
  market_analysis: {
    average_price: number;
    price_range: {
      min: number;
      max: number;
    };
    average_transit_time: number;
  };
}

// Route Optimization Interfaces
interface RouteWaypoint {
  id: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'pickup' | 'delivery' | 'stop';
  timeWindow?: {
    start: string;
    end: string;
  };
  serviceTime?: number; // minutes
  priority?: number;
}

interface RouteOptimizationRequest {
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

interface OptimizedRoute {
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

interface RouteInstruction {
  step: number;
  instruction: string;
  distance: number;
  duration: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface RouteAnalytics {
  efficiency: number; // percentage
  fuelSavings: number;
  timeSavings: number;
  costSavings: number;
  environmentalImpact: {
    co2Reduction: number;
    fuelReduction: number;
  };
}

interface MultiRouteOptimization {
  routes: OptimizedRoute[];
  totalStats: {
    totalDistance: number;
    totalDuration: number;
    totalCost: number;
    vehiclesUsed: number;
  };
  analytics: RouteAnalytics;
}

// Analytics Dashboard Interfaces
interface ShippingMetrics {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  delayedShipments: number;
  totalRevenue: number;
  averageTransitTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore: number;
}

interface CarrierPerformance {
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

interface RouteEfficiency {
  routeId: string;
  routeName: string;
  totalDistance: number;
  actualDistance: number;
  plannedTime: number;
  actualTime: number;
  fuelEfficiency: number;
  costEfficiency: number;
  utilizationRate: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: ShippingMetrics;
  carrierPerformance: CarrierPerformance[];
  routeEfficiency: RouteEfficiency[];
  trends: {
    shipmentVolume: TimeSeriesData[];
    revenue: TimeSeriesData[];
    costs: TimeSeriesData[];
    onTimeDelivery: TimeSeriesData[];
  };
  insights: {
    topPerformingCarriers: CarrierPerformance[];
    underperformingRoutes: RouteEfficiency[];
    costSavingOpportunities: {
      description: string;
      potentialSavings: number;
      actionRequired: string;
    }[];
    recommendations: string[];
  };
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map';
  title: string;
  data: any;
  config?: {
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeRange?: string;
    refreshInterval?: number;
  };
}

interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: {
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification System Interfaces
interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  types: NotificationType[];
}

interface Notification {
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

type NotificationType = 
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

interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
  isActive: boolean;
}

// Document Management
interface ShippingDocument {
  id: string;
  shipment_id: string;
  type: DocumentType;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  uploaded_by: string;
  uploaded_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

type DocumentType = 
  | 'bill_of_lading'
  | 'commercial_invoice'
  | 'packing_list'
  | 'customs_declaration'
  | 'certificate_of_origin'
  | 'insurance_certificate'
  | 'delivery_receipt'
  | 'proof_of_delivery'
  | 'other';

type DocumentStatus = 
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'expired';

interface DocumentTemplate {
  id: string;
  type: DocumentType;
  name: string;
  description: string;
  template_url: string;
  fields: DocumentField[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  validation?: string;
}

interface DocumentGenerationRequest {
  template_id: string;
  shipment_id: string;
  data: Record<string, any>;
  format?: 'pdf' | 'docx';
}

interface DocumentUploadRequest {
  shipment_id: string;
  type: DocumentType;
  name: string;
  file: File;
  metadata?: Record<string, any>;
}

interface QuoteRequest {
  origin: string;
  destination: string;
  equipment: string;
  weight?: number;
  commodity?: string;
  pickupDate: string;
  deliveryDate?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class GreenscreensAPI {
  private config: GreenscreensConfig;

  constructor(config: GreenscreensConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Greenscreens API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get rate prediction for a specific lane
   */
  async getRatePrediction(
    origin: string,
    destination: string,
    equipment: string = 'van'
  ): Promise<ApiResponse<RatePrediction>> {
    const params = new URLSearchParams({
      origin,
      destination,
      equipment,
    });

    return this.makeRequest<RatePrediction>(
      `/api/v1/rates/predict?${params.toString()}`
    );
  }

  /**
   * Get market intelligence for a lane
   */
  async getMarketIntelligence(
    origin: string,
    destination: string
  ): Promise<ApiResponse<MarketIntelligence>> {
    const params = new URLSearchParams({
      origin,
      destination,
    });

    return this.makeRequest<MarketIntelligence>(
      `/api/v1/market/intelligence?${params.toString()}`
    );
  }

  /**
   * Request carrier bids for a lane
   */
  async getCarrierBids(
    quoteRequest: QuoteRequest
  ): Promise<ApiResponse<CarrierBid[]>> {
    return this.makeRequest<CarrierBid[]>('/api/v1/carriers/bids', {
      method: 'POST',
      body: JSON.stringify(quoteRequest),
    });
  }

  /**
   * Get batch rate predictions for multiple lanes
   */
  async getBatchRates(
    lanes: Array<{ origin: string; destination: string; equipment?: string }>
  ): Promise<ApiResponse<RatePrediction[]>> {
    return this.makeRequest<RatePrediction[]>('/api/v1/rates/batch', {
      method: 'POST',
      body: JSON.stringify({ lanes }),
    });
  }

  /**
   * Get real-time market trends
   */
  async getMarketTrends(
    region?: string
  ): Promise<ApiResponse<{ trends: MarketIntelligence[] }>> {
    const params = region ? new URLSearchParams({ region }) : '';
    return this.makeRequest<{ trends: MarketIntelligence[] }>(
      `/api/v1/market/trends${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Validate API connection and credentials
   */
  async validateConnection(): Promise<ApiResponse<{ status: string }>> {
    return this.makeRequest<{ status: string }>('/api/v1/health');
  }

  /**
   * Create a new shipment
   */
  async createShipment(
    shipmentRequest: CreateShipmentRequest
  ): Promise<ApiResponse<ShipmentTracking>> {
    return this.makeRequest<ShipmentTracking>('/api/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentRequest),
    });
  }

  /**
   * Get shipment tracking information
   */
  async getShipmentTracking(
    shipmentId: string
  ): Promise<ApiResponse<ShipmentTracking>> {
    return this.makeRequest<ShipmentTracking>(
      `/api/v1/shipments/${shipmentId}/tracking`
    );
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentTracking['status'],
    location?: string
  ): Promise<ApiResponse<ShipmentTracking>> {
    return this.makeRequest<ShipmentTracking>(
      `/api/v1/shipments/${shipmentId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, location }),
      }
    );
  }

  /**
   * Get all shipments for a user
   */
  async getShipments(
    filters?: {
      status?: ShipmentTracking['status'];
      origin?: string;
      destination?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<ShipmentTracking[]>> {
    const params = filters ? new URLSearchParams(filters as any) : '';
    return this.makeRequest<ShipmentTracking[]>(
      `/api/v1/shipments${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Get carrier profiles
   */
  async getCarrierProfiles(
    filters?: {
      service_area?: string;
      equipment_type?: string;
      min_rating?: number;
    }
  ): Promise<ApiResponse<CarrierProfile[]>> {
    const params = filters ? new URLSearchParams(filters as any) : '';
    return this.makeRequest<CarrierProfile[]>(
      `/api/v1/carriers${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Get carrier quotes for comparison
   */
  async getCarrierQuotes(
    quoteRequest: CarrierQuoteRequest
  ): Promise<ApiResponse<CarrierComparison>> {
    return this.makeRequest<CarrierComparison>('/api/v1/carriers/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteRequest),
    });
  }

  /**
   * Get specific carrier profile
   */
  async getCarrierProfile(
    carrierId: string
  ): Promise<ApiResponse<CarrierProfile>> {
    return this.makeRequest<CarrierProfile>(
      `/api/v1/carriers/${carrierId}`
    );
  }

  /**
   * Select carrier for shipment
   */
  async selectCarrier(
    quoteId: string,
    carrierId: string
  ): Promise<ApiResponse<{ booking_id: string; confirmation: string }>> {
    return this.makeRequest<{ booking_id: string; confirmation: string }>(
      '/api/v1/carriers/select',
      {
        method: 'POST',
        body: JSON.stringify({ quote_id: quoteId, carrier_id: carrierId }),
      }
    );
  }

  /**
   * Optimize route for multiple waypoints
   */
  async optimizeRoute(
    request: RouteOptimizationRequest
  ): Promise<ApiResponse<OptimizedRoute>> {
    return this.makeRequest<OptimizedRoute>('/api/v1/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Optimize multiple routes
   */
  async optimizeMultipleRoutes(
    requests: RouteOptimizationRequest[]
  ): Promise<ApiResponse<MultiRouteOptimization>> {
    return this.makeRequest<MultiRouteOptimization>('/api/v1/routes/optimize/multiple', {
      method: 'POST',
      body: JSON.stringify({ route_requests: requests }),
    });
  }

  /**
   * Get route analytics
   */
  async getRouteAnalytics(
    routeId: string
  ): Promise<ApiResponse<RouteAnalytics>> {
    return this.makeRequest<RouteAnalytics>(
      `/api/v1/routes/${routeId}/analytics`
    );
  }

  /**
   * Save optimized route
   */
  async saveOptimizedRoute(
    route: OptimizedRoute,
    name?: string
  ): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest<{ id: string }>('/api/v1/routes/save', {
      method: 'POST',
      body: JSON.stringify({ route, name }),
    });
  }

  /**
   * Get saved routes
   */
  async getSavedRoutes(): Promise<ApiResponse<OptimizedRoute[]>> {
    return this.makeRequest<OptimizedRoute[]>('/api/v1/routes/saved');
  }

  /**
   * Get shipping metrics for analytics dashboard
   */
  async getShippingMetrics(
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<ShippingMetrics>> {
    const params = dateRange ? new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end
    }) : '';
    
    return this.makeRequest<ShippingMetrics>(
      `/api/v1/analytics/metrics${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Get carrier performance analytics
   */
  async getCarrierPerformance(
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<CarrierPerformance[]>> {
    const params = dateRange ? new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end
    }) : '';
    
    return this.makeRequest<CarrierPerformance[]>(
      `/api/v1/analytics/carriers${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Get route efficiency analytics
   */
  async getRouteEfficiency(
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<RouteEfficiency[]>> {
    const params = dateRange ? new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end
    }) : '';
    
    return this.makeRequest<RouteEfficiency[]>(
      `/api/v1/analytics/routes${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalyticsReport(
    dateRange: { start: string; end: string },
    reportType?: string
  ): Promise<ApiResponse<AnalyticsReport>> {
    return this.makeRequest<AnalyticsReport>('/api/v1/analytics/reports', {
      method: 'POST',
      body: JSON.stringify({
        date_range: dateRange,
        report_type: reportType || 'comprehensive'
      })
    });
  }

  /**
   * Get custom dashboards
   */
  async getCustomDashboards(): Promise<ApiResponse<CustomDashboard[]>> {
    return this.makeRequest<CustomDashboard[]>('/api/v1/analytics/dashboards');
  }

  /**
   * Save custom dashboard
   */
  async saveCustomDashboard(
    dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest<{ id: string }>('/api/v1/analytics/dashboards', {
      method: 'POST',
      body: JSON.stringify(dashboard)
    });
  }

  /**
   * Update custom dashboard
   */
  async updateCustomDashboard(
    dashboardId: string,
    updates: Partial<CustomDashboard>
  ): Promise<ApiResponse<CustomDashboard>> {
    return this.makeRequest<CustomDashboard>(
      `/api/v1/analytics/dashboards/${dashboardId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
  }

  /**
   * Get notifications
   */
  async getNotifications(
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<ApiResponse<{ notifications: Notification[]; total: number; unread: number }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString()
    });
    
    return this.makeRequest<{ notifications: Notification[]; total: number; unread: number }>(
      `/api/v1/notifications?${params.toString()}`
    );
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      `/api/v1/notifications/${notificationId}/read`,
      { method: 'PUT' }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      '/api/v1/notifications/read-all',
      { method: 'PUT' }
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      `/api/v1/notifications/${notificationId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>('/api/v1/notifications/preferences');
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(
      '/api/v1/notifications/preferences',
      {
        method: 'PUT',
        body: JSON.stringify(preferences)
      }
    );
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(
    subscription: Omit<NotificationSubscription, 'id' | 'userId' | 'createdAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest<{ id: string }>(
      '/api/v1/notifications/subscribe',
      {
        method: 'POST',
        body: JSON.stringify(subscription)
      }
    );
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(
    subscriptionId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      `/api/v1/notifications/subscribe/${subscriptionId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Send test notification
   */
  async sendTestNotification(
    type: NotificationType,
    data?: any
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      '/api/v1/notifications/test',
      {
        method: 'POST',
        body: JSON.stringify({ type, data })
      }
    );
  }

  /**
   * Get notification templates
   */
  async getNotificationTemplates(): Promise<ApiResponse<NotificationTemplate[]>> {
    return this.makeRequest<NotificationTemplate[]>('/api/v1/notifications/templates');
  }

  /**
   * Update notification template
   */
  async updateNotificationTemplate(
    templateId: string,
    updates: Partial<NotificationTemplate>
  ): Promise<ApiResponse<NotificationTemplate>> {
    return this.makeRequest<NotificationTemplate>(
      `/api/v1/notifications/templates/${templateId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
  }

  /**
   * Upload document for shipment
   */
  async uploadDocument(
    request: DocumentUploadRequest
  ): Promise<ApiResponse<ShippingDocument>> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('shipment_id', request.shipment_id);
    formData.append('type', request.type);
    formData.append('name', request.name);
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    return this.makeRequest<ShippingDocument>('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });
  }

  /**
   * Get documents for a shipment
   */
  async getShipmentDocuments(
    shipmentId: string
  ): Promise<ApiResponse<ShippingDocument[]>> {
    return this.makeRequest<ShippingDocument[]>(
      `/api/v1/shipments/${shipmentId}/documents`
    );
  }

  /**
   * Get document by ID
   */
  async getDocument(
    documentId: string
  ): Promise<ApiResponse<ShippingDocument>> {
    return this.makeRequest<ShippingDocument>(
      `/api/v1/documents/${documentId}`
    );
  }

  /**
   * Delete document
   */
  async deleteDocument(
    documentId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(
      `/api/v1/documents/${documentId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Generate document from template
   */
  async generateDocument(
    request: DocumentGenerationRequest
  ): Promise<ApiResponse<ShippingDocument>> {
    return this.makeRequest<ShippingDocument>('/api/v1/documents/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get document templates
   */
  async getDocumentTemplates(
    type?: DocumentType
  ): Promise<ApiResponse<DocumentTemplate[]>> {
    const params = type ? new URLSearchParams({ type }) : '';
    return this.makeRequest<DocumentTemplate[]>(
      `/api/v1/documents/templates${params ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus
  ): Promise<ApiResponse<ShippingDocument>> {
    return this.makeRequest<ShippingDocument>(
      `/api/v1/documents/${documentId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  }

  /**
   * Download document
   */
  async downloadDocument(
    documentId: string
  ): Promise<ApiResponse<Blob>> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/documents/${documentId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const blob = await response.blob();
    return {
      success: true,
      data: blob,
    };
  }
}

// Export singleton instance
let greenscreensAPI: GreenscreensAPI | null = null;

export function initializeGreenscreensAPI(config: GreenscreensConfig): GreenscreensAPI {
  greenscreensAPI = new GreenscreensAPI(config);
  return greenscreensAPI;
}

export function getGreenscreensAPI(): GreenscreensAPI {
  if (!greenscreensAPI) {
    throw new Error('Greenscreens API not initialized. Call initializeGreenscreensAPI first.');
  }
  return greenscreensAPI;
}

export type {
  GreenscreensConfig,
  RatePrediction,
  MarketIntelligence,
  CarrierBid,
  QuoteRequest,
  ApiResponse,
  ShipmentTracking,
  ShipmentMilestone,
  ShipmentDocument,
  ShipmentAlert,
  CreateShipmentRequest,
  CarrierProfile,
  CarrierQuoteRequest,
  CarrierQuote,
  CarrierComparison,
  RouteWaypoint,
  RouteOptimizationRequest,
  OptimizedRoute,
  RouteInstruction,
  RouteAnalytics,
  MultiRouteOptimization,
  ShippingMetrics,
  CarrierPerformance,
  RouteEfficiency,
  TimeSeriesData,
  AnalyticsReport,
  DashboardWidget,
  CustomDashboard,
  NotificationPreferences,
  Notification,
  NotificationType,
  NotificationSubscription,
  NotificationTemplate,
  ShippingDocument,
  DocumentType,
  DocumentStatus,
  DocumentTemplate,
  DocumentField,
  DocumentGenerationRequest,
  DocumentUploadRequest,
};

export { GreenscreensAPI };

// Export greenscreensApi for backward compatibility
export const greenscreensApi = getGreenscreensAPI;