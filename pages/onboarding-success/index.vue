<template>
  <v-container fluid class="d-flex justify-center align-center fill-height">
    <v-card class="text-center" elevation="0">
      <v-avatar color="success" size="80" class="mb-4">
        <v-icon size="50" color="white">mdi-check</v-icon>
      </v-avatar>
      <v-card-title class="text-h6 font-weight-bold">
        Your Stripe Onboarding is Complete
      </v-card-title>
      <v-card-text>
        <p>You're all set up and ready to start processing payments!</p>
        <p>To ensure everything is up to date, please return to the app and refresh the page to reflect your new status.</p>
    </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "venue-management-new",
});
</script>
<style scoped>
.v-avatar {
  margin: 0 auto;
}
</style>
