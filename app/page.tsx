export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🚛 Exodus Logistix
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Complete Logistics Management System
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            ✅ Successfully Deployed!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Your logistics platform is now running and ready for business.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">🚚 Shipping</h3>
              <p className="text-blue-600">Manage shipments and track deliveries</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-2">📊 Analytics</h3>
              <p className="text-green-600">Real-time insights and reporting</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-2">💳 Payments</h3>
              <p className="text-purple-600">Secure payment processing</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Repository: <a href="https://github.com/rahmivinnn/Exodus-Webapp" className="text-blue-600 hover:underline">GitHub</a>
          </p>
          <p className="text-sm text-gray-400">
            Built with Next.js 15, TypeScript, Tailwind CSS, and Prisma
          </p>
        </div>
      </div>
    </div>
  )
}