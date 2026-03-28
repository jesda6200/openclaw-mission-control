/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@lending/contracts'],
  experimental: {
    optimizePackageImports: ['clsx'],
  },
};

export default nextConfig;
