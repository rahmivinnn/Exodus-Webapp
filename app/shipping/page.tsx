'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShipmentTracker } from '@/components/shipment-tracker'
import { ShipmentCreator } from '@/components/shipment-creator'
import { CarrierSelection } from '@/components/carrier-selection'
import { RouteOptimization } from '@/components/route-optimization'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { NotificationSystem } from '@/components/notification-system'
import { DocumentManagement } from '@/components/document-management'
import { useShipments } from '@/hooks/use-shipment-tracking'
import { 
  Package, 
  Plus, 
  Search, 
  Truck, 
  MapPin, 
  Clock,
  Filter,
  RefreshCw,
  Bell,
  FileText
} from 'lucide-react'
import type { ShipmentTracking } from '@/lib/greenscreens-api'

function getStatusColor(status: ShipmentTracking['status']) {
  switch (status) {
    case 'pending': return 'bg-gray-500'
    case 'picked_up': return 'bg-blue-500'
    case 'in_transit': return 'bg-yellow-500'
    case 'delivered': return 'bg-green-500'
    case 'delayed': return 'bg-orange-500'
    case 'cancelled': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getStatusText(status: ShipmentTracking['status']) {
  switch (status) {
    case 'pending': return 'Pending'
    case 'picked_up': return 'Picked Up'
    case 'in_transit': return 'In Transit'
    case 'delivered': return 'Delivered'
    case 'delayed': return 'Delayed'
    case 'cancelled': return 'Cancelled'
    default: return 'Unknown'
  }
}

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<ShipmentTracking | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    origin: '',
    destination: ''
  })
  
  const { shipments, loading, error, refetch } = useShipments({
    ...(filters.status && { status: filters.status as ShipmentTracking['status'] }),
    ...(filters.origin && { origin: filters.origin }),
    ...(filters.destination && { destination: filters.destination })
  })

  const handleShipmentCreated = (shipment: ShipmentTracking) => {
    setSelectedShipmentId(shipment.shipment_id)
    setActiveTab('track')
    refetch() // Refresh the shipments list
  }

  const handleTrackShipment = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId)
    setActiveTab('track')
  }

  const clearFilters = () => {
    setFilters({ status: '', origin: '', destination: '' })
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shipping Management</h1>
        <p className="text-muted-foreground">
          Create, track, and manage your shipments with real-time updates powered by greenscreens.ai
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Shipment
          </TabsTrigger>
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Track Shipment
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Route Optimization
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Manage
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                    <p className="text-2xl font-bold">{shipments.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === 'in_transit').length}
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === 'delivered').length}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === 'delayed').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Shipments
                  </CardTitle>
                  <CardDescription>Filter your shipments by status, origin, or destination</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount} active</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={refetch}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin</label>
                  <Input
                    placeholder="Filter by origin city"
                    value={filters.origin}
                    onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input
                    placeholder="Filter by destination city"
                    value={filters.destination}
                    onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>
                {loading ? 'Loading shipments...' : `${shipments.length} shipments found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Error loading shipments: {error}</p>
                  <Button variant="outline" onClick={refetch} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shipments found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('create')} 
                    className="mt-2"
                  >
                    Create Your First Shipment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.slice(0, 10).map((shipment) => (
                    <div key={shipment.shipment_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">#{shipment.tracking_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.origin.city} → {shipment.destination.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusText(shipment.status)}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTrackShipment(shipment.shipment_id)}
                        >
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Shipment Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Shipment
              </CardTitle>
              <CardDescription>
                Fill out the form below to create a new shipment with real-time tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentCreator onShipmentCreated={handleShipmentCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Track Shipment Tab */}
        <TabsContent value="track">
          <ShipmentTracker initialShipmentId={selectedShipmentId} />
        </TabsContent>

        {/* Route Optimization Tab */}
        <TabsContent value="routes" className="space-y-6">
          <RouteOptimization 
            onRouteOptimized={(route) => {
              console.log('Route optimized:', route)
              // Handle route optimization
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsDashboard
            onReportGenerated={(reportId) => {
              console.log('Analytics report generated:', reportId)
            }}
          />
        </TabsContent>

        {/* Notifications Tab */}
         <TabsContent value="notifications">
           <NotificationSystem onNotificationClick={(notification) => console.log('Notification clicked:', notification)} />
         </TabsContent>
         
         {/* Documents Tab */}
         <TabsContent value="documents">
           <DocumentManagement 
             shipmentId={selectedShipment?.id}
             onDocumentSelect={(document) => console.log('Document selected:', document)}
           />
         </TabsContent>
 
         {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          <CarrierSelection 
            onCarrierSelected={(carrierId, quoteId) => {
              console.log('Carrier selected:', carrierId, quoteId)
              // Handle carrier selection
            }}
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipment Management
              </CardTitle>
              <CardDescription>
                Advanced shipment management features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bulk Operations</CardTitle>
                    <CardDescription>Manage multiple shipments at once</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        Export Shipment Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Bulk Status Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analytics</CardTitle>
                    <CardDescription>View shipment analytics and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" />
                        Delivery Performance
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="mr-2 h-4 w-4" />
                        Route Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}