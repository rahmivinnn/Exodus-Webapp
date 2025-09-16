import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="text-2xl font-bold text-green-400 mb-4">
              EXODUS LOGISTIX
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Advanced freight intelligence and shipping solutions powered by Greenscreens.ai
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white">
                  Shipping Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <p>915 Highland Pointe Drive, Roseville,</p>
              <p>California 95678, United States</p>
              <p className="mt-4">Phone: (916) 303-5777</p>
              <p>loads@exoduslogistix.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">Copyright © 2025 Exodus Logistix – All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}