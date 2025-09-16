"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, BarChart3, MapPin, Loader2 } from "lucide-react"

export function MarketDashboard() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [region, setRegion] = useState("")
  const [loading, setLoading] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)
  const [trendsData, setTrendsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load mock trends data on component mount
    loadMockTrends()
  }, [])

  const loadMockTrends = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTrends = {
        trends: [
          {
            lane: "Los Angeles - New York",
            averageRate7Days: 1850,
            averageRate15Days: 1920,
            averageRate30Days: 1780,
            trend: "increasing" as const,
            volume: 150
          },
          {
            lane: "Chicago - Dallas",
            averageRate7Days: 1200,
            averageRate15Days: 1180,
            averageRate30Days: 1250,
            trend: "decreasing" as const,
            volume: 89
          },
          {
            lane: "Atlanta - Miami",
            averageRate7Days: 950,
            averageRate15Days: 960,
            averageRate30Days: 940,
            trend: "stable" as const,
            volume: 67
          }
        ]
      }
      
      setTrendsData(mockTrends)
    } catch (err) {
      setError("Failed to load market trends")
    } finally {
      setLoading(false)
    }
  }

  const handleMarketSearch = async () => {
    if (!origin || !destination) {
      setError("Please enter both origin and destination")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockMarketData = {
        lane: `${origin} - ${destination}`,
        averageRate7Days: Math.floor(Math.random() * 1000) + 1000,
        averageRate15Days: Math.floor(Math.random() * 1000) + 1000,
        averageRate30Days: Math.floor(Math.random() * 1000) + 1000,
        trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)],
        volume: Math.floor(Math.random() * 200) + 50
      }
      
      setMarketData(mockMarketData)
    } catch (err) {
      setError("Failed to fetch market intelligence")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Intelligence Dashboard
          </CardTitle>
          <CardDescription>
            Real-time freight market insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <div className="space-y-2">
              <Label htmlFor="region">Region (Optional)</Label>
              <Input
                id="region"
                placeholder="e.g., West Coast"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={handleMarketSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Get Market Intelligence
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {marketData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-3">Market Intelligence for {marketData.lane}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">7-Day Avg:</span>
                  <span className="ml-2 font-semibold">${marketData.averageRate7Days.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600">15-Day Avg:</span>
                  <span className="ml-2 font-semibold">${marketData.averageRate15Days.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600">30-Day Avg:</span>
                  <span className="ml-2 font-semibold">${marketData.averageRate30Days.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600">Trend:</span>
                  <span className="ml-2 font-semibold capitalize flex items-center">
                    {marketData.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : marketData.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : null}
                    {marketData.trend}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {trendsData && (
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>Current market activity across major lanes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendsData.trends.map((trend: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{trend.lane}</h4>
                    <span className="text-sm text-gray-500">Volume: {trend.volume}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">7-Day:</span>
                      <span className="ml-2 font-semibold">${trend.averageRate7Days.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">15-Day:</span>
                      <span className="ml-2 font-semibold">${trend.averageRate15Days.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">30-Day:</span>
                      <span className="ml-2 font-semibold">${trend.averageRate30Days.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Trend:</span>
                    {trend.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : trend.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : null}
                    <span className="text-sm font-medium capitalize">{trend.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}