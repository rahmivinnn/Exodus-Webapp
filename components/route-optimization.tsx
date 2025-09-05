'use client'

import React, { useState } from 'react'
import { 
  useRouteOptimization, 
  useWaypointManager, 
  useSavedRoutes,
  useRouteAnalytics 
} from '@/hooks/use-route-optimization'
import { RouteWaypoint } from '@/lib/greenscreens-api'

interface RouteOptimizationProps {
  onRouteOptimized?: (route: any) => void
}

export function RouteOptimization({ onRouteOptimized }: RouteOptimizationProps) {
  const [vehicleType, setVehicleType] = useState('truck')
  const [optimization, setOptimization] = useState<'distance' | 'time' | 'fuel' | 'cost'>('distance')
  const [constraints, setConstraints] = useState({
    maxDistance: 0,
    maxDuration: 0,
    avoidTolls: false,
    avoidHighways: false
  })
  const [showSavedRoutes, setShowSavedRoutes] = useState(false)
  const [routeName, setRouteName] = useState('')
  
  const { optimizedRoute, loading, error, optimizeRoute, clearRoute } = useRouteOptimization()
  const { waypoints, addWaypoint, removeWaypoint, updateWaypoint, clearWaypoints } = useWaypointManager()
  const { routes: savedRoutes, saveRoute, fetchSavedRoutes } = useSavedRoutes()
  const { analytics } = useRouteAnalytics(optimizedRoute?.id)

  const handleAddWaypoint = () => {
    addWaypoint({
      address: '',
      coordinates: { lat: 0, lng: 0 },
      type: 'stop',
      serviceTime: 15
    })
  }

  const handleOptimizeRoute = async () => {
    if (waypoints.length < 2) {
      alert('Please add at least 2 waypoints')
      return
    }

    try {
      const request = {
        waypoints,
        vehicleType,
        constraints: {
          ...(constraints.maxDistance > 0 && { maxDistance: constraints.maxDistance }),
          ...(constraints.maxDuration > 0 && { maxDuration: constraints.maxDuration }),
          avoidTolls: constraints.avoidTolls,
          avoidHighways: constraints.avoidHighways
        },
        optimization
      }

      const result = await optimizeRoute(request)
      onRouteOptimized?.(result)
    } catch (error) {
      console.error('Failed to optimize route:', error)
    }
  }

  const handleSaveRoute = async () => {
    if (!optimizedRoute) return
    
    try {
      await saveRoute(optimizedRoute, routeName || undefined)
      setRouteName('')
      alert('Route saved successfully!')
    } catch (error) {
      console.error('Failed to save route:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Route Configuration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Route Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Priority
            </label>
            <select
              value={optimization}
              onChange={(e) => setOptimization(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">Shortest Distance</option>
              <option value="time">Fastest Time</option>
              <option value="fuel">Fuel Efficient</option>
              <option value="cost">Lowest Cost</option>
            </select>
          </div>
        </div>
        
        {/* Constraints */}
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Constraints</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (miles)
              </label>
              <input
                type="number"
                value={constraints.maxDistance}
                onChange={(e) => setConstraints(prev => ({ ...prev, maxDistance: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 = no limit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Duration (hours)
              </label>
              <input
                type="number"
                value={constraints.maxDuration}
                onChange={(e) => setConstraints(prev => ({ ...prev, maxDuration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 = no limit"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraints.avoidTolls}
                onChange={(e) => setConstraints(prev => ({ ...prev, avoidTolls: e.target.checked }))}
                className="mr-2"
              />
              Avoid Tolls
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraints.avoidHighways}
                onChange={(e) => setConstraints(prev => ({ ...prev, avoidHighways: e.target.checked }))}
                className="mr-2"
              />
              Avoid Highways
            </label>
          </div>
        </div>
      </div>

      {/* Waypoints Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Waypoints</h3>
          <div className="space-x-2">
            <button
              onClick={handleAddWaypoint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Waypoint
            </button>
            <button
              onClick={clearWaypoints}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">Waypoint {index + 1}</span>
                <button
                  onClick={() => removeWaypoint(waypoint.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={waypoint.address}
                    onChange={(e) => updateWaypoint(waypoint.id, { address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={waypoint.type}
                    onChange={(e) => updateWaypoint(waypoint.id, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                    <option value="stop">Stop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Time (min)
                  </label>
                  <input
                    type="number"
                    value={waypoint.serviceTime || 0}
                    onChange={(e) => updateWaypoint(waypoint.id, { serviceTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleOptimizeRoute}
            disabled={waypoints.length < 2 || loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Optimizing...' : 'Optimize Route'}
          </button>
          {optimizedRoute && (
            <button
              onClick={clearRoute}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear Route
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Optimized Route Results */}
      {optimizedRoute && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Optimized Route</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Route name (optional)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveRoute}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Route
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Distance</h4>
              <p className="text-2xl font-bold text-blue-600">{optimizedRoute.totalDistance} mi</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Duration</h4>
              <p className="text-2xl font-bold text-green-600">{Math.round(optimizedRoute.totalDuration / 60)} hrs</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Estimated Fuel</h4>
              <p className="text-2xl font-bold text-yellow-600">{optimizedRoute.estimatedFuel} gal</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Estimated Cost</h4>
              <p className="text-2xl font-bold text-purple-600">${optimizedRoute.estimatedCost}</p>
            </div>
          </div>
          
          {/* Route Analytics */}
          {analytics && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Route Analytics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Efficiency:</span>
                  <span className="ml-2">{analytics.efficiency}%</span>
                </div>
                <div>
                  <span className="font-medium">Fuel Savings:</span>
                  <span className="ml-2">{analytics.fuelSavings} gal</span>
                </div>
                <div>
                  <span className="font-medium">Time Savings:</span>
                  <span className="ml-2">{analytics.timeSavings} min</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Waypoint Order */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Optimized Waypoint Order</h4>
            <div className="space-y-2">
              {optimizedRoute.waypoints.map((waypoint, index) => (
                <div key={waypoint.id} className="flex items-center p-2 bg-gray-50 rounded">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{waypoint.address}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      waypoint.type === 'pickup' ? 'bg-green-100 text-green-800' :
                      waypoint.type === 'delivery' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {waypoint.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Routes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Saved Routes</h3>
          <button
            onClick={() => setShowSavedRoutes(!showSavedRoutes)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showSavedRoutes ? 'Hide' : 'Show'} Saved Routes
          </button>
        </div>
        
        {showSavedRoutes && (
          <div className="space-y-3">
            {savedRoutes.length === 0 ? (
              <p className="text-gray-500">No saved routes yet.</p>
            ) : (
              savedRoutes.map((route) => (
                <div key={route.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Route {route.id}</h4>
                      <p className="text-sm text-gray-600">
                        {route.totalDistance} mi • {Math.round(route.totalDuration / 60)} hrs • ${route.estimatedCost}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Load this route for editing
                        console.log('Load route:', route)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}