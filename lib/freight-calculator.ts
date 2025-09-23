/**
 * FREIGHT RATE CALCULATOR UTILITIES
 * =================================
 * 
 * This file contains all the core logic for freight rate calculations.
 * It's designed to be easily maintainable and understandable by any developer.
 * 
 * Key Features:
 * - Centralized calculation logic (DRY principle)
 * - Clear TypeScript interfaces
 * - Comprehensive documentation
 * - Easy to test and modify
 * 
 * @author Exodus Logistix Development Team
 * @version 1.0.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input data for freight rate calculation
 * All fields are required for accurate calculation
 */
export interface FreightRateInput {
  /** Origin city (e.g., "New York, NY") */
  origin: string;
  /** Destination city (e.g., "Los Angeles, CA") */
  destination: string;
  /** Type of equipment used for transport */
  equipmentType: string;
  /** Weight in pounds (optional, defaults to 0) */
  weight?: number;
  /** Distance in miles (optional, auto-calculated if not provided) */
  distance?: number;
  /** Pickup date in YYYY-MM-DD format (optional) */
  pickupDate?: string;
  /** Pickup time in HH:MM format (optional) */
  pickupTime?: string;
  /** Additional surcharge amount (optional) */
  surcharge?: number;
  /** Fuel surcharge percentage (optional) */
  fuelSurcharge?: number;
}

/**
 * Result of freight rate calculation
 * Contains all calculated values and breakdown
 */
export interface FreightRateResult {
  /** Base rate before any adjustments */
  baseRate: number;
  /** Total cost including all surcharges */
  totalCost: number;
  /** Estimated delivery time in days */
  estimatedDays: number;
  /** Confidence level (0-1, where 1 = 100% confident) */
  confidence: number;
  /** Detailed breakdown of all cost components */
  breakdown: {
    baseRate: number;
    weightCost: number;
    distanceCost: number;
    fuelSurcharge: number;
    additionalSurcharges: number;
  };
}

/**
 * Equipment type configuration
 * Each equipment type has different pricing characteristics
 */
export interface EquipmentType {
  /** Unique identifier for the equipment */
  value: string;
  /** Human-readable name */
  label: string;
  /** Base rate per mile in USD */
  baseRatePerMile: number;
  /** Weight multiplier for weight-based pricing */
  weightMultiplier: number;
  /** Fuel surcharge rate (percentage) */
  fuelSurchargeRate: number;
}

/**
 * Pickup time option
 */
