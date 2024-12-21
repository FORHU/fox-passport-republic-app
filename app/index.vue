<template>
  <ClientOnly>
    <NuxtLayout>
      <v-snackbar v-model="defaultSnackbar" :color="defaultSnackbarColor">
        {{ defaultSnackbarText }}

        <template v-slot:actions>
          <v-btn variant="text" @click="defaultSnackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>

      <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-16691460580"></Script> 
      <Script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'AW-16691460580'); </Script>
      <NuxtPage />
    </NuxtLayout>
    <NuxtLoadingIndicator color="#8091AF" :height="4" />
  </ClientOnly>
</template>

<script setup lang="ts">
const { defaultSnackbar, defaultSnackbarText, defaultSnackbarColor } =
  useLocal();


</script>

<style >
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
