import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function IndustriesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/highway-trucks-warehouse.png')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Tailored Logistics Solutions
              <br />
              Across Industries
            </h1>
            <p className="text-xl">
              Exodus Logistix delivers customized supply chain solutions to meet the unique demands of various sectors.
            </p>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Industries We Serve</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Food & Beverage */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="/assorted-food-beverages.png"
                  alt="Food & Beverage"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Food & Beverage</h3>
                <p className="text-gray-600 mb-6">
                  We specialize in offering tailored logistics solutions designed to meet the unique demands of the food
                  and beverage industry. From sourcing to distribution, our services ensure seamless operations while
                  maintaining optimal temperature control and handling sensitive products with care.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>

            {/* Automotive */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%284%29-ZdHC1ixaY5dyTI70vFC72WjE1VONDr.png"
                  alt="Automotive"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Automotive</h3>
                <p className="text-gray-600 mb-6">
                  Exodus specializes in streamlining supply chains, ensuring seamless coordination between manufacturers
                  and distribution networks for the automotive sector. With relentless focus on precision and
                  efficiency, our team guarantees timely delivery of crucial components, enabling your business to
                  thrive in the fast-paced world of automotive energy.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Manufacturing */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%283%29-z5mbOMsGetiePlLf5cqPPnGfcENqKk.png"
                  alt="Manufacturing"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Manufacturing</h3>
                <p className="text-gray-600 mb-6">
                  With a keen understanding of manufacturing intricacies, our team ensures the efficient flow of raw
                  materials and finished goods, optimizing production schedules and minimizing downtime. Through a blend
                  of advanced logistical strategies and a robust transportation network, we guarantee prompt and secure
                  delivery of essential components and products, enabling manufacturers to maintain their commitment to
                  precision, reliability, and tailored solutions solidifies our position as the preferred logistics
                  partner for manufacturers seeking seamless logistical support to drive their operations to new
                  heights.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>

            {/* Health Care */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="/manufacturing-facility.png"
                  alt="Health Care"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Health Care</h3>
                <p className="text-gray-600 mb-6">
                  Save lives and improve quality of care with a strong, resilient supply chain and medical logistics
                  strategy dedicated to delivering products when you need them most. In the healthcare industry,
                  precision is non-negotiable when it comes to the transportation and delivery of essential healthcare
                  products. Gain confidence in your most essential healthcare supply chain with our visibility. From
                  vaccines and medical equipment to pharmaceuticals and laboratory specimens, we prioritize security
                  protocols, good distribution practices (GDP) certifications, temperature-controlled environments, and
                  market-leading technology to help deliver shipments safely, on time, and on budget.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reverse Logistics & Retail */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="/retail-warehouse-logistics.png"
                  alt="Reverse Logistics & Retail"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Reverse Logistics & Retail</h3>
                <p className="text-gray-600 mb-6">
                  At Exodus Logistix, we specialize in providing seamless reverse logistics solutions for the retail
                  sector. Whether it's handling returns, managing excess inventory, or optimizing the flow of returned
                  products, our expertise ensures efficiency and cost-effectiveness. We understand the unique challenges
                  of the retail sector and are committed to delivering reliable, timely solutions that keep your
                  business running smoothly.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>

            {/* Energy */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%281%29-vCW7QlCITLq0SHnjwGmYutSnJhBRk6.png"
                  alt="Energy"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <h3 className="text-2xl font-bold mb-4">Energy</h3>
                <p className="text-gray-600 mb-6">
                  At the forefront of the energy sector, our company stands as a beacon of innovation and reliability in
                  energy services. Specializing in the energy industry, we orchestrate seamless and efficient
                  transportation of critical components, ensuring timely delivery to power plants, renewable energy
                  projects, and distribution networks. Our comprehensive solutions encompass a robust transportation
                  network tailored to meet the unique demands of the energy sector.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Private Equity Logistics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yyuvj6d36gdhImFA37ETxj8PnKz2Wg.png"
                  alt="Private Equity Logistics"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Private Equity Logistics</h2>
                <p className="text-gray-600 mb-6">
                  Exodus Logistix offers a transformative approach to logistics solutions, particularly tailored for
                  private equity firms looking to enhance the operational efficiency and reduce costs across the supply
                  chain. Through our innovative solutions, private equity firms can navigate the complexities of each
                  company's logistics network. Exodus Logistix adeptly identifies hidden connections within the supply
                  chain, enabling clients to leverage alternative transportation processes. By leveraging advanced data
                  analytics and industry expertise, Exodus Logistix empowers clients to make informed decisions that
                  enhance efficiency and reduce costs across their portfolios. This strategic optimization not only
                  streamlines operations but also contributes to the overall success and profitability of each company
                  within the portfolio. With Exodus Logistix's innovative solutions, private equity firms can navigate
                  the complexities of supply chain management with confidence, ultimately maximizing the value of their
                  investments.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Optimize */}
      <section className="py-16 bg-gradient-to-r from-teal-400 to-green-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Optimize Your Industry's Logistics?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-3">Request a Quote</Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-800 px-8 py-3 bg-transparent"
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
