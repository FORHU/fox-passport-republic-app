<template>
  <v-row no-gutters class="w-100 mb-10">
    <h2 v-if="!hideTitle" class="mt-5 mb-1 w-100">Keywords</h2>

    <template v-if="keywords.length > 0">
      <template v-for="keyword in keywords" :key="keyword.keyword">
        <v-chip
          class="ma-1"
          variant="outlined"
          :text="keyword.keyword"
          :ripple="false"
        ></v-chip>
      </template>
    </template>
    <template v-else>
      <p>No keywords selected.</p>
    </template>
  </v-row>
</template>

<script setup>
const props = defineProps({
  keywords: {
    type: Array,
    required: true,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
