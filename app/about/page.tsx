import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] bg-teal-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700">
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage: `url('/abstract-geometric-pattern.png')`,
              }}
            />
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl font-bold mb-4">Who We Are</h1>
            <p className="text-xl">
              Exodus Logistix is a full-service logistics company driven by precision, powered by people.
            </p>
          </div>
        </div>
        {/* Truck illustrations */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <img src="/white-truck-side-view.png" alt="Truck" className="opacity-80" />
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <img src="/white-truck-side-view.png" alt="Truck" className="opacity-80 scale-x-[-1]" />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded with a vision to transform logistics into a seamless and customer-centric experience, Exodus
                  Logistix began as a small, determined team with a passion for delivering excellence. Over the years,
                  we've grown into a nationwide logistics provider known for our reliability, innovation, and personal
                  approach to every shipment. We understand that behind every delivery is a business that counts on us —
                  and we take that responsibility seriously. With deep commitment to communication, precision, and
                  partnership, we've built long-term relationships with clients across a wide range of industries. Our
                  journey continues as we invest in new technologies, expand our fleet, and enhance our services to meet
                  the evolving demands of modern commerce.
                </p>
                <p>
                  Our continued success is driven by a dedicated team and a relentless focus on improvement. Every mile
                  we cover reflects our promise to deliver more than freight — we deliver trust.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/desert-truck-sunset.png"
                  alt="Truck in desert landscape"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/placeholder-b2egt.png"
                  alt="Truck on highway at sunset"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8">Mission & Vision</h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Mission:</h3>
                <p className="text-gray-600">
                  To provide dependable, efficient, and customized logistics solutions that drive success for our
                  clients. We are committed to delivering every shipment with care, speed, and transparency while
                  upholding the highest standards of customer service and operational excellence.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Vision:</h3>
                <p className="text-gray-600">
                  To be the most trusted and innovative logistics partner in the nation — recognized for our integrity,
                  technology-driven services, and unwavering dedication to connecting businesses with their goals. We
                  envision a future where logistics is smarter, faster, and more responsive to the unique needs of every
                  client. At Exodus, we're not just moving goods — we're moving industries forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet The Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Meet The Exodus Team</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <div className="rounded-lg overflow-hidden">
                <img src="/business-team.png" alt="Aleks Levko CEO" className="w-full h-96 object-cover" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Aleks Levko, CEO</h3>
              <p className="text-gray-600">
                I am the Chief Executive Officer and Operations Director at Exodus Logistix. My background in the
                logistics space started at the age of 16 helping my dad search for loads on a CB radio, one load and one
                trailer. The moment I realized my destiny was in the logistics space was when I was 18 and my parents
                took us to a large truck stop in our home town of Stockton and I walk around the store with us showing
                us all of the stuff that he has transported across the U.S. and I thought that was the coolest thing
                ever. My wife is my greatest encouragement and has blessed me with 3 amazing children.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 relative">
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/professional-woman-portrait.png"
                  alt="Vitaliy Levko President"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
            <div className="lg:order-1">
              <h3 className="text-2xl font-bold mb-4">Vitaliy Levko, President</h3>
              <p className="text-gray-600">
                I was a professional truck driver for more than 18 years and my wife Nelli encouraged me to pursue
                opening my very own trucking company. I've always thought that the trucking industry was the most
                difficult business to be in and of course it would be me who would choose to be in it. However, I have
                learned that what I do impacts so many in my community and even around the world in the most amazing
                ways. I feel honored, I am now able to help feed a city and do what I love to do with the ones closest
                to me.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
