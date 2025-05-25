/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'placehold.co', 'images.unsplash.com', 'glhskzubuidgdpjsfxyj.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // For Netlify deployment
  output: 'standalone',
  swcMinify: true,
}

module.exports = nextConfig
