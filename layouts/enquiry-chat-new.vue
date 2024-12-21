<template>
  <v-app>
    <LayoutPrimaryHeader />
    <v-main style="height: 92dvh;overflow: hidden;">
      <slot />
    </v-main>
  </v-app>
  <DialogCompleteAccountDetails />
</template>

<script setup lang="ts">
</script>
