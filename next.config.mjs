/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  experimental: {
    proxyClientMaxBodySize: '11mb',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