export interface PickupTimeOption {
  /** Time value in HH:MM format */
  value: string;
  /** Human-readable label */
  label: string;
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

/**
 * Available equipment types with their pricing characteristics
 * 
 * Pricing is based on:
 * - Equipment complexity and maintenance costs
 * - Market demand and availability
 * - Fuel efficiency and operational costs
 */
export const EQUIPMENT_TYPES: EquipmentType[] = [
  { 
    value: "van", 
    label: "Dry Van", 
    baseRatePerMile: 2.50, 
    weightMultiplier: 0.15, 
    fuelSurchargeRate: 0.12 
  },
  { 
    value: "reefer", 
    label: "Refrigerated", 
    baseRatePerMile: 3.20, 
    weightMultiplier: 0.18, 
    fuelSurchargeRate: 0.15 
  },
  { 
    value: "flatbed", 
    label: "Flatbed", 
    baseRatePerMile: 2.80, 
    weightMultiplier: 0.16, 
    fuelSurchargeRate: 0.13 
  },
  { 
    value: "step_deck", 
    label: "Step Deck", 
    baseRatePerMile: 3.00, 
    weightMultiplier: 0.17, 
    fuelSurchargeRate: 0.14 
  },
  { 
    value: "double_drop", 
    label: "Double Drop", 
    baseRatePerMile: 3.50, 
    weightMultiplier: 0.20, 
    fuelSurchargeRate: 0.16 
  },
  { 
    value: "lowboy", 
    label: "Lowboy", 
    baseRatePerMile: 4.00, 
    weightMultiplier: 0.22, 
    fuelSurchargeRate: 0.18 
  },
];

/**
 * Available pickup time slots
 * These are the standard pickup windows offered
 */
export const PICKUP_TIMES: PickupTimeOption[] = [
  { value: "08:00", label: "8:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "20:00", label: "8:00 PM" },
];

/**
 * Major US cities for freight shipping
 * This list covers the most common shipping destinations
 * 
 * Note: In production, this should be loaded from a database
 * or external API for better maintainability
 */
export const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "El Paso, TX", "Nashville, TN", "Detroit, MI", "Oklahoma City, OK",
  "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA",
  "Mesa, AZ", "Kansas City, MO", "Atlanta, GA", "Long Beach, CA", "Colorado Springs, CO",
  "Raleigh, NC", "Miami, FL", "Virginia Beach, VA", "Omaha, NE", "Oakland, CA",
  "Minneapolis, MN", "Tulsa, OK", "Arlington, TX", "Tampa, FL",
];

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two cities using Haversine formula
 * 
 * This is a simplified calculation. In production, you should:
 * 1. Use a proper geocoding service (Google Maps, Mapbox, etc.)
 * 2. Consider actual road distances, not straight-line distances
 * 3. Account for traffic patterns and route optimization
 * 
 * @param origin - Origin city name
 * @param destination - Destination city name
 * @returns Distance in miles
 */
export function calculateDistance(origin: string, destination: string): number {
  // City coordinates database (simplified)
  // In production, this should be in a separate database or config file
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    "New York, NY": { lat: 40.7128, lng: -74.0060 },
    "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
    "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
    "Houston, TX": { lat: 29.7604, lng: -95.3698 },
    "Phoenix, AZ": { lat: 33.4484, lng: -112.0740 },
    "Philadelphia, PA": { lat: 39.9526, lng: -75.1652 },
    "San Antonio, TX": { lat: 29.4241, lng: -98.4936 },
    "San Diego, CA": { lat: 32.7157, lng: -117.1611 },
    "Dallas, TX": { lat: 32.7767, lng: -96.7970 },
    "San Jose, CA": { lat: 37.3382, lng: -121.8863 },
    "Austin, TX": { lat: 30.2672, lng: -97.7431 },
    "Jacksonville, FL": { lat: 30.3322, lng: -81.6557 },
    "Fort Worth, TX": { lat: 32.7555, lng: -97.3308 },
    "Columbus, OH": { lat: 39.9612, lng: -82.9988 },
    "Charlotte, NC": { lat: 35.2271, lng: -80.8431 },
    "San Francisco, CA": { lat: 37.7749, lng: -122.4194 },
    "Indianapolis, IN": { lat: 39.7684, lng: -86.1581 },
    "Seattle, WA": { lat: 47.6062, lng: -122.3321 },
    "Denver, CO": { lat: 39.7392, lng: -104.9903 },
    "Washington, DC": { lat: 38.9072, lng: -77.0369 },
    "Boston, MA": { lat: 42.3601, lng: -71.0589 },
    "El Paso, TX": { lat: 31.7619, lng: -106.4850 },
    "Nashville, TN": { lat: 36.1627, lng: -86.7816 },
    "Detroit, MI": { lat: 42.3314, lng: -83.0458 },
    "Oklahoma City, OK": { lat: 35.4676, lng: -97.5164 },
    "Portland, OR": { lat: 45.5152, lng: -122.6784 },
    "Las Vegas, NV": { lat: 36.1699, lng: -115.1398 },
    "Memphis, TN": { lat: 35.1495, lng: -90.0490 },
    "Louisville, KY": { lat: 38.2527, lng: -85.7585 },
    "Baltimore, MD": { lat: 39.2904, lng: -76.6122 },
    "Milwaukee, WI": { lat: 43.0389, lng: -87.9065 },
    "Albuquerque, NM": { lat: 35.0844, lng: -106.6504 },
    "Tucson, AZ": { lat: 32.2226, lng: -110.9747 },
    "Fresno, CA": { lat: 36.7378, lng: -119.7871 },
    "Sacramento, CA": { lat: 38.5816, lng: -121.4944 },
    "Mesa, AZ": { lat: 33.4152, lng: -111.8315 },
    "Kansas City, MO": { lat: 39.0997, lng: -94.5786 },
    "Atlanta, GA": { lat: 33.7490, lng: -80.3880 },
    "Long Beach, CA": { lat: 33.7701, lng: -118.1937 },
    "Colorado Springs, CO": { lat: 38.8339, lng: -104.8214 },
    "Raleigh, NC": { lat: 35.7796, lng: -78.6382 },
    "Miami, FL": { lat: 25.7617, lng: -80.1918 },
    "Virginia Beach, VA": { lat: 36.8529, lng: -75.9780 },
    "Omaha, NE": { lat: 41.2565, lng: -95.9345 },
    "Oakland, CA": { lat: 37.8044, lng: -122.2712 },
    "Minneapolis, MN": { lat: 44.9778, lng: -93.2650 },
    "Tulsa, OK": { lat: 36.1540, lng: -95.9928 },
    "Arlington, TX": { lat: 32.7357, lng: -97.1081 },
    "Tampa, FL": { lat: 27.9506, lng: -82.4572 },
  };

