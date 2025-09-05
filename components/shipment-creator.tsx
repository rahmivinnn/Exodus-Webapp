'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateShipment } from '@/hooks/use-shipment-tracking'
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Calendar,
  Truck,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import type { CreateShipmentRequest, ShipmentTracking } from '@/lib/greenscreens-api'

interface ShipmentCreatorProps {
  onShipmentCreated?: (shipment: ShipmentTracking) => void
}

export function ShipmentCreator({ onShipmentCreated }: ShipmentCreatorProps) {
  const { createShipment, loading, error } = useCreateShipment()
  const [success, setSuccess] = useState(false)
  const [createdShipment, setCreatedShipment] = useState<ShipmentTracking | null>(null)

  const [formData, setFormData] = useState<CreateShipmentRequest>({
    origin: {
      address: '',
      city: '',
      state: '',
      zip: '',
      contact_name: '',
      contact_phone: ''
    },
    destination: {
      address: '',
      city: '',
      state: '',
      zip: '',
      contact_name: '',
      contact_phone: ''
    },
    cargo: {
      description: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0
      },
      value: 0,
      special_instructions: ''
    },
    service_type: '',
    pickup_date: '',
    delivery_date: ''
  })

  const handleInputChange = (section: keyof CreateShipmentRequest, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleNestedInputChange = (section: keyof CreateShipmentRequest, nestedSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...(prev[section] as any)[nestedSection],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    
    const result = await createShipment(formData)
    if (result) {
      setSuccess(true)
      setCreatedShipment(result)
      onShipmentCreated?.(result)
      
      // Reset form after successful creation
      setTimeout(() => {
        setSuccess(false)
        setCreatedShipment(null)
      }, 5000)
    }
  }

  const isFormValid = () => {
    return (
      formData.origin.address &&
      formData.origin.city &&
      formData.origin.state &&
      formData.origin.zip &&
      formData.destination.address &&
      formData.destination.city &&
      formData.destination.state &&
      formData.destination.zip &&
      formData.cargo.description &&
      formData.cargo.weight > 0 &&
      formData.pickup_date &&
      formData.delivery_date &&
      formData.service_type
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && createdShipment && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Shipment created successfully! Tracking ID: <strong>{createdShipment.tracking_number}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Pickup Location
            </CardTitle>
            <CardDescription>Enter the pickup address and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-address">Address *</Label>
                <Input
                  id="origin-address"
                  placeholder="Street address"
                  value={formData.origin.address}
                  onChange={(e) => handleInputChange('origin', 'address', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-city">City *</Label>
                <Input
                  id="origin-city"
                  placeholder="City"
                  value={formData.origin.city}
                  onChange={(e) => handleInputChange('origin', 'city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-state">State *</Label>
                <Input
                  id="origin-state"
                  placeholder="State"
                  value={formData.origin.state}
                  onChange={(e) => handleInputChange('origin', 'state', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-zip">ZIP Code *</Label>
                <Input
                  id="origin-zip"
                  placeholder="ZIP Code"
                  value={formData.origin.zip}
                  onChange={(e) => handleInputChange('origin', 'zip', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-contact">Contact Name</Label>
                <Input
                  id="origin-contact"
                  placeholder="Contact person"
                  value={formData.origin.contact_name}
                  onChange={(e) => handleInputChange('origin', 'contact_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin-phone">Contact Phone</Label>
                <Input
                  id="origin-phone"
                  placeholder="Phone number"
                  value={formData.origin.contact_phone}
                  onChange={(e) => handleInputChange('origin', 'contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Delivery Location
            </CardTitle>
            <CardDescription>Enter the delivery address and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dest-address">Address *</Label>
                <Input
                  id="dest-address"
                  placeholder="Street address"
                  value={formData.destination.address}
                  onChange={(e) => handleInputChange('destination', 'address', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-city">City *</Label>
                <Input
                  id="dest-city"
                  placeholder="City"
                  value={formData.destination.city}
                  onChange={(e) => handleInputChange('destination', 'city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-state">State *</Label>
                <Input
                  id="dest-state"
                  placeholder="State"
                  value={formData.destination.state}
                  onChange={(e) => handleInputChange('destination', 'state', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-zip">ZIP Code *</Label>
                <Input
                  id="dest-zip"
                  placeholder="ZIP Code"
                  value={formData.destination.zip}
                  onChange={(e) => handleInputChange('destination', 'zip', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-contact">Contact Name</Label>
                <Input
                  id="dest-contact"
                  placeholder="Contact person"
                  value={formData.destination.contact_name}
                  onChange={(e) => handleInputChange('destination', 'contact_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-phone">Contact Phone</Label>
                <Input
                  id="dest-phone"
                  placeholder="Phone number"
                  value={formData.destination.contact_phone}
                  onChange={(e) => handleInputChange('destination', 'contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargo Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cargo Details
            </CardTitle>
            <CardDescription>Provide details about the cargo being shipped</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cargo-description">Description *</Label>
              <Textarea
                id="cargo-description"
                placeholder="Describe the cargo"
                value={formData.cargo.description}
                onChange={(e) => handleInputChange('cargo', 'description', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo-weight">Weight (lbs) *</Label>
                <Input
                  id="cargo-weight"
                  type="number"
                  placeholder="Weight in pounds"
                  value={formData.cargo.weight || ''}
                  onChange={(e) => handleInputChange('cargo', 'weight', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo-value">Value ($)</Label>
                <Input
                  id="cargo-value"
                  type="number"
                  placeholder="Cargo value"
                  value={formData.cargo.value || ''}
                  onChange={(e) => handleInputChange('cargo', 'value', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo-length">Length (ft)</Label>
                <Input
                  id="cargo-length"
                  type="number"
                  placeholder="Length"
                  value={formData.cargo.dimensions.length || ''}
                  onChange={(e) => handleNestedInputChange('cargo', 'dimensions', 'length', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo-width">Width (ft)</Label>
                <Input
                  id="cargo-width"
                  type="number"
                  placeholder="Width"
                  value={formData.cargo.dimensions.width || ''}
                  onChange={(e) => handleNestedInputChange('cargo', 'dimensions', 'width', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo-height">Height (ft)</Label>
                <Input
                  id="cargo-height"
                  type="number"
                  placeholder="Height"
                  value={formData.cargo.dimensions.height || ''}
                  onChange={(e) => handleNestedInputChange('cargo', 'dimensions', 'height', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-instructions">Special Instructions</Label>
              <Textarea
                id="cargo-instructions"
                placeholder="Any special handling instructions"
                value={formData.cargo.special_instructions}
                onChange={(e) => handleInputChange('cargo', 'special_instructions', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Service Details
            </CardTitle>
            <CardDescription>Select service type and schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type *</Label>
                <Select value={formData.service_type} onValueChange={(value) => handleInputChange('', 'service_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="white_glove">White Glove</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-date">Pickup Date *</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => handleInputChange('', 'pickup_date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-date">Delivery Date *</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('', 'delivery_date', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!isFormValid() || loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Shipment'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}