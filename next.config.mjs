/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel-optimized configuration
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Ensure proper build output
  output: 'standalone',
}

export default nextConfig
