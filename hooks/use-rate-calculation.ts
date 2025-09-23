import { useState, useCallback } from "react";
import { FreightRateInput, FreightRateResult } from "@/lib/freight-calculator";

// ============================================================================
// HOOK INTERFACES
// ============================================================================

interface UseRateCalculationOptions {
  onSuccess?: (result: FreightRateResult) => void;
  onError?: (error: string) => void;
}

interface UseRateCalculationReturn {
  loading: boolean;
  error: string | null;
  result: FreightRateResult | null;
  calculateRate: (input: FreightRateInput) => Promise<FreightRateResult | null>;
  clearError: () => void;
  clearResult: () => void;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useRateCalculation(options: UseRateCalculationOptions = {}): UseRateCalculationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreightRateResult | null>(null);

  const calculateRate = useCallback(async (input: FreightRateInput): Promise<FreightRateResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/rates/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate rate");
      }

      if (!data.success) {
        throw new Error(data.error || "Calculation failed");
      }

      const calculatedResult = data.data;
      setResult(calculatedResult);
      options.onSuccess?.(calculatedResult);
      
      return calculatedResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      options.onError?.(errorMessage);
      
      console.error("Rate calculation error:", {
        error: errorMessage,
        input,
        timestamp: new Date().toISOString()
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    calculateRate,
    clearError,
    clearResult,
  };
}

// ============================================================================
// API CLIENT UTILITIES
// ============================================================================

export class RateCalculationAPI {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  async calculateRate(input: FreightRateInput): Promise<FreightRateResult> {
    const response = await fetch(${this.baseURL}/rates/calculate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Calculation failed");
    }

    return data.data;
  }

  async getAPIInfo() {
    const response = await fetch(${this.baseURL}/rates/calculate);
    
    if (!response.ok) {
      throw new Error("Failed to fetch API info");
    }

    return response.json();
  }
}

// ============================================================================
// EXPORT API CLIENT INSTANCE
// ============================================================================

export const rateCalculationAPI = new RateCalculationAPI();
