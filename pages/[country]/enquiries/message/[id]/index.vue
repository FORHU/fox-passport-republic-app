<template>
<v-row no-gutters>
  <EnquiryChat />
</v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();


definePageMeta({
  layout: 'enquiry-chat-new',
})





</script>

<style scoped>
</style>
