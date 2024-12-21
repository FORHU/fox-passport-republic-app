<template>
  <v-btn type="submit" variant="flat" class="text-uppercase" color="primary">{{
    label
  }}</v-btn>
</template>

<script setup lang="ts">
defineProps({
  label: String,
});
</script>

<style scoped></style>
