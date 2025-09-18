'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Truck, Clock, Star, BarChart3, PieChart, Download, RefreshCw } from 'lucide-react'
import {
  useShippingMetrics,
  useCarrierPerformance,
  useRouteEfficiency,
  useAnalyticsReports,
  useCustomDashboards,
  useDateRange
} from '@/hooks/use-analytics'

interface AnalyticsDashboardProps {
  onReportGenerated?: (reportId: string) => void
}

export function AnalyticsDashboard({ onReportGenerated }: AnalyticsDashboardProps) {
  const { dateRange, updateDateRange, setPresetRange } = useDateRange()
  const { metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useShippingMetrics(dateRange)
  const { performance, loading: performanceLoading, error: performanceError, refetch: refetchPerformance } = useCarrierPerformance(dateRange)
  const { efficiency, loading: efficiencyLoading, error: efficiencyError, refetch: refetchEfficiency } = useRouteEfficiency(dateRange)
  const { report, loading: reportLoading, error: reportError, generateReport } = useAnalyticsReports()
  const { dashboards, loading: dashboardsLoading, error: dashboardsError, saveDashboard } = useCustomDashboards()

  const [reportType, setReportType] = useState('comprehensive')
  const [selectedDashboard, setSelectedDashboard] = useState<string>('')

  const handleGenerateReport = async () => {
    try {
      await generateReport(dateRange, reportType)
      if (report && onReportGenerated) {
        onReportGenerated(report.id)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const handleRefreshAll = () => {
    refetchMetrics()
    refetchPerformance()
    refetchEfficiency()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive shipping and logistics analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select the time period for analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange('last7days')}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange('last30days')}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange('last90days')}
              >
                Last 90 Days
              </Button>
            </div>
            <div className="flex gap-2">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => updateDateRange({ start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => updateDateRange({ end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {metricsError && (
            <Alert>
              <AlertDescription>{metricsError}</AlertDescription>
            </Alert>
          )}

          {metricsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : metrics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalShipments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.activeShipments} active, {metrics.completedShipments} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Average: {formatCurrency(metrics.totalRevenue / metrics.totalShipments)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(metrics.onTimeDeliveryRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg transit: {metrics.averageTransitTime.toFixed(1)} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.customerSatisfactionScore.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.delayedShipments} delayed shipments
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No metrics data available for the selected period</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Carriers Tab */}
        <TabsContent value="carriers" className="space-y-4">
          {performanceError && (
            <Alert>
              <AlertDescription>{performanceError}</AlertDescription>
            </Alert>
          )}

          {performanceLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : performance.length > 0 ? (
            <div className="grid gap-4">
              {performance.map((carrier) => (
                <Card key={carrier.carrierId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{carrier.carrierName}</CardTitle>
                        <CardDescription>Carrier ID: {carrier.carrierId}</CardDescription>
                      </div>
                      <Badge variant={carrier.onTimeRate > 0.9 ? 'default' : carrier.onTimeRate > 0.8 ? 'secondary' : 'destructive'}>
                        {formatPercentage(carrier.onTimeRate)} On-Time
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Shipments</p>
                        <p className="text-2xl font-bold">{carrier.totalShipments}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Average Cost</p>
                        <p className="text-2xl font-bold">{formatCurrency(carrier.averageCost)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rating</p>
                        <p className="text-2xl font-bold">{carrier.averageRating.toFixed(1)}/5</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Issues</p>
                        <p className="text-2xl font-bold text-red-600">{carrier.issues}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No carrier performance data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          {efficiencyError && (
            <Alert>
              <AlertDescription>{efficiencyError}</AlertDescription>
            </Alert>
          )}

          {efficiencyLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : efficiency.length > 0 ? (
            <div className="grid gap-4">
              {efficiency.map((route) => (
                <Card key={route.routeId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{route.routeName}</CardTitle>
                        <CardDescription>Route ID: {route.routeId}</CardDescription>
                      </div>
                      <Badge variant={route.costEfficiency > 0.8 ? 'default' : route.costEfficiency > 0.6 ? 'secondary' : 'destructive'}>
                        {formatPercentage(route.costEfficiency)} Efficient
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-lg font-bold">{route.totalDistance.toFixed(1)} mi</p>
                        <p className="text-xs text-muted-foreground">vs {route.actualDistance.toFixed(1)} actual</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-lg font-bold">{(route.plannedTime / 60).toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">vs {(route.actualTime / 60).toFixed(1)}h actual</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fuel Efficiency</p>
                        <p className="text-lg font-bold">{route.fuelEfficiency.toFixed(1)} mpg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Utilization</p>
                        <p className="text-lg font-bold">{formatPercentage(route.utilizationRate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No route efficiency data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Analytics Report</CardTitle>
              <CardDescription>Create comprehensive reports for the selected time period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                      <SelectItem value="performance">Performance Summary</SelectItem>
                      <SelectItem value="financial">Financial Analysis</SelectItem>
                      <SelectItem value="operational">Operational Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGenerateReport} disabled={reportLoading}>
                    {reportLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Generate Report
                  </Button>
                </div>
              </div>

              {reportError && (
                <Alert>
                  <AlertDescription>{reportError}</AlertDescription>
                </Alert>
              )}

              {report && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Insights</h4>
                        <ul className="space-y-1">
                          {report.insights.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {report.insights.costSavingOpportunities.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Cost Saving Opportunities</h4>
                          <div className="space-y-2">
                            {report.insights.costSavingOpportunities.map((opp, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                <p className="font-medium text-green-800">{opp.description}</p>
                                <p className="text-sm text-green-600">
                                  Potential savings: {formatCurrency(opp.potentialSavings)}
                                </p>
                                <p className="text-xs text-green-500">{opp.actionRequired}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}