"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Truck, MapPin, Clock } from "lucide-react";

// ============================================================================
// INTERFACES
// ============================================================================

interface MarketData {
  averageRate: number;
  rateChange: number;
  volumeChange: number;
  topRoutes: Array<{
    route: string;
    rate: number;
    change: number;
  }>;
  equipmentTypes: Array<{
    type: string;
    rate: number;
    change: number;
  }>;
  regionalData: Array<{
    region: string;
    rate: number;
    change: number;
  }>;
}

interface MarketDashboardProps {
  refreshInterval?: number; // in milliseconds
  onDataUpdate?: (data: MarketData) => void;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockMarketData(): MarketData {
  const baseRate = 2.50 + Math.random() * 1.50; // .50 - .00 per mile
  const rateChange = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
  const volumeChange = (Math.random() - 0.5) * 0.3; // -0.15 to +0.15

  return {
    averageRate: parseFloat(baseRate.toFixed(2)),
    rateChange: parseFloat(rateChange.toFixed(3)),
    volumeChange: parseFloat(volumeChange.toFixed(3)),
    topRoutes: [
      { route: "Los Angeles, CA  New York, NY", rate: 3.25, change: 0.05 },
      { route: "Chicago, IL  Houston, TX", rate: 2.85, change: -0.02 },
      { route: "Dallas, TX  Miami, FL", rate: 2.95, change: 0.08 },
      { route: "Phoenix, AZ  Denver, CO", rate: 2.75, change: -0.03 },
      { route: "Atlanta, GA  Los Angeles, CA", rate: 3.15, change: 0.12 },
    ],
    equipmentTypes: [
      { type: "Van", rate: 2.45, change: 0.02 },
      { type: "Reefer", rate: 3.15, change: 0.05 },
      { type: "Flatbed", rate: 2.85, change: -0.01 },
      { type: "Step Deck", rate: 3.25, change: 0.08 },
    ],
    regionalData: [
      { region: "West Coast", rate: 3.05, change: 0.06 },
      { region: "East Coast", rate: 2.95, change: 0.03 },
      { region: "Midwest", rate: 2.75, change: -0.02 },
      { region: "South", rate: 2.85, change: 0.01 },
    ],
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return ${sign}%;
}

function getChangeColor(change: number): string {
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-gray-600";
}

function getChangeIcon(change: number) {
  if (change > 0) return <TrendingUp className="w-4 h-4" />;
  if (change < 0) return <TrendingDown className="w-4 h-4" />;
  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MarketDashboard({ 
  refreshInterval = 30000, // 30 seconds
  onDataUpdate 
}: MarketDashboardProps = {}) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockMarketData();
      setMarketData(data);
      setLastUpdated(new Date());
      onDataUpdate?.(data);
      
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    const interval = setInterval(fetchMarketData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // ========================================================================
  // RENDER FUNCTIONS
  // ========================================================================

  const renderOverviewCards = () => {
    if (!marketData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(marketData.averageRate)}</div>
            <p className={	ext-xs flex items-center }>
              {getChangeIcon(marketData.rateChange)}
              <span className="ml-1">{formatPercentage(marketData.rateChange)} from last week</span>
            </p>
          </CardContent>
        </Card>

        {/* Volume Change Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Change</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(marketData.volumeChange)}</div>
            <p className="text-xs text-muted-foreground">Shipment volume vs last week</p>
          </CardContent>
        </Card>

        {/* Last Updated Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTopRoutes = () => {
    if (!marketData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Top Routes
          </CardTitle>
          <CardDescription>
            Most popular freight routes with current rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{route.route}</p>
                  <p className="text-xs text-gray-500">Route #{index + 1}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(route.rate)}/mile</p>
                  <p className={	ext-xs flex items-center justify-end }>
                    {getChangeIcon(route.change)}
                    <span className="ml-1">{formatPercentage(route.change)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEquipmentTypes = () => {
    if (!marketData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Equipment Types
          </CardTitle>
          <CardDescription>
            Current rates by equipment type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketData.equipmentTypes.map((equipment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{equipment.type}</Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(equipment.rate)}/mile</p>
                  <p className={	ext-xs flex items-center justify-end }>
                    {getChangeIcon(equipment.change)}
                    <span className="ml-1">{formatPercentage(equipment.change)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRegionalData = () => {
    if (!marketData) return null;

    const filteredData = selectedRegion === "all" 
      ? marketData.regionalData 
      : marketData.regionalData.filter(region => region.region === selectedRegion);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Regional Rates</CardTitle>
              <CardDescription>
                Freight rates by region
              </CardDescription>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {marketData.regionalData.map((region) => (
                  <SelectItem key={region.region} value={region.region}>
                    {region.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{region.region}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(region.rate)}/mile</p>
                  <p className={	ext-xs flex items-center justify-end }>
                    {getChangeIcon(region.change)}
                    <span className="ml-1">{formatPercentage(region.change)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (loading && !marketData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Market Intelligence</h3>
          <p className="text-sm text-gray-600">
            Real-time freight market data and trends
          </p>
        </div>
        <Button 
          onClick={fetchMarketData} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTopRoutes()}
        {renderEquipmentTypes()}
      </div>

      {/* Regional Data */}
      {renderRegionalData()}
    </div>
  );
}

export default MarketDashboard;
