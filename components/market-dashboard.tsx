"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMarketIntelligence, useMarketTrends } from "@/lib/hooks/use-greenscreens"
import { TrendingUp, TrendingDown, BarChart3, MapPin, Loader2 } from "lucide-react"

export function MarketDashboard() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [region, setRegion] = useState("")

  const { data: marketData, loading: marketLoading, error: marketError, fetchMarketIntelligence } = useMarketIntelligence()
  const { data: trendsData, loading: trendsLoading, error: trendsError, fetchMarketTrends } = useMarketTrends()

  useEffect(() => {
    // Load general market trends on component mount
    fetchMarketTrends()
  }, [])

  const handleMarketSearch = () => {
    if (origin && destination) {
      fetchMarketIntelligence({ origin, destination, region })
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
            Real-time freight market insights powered by Greenscreens.ai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="market-origin">Origin</Label>
              <Input
                id="market-origin"
                placeholder="e.g., Chicago, IL"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-destination">Destination</Label>
              <Input
                id="market-destination"
                placeholder="e.g., Atlanta, GA"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-region">Region (Optional)</Label>
              <Input
                id="market-region"
                placeholder="e.g., Southeast"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleMarketSearch} 
            disabled={marketLoading || !origin || !destination}
            className="w-full md:w-auto"
          >
            {marketLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Get Market Intelligence
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {marketError && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-700 text-sm">{marketError}</div>
          </CardContent>
        </Card>
      )}

      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Demand Level:</span>
                  <span className="font-semibold">{marketData.demand_level || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className="font-semibold">{marketData.capacity_level || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rate Trend:</span>
                  <div className="flex items-center gap-1">
                    {marketData.rate_trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : marketData.rate_trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className="font-semibold">{marketData.rate_trend || 'Stable'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rate:</span>
                  <span className="font-semibold">${marketData.average_rate?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rate Range:</span>
                  <span className="font-semibold">
                    ${marketData.rate_range?.min?.toLocaleString() || 'N/A'} - ${marketData.rate_range?.max?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="font-semibold text-sm">{marketData.last_updated || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {marketData.insights && marketData.insights.length > 0 ? (
                  marketData.insights.map((insight, index) => (
                    <div key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                      {insight}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No insights available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading market trends...</span>
            </div>
          ) : trendsError ? (
            <div className="text-red-700 text-sm">{trendsError}</div>
          ) : trendsData && trendsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData.map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{trend.region || `Trend ${index + 1}`}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment Type:</span>
                      <span>{trend.equipment_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <div className="flex items-center gap-1">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                        <span>{trend.direction || 'Stable'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change:</span>
                      <span className={trend.percentage_change > 0 ? 'text-green-600' : trend.percentage_change < 0 ? 'text-red-600' : ''}>
                        {trend.percentage_change ? `${trend.percentage_change > 0 ? '+' : ''}${trend.percentage_change}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No market trends available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}