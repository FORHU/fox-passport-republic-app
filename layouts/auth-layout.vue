<template>
  <v-app>
    <v-main>
      <v-row no-gutters style="height: 100dvh; overflow-y: hidden;">
        <v-col cols="8" class="d-none d-lg-block">
          <v-img :lazy-src="defaultCountryImage" :src="defaultCountryImage" height="100%" cover
            style="position: relative;" alt="auth layout image">
            <v-row no-gutters class="w-100 h-100"
              style="position: absolute; top:0; left:0; opacity: 40%; background-color: black; z-index:1"></v-row>
            <v-row no-gutters class="h-100 pa-5 pb-md-10 px-md-10 d-flex flex-column justify-space-between">
              <v-row no-gutters class="w-100" style="max-height: 100px; z-index: 2;">
                <LogoWhite @click="navigateTo({name: 'country', params: {country}})" class="cursor-pointer"/>
              </v-row>
              <v-row no-gutters class="text-white w-100" style="max-height: 100px; z-index: 2;">
                <v-col cols="12" class="text-44px ">Discover & Reserve Venues</v-col>
                <v-col cols="12" class="text-24px ">Seamless Venue Solutions for Every Event Endeavor</v-col>
              </v-row>
            </v-row>
          </v-img>
        </v-col>
        <v-col style="height: 100dvh; overflow-y: auto;">
          <slot />
        </v-col>
      </v-row>

    </v-main>
  </v-app>
</template>
<script setup lang="ts">
const { getDefaultCountryImage, defaultCountryImage, loadCountries } = useLocal();

await loadCountries();
await getDefaultCountryImage();
</script>
<style scoped></style>

<!-- 
<v-row no-gutters class="h-100 w-100" style="position: absolute; background-color: black; opacity: 40%;"
z-index="0"></v-row> -->
