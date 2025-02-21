<template>
  <ClientOnly>
    <NuxtLayout>
      <!-- <Head> -->
        <!-- Apple Smart App Banner -->
        <Meta name="apple-itunes-app" content="app-id=6736890246" />
      <!-- </Head> -->

      <v-snackbar v-model="showBanner" color="primary" timeout="-1" v-if="isMobileOrTablet">
        Get the best experience! Download our app.
        <template v-slot:actions>
          <v-btn
            variant="text"
            href="https://play.google.com/store/apps/details?id=com.venue4use"
            target="_blank"
          >
            Download
          </v-btn>
          <v-btn variant="text" @click="handleClose">Close</v-btn>
        </template>
      </v-snackbar>

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
import { useDisplay } from "vuetify";
const { defaultSnackbar, defaultSnackbarText, defaultSnackbarColor } =
  useLocal();

const { xs, sm, mdAndDown } = useDisplay();
const showBanner = ref(false);


const isMobileOrTablet = xs.value || sm.value || mdAndDown.value;

const handleClose = () => {
  showBanner.value = false;
  const showBannerCookie = useCookie("showBannerCookie", { default: () => "true" });
  showBannerCookie.value = "false";
};

onMounted(() => {
  const showBannerFromCookie = useCookie("showBannerCookie", { default: () => "true" });
  if (showBannerFromCookie.value === "true" && isMobileOrTablet) {
    showBanner.value = true;
  }
});
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
