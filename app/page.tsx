import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, Shield, Clock, Users, Star, CheckCircle, Award } from "lucide-react"
import Image from "next/image"
import { RateCalculator } from "@/components/rate-calculator"
import { MarketDashboard } from "@/components/market-dashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/highway-trucks-warehouse.png')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Powering Logistics with
              <br />
              <span className="text-green-400">Precision</span> and <span className="text-green-400">Trust</span>
            </h1>
            <p className="text-xl mb-8">
              End-to-end freight management and real-time operational data for your supply chain success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3">Get a Quote</Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 bg-transparent"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Truck Load (Less Than Truckload)",
                description:
                  "Our Full Truck Load service is tailored for large shipments requiring dedicated truck capacity for efficient delivery.",
                image: "/desert-truck-sunset.png",
                buttonColor: "bg-red-600",
              },
              {
                title: "Shared Truckload Program",
                description: "Shared truckload services combine multiple shipments to optimize costs and efficiency.",
                image: "/manufacturing-facility.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Dry & Refrigerated Transportation",
                description:
                  "Specialized equipment and monitoring for temperature-sensitive cargo, ensuring product integrity.",
                image: "/logistics-warehouse.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Freight Solutions",
                description: "Comprehensive freight solutions tailored to your unique business requirements.",
                image: "/automotive-manufacturing.png",
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

      {/* Rate Calculator Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Instant Rate Quotes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Use our AI-powered rate calculator to get accurate freight quotes in seconds.
            </p>
          </div>
          <RateCalculator />
        </div>
      </section>

      {/* Market Intelligence Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Market Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay ahead with real-time market insights and freight trends.
            </p>
          </div>
          <MarketDashboard />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <img
                  src="/highway-trucks-warehouse.png"
                  alt="Truck on highway at sunset"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Choose Us</h2>
              <p className="text-gray-600 mb-8">
                At Exodus Logistix, we don't just move freight — we move your business forward with cutting-edge AI technology.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: Clock,
                    title: "Fast Time Tracking",
                    description: "Real-time tracking and monitoring of all shipments.",
                  },
                  {
                    icon: Shield,
                    title: "Nationwide Network",
                    description: "Comprehensive network covering all 50 states.",
                  },
                  {
                    icon: CheckCircle,
                    title: "Dedicated Fleet Services",
                    description: "Reliable, scalable, and customized trucking solutions.",
                  },
                  {
                    icon: Award,
                    title: "Fast & Reliable Delivery",
                    description: "We meet your deadlines without compromising safety.",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Industries We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Food & Beverage",
                description:
                  "We specialize in offering tailored logistics solutions designed to meet the unique demands of the food and beverage industry.",
                image: "/assorted-food-beverages.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Reverse Logistics & Retail",
                description:
                  "At Exodus Logistix, we specialize in providing seamless reverse logistics solutions for the retail sector.",
                image: "/retail-warehouse-logistics.png",
                buttonColor: "bg-teal-600",
              },
              {
                title: "Manufacturing",
                description:
                  "With a keen understanding of manufacturing intricacies, our team ensures the efficient flow of raw materials.",
                image: "/manufacturing-facility.png",
                buttonColor: "bg-teal-600",
              },
            ].map((industry, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('${industry.image}')` }} />
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3">{industry.title}</h3>
                  <p className="text-gray-600 mb-4">{industry.description}</p>
                  <Button className={`${industry.buttonColor} hover:opacity-90 text-white`}>Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent"
            >
              View More
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Contact us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Send Us A Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Name" />
                  <Input placeholder="Email" />
                </div>
                <Textarea placeholder="Message" rows={6} />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Type of service needed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truckload">Full Truckload</SelectItem>
                    <SelectItem value="ltl">Less Than Truckload</SelectItem>
                    <SelectItem value="refrigerated">Refrigerated</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Company Name" />
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions, and privacy policy.
                  </label>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full">Send Message</Button>
              </form>
              <p className="text-xs text-gray-500 mt-4">
                This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
              </p>
            </div>
            <div className="bg-teal-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Better yet, see us in person!</h3>
              <p className="mb-6">
                We love our customers, so feel free to visit us in Roseville to discuss your freight and logistics needs
                in person!
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Exodus Logistix</h4>
                  <p>915 Highland Pointe Drive, Roseville, California 95678, United States</p>
                </div>
                <div>
                  <p>(916) 303-5777</p>
                  <p>loads@exoduslogistix.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-96">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/california-map-green.png')`,
          }}
        >
          <div className="w-full h-full bg-green-100 bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">📍</span>
              </div>
              <p className="text-teal-800 font-semibold">Our Location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">See what our customers are saying!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Diana Martynyshyn",
                text: "Aleks and his team have been a great asset to our company. They are very professional and always deliver on time. We highly recommend them for any logistics needs.",
                avatar: "/professional-woman-headshot.png",
              },
              {
                name: "Diana Martynyshyn",
                text: "Aleks and his team have been a great asset to our company. They are very professional and always deliver on time. We highly recommend them for any logistics needs.",
                avatar: "/professional-woman-headshot.png",
              },
              {
                name: "Diana Martynyshyn",
                text: "Aleks and his team have been a great asset to our company. They are very professional and always deliver on time. We highly recommend them for any logistics needs.",
                avatar: "/professional-woman-headshot.png",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white text-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
