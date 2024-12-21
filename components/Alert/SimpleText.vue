<template>
  <!-- DO NOT REMOVE v-field--error CLASS, it will stop the validation logic  -->
  <v-alert
    variant="tonal"
    type="error"
    elevation="2"
    density="compact"
    class="v-field--error text-error"
    >{{ text }}</v-alert
  >
</template>

<script setup lang="ts">
defineProps({
  text: {
    required: true,
    type: String,
  },
});
</script>

<style scoped></style>
