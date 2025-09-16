"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Truck, DollarSign } from "lucide-react"

export function RateCalculator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [equipmentType, setEquipmentType] = useState("")
  const [weight, setWeight] = useState("")
  const [distance, setDistance] = useState("")
  const [loading, setLoading] = useState(false)
  const [rateData, setRateData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!origin || !destination || !equipmentType || !weight || !distance) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock rate calculation
      const mockRate = {
        predictedRate: Math.floor(Math.random() * 2000) + 1000,
        networkRate: Math.floor(Math.random() * 1800) + 900,
        confidence: Math.floor(Math.random() * 30) + 70,
        marketActivity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        lastUpdated: new Date().toISOString()
      }
      
      setRateData(mockRate)
    } catch (err) {
      setError("Failed to calculate rate. Please try again.")
    } finally {
      setLoading(false)
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
          Get instant freight rate predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin City</Label>
            <Input
              id="origin"
              placeholder="e.g., Los Angeles, CA"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination City</Label>
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
                <SelectItem value="van">Dry Van</SelectItem>
                <SelectItem value="reefer">Refrigerated</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 25000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (miles)</Label>
            <Input
              id="distance"
              type="number"
              placeholder="e.g., 2500"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleCalculate} 
          disabled={loading}
          className="w-full"
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {rateData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Rate Prediction</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Predicted Rate:</span>
                <span className="ml-2 font-semibold">${rateData.predictedRate.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-green-600">Network Rate:</span>
                <span className="ml-2 font-semibold">${rateData.networkRate.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-green-600">Confidence:</span>
                <span className="ml-2 font-semibold">{rateData.confidence}%</span>
              </div>
              <div>
                <span className="text-green-600">Market Activity:</span>
                <span className="ml-2 font-semibold capitalize">{rateData.marketActivity}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}