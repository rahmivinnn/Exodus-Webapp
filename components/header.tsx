"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, Zap } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Greenscreens.ai</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link href="#quote-section" className="text-gray-700 hover:text-green-600 font-medium">
              Rate Quotes
            </Link>
            <Link href="#market-section" className="text-gray-700 hover:text-green-600 font-medium">
              Market Data
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-green-600 font-medium">
              Features
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API Online</span>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                onClick={() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
