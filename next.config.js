/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
    serverComponentsExternalPackages: ["@vercel/blob"],
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion']
  }
}



module.exports = nextConfig
