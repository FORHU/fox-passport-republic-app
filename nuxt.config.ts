// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  // devtools: {
  //   enabled: true,

  //   timeline: {
  //     enabled: true,
  //   },
  // },
  app: {
    head: {
      title: "Venue Booking and Event Spaces | Venue4use",
      meta: [
        {
          name: "description",
          content:
            "Find and book event spaces, meeting venues, conference rooms, and more.",
        },
        {
          name: "keywords",
          content:
            "Venue booking, Event spaces for rent, Meeting venues near me, Conference rooms for hire, Webinar location rentals, Event venues, Party spaces, Team gathering places, Meeting rooms, Conference locations, Venue rentals for workshops and seminars, Training room rentals, Trade show venues, Summit locations, Wedding venues, Exhibition spaces, Networking venues, Corporate retreat locations, Team building venues, Convention centers, Boardroom rentals, Town hall locations, Product launch venues, Lecture halls and training centers, Webinar spaces, Seminar rooms, Meeting hubs, Event halls, Event planning, Venue management, Venue solutions, Venue finder, Event space marketplace, Venue booking platform, Venue rental services, Event venue selection, Venue discovery, Event venue options, Venue booking app, Venue reservation system, Venue availability, Venue search engine, Venue booking portal, Online venue management software, Remote venue rental marketplace, Online venue booking website, Virtual venue directory, Digital venue reviews, Remote venue booking platform, Virtual event space finder, Digital venue booking system, Remote venue booking service, Online venue reservation platform, Virtual event venue marketplace, Digital venue availability checker, Online venue booking directory, Virtual venue booking app, Digital event venue search, Online virtual event venues, Virtual meeting space rentals, Remote conference venue rentals, Online webinar venue options, Workshop venue rentals, Party venue rentals",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  css: ["vuetify/styles", "@/assets/css/main.css"],
  build: {
    transpile: ["vuetify"],
  },
  plugins: [{ src: "~/plugins/axios.ts", mode: "client" }],
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "nuxt-proxy",
    "@pinia/nuxt",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
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
  }
});
