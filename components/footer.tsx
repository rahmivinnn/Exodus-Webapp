export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Exodus Logistix</h3>
            <p className="text-gray-400">
              Professional freight management and logistics solutions for your business.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Truck Load</li>
              <li>Shared Truckload</li>
              <li>Refrigerated Transport</li>
              <li>Freight Solutions</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="text-gray-400">
              <p>915 Highland Pointe Drive</p>
              <p>Roseville, CA 95678</p>
              <p>(916) 303-5777</p>
              <p>loads@exoduslogistix.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Exodus Logistix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
