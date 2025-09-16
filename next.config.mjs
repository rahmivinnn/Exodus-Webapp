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
  // Remove static export for now to fix client-side issues
  // output: 'export',
  // trailingSlash: true,
  // basePath: process.env.NODE_ENV === 'production' ? '/Exodus-Webapp' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/Exodus-Webapp' : '',
}

export default nextConfig
