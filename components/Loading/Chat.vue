<template>
  <v-row no-gutters class="d-flex flex-column ga-2 w-100 pa-2">
    <template v-for="item in lines" :key="item">
      <v-card elevation="0" :border="'sm'" class="w-100">
        <v-skeleton-loader type="list-item-two-line" class="w-100"> </v-skeleton-loader>
      </v-card>
    </template>
  </v-row>
</template>

<script setup lang="ts">
defineProps({
  lines: {
    type: Number,
    required: false,
    default: 10,
  },
});
</script>

<style scoped></style>
