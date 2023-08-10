// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  images: {
    domains: ['cloud.appwrite.io', 'links.papareact.com'],
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
};

module.exports = nextConfig;
