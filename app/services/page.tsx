import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Package, Thermometer, Wrench, ArrowLeftRight, Warehouse, Shield, Zap } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400/30 mb-6">
                <span className="text-blue-300 text-sm font-medium">🚛 Our Services</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Comprehensive
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Logistics</span>
                <br />
                Solutions
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                From Full Truckload to Warehousing, Exodus Logistix delivers excellence at every step of your supply chain journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                  Get a Quote
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              🚛 Core Services
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Core
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of logistics services designed to meet your specific transportation and supply chain needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                title: "Full Truckload (FTL)",
                description: "Dedicated truck capacity for large shipments requiring direct and efficient delivery with guaranteed space.",
                icon: Truck,
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
              },
              {
                title: "Shared Truckload (STL)",
                description: "Cost-effective solution for shipments under 10 pallets and 10,000 lbs, combining multiple loads in one truck.",
                icon: Package,
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
              },
              {
                title: "Less Than Truckload (LTL)",
                description: "Ideal for smaller shipments, sharing truck space to optimize costs and efficiency for your business.",
                icon: ArrowLeftRight,
                gradient: "from-cyan-500 to-cyan-600",
                bgGradient: "from-cyan-50 to-cyan-100",
              },
              {
                title: "Refrigerated Transport",
                description: "Specialized equipment and monitoring for temperature-sensitive cargo, ensuring product integrity throughout transit.",
                icon: Thermometer,
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100",
              },
            ].map((service, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <CardContent className="relative z-10 p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <Button className={`w-full bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg`}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Dry Goods Transportation",
                description:
                  "Secure and efficient delivery of non-perishable items across various industries and destinations.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Intermodal Solutions",
                description: "Combining truck and rail transport for flexible and cost-effective shipping options.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Warehousing & Cross-Docking",
                description: "Secure storage and efficient cross-docking services to streamline your supply chain.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Government Logistics",
                description:
                  "Exodus Logistix is proud to offer specialized logistics services tailored to the unique needs of government contracts.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
            ].map((service, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('${service.image}')` }} />
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <Button className={`${service.buttonColor} hover:opacity-90 text-white w-full`}>Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Freight Theft Prevention */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Freight Theft Prevention</h2>
                <h3 className="text-xl font-semibold mb-4">We specialize in Freight Theft Prevention</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Freight theft has increased over 1000% in the past 3 years! We at Exodus Logistix believe this to be
                    an enormous problem and many of you shippers out there will agree. Companies are losing hundreds of
                    thousands to millions of dollars on lost freight!
                  </p>
                  <p>
                    Please contact us to set up a cost free consultation and let us help you protect your company from
                    freight theft immediately.
                  </p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white mt-6">Learn More</Button>
              </div>
              <div className="relative">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Warehouse worker checking inventory"
                    className="w-full h-96 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Other Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Reverse Logistics",
                description:
                  "Reverse logistics is a critical component of the supply chain, focusing on the movement of goods from their final destination back to the manufacturer or disposal facility.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Hazmat Logistics",
                description:
                  "Our Hazmat Logistics Department is equipped and certified for safe and efficient transportation of hazardous materials.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Flatbed services",
                description:
                  "We can ship your over-sized freight from any point in the US to any point in the continental 48 states.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Private Equity Logistics",
                description:
                  "Exodus Logistix offers a transformative approach to logistics solutions, particularly tailored for private equity firms seeking to optimize their portfolio companies' supply chains.",
                image: "/placeholder.svg?height=200&width=300",
                buttonColor: "bg-teal-600",
              },
            ].map((service, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('${service.image}')` }} />
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <Button className={`${service.buttonColor} hover:opacity-90 text-white w-full`}>Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
