/** @type {import('next').NextConfig} */
const isWindows = process.platform === "win32";

const nextConfig = {
  turbopack: {},
  // `output: "standalone"` uses filesystem tracing and may require symlink
  // permissions on Windows. We keep standalone for non-Windows builds
  // (e.g. Docker/Linux) but disable it on Windows to avoid EPERM symlink errors.
  ...(isWindows ? {} : { output: "standalone" }),
  // 1. CRITICAL: Disable Strict Mode. Cesium crashes if initialized twice.
  reactStrictMode: false,

  // 2. Allow image domains (for venue images)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
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