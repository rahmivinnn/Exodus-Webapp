import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-12">Contact us</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us A Message</h2>
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
                    <SelectItem value="hazmat">Hazmat</SelectItem>
                    <SelectItem value="flatbed">Flatbed</SelectItem>
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

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Our Location</h2>
          <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3115.8234567890123!2d-121.28765!3d38.75123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809b1f5e5e5e5e5e%3A0x5e5e5e5e5e5e5e5e!2s915%20Highland%20Pointe%20Dr%2C%20Roseville%2C%20CA%2095678%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Exodus Logistix Location - 915 Highland Pointe Drive, Roseville, CA"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
