<template>
  <v-row no-gutters>
    <v-col
      v-for="(facility, index) in filteredFacilities"
      :key="index"
      :cols="xs ? '12' : '6'"
      class="mb-4"
    >
      <v-icon :icon="facility.icon" size="small" class="mr-2"></v-icon>
      <span>{{ facility.question }}</span>
    </v-col>

    <!-- Add the 'Venue provides alcohol' if available -->
    <v-col v-if="providesAlcohol" :cols="xs ? '12' : '6'" class="mb-4">
      <v-icon icon="mdi-glass-cocktail" size="small" class="mr-2"></v-icon>
      <span>Venue provides alcohol</span>
    </v-col>

    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-4"
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space) => space.key == '5'
        )?.answer
      "
    >
      <v-icon icon="mdi-glass-mug" size="small" class="mr-2"></v-icon>
      <span>Bring your own alcohol allowed</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-4"
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space) => space.key == '1'
        )?.answer
      "
    >
      <v-icon icon="mdi-food-outline" size="small" class="mr-2"></v-icon>
      <span>External catering allowed</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-4"
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space) => space.key == '2.1'
        )?.answer
      "
    >
      <v-icon icon="mdi-cash-plus" size="small" class="mr-2"></v-icon>
      <span>Buyout fee for external catering</span>
    </v-col>
    <v-col
      v-if="
        props.specificSpace.features.filter(
          (space) => space.reference === 'wedding'
        )[0]?.answer
      "
      :cols="xs ? '12' : '6'"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>{{
        props.specificSpace.features.filter(
          (space) => space.reference === "wedding"
        )[0]?.question
      }}</span>
    </v-col>
    <v-col
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space) => space.key == '3'
        )?.answer
      "
      :cols="xs ? '12' : '6'"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Complimentary {{ complimentaryItems }}</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-2"
      v-if="
        specificSpace.venue?.foods_and_beverages?.filter(
          (food) =>
            food.question === 'The venue offers in-house catering services'
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-food-variant" size="small" class="ml-2"></v-icon>
      <span class="ml-2"> Venue offers catering </span>
    </v-col>
    <v-col
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space) => space.key == '4'
        )?.answer
      "
      :cols="xs ? '12' : '6'"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span
        >Alcohol licence until
        {{
          props.specificSpace.venue.foods_and_beverages.find(
            (space) => space.key == "4"
          )?.max_capacity
        }}</span
      >
    </v-col>

    <template v-if="hasCustomFacilities">
      <v-divider class="my-3"></v-divider>
      <v-col cols="12" class="font-weight-bold mb-4">
        <span>Featured Custom Facility Offered</span>
      </v-col>
      <v-col
        :cols="xs ? '12' : '6'"
        v-for="(customFacility, index) in customFacilities"
        :key="index"
      >
        <span>{{ customFacility }}</span>
      </v-col>
    </template>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
// Define props
const props = defineProps({
  specificSpace: {
    type: Object,
    required: true,
  },
});

// Define emits
const emit = defineEmits(["data-status"]);

// Facilities icon mapping
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

// Computed properties
const complimentaryItems = computed(() =>
  props.specificSpace.venue.foods_and_beverages
    .find((space) => space.key == "3")
    ?.options.join(", ")
    .toLowerCase()
);

const filteredFacilities = computed(() =>
  props.specificSpace.features
    .filter((item) => item.reference === "facilities" && item.answer === true && 
      !(item.question === "Custom Facilities" && item.answer === true))
    .map((item) => ({
      ...item,
      icon: facilitiesIconMap[item.question] || "mdi-information-outline",
    }))
);

const providesAlcohol = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space) => space.key == "4"
    )?.answer === true
);

const hasCustomFacilities = computed(() => {
  const customFeature = props.specificSpace.features?.find(
    (space) => space.key === "12" && space.answer
  );
  return customFeature?.options?.length > 0;
});

const customFacilities = computed(() => {
  const customFeature = props.specificSpace.features?.find(
    (space) => space.key === "12" && space.answer
  );
  return customFeature?.options || [];
});

// Emit data status when component is mounted
onMounted(() => {
  emit(
    "data-status",
    filteredFacilities.value.length > 0 ||
      hasCustomFacilities.value ||
      providesAlcohol.value
  );
});
</script>
