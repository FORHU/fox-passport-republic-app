// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
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
    "@pinia/nuxt",
    //"@nuxtjs/sitemap",
    //"@nuxtjs/robots",
    "nuxt-gtag",
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  gtag: {
    enabled: process.env.NUXT_APP_ENV === "production",
    id: "G-JW0RX8V7CP",
  },

  runtimeConfig: {
    public: {
      API: process.env.API || "http://localhost:8080",
      DOMAIN: process.env.DOMAIN || "localhost",
      SOCKET_URL: process.env.SOCKET_URL || "http://localhost:8080",
      GOOGLE_API: process.env.GOOGLE_API || "",
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
      VERSION: process.env.VERSION || "1.6.6",
      USE_V2_ROUTES: process.env.USE_V2_ROUTES || "false",
      ALT_DOMAIN: process.env.ALT_DOMAIN || "",
      MAIN_URL: process.env.MAIN_URL || "http://localhost:3000",
      TENANT_CODE: process.env.TENANT_CODE || "",
      TENANT_API_KEY: process.env.TENANT_API_KEY || "",
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || "",
    },
  },

  // Built-in Nitro proxy (replaces nuxt-proxy)
  nitro: {
    devProxy: {
      "/api": {
        target: process.env.API || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },

  routeRules: {
    "/.well-known/apple-app-site-association": {
      headers: { "content-type": "application/json" },
    },
  },

  //site: {
  // url: process.env.MAIN_URL || 'http://localhost:3000',
  //},

  //sitemap: {
  //  exclude: [
  //    '/forgot-password',
  //    '/forgot-password/*',
  //    '/settings',
  //    '/callback/*',
  //    '/settings/*',
  //    '/onboarding-success',
  //    '/redirect-page',
  //  ],
  //  sources: ['/api/__sitemap__/urls']
  //},

  compatibilityDate: "2024-12-09",
});