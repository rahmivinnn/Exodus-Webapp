'use client'

import React, { useState } from 'react'
import { useCarrierProfiles, useCarrierQuotes, useCarrierSelection } from '@/hooks/use-carrier-selection'
import { CarrierQuoteRequest } from '@/lib/greenscreens-api'

interface CarrierSelectionProps {
  onCarrierSelected?: (carrierId: string, quoteId: string) => void
}

export function CarrierSelection({ onCarrierSelected }: CarrierSelectionProps) {
  const [filters, setFilters] = useState({
    serviceArea: '',
    equipmentType: '',
    minRating: 0
  })
  
  const [quoteRequest, setQuoteRequest] = useState<CarrierQuoteRequest>({
    origin: '',
    destination: '',
    equipment: '',
    weight: 0,
    commodity: '',
    pickupDate: '',
    deliveryDate: ''
  })
  
  const [showQuotes, setShowQuotes] = useState(false)
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  
  const { carriers, loading: carriersLoading, error: carriersError } = useCarrierProfiles(filters)
  const { quotes, loading: quotesLoading, error: quotesError, getQuotes } = useCarrierQuotes()
  const { loading: selectionLoading, error: selectionError, selectCarrier } = useCarrierSelection()

  const handleGetQuotes = async () => {
    if (!quoteRequest.origin || !quoteRequest.destination || !quoteRequest.equipment || !quoteRequest.pickupDate) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      await getQuotes({
        ...quoteRequest,
        carrierIds: selectedCarriers
      })
      setShowQuotes(true)
    } catch (error) {
      console.error('Failed to get quotes:', error)
    }
  }

  const handleSelectCarrier = async (carrierId: string, quoteId: string) => {
    try {
      await selectCarrier(carrierId, quoteId)
      onCarrierSelected?.(carrierId, quoteId)
      alert('Carrier selected successfully!')
    } catch (error) {
      console.error('Failed to select carrier:', error)
    }
  }

  const toggleCarrierSelection = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filter Carriers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Area
            </label>
            <input
              type="text"
              value={filters.serviceArea}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceArea: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., US, Canada"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Type
            </label>
            <select
              value={filters.equipmentType}
              onChange={(e) => setFilters(prev => ({ ...prev, equipmentType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Equipment</option>
              <option value="dry_van">Dry Van</option>
              <option value="refrigerated">Refrigerated</option>
              <option value="flatbed">Flatbed</option>
              <option value="step_deck">Step Deck</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      {/* Quote Request Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Request Quotes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin *
            </label>
            <input
              type="text"
              value={quoteRequest.origin}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Origin city, state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={quoteRequest.destination}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Destination city, state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment *
            </label>
            <select
              value={quoteRequest.equipment}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, equipment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Equipment</option>
              <option value="dry_van">Dry Van</option>
              <option value="refrigerated">Refrigerated</option>
              <option value="flatbed">Flatbed</option>
              <option value="step_deck">Step Deck</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={quoteRequest.weight}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Weight in pounds"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Date *
            </label>
            <input
              type="date"
              value={quoteRequest.pickupDate}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, pickupDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date
            </label>
            <input
              type="date"
              value={quoteRequest.deliveryDate}
              onChange={(e) => setQuoteRequest(prev => ({ ...prev, deliveryDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Carriers List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Available Carriers</h3>
        {carriersLoading && <p className="text-gray-500">Loading carriers...</p>}
        {carriersError && <p className="text-red-500">Error: {carriersError}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {carriers.map((carrier) => (
            <div key={carrier.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{carrier.name}</h4>
                <input
                  type="checkbox"
                  checked={selectedCarriers.includes(carrier.id)}
                  onChange={() => toggleCarrierSelection(carrier.id)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">{carrier.description}</p>
              <div className="flex justify-between text-sm">
                <span>Rating: {carrier.rating}/5</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  carrier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {carrier.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleGetQuotes}
          disabled={selectedCarriers.length === 0 || quotesLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {quotesLoading ? 'Getting Quotes...' : `Get Quotes from ${selectedCarriers.length} Carriers`}
        </button>
      </div>

      {/* Quotes */}
      {showQuotes && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Carrier Quotes</h3>
          {quotesError && <p className="text-red-500">Error: {quotesError}</p>}
          
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{quote.carrierName}</h4>
                    <p className="text-2xl font-bold text-green-600">${quote.price}</p>
                  </div>
                  <button
                    onClick={() => handleSelectCarrier(quote.carrierId, quote.id)}
                    disabled={selectionLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {selectionLoading ? 'Selecting...' : 'Select'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Transit Time:</span>
                    <p>{quote.transitTime} days</p>
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span>
                    <p>{quote.equipment}</p>
                  </div>
                  <div>
                    <span className="font-medium">Valid Until:</span>
                    <p>{new Date(quote.validUntil).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Service Level:</span>
                    <p>{quote.serviceLevel}</p>
                  </div>
                </div>
                {quote.notes && (
                  <div className="mt-2">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-gray-600">{quote.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {selectionError}</p>
        </div>
      )}
    </div>
  )
}