<template>
  <v-app>
    <LayoutPrimaryHeader v-if="!isMobile" />

    <v-main>
      <slot />
    </v-main>

    <layout-footer />
  </v-app>
</template>

<script setup>
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();

const isMobile = smAndDown;
</script>
