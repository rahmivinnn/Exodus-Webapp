import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Users, Award, Clock } from "lucide-react"

export default function AboutPage() {
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
                <span className="text-blue-300 text-sm font-medium">🏢 About Exodus Logistix</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Who We
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Are</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                Exodus Logistix is a full-service logistics company driven by precision, powered by people, and committed to excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                  Our Story
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300"
                >
                  Meet Our Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              📖 Our Story
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Building the Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Logistics</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  Founded with a vision to transform logistics into a seamless and customer-centric experience, Exodus
                  Logistix began as a small, determined team with a passion for delivering excellence.
                </p>
                <p>
                  Over the years, we've grown into a nationwide logistics provider known for our reliability, innovation, and personal
                  approach to every shipment. We understand that behind every delivery is a business that counts on us —
                  and we take that responsibility seriously.
                </p>
                <p>
                  With deep commitment to communication, precision, and partnership, we've built long-term relationships with clients across a wide range of industries. Our
                  journey continues as we invest in new technologies, expand our fleet, and enhance our services to meet
                  the evolving demands of modern commerce.
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  Our continued success is driven by a dedicated team and a relentless focus on improvement. Every mile
                  we cover reflects our promise to deliver more than freight — we deliver trust.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600 text-sm">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">99.9%</div>
                  <div className="text-gray-600 text-sm">On-Time Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/desert-truck-sunset.png"
                  alt="Truck in desert landscape"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              🎯 Mission & Vision
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Commitment to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Excellence</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/placeholder-b2egt.png"
                  alt="Truck on highway at sunset"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"></div>
            </div>
            
            <div className="space-y-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To provide dependable, efficient, and customized logistics solutions that drive success for our
                    clients. We are committed to delivering every shipment with care, speed, and transparency while
                    upholding the highest standards of customer service and operational excellence.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To be the most trusted and innovative logistics partner in the nation — recognized for our integrity,
                    technology-driven services, and unwavering dedication to connecting businesses with their goals. We
                    envision a future where logistics is smarter, faster, and more responsive to the unique needs of every
                    client. At Exodus, we're not just moving goods — we're moving industries forward.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Meet The Team */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              👥 Meet Our Team
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              The People Behind
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals who make Exodus Logistix the trusted logistics partner for businesses nationwide.
            </p>
          </div>

          <div className="space-y-20">
            {/* CEO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <img src="/business-team.png" alt="Aleks Levko CEO" className="w-full h-96 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"></div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Aleks Levko</h3>
                  <p className="text-xl text-blue-600 font-semibold mb-4">Chief Executive Officer</p>
                </div>
                
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    I am the Chief Executive Officer and Operations Director at Exodus Logistix. My background in the
                    logistics space started at the age of 16 helping my dad search for loads on a CB radio, one load and one
                    trailer.
                  </p>
                  <p>
                    The moment I realized my destiny was in the logistics space was when I was 18 and my parents
                    took us to a large truck stop in our home town of Stockton and I walk around the store with us showing
                    us all of the stuff that he has transported across the U.S. and I thought that was the coolest thing
                    ever.
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    My wife is my greatest encouragement and has blessed me with 3 amazing children.
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Leadership Experience</div>
                    <div className="text-sm text-gray-600">15+ years in logistics</div>
                  </div>
                </div>
              </div>
            </div>

            {/* President */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2 relative">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/professional-woman-portrait.png"
                    alt="Vitaliy Levko President"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
              </div>
              
              <div className="lg:order-1 space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Vitaliy Levko</h3>
                  <p className="text-xl text-cyan-600 font-semibold mb-4">President</p>
                </div>
                
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    I was a professional truck driver for more than 18 years and my wife Nelli encouraged me to pursue
                    opening my very own trucking company.
                  </p>
                  <p>
                    I've always thought that the trucking industry was the most
                    difficult business to be in and of course it would be me who would choose to be in it. However, I have
                    learned that what I do impacts so many in my community and even around the world in the most amazing
                    ways.
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    I feel honored, I am now able to help feed a city and do what I love to do with the ones closest
                    to me.
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Driving Experience</div>
                    <div className="text-sm text-gray-600">18+ years on the road</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
