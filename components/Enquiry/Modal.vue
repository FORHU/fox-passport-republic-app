<template>
  <v-overlay
    v-model="overlay"
    width="100%"
    height="100%"
    max-width="700px"
    class="d-flex justify-center align-center"
  >
    <v-row
      align="center"
      justify="center"
      class="fill-height mx-2"
      style="position: relative"
    >
      <slot />
    </v-row>
  </v-overlay>
</template>

<script setup lang="ts">
const overlay = defineModel("show", { default: false });
</script>

<style scoped></style>
