"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRatePrediction } from "@/lib/hooks/use-greenscreens"
import { Loader2, Truck, DollarSign } from "lucide-react"

export function RateCalculator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [equipmentType, setEquipmentType] = useState("")
  const [weight, setWeight] = useState("")
  const [distance, setDistance] = useState("")

  const { data: rateData, loading, error, fetchRatePrediction } = useRatePrediction()

  const handleCalculate = () => {
    if (origin && destination && equipmentType && weight && distance) {
      fetchRatePrediction({
        origin,
        destination,
        equipment_type: equipmentType,
        weight: parseFloat(weight),
        distance: parseFloat(distance)
      })
    }
  }

  return (
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
          disabled={loading || !origin || !destination || !equipmentType || !weight || !distance}
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
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {rateData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Rate Prediction</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Predicted Rate:</span>
                <p className="font-bold text-lg">${rateData.predicted_rate?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Confidence:</span>
                <p className="font-bold">{(rateData.confidence * 100).toFixed(1)}%</p>
              </div>
              {rateData.market_factors && (
                <div className="col-span-2">
                  <span className="text-green-600">Market Factors:</span>
                  <ul className="list-disc list-inside mt-1">
                    {rateData.market_factors.map((factor, index) => (
                      <li key={index} className="text-green-700">{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}