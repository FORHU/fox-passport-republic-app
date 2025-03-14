// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  // devtools: {
  //   enabled: true,

  //   timeline: {
  //     enabled: true,
  //   },
  // },
  css: ["vuetify/styles", "@/assets/css/main.css"],
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "nuxt-proxy",
    "@pinia/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-gtag"
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  gtag: {
    enabled: process.env.NUXT_APP_ENV === 'production',
    id: 'G-JW0RX8V7CP'
  },

  runtimeConfig: {
    public: {
      API: process.env.API as string,
      DOMAIN: (process.env.DOMAIN || "localhost") as string,
      SOCKET_URL: process.env.SOCKET_URL as string,
      GOOGLE_API: process.env.GOOGLE_API as string,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,
      VERSION: process.env.VERSION as string,
      USE_V2_ROUTES: process.env.USE_V2_ROUTES as string,
      ALT_DOMAIN: process.env.ALT_DOMAIN as string,
      MAIN_URL: process.env.MAIN_URL as string,
      TENANT_CODE: process.env.TENANT_CODE as string,
      TENANT_API_KEY: process.env.TENANT_API_KEY
    },
  },

  proxy: {
    options: [
      {
        target: process.env.API,
        changeOrigin: true,
        pathRewrite: {
          "^/api/": "/api/",
        },
        pathFilter: ["/api/"],
      },
    ],
  },

  routeRules: {
    '/.well-known/apple-app-site-association': { headers: { 'content-type': 'application/json' } },
  },
  sitemap: {
    hostname: process.env.MAIN_URL,  // Replace with your website's hostname
    exclude: [
      '/forgot-password',
      '/forgot-password/*',
      '/settings',
      '/callback/*',
      '/settings/*',
      '/onboarding-success',
      '/redirect-page',
    ],
    sources: ['/__sitemap__/urls']
  
  }
});
