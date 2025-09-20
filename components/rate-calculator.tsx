"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRatePrediction } from "@/lib/hooks/use-greenscreens"
import { ErrorBoundary } from "@/components/error-boundary"
import { Loader2, Truck, DollarSign, AlertCircle } from "lucide-react"

export function RateCalculator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [equipmentType, setEquipmentType] = useState("")
  const [weight, setWeight] = useState("")
  const [distance, setDistance] = useState("")

  const { data: rateData, loading, error, refetch } = useRatePrediction({
    origin,
    destination,
    equipment: equipmentType,
    enabled: false
  })

  const handleCalculate = useCallback(() => {
    if (origin && destination && equipmentType && weight && distance) {
      refetch()
    }
  }, [origin, destination, equipmentType, weight, distance, refetch])

  const isFormValid = useMemo(() => {
    return !!(origin && destination && equipmentType && weight && distance)
  }, [origin, destination, equipmentType, weight, distance])

  return (
    <ErrorBoundary>
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Rate Calculator
        </CardTitle>
        <CardDescription>
          Get instant freight rate predictions powered by Greenscreens.ai
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              placeholder="e.g., Los Angeles, CA"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., New York, NY"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Type</Label>
            <Select value={equipmentType} onValueChange={setEquipmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dry_van">Dry Van</SelectItem>
                <SelectItem value="reefer">Reefer</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="step_deck">Step Deck</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="40000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (miles)</Label>
            <Input
              id="distance"
              type="number"
              placeholder="2500"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleCalculate} 
          className="w-full" 
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Calculate Rate
            </>
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 font-medium text-sm">Error calculating rate</p>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleCalculate}
            >
              Try Again
            </Button>
          </div>
        )}

        {rateData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Rate Prediction</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Predicted Rate:</span>
                <p className="font-bold text-lg">${rateData.predictedRate?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Network Rate:</span>
                <p className="font-bold text-lg">${rateData.networkRate?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Confidence:</span>
                <p className="font-bold">{(rateData.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-green-600">Market Activity:</span>
                <p className="font-bold">{rateData.marketActivity || 'Unknown'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-green-600">Lane:</span>
                <p className="font-bold">{rateData.lane || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-green-600">Last Updated:</span>
                <p className="font-bold">{rateData.lastUpdated || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </ErrorBoundary>
  )
}