import Link from "next/link"
import { TrendingUp, Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold">
                Greenscreens.ai
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              AI-powered freight intelligence platform providing instant rate predictions, 
              market insights, and carrier analytics for the logistics industry.
            </p>
            <div className="flex space-x-4">
              <Github className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
              <Mail className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* API Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">API Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Rate Predictions</li>
              <li className="text-gray-300">Market Intelligence</li>
              <li className="text-gray-300">Carrier Analytics</li>
              <li className="text-gray-300">Real-time Data</li>
              <li className="text-gray-300">Batch Processing</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#quote-section" className="text-gray-300 hover:text-white">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="#market-section" className="text-gray-300 hover:text-white">
                  Market Data
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-300 hover:text-white">
                  Features
                </Link>
              </li>
              <li className="text-gray-300">Documentation</li>
              <li className="text-gray-300">API Status</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">Copyright © 2025 Greenscreens.ai – All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