  // Get coordinates for both cities
  const originCoords = cityCoordinates[origin] || { lat: 40.7128, lng: -74.0060 }; // Default to NYC
  const destCoords = cityCoordinates[destination] || { lat: 34.0522, lng: -118.2437 }; // Default to LA

  // Haversine formula for calculating great-circle distance
  const R = 3959; // Earth's radius in miles
  const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
  const dLng = (destCoords.lng - originCoords.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c); // Round to nearest mile
}

/**
 * Calculate estimated transit time based on distance
 * 
 * This uses industry-standard transit time estimates:
 * - Local: 100 miles = 1 day
 * - Regional: 101-300 miles = 2 days
 * - Short haul: 301-600 miles = 3 days
 * - Medium haul: 601-1000 miles = 4 days
 * - Long haul: 1001-1500 miles = 5 days
 * - Cross-country: 1501-2500 miles = 7 days
 * - Very long haul: >2500 miles = calculated at 400 miles/day
 * 
 * @param distance - Distance in miles
 * @returns Estimated transit time in days
 */
export function calculateTransitTime(distance: number): number {
  if (distance <= 100) return 1;
  if (distance <= 300) return 2;
  if (distance <= 600) return 3;
  if (distance <= 1000) return 4;
  if (distance <= 1500) return 5;
  if (distance <= 2500) return 7;
  
  // For very long distances, calculate based on 400 miles per day average
  return Math.ceil(distance / 400);
}

/**
 * Calculate confidence score based on input completeness and market factors
 * 
 * Confidence factors:
 * - Input completeness (40% of total)
 * - Business hours timing (10% of total)
 * - Optimal booking window (10% of total)
 * - Base confidence (40% of total)
 * 
 * @param input - Freight rate input data
 * @returns Confidence score between 0 and 1
 */
