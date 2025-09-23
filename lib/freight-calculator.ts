/**
 * Freight Rate Calculator Utilities
 * Centralized calculation logic for freight rates
 */

export interface FreightRateInput {
  origin: string;
  destination: string;
  equipmentType: string;
  weight?: number;
  distance?: number;
  pickupDate?: string;
  pickupTime?: string;
  surcharge?: number;
  fuelSurcharge?: number;
}

export interface FreightRateResult {
  baseRate: number;
  totalCost: number;
  estimatedDays: number;
  confidence: number;
  breakdown: {
    baseRate: number;
    weightCost: number;
    distanceCost: number;
    fuelSurcharge: number;
    additionalSurcharges: number;
  };
}

export interface EquipmentType {
  value: string;
  label: string;
  baseRatePerMile: number;
  weightMultiplier: number;
  fuelSurchargeRate: number;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  { value: "van", label: "Van", baseRatePerMile: 2.50, weightMultiplier: 0.15, fuelSurchargeRate: 0.12 },
  { value: "reefer", label: "Reefer", baseRatePerMile: 3.20, weightMultiplier: 0.18, fuelSurchargeRate: 0.15 },
  { value: "flatbed", label: "Flatbed", baseRatePerMile: 2.80, weightMultiplier: 0.16, fuelSurchargeRate: 0.13 },
  { value: "step_deck", label: "Step Deck", baseRatePerMile: 3.00, weightMultiplier: 0.17, fuelSurchargeRate: 0.14 },
  { value: "double_drop", label: "Double Drop", baseRatePerMile: 3.50, weightMultiplier: 0.20, fuelSurchargeRate: 0.16 },
  { value: "lowboy", label: "Lowboy", baseRatePerMile: 4.00, weightMultiplier: 0.22, fuelSurchargeRate: 0.18 },
];

export const PICKUP_TIMES = [
  { value: "08:00", label: "8:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "20:00", label: "8:00 PM" },
];

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

/**
 * Calculate distance between two cities (simplified calculation)
 * In production, this would use a proper geocoding service
 */
export function calculateDistance(origin: string, destination: string): number {
  // Simplified distance calculation based on city coordinates
  // In production, use Google Maps API or similar service
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    "New York, NY": { lat: 40.7128, lng: -74.0060 },
    "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
    "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
    "Houston, TX": { lat: 29.7604, lng: -95.3698 },
    "Phoenix, AZ": { lat: 33.4484, lng: -112.0740 },
    // Add more cities as needed
  };

  const originCoords = cityCoordinates[origin] || { lat: 40.7128, lng: -74.0060 };
  const destCoords = cityCoordinates[destination] || { lat: 34.0522, lng: -118.2437 };

  // Haversine formula for distance calculation
  const R = 3959; // Earth's radius in miles
  const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
  const dLng = (destCoords.lng - originCoords.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate estimated transit time based on distance
 */
export function calculateTransitTime(distance: number): number {
  if (distance <= 100) return 1;
  if (distance <= 300) return 2;
  if (distance <= 600) return 3;
  if (distance <= 1000) return 4;
  if (distance <= 1500) return 5;
  if (distance <= 2500) return 7;
  return Math.ceil(distance / 400); // 400 miles per day average
}

/**
 * Calculate confidence score based on input completeness and market factors
 */
export function calculateConfidence(input: FreightRateInput): number {
  let confidence = 0.5; // Base confidence

  // Increase confidence based on input completeness
  if (input.origin && input.destination) confidence += 0.2;
  if (input.equipmentType) confidence += 0.1;
  if (input.weight && input.weight > 0) confidence += 0.1;
  if (input.pickupDate) confidence += 0.1;

  // Market factors (simplified)
  const currentHour = new Date().getHours();
  if (currentHour >= 9 && currentHour <= 17) confidence += 0.05; // Business hours
  if (input.pickupDate) {
    const pickupDate = new Date(input.pickupDate);
    const daysUntilPickup = Math.ceil((pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilPickup >= 1 && daysUntilPickup <= 7) confidence += 0.05; // Optimal booking window
  }

  return Math.min(confidence, 0.95); // Cap at 95%
}

/**
 * Main freight rate calculation function
 */
export function calculateFreightRate(input: FreightRateInput): FreightRateResult {
  const equipment = EQUIPMENT_TYPES.find(eq => eq.value === input.equipmentType) || EQUIPMENT_TYPES[0];
  
  // Calculate distance if not provided
  const distance = input.distance || calculateDistance(input.origin, input.destination);
  
  // Base rate calculation
  const baseRate = distance * equipment.baseRatePerMile;
  
  // Weight-based cost
  const weightCost = input.weight ? input.weight * equipment.weightMultiplier : 0;
  
  // Distance-based adjustments
  const distanceCost = distance > 1000 ? distance * 0.1 : 0; // Long haul surcharge
  
  // Fuel surcharge
  const fuelSurcharge = baseRate * equipment.fuelSurchargeRate;
  
  // Additional surcharges
  const additionalSurcharges = (input.surcharge || 0) + (input.fuelSurcharge || 0);
  
  // Total cost calculation
  const totalCost = baseRate + weightCost + distanceCost + fuelSurcharge + additionalSurcharges;
  
  // Calculate transit time and confidence
  const estimatedDays = calculateTransitTime(distance);
  const confidence = calculateConfidence(input);
  
  return {
    baseRate,
    totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
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

/**
 * Validate freight rate input
 */
export function validateFreightRateInput(input: FreightRateInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.origin?.trim()) errors.push("Origin city is required");
  if (!input.destination?.trim()) errors.push("Destination city is required");
  if (!input.equipmentType?.trim()) errors.push("Equipment type is required");
  if (input.weight && input.weight < 0) errors.push("Weight must be positive");
  if (input.distance && input.distance < 0) errors.push("Distance must be positive");
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
