<template>
  <v-row no-gutters class="pa-6">
    <v-btn
      size="large"
      :to="{
        name: 'country-user-enquiries-enquiry-booking',
        params: { country, enquiry: '123' },
      }"
      color="primary"
    >
      book now
    </v-btn>
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "enquiry-management",
});
const { country } = useLocal();
</script>
