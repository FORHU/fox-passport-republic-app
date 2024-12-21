<template>
  <v-row no-gutters class="fill-height" justify="center" align-content="center">
    <h1 class="text-capitalize">{{ routeName }}</h1>
  </v-row>
</template>

<script setup lang="ts">
const routeName = computed(() => useRoute().name)
  .value?.toString()
  .replace("country-", "");
</script>
