<template>
  <ClientOnly>
    <NuxtLayout>
        <Meta name="apple-itunes-app" content="app-id=6736890246" />
      <v-snackbar v-model="defaultSnackbar" :color="defaultSnackbarColor">
        {{ defaultSnackbarText }}

        <template v-slot:actions>
          <v-btn variant="text" @click="defaultSnackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-16691460580"
      ></Script>
      <Script>
        window.dataLayer = window.dataLayer || []; function
        gtag(){dataLayer.push(arguments);} gtag('js', new Date());
        gtag('config', 'AW-16691460580');
      </Script>
      <NuxtPage />
    </NuxtLayout>
    <NuxtLoadingIndicator color="#8091AF" :height="4" />
  </ClientOnly>
</template>

<script setup lang="ts">
// import { useDisplay } from "vuetify";
const { defaultSnackbar, defaultSnackbarText, defaultSnackbarColor, country, defaultCountryImage } =
  useLocal();


useSeoMeta({
  title: 'Venue4Use | Book Top Event Venues & Meeting Spaces',
  ogTitle: 'Venue4Use | Book Top Event Venues & Meeting Spaces',
  description: `Find the perfect venue for any occasion in ${country} - meetings, parties, or corporate events. Venue4use makes venue booking quick and easy.`,
  ogDescription: `Find the perfect venue for any occasion in ${country} - meetings, parties, or corporate events. Venue4use makes venue booking quick and easy.`,
  ogImage: defaultCountryImage.value,
  twitterCard: 'summary_large_image',
  keywords: 'Singapore, singapore, venue, restaurant, elite venue, elite venues, restaurant, meetings, events, party, corporate events, birthday, space, bookings, booking'
})

</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<!-- some work done -->
