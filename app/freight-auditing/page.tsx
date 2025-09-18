import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from "lucide-react"

export default function FreightAuditingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] bg-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-900">
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
            <h1 className="text-5xl font-bold mb-4">Logistics Consulting & Freight Auditing</h1>
            <p className="text-xl">
              Our proven theft prevention model will mitigate your theft problem to a complete stop.
            </p>
          </div>
        </div>
      </section>

      {/* Freight Theft Prevention */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">We specialize in Freight Theft Prevention</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Freight theft has increased over 1000% in the past 3 years! We at Exodus Logistix believe this to be
                  an enormous problem and many of you shippers out there will agree. Companies are losing hundreds of
                  thousands to millions of dollars on lost freight!
                </p>
                <p>
                  Our proven theft prevention model will mitigate your theft problem to a complete stop. Freight scams
                  are rampant and have taken many different forms. Our team has perfected learning every new and old
                  scam and has even helped the FBI catch scammers. We would love to help you!
                </p>
                <p>
                  Please contact us to set up a cost free consultation and let us help you protect your company from
                  freight theft immediately.
                </p>
              </div>
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
      </section>

      {/* Freight Auditing Cards */}
      <section
        className="py-16 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/placeholder.svg?height=600&width=1200')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Freight Auditing Card */}
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">FREIGHT AUDITING</h3>
                <div className="space-y-4 text-gray-600 mb-8">
                  <p>
                    Please send us your most recent 30-60 days of freight data and we will audit it within 24 hours! You
                  </p>
                  <p className="font-semibold">Exodus Logistix Inc</p>
                  <p className="font-semibold">916-842-7623</p>
                </div>
                <Button className="bg-teal-800 hover:bg-teal-900 text-white w-full">Submit your request!</Button>
              </CardContent>
            </Card>

            {/* Template Card */}
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">Template</h3>
                <div className="space-y-4 text-gray-600 mb-8">
                  <p>
                    Please download this template to use for your freight audit. You may upload once complete by
                    clicking on "Click here to audit your freight rates"
                  </p>
                  <p className="font-semibold">Freight Audit Template (3)</p>
                </div>
                <Button className="bg-teal-800 hover:bg-teal-900 text-white w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
