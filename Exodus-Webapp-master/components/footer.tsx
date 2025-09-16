import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <span className="text-teal-800 font-bold text-lg">X</span>
              </div>
              <div className="text-xl font-bold">
                EXODUS
                <br />
                <span className="text-sm font-normal">LOGISTIX</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Lorem ipsum dolor sit amet consectetur. Vestibulum augue sit libero amet laoreet etiam mattis cras
              ullamcorper. Morbi donec morbi sit mollis.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
              <Linkedin className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white">
                  Our service
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-300 hover:text-white">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Clients */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quote" className="text-gray-300 hover:text-white">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-gray-300 hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <p>915 Highland Pointe Drive, Roseville,</p>
              <p>California 95678, United States</p>
              <p className="mt-4">Phone: (916) 303-5777</p>
              <p>loads@exoduslogistix.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">Copyright © 2025 Exodus Logistix – All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