export function calculateConfidence(input: FreightRateInput): number {
  let confidence = 0.4; // Base confidence (40%)

  // Input completeness factors (40% total)
  if (input.origin && input.destination) confidence += 0.15; // 15%
  if (input.equipmentType) confidence += 0.10; // 10%
  if (input.weight && input.weight > 0) confidence += 0.10; // 10%
  if (input.pickupDate) confidence += 0.05; // 5%

  // Market timing factors (20% total)
  const currentHour = new Date().getHours();
  if (currentHour >= 9 && currentHour <= 17) confidence += 0.10; // Business hours (10%)
  
  if (input.pickupDate) {
    const pickupDate = new Date(input.pickupDate);
    const daysUntilPickup = Math.ceil((pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilPickup >= 1 && daysUntilPickup <= 7) confidence += 0.10; // Optimal booking window (10%)
  }

  return Math.min(confidence, 0.95); // Cap at 95% to maintain some uncertainty
}

/**
 * Main freight rate calculation function
 * 
 * This is the core function that calculates freight rates based on:
 * 1. Distance-based pricing
 * 2. Equipment type characteristics
 * 3. Weight-based adjustments
 * 4. Fuel surcharges
 * 5. Additional surcharges
 * 
 * @param input - Freight rate input data
 * @returns Complete freight rate calculation result
 */
export function calculateFreightRate(input: FreightRateInput): FreightRateResult {
  // Find equipment configuration
  const equipment = EQUIPMENT_TYPES.find(eq => eq.value === input.equipmentType) || EQUIPMENT_TYPES[0];
  
  // Calculate distance if not provided
  const distance = input.distance || calculateDistance(input.origin, input.destination);
  
  // Base rate calculation (distance  rate per mile)
  const baseRate = distance * equipment.baseRatePerMile;
  
  // Weight-based cost (weight  weight multiplier)
  const weightCost = input.weight ? input.weight * equipment.weightMultiplier : 0;
  
  // Distance-based adjustments
  // Long haul surcharge for distances > 1000 miles
  const distanceCost = distance > 1000 ? distance * 0.1 : 0;
  
  // Fuel surcharge (base rate  fuel surcharge rate)
  const fuelSurcharge = baseRate * equipment.fuelSurchargeRate;
  
  // Additional surcharges (custom surcharges + fuel surcharges)
  const additionalSurcharges = (input.surcharge || 0) + (input.fuelSurcharge || 0);
  
  // Total cost calculation
  const totalCost = baseRate + weightCost + distanceCost + fuelSurcharge + additionalSurcharges;
  
  // Calculate transit time and confidence
  const estimatedDays = calculateTransitTime(distance);
  const confidence = calculateConfidence(input);
  
  return {
    baseRate: Math.round(baseRate * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    estimatedDays,
    confidence,
    breakdown: {
      baseRate: Math.round(baseRate * 100) / 100,
      weightCost: Math.round(weightCost * 100) / 100,
      distanceCost: Math.round(distanceCost * 100) / 100,
      fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
      additionalSurcharges: Math.round(additionalSurcharges * 100) / 100,
    }
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
}

/**
 * Validate freight rate input data
 * 
 * This function checks all required fields and validates data types
 * to ensure accurate calculations.
 * 
 * @param input - Freight rate input data to validate
 * @returns Validation result with errors if any
 */
export function validateFreightRateInput(input: FreightRateInput): ValidationResult {
  const errors: string[] = [];
  
  // Required field validations
  if (!input.origin?.trim()) {
    errors.push("Origin city is required");
  }
  
  if (!input.destination?.trim()) {
    errors.push("Destination city is required");
  }
  
  if (!input.equipmentType?.trim()) {
    errors.push("Equipment type is required");
  }
  
  // Data type validations
  if (input.weight !== undefined && input.weight < 0) {
    errors.push("Weight must be positive");
  }
  
  if (input.distance !== undefined && input.distance < 0) {
    errors.push("Distance must be positive");
  }
  
  // Business logic validations
  if (input.weight !== undefined && input.weight > 80000) {
    errors.push("Weight cannot exceed 80,000 lbs (federal limit)");
  }
  
  if (input.pickupDate) {
    const pickupDate = new Date(input.pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      errors.push("Pickup date cannot be in the past");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency value for display
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format percentage value for display
 * 
 * @param value - Value to format (0-1 range)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return ${(value * 100).toFixed(decimals)}%;
}

/**
 * Get equipment type by value
 * 
 * @param value - Equipment type value
 * @returns Equipment type configuration or undefined
 */
export function getEquipmentType(value: string): EquipmentType | undefined {
  return EQUIPMENT_TYPES.find(eq => eq.value === value);
}

/**
 * Check if a city is supported
 * 
 * @param city - City name to check
 * @returns True if city is supported
 */
export function isCitySupported(city: string): boolean {
  return US_CITIES.includes(city);
}
