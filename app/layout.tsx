import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Exodus Logistix - Freight Management",
  description: "Professional freight management and rate calculation system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
