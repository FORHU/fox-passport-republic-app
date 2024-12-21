<template>

  <v-alert  v-model="showAlert" location="top" type="error" border="end" variant="tonal"
    :title="bannerStatusMessage?.title || ''" :border-color="`${bannerStatusMessage?.color || ''} accent-4`"
    elevation="2" :class="`text-${bannerStatusMessage?.color || ''}`">
    <v-row no-gutters class="flex-wrap text-subtitle-2 text-md-subtitle-1">{{
      bannerStatusMessage?.message || '' }}</v-row>
  </v-alert>
</template>

<script setup lang="ts">
defineProps<{
  bannerStatusMessage: {
    title: string,
    color: String;
    message: String;
  };
}>();

const showAlert = defineModel({ required: true, default: false })
</script>

<style scoped></style>
