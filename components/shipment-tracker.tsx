'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useShipmentTracking } from '@/hooks/use-shipment-tracking'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Phone, 
  User, 
  AlertTriangle,
  CheckCircle,
  Circle,
  FileText,
  RefreshCw
} from 'lucide-react'
import type { ShipmentTracking } from '@/lib/greenscreens-api'

interface ShipmentTrackerProps {
  initialShipmentId?: string
}

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

function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical') {
  switch (severity) {
    case 'low': return 'bg-blue-100 text-blue-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'critical': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function ShipmentTracker({ initialShipmentId = '' }: ShipmentTrackerProps) {
  const [shipmentId, setShipmentId] = useState(initialShipmentId)
  const [searchId, setSearchId] = useState(initialShipmentId)
  const { shipment, loading, error, refetch } = useShipmentTracking(searchId)

  const handleSearch = () => {
    setSearchId(shipmentId)
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Shipment
          </CardTitle>
          <CardDescription>
            Enter your shipment ID or tracking number to get real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter shipment ID or tracking number"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!shipmentId.trim() || loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Track'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shipment Details */}
      {shipment && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipment #{shipment.shipment_id}
                  </CardTitle>
                  <CardDescription>Tracking: {shipment.tracking_number}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(shipment.status)}>
                    {getStatusText(shipment.status)}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Current Location
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {shipment.current_location.city}, {shipment.current_location.state}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Carrier
                  </h4>
                  <p className="text-sm text-muted-foreground">{shipment.carrier.name}</p>
                  {shipment.carrier.driver_name && (
                    <p className="text-xs text-muted-foreground">
                      Driver: {shipment.carrier.driver_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Delivery
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(shipment.timeline.delivery_estimated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Origin</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{shipment.origin.address}</p>
                    <p>{shipment.origin.city}, {shipment.origin.state} {shipment.origin.zip}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Destination</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{shipment.destination.address}</p>
                    <p>{shipment.destination.city}, {shipment.destination.state} {shipment.destination.zip}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipment.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                      {index < shipment.milestones.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{milestone.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(milestone.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      <p className="text-xs text-muted-foreground">{milestone.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {shipment.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shipment.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      {alert.resolved && (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {shipment.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Shipping Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shipment.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {doc.type.replace('_', ' ')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Carrier Contact</h4>
                  <p className="text-sm text-muted-foreground">{shipment.carrier.contact}</p>
                </div>
                {shipment.carrier.driver_phone && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Driver Contact</h4>
                    <p className="text-sm text-muted-foreground">{shipment.carrier.driver_phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}