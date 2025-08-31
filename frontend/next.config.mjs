/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: '/home/dp/gh/entryhall/frontend'
  },
  outputFileTracingRoot: '/home/dp/gh/entryhall/frontend',
  eslint: {
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig