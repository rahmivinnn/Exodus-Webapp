"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Truck, DollarSign, MapPin, Calendar, Clock } from "lucide-react";
import { 
  calculateFreightRate, 
  validateFreightRateInput, 
  EQUIPMENT_TYPES, 
  PICKUP_TIMES, 
  US_CITIES,
  formatCurrency,
  formatPercentage,
  type FreightRateInput,
  type FreightRateResult 
} from "@/lib/freight-calculator";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface FreightRateCalculatorProps {
  onRateCalculated?: (result: FreightRateResult) => void;
  onError?: (error: string) => void;
  initialData?: Partial<FreightRateInput>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FreightRateCalculator({ 
  onRateCalculated, 
  onError, 
  initialData 
}: FreightRateCalculatorProps = {}) {
  
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [formData, setFormData] = useState<FreightRateInput>({
    origin: initialData?.origin || "",
    destination: initialData?.destination || "",
    equipmentType: initialData?.equipmentType || "",
    weight: initialData?.weight || undefined,
    distance: initialData?.distance || undefined,
    pickupDate: initialData?.pickupDate || "",
    pickupTime: initialData?.pickupTime || "",
    surcharge: initialData?.surcharge || 0,
    fuelSurcharge: initialData?.fuelSurcharge || 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreightRateResult | null>(null);
  const [error, setError] = useState("");

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const handleInputChange = (field: keyof FreightRateInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const validation = validateFreightRateInput(formData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(", ");
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      const calculatedResult = calculateFreightRate(formData);
      setResult(calculatedResult);
      onRateCalculated?.(calculatedResult);
      
    } catch (err) {
      const errorMessage = "Failed to calculate freight rate. Please try again.";
      setError(errorMessage);
      onError?.(errorMessage);
      console.error("Freight rate calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  
  const isFormValid = Boolean(
    formData.origin && 
    formData.destination && 
    formData.equipmentType && 
    formData.pickupDate && 
    formData.pickupTime
  );

  // ========================================================================
  // RENDER FUNCTIONS
  // ========================================================================
  
  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="rounded-2xl shadow-lg border-0 bg-white">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center">
            <Truck className="mr-3 h-6 w-6 text-blue-600" />
            Get Your Quote
          </CardTitle>
          <CardDescription className="text-gray-600">
            Fill in the details below to get an instant freight rate quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin and Destination Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm font-medium text-gray-700">
                  Origin City *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="origin"
                    placeholder="Enter origin city"
                    value={formData.origin}
                    onChange={(e) => handleInputChange("origin", e.target.value)}
                    className="pl-10"
                    list="origin-cities"
                    required
                  />
                  <datalist id="origin-cities">
                    {US_CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
                  Destination City *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="destination"
                    placeholder="Enter destination city"
                    value={formData.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                    className="pl-10"
                    list="destination-cities"
                    required
                  />
                  <datalist id="destination-cities">
                    {US_CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Equipment Type Field */}
            <div className="space-y-2">
              <Label htmlFor="equipmentType" className="text-sm font-medium text-gray-700">
                Equipment Type *
              </Label>
              <Select 
                value={formData.equipmentType} 
                onValueChange={(value) => handleInputChange("equipmentType", value)} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Date and Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate" className="text-sm font-medium text-gray-700">
                  Pickup Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupTime" className="text-sm font-medium text-gray-700">
                  Pickup Time *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select 
                    value={formData.pickupTime} 
                    onValueChange={(value) => handleInputChange("pickupTime", value)} 
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_TIMES.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Weight and Distance Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                  Weight (lbs) - Optional
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="40000"
                  value={formData.weight || ""}
                  onChange={(e) => handleInputChange("weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance" className="text-sm font-medium text-gray-700">
                  Distance (miles) - Optional
                </Label>
                <Input
                  id="distance"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.distance || ""}
                  onChange={(e) => handleInputChange("distance", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculating Rate...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-5 w-5" />
                    Get Rate Quote
                  </>
                )}
              </Button>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Rate Quote
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your freight rate and delivery information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Total Cost Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(result.totalCost)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-semibold text-blue-600 mb-1">
                    {result.estimatedDays}
                  </div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-semibold text-purple-600 mb-1">
                    {formatPercentage(result.confidence)}
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="text-gray-900">{formatPercentage(result.confidence)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: ${result.confidence * 100}% }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate:</span>
                    <span className="text-gray-900">{formatCurrency(result.breakdown.baseRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight Cost:</span>
                    <span className="text-gray-900">{formatCurrency(result.breakdown.weightCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance Cost:</span>
                    <span className="text-gray-900">{formatCurrency(result.breakdown.distanceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Surcharge:</span>
                    <span className="text-gray-900">{formatCurrency(result.breakdown.fuelSurcharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Surcharges:</span>
                    <span className="text-gray-900">{formatCurrency(result.breakdown.additionalSurcharges)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Enter your shipment details to get a quote</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Freight Rate Calculator
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get instant, accurate freight quotes for your shipments. 
          Our calculator provides real-time rates and delivery estimates.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderForm()}
        {renderResults()}
      </div>
    </div>
  );
}

export default FreightRateCalculator;
