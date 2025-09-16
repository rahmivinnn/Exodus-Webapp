"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Clock, Star, CheckCircle, Award, TrendingUp, MapPin } from "lucide-react"
import { useRatePrediction, useMarketIntelligence, useCarrierBids, useGreenscreensHealth } from "@/lib/hooks/use-greenscreens"
import { useState } from "react"

export default function HomePage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [equipment, setEquipment] = useState('van')
  const [weight, setWeight] = useState('')
  const [commodity, setCommodity] = useState('')
  const [pickupDate, setPickupDate] = useState('')

  const { data: rateData, loading: rateLoading, error: rateError, refetch: refetchRates } = useRatePrediction({
    origin,
    destination,
    equipment,
    enabled: !!origin && !!destination
  })

  const { data: marketData, loading: marketLoading, error: marketError } = useMarketIntelligence({
    origin,
    destination,
    enabled: !!origin && !!destination
  })

  const { data: healthData, loading: healthLoading, error: healthError } = useGreenscreensHealth()

  const handleGetQuote = () => {
    if (origin && destination) {
      refetchRates()
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-green-600 to-green-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Greenscreens.ai
              <br />
              <span className="text-green-300">Freight Intelligence</span>
            </h1>
            <p className="text-xl mb-8">
              Get instant rate predictions, market intelligence, and carrier insights powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Rate Quote
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
                onClick={() => document.getElementById('market-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Market Data
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API Health Status */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${healthData?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                API Status: {healthLoading ? 'Checking...' : healthData?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Quote Section */}
      <section id="quote-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Instant Rate Predictions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enter your shipment details to get AI-powered rate predictions and market insights.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Rate Quote Calculator</CardTitle>
                <CardDescription>
                  Get accurate freight rate predictions using Greenscreens.ai intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                    <Input
                      placeholder="e.g., Los Angeles, CA"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                    <Input
                      placeholder="e.g., New York, NY"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
                    <Select value={equipment} onValueChange={setEquipment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="reefer">Reefer</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <Input
                      placeholder="e.g., 10000"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                    <Input
                      placeholder="e.g., Electronics"
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleGetQuote}
                    disabled={rateLoading || !origin || !destination}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    {rateLoading ? 'Getting Quote...' : 'Get Rate Quote'}
                  </Button>
                </div>

                {rateError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">Error: {rateError}</p>
                  </div>
                )}

                {rateData && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Rate Prediction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700">Predicted Rate</p>
                        <p className="text-2xl font-bold text-green-800">${rateData.predictedRate?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Network Rate</p>
                        <p className="text-2xl font-bold text-green-800">${rateData.networkRate?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Confidence</p>
                        <p className="text-lg font-semibold text-green-800">{(rateData.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Market Activity</p>
                        <Badge variant={rateData.marketActivity === 'high' ? 'default' : 'secondary'}>
                          {rateData.marketActivity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Intelligence Section */}
      <section id="market-section" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Market Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time market insights and freight trends for your lane.
            </p>
          </div>

          {marketData && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Market Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Lane: {origin} → {destination}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">7-Day Average</p>
                      <p className="text-2xl font-bold text-green-600">${marketData.averageRate7Days?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">15-Day Average</p>
                      <p className="text-2xl font-bold text-green-600">${marketData.averageRate15Days?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">30-Day Average</p>
                      <p className="text-2xl font-bold text-green-600">${marketData.averageRate30Days?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Trend: </span>
                      <Badge variant={marketData.trend === 'increasing' ? 'default' : marketData.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                        {marketData.trend}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Volume: {marketData.volume?.toLocaleString()} shipments
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {marketError && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">Market data error: {marketError}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Greenscreens.ai Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Rate Predictions",
                description: "AI-powered rate predictions with high accuracy and confidence scores.",
              },
              {
                icon: MapPin,
                title: "Market Intelligence",
                description: "Real-time market trends and lane-specific insights.",
              },
              {
                icon: Clock,
                title: "Instant Results",
                description: "Get quotes and market data in seconds, not hours.",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
