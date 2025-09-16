"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExodusLogo } from "@/components/logo"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            {/* Desktop Logo */}
            <div className="hidden md:block">
              <ExodusLogo className="h-12" />
            </div>
            {/* Mobile Logo */}
            <div className="md:hidden">
              <ExodusLogoSimple className="h-10" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-teal-600 font-medium">
              About
            </Link>
            <Link href="/shipping" className="text-gray-700 hover:text-teal-600 font-medium">
              Shipping
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-teal-600 font-medium">
                Services <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/services">All Services</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/freight-auditing">Freight Auditing</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-teal-600 font-medium">
                Industries <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/industries">All Industries</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-teal-600 font-medium">
                Resources <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Resources</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-teal-600 font-medium">
                Join us <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Join us</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/contact" className="text-gray-700 hover:text-teal-600 font-medium">
              Contact us
            </Link>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs">🌐</span>
              </div>
              <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6">Request a Quote</Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
