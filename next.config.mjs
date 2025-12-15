/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. CRITICAL: Disable Strict Mode. Cesium crashes if initialized twice.
  reactStrictMode: false,
  
  // 2. Allow image domains (for venue images)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },

  // 3. Webpack config to handle Cesium's internal usage of "fs" (file system)
  webpack: (config) => {
    config.externals.push({
      cesium: 'Cesium',
    });
    return config;
  },
};

export default nextConfig;