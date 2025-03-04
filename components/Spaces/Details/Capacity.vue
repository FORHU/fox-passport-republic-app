<template>
  <v-row no-gutters class="pl-4">
    <v-col
      cols="6"
      class="d-flex flex-row align-center"
      v-for="(capacity, index) in filteredCapacity"
      :key="index"
    >
      <v-img
        :src="capacity.svgSource"
        max-width="60"
        height="60"
        contain
        :alt="'Capacity Icon for ' + capacity?.question"
      ></v-img>
      <span class="ml-2"
        >{{ capacity.question }} up to
        <span class="font-weight-bold">{{ capacity.max_capacity }}</span></span
      >
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
const { guestFilter } = useSpaceData();
const props = defineProps<{
  specificSpace: any;
}>();

const filteredCapacity = computed(() => {
  return props.specificSpace.capacity_layout
    .filter((layout) => layout.answer === true)
    .map((layout) => {
      const match = guestFilter.find((guest) => guest.name === layout.question);
      return {
        ...layout,
        svgSource: match ? match.svgSource : "",
      };
    });
});
</script>
