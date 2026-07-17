/** @type {import('next').NextConfig} */
const isWindows = process.platform === "win32";

const nextConfig = {
  turbopack: {},
  ...(isWindows ? {} : { output: "standalone" }),
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'd1bdogktone6hj.cloudfront.net' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  async redirects() {
    return [
      { source: '/host',                      destination: '/creator-dashboard',                      permanent: true },
      { source: '/host/apply',                destination: '/creator-dashboard/apply',                permanent: true },
      { source: '/host/calendar',             destination: '/creator-dashboard/calendar',             permanent: true },
      { source: '/host/events',               destination: '/creator-dashboard/events',               permanent: true },
      { source: '/host/events/:id/edit',      destination: '/creator-dashboard/events/:id/edit',      permanent: true },
      { source: '/host/assets',               destination: '/creator-dashboard/assets',               permanent: true },
      { source: '/host/assets/:id/edit',      destination: '/creator-dashboard/assets/:id/edit',      permanent: true },
      { source: '/host/services',             destination: '/creator-dashboard/services',             permanent: true },
      { source: '/host/services/:id/edit',    destination: '/creator-dashboard/services/:id/edit',    permanent: true },
      { source: '/host/venues',               destination: '/creator-dashboard/venues',               permanent: true },
      { source: '/host/venues/:id/edit',      destination: '/creator-dashboard/venues/:id/edit',      permanent: true },
      { source: '/host/stripe-dashboard',     destination: '/creator-dashboard/stripe-dashboard',     permanent: true },
      { source: '/host/stripe-onboard',       destination: '/creator-dashboard/stripe-onboard',       permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/creator-dashboard/stripe-:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.stripe.network",
              "style-src 'self' 'unsafe-inline' https://*.stripe.com",
              "frame-src https://*.stripe.com https://*.stripe.network",
              "connect-src 'self' https://*.stripe.com https://*.stripe.network http://localhost:3002",
              "img-src 'self' data: https://*.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.externals.push({
      cesium: 'Cesium',
    });
    return config;
  },
};

export default nextConfig;