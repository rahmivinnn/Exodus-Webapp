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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400/30 mb-6">
                  <span className="text-blue-300 text-sm font-medium">🚀 Trusted by 500+ Companies</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                  Powering Logistics with
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Precision
                  </span> and 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Trust
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  End-to-end freight management and real-time operational data for your supply chain success.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                    Get a Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300"
                  >
                    Learn more
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                    <div className="text-gray-400 text-sm">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
                    <div className="text-gray-400 text-sm">On-Time Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                    <div className="text-gray-400 text-sm">Support</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="text-center text-white mb-6">
                    <h3 className="text-2xl font-bold mb-2">Get Instant Quote</h3>
                    <p className="text-gray-300">Calculate your shipping costs in seconds</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="From" 
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                      />
                      <Input 
                        placeholder="To" 
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Weight (lbs)" 
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                      />
                      <Select>
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="truckload">Full Truckload</SelectItem>
                          <SelectItem value="ltl">Less Than Truckload</SelectItem>
                          <SelectItem value="refrigerated">Refrigerated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold rounded-lg">
                      Calculate Quote
                    </Button>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              🚛 Our Services
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Logistics
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From freight management to real-time tracking, we provide end-to-end logistics solutions tailored to your business needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Full Truck Load",
                description: "Dedicated truck capacity for large shipments with guaranteed delivery times and premium service.",
                icon: "🚛",
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
              },
              {
                title: "Shared Truckload",
                description: "Cost-effective shared truckload services that combine multiple shipments for optimal efficiency.",
                icon: "📦",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
              },
              {
                title: "Refrigerated Transport",
                description: "Temperature-controlled transportation for perishable goods with real-time monitoring.",
                icon: "❄️",
                gradient: "from-cyan-500 to-cyan-600",
                bgGradient: "from-cyan-50 to-cyan-100",
              },
              {
                title: "Custom Solutions",
                description: "Tailored freight solutions designed to meet your unique business requirements and challenges.",
                icon: "⚙️",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100",
              },
            ].map((service, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <CardContent className="relative z-10 p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
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
