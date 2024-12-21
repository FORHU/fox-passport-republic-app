<template>
  <v-alert
    border="top"
    variant="tonal"
    :border-color="`${adminStatusMessage?.color} accent-4`"
    elevation="2"
    :class="`text-${adminStatusMessage?.color}`"
  >
    <v-row
      no-gutters
      class="d-flex justify-center flex-wrap text-subtitle-2 text-md-subtitle-1"
      >{{ adminStatusMessage?.message }}</v-row
    >
  </v-alert>
</template>

<script setup lang="ts">
defineProps<{
  adminStatusMessage: {
    color: String;
    message: String;
  };
}>();
</script>

<style scoped></style>
