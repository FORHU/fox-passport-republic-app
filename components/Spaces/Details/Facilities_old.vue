<template>
  <v-row no-gutters class="ml-2">
    <v-col
      v-for="(facility, index) in filteredFacilities"
      :key="index"
      cols="6"
      class="mb-1"
    >
      <v-icon :icon="facility.icon" size="small" class="mr-1"></v-icon>
      <span>{{ facility.question }}</span>
    </v-col>
    <v-divider
      v-if="
        props.specificSpace.features?.filter((space) => space.key == '12')[0]
          ?.answer
      "
      class="my-3"
    ></v-divider>
    <v-col
      cols="12"
      class="font-weight-bold mb-1"
      v-if="
        props.specificSpace.features?.filter((space) => space.key == '12')[0]
          ?.answer
      "
    >
      <span>Featured Custom Facility Offered</span>
    </v-col>
    <v-col
      cols="6"
      v-if="
        props.specificSpace.features?.filter((space) => space.key == '12')[0]
          ?.answer
      "
      v-for="(customFacility, index) in props.specificSpace.features.filter(
        (space) => space.key == '12',
      )[0].options"
      :key="index"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span> {{ customFacility }}</span>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
const props = defineProps<{
  specificSpace: any;
}>();

const facilitiesIconMap = {
  Whiteboard: "mdi-human-male-board",
  Flipchart: "mdi-chart-line",
  Projector: "mdi-projector",
  "Wi-Fi": "mdi-wifi",
  "Flatscreen TV": "mdi-television",
  "PA System/Speaker": "mdi-speaker",
  "Conference Call Facility": "mdi-phone",
  "Air Conditioning": "mdi-air-conditioner",
  "Natural Light": "mdi-weather-sunny",
  "Storage Space": "mdi-cube-outline",
};

const filteredFacilities = computed(() => {
  return props.specificSpace.features
    .filter((item) => item.reference === "facilities" && item.answer === true)
    .map((item) => ({
      ...item,
      icon: facilitiesIconMap[item.question] || "mdi-information-outline",
    }));
});
</script>