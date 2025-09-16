"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-green-600">Exodus Logistix</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link href="/shipping" className="text-gray-700 hover:text-green-600 font-medium">
              Shipping
            </Link>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6">
              Request a Quote
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}