"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMarketIntelligence, useMarketTrends } from "@/lib/hooks/use-greenscreens"
import { ErrorBoundary } from "@/components/error-boundary"
import { TrendingUp, TrendingDown, BarChart3, MapPin, Loader2, AlertCircle } from "lucide-react"

export function MarketDashboard() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [region, setRegion] = useState("")

  const { data: marketData, loading: marketLoading, error: marketError, refetch: refetchMarketIntelligence } = useMarketIntelligence({
    origin,
    destination,
    enabled: false
  })
  const { data: trendsData, loading: trendsLoading, error: trendsError, refetch: refetchTrends } = useMarketTrends(region)

  useEffect(() => {
    // Load general market trends on component mount
    refetchTrends()
  }, [refetchTrends])

  const handleMarketSearch = useCallback(() => {
    if (origin && destination) {
      refetchMarketIntelligence()
    }
  }, [origin, destination, refetchMarketIntelligence])

  const isMarketFormValid = useMemo(() => {
    return !!(origin && destination)
  }, [origin, destination])

  return (
    <ErrorBoundary>
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
            disabled={marketLoading || !isMarketFormValid}
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
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 font-medium text-sm">Error loading market data</p>
            </div>
            <div className="text-red-600 text-sm mb-3">{marketError}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleMarketSearch}
            >
              Try Again
            </Button>
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
                  <span className="text-sm text-gray-600">Market Activity:</span>
                  <span className="font-semibold">{marketData.marketActivity || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Volume:</span>
                  <span className="font-semibold">{marketData.volume?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rate Trend:</span>
                  <div className="flex items-center gap-1">
                    {marketData.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : marketData.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className="font-semibold">{marketData.trend || 'stable'}</span>
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
                  <span className="text-sm text-gray-600">7-Day Average:</span>
                  <span className="font-semibold">${marketData.averageRate7Days?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">30-Day Average:</span>
                  <span className="font-semibold">${marketData.averageRate30Days?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lane:</span>
                  <span className="font-semibold text-sm">{marketData.lane || 'N/A'}</span>
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
                <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                  Market activity: {marketData.marketActivity || 'Unknown'}
                </div>
                <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                  Trend direction: {marketData.trend || 'Stable'}
                </div>
                <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                  Volume: {marketData.volume?.toLocaleString() || 'N/A'} shipments
                </div>
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
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-700 font-medium text-sm">Error loading trends</p>
              </div>
              <div className="text-red-600 text-sm mb-3">{trendsError}</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={refetchTrends}
              >
                Try Again
              </Button>
            </div>
          ) : trendsData && trendsData.trends && trendsData.trends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData.trends.map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{trend.lane || `Trend ${index + 1}`}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <div className="flex items-center gap-1">
                        {trend.trend === 'increasing' ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : trend.trend === 'decreasing' ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                        <span>{trend.trend || 'stable'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume:</span>
                      <span>{trend.volume?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">7-Day Avg:</span>
                      <span>${trend.averageRate7Days?.toLocaleString() || 'N/A'}</span>
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
    </ErrorBoundary>
  )
}