/**
 * Clean Greenscreens.ai API Service
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
   * Get market trends
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
}

// Export singleton instance
let greenscreensAPI: GreenscreensAPI | null = null;

export function initializeGreenscreensAPI(config: GreenscreensConfig): GreenscreensAPI {
  greenscreensAPI = new GreenscreensAPI(config);
  return greenscreensAPI;
}

export function getGreenscreensAPI(): GreenscreensAPI {
  if (!greenscreensAPI) {
    // Auto-initialize with default config if not already initialized
    const config = {
      apiKey: process.env.GREENSCREENS_API_KEY || process.env.NEXT_PUBLIC_GREENSCREENS_API_KEY || '',
      baseUrl: process.env.GREENSCREENS_BASE_URL || 'https://connect.greenscreens.ai',
      timeout: parseInt(process.env.GREENSCREENS_TIMEOUT || '10000'),
    };
    greenscreensAPI = new GreenscreensAPI(config);
  }
  return greenscreensAPI;
}

// Export alias for compatibility
export const greenscreensApi = getGreenscreensAPI;

export type {
  GreenscreensConfig,
  RatePrediction,
  MarketIntelligence,
  QuoteRequest,
  ApiResponse,
};

export { GreenscreensAPI };