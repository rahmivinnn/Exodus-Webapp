import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/placeholder-q5fnf.png')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Comprehensive Logistics
              <br />
              Solutions Tailored to Your Needs
            </h1>
            <p className="text-xl">
              From Full Truckload to Warehousing, Exodus Logistix Delivers Excellence at Every Step.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                title: "Full Truckload (FTL)",
                description: "Dedicated truck capacity for large shipments requiring direct and efficient delivery.",
                image: "/placeholder-i304y.png",
                buttonColor: "bg-red-600",
              },
              {
                title: "Shared Truckload (STL)",
                description:
                  "Cost-effective solution for shipments under 10 pallets and 10,000 lbs, combining multiple loads in one truck.",
                image: "/placeholder-urmwc.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Less Than Truckload (LTL)",
                description: "Ideal for smaller shipments, sharing truck space to optimize costs and efficiency.",
                image: "/open-truck-cargo.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Refrigerated Transportation",
                description:
                  "Specialized equipment and monitoring for temperature-sensitive cargo, ensuring product integrity.",
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
