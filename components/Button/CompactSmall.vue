<template>
  <v-btn
    variant="flat"
    class="text-uppercase"
    color="primary"
    density="compact"
    >{{ label }}</v-btn
  >
</template>

<script setup lang="ts">
defineProps({
  label: String,
});
</script>

<style scoped></style>
