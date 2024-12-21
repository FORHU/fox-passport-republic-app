<template>
  <v-row no-gutters>
    <!-- <v-col :cols="xs ? '12' : '6'" class="mb-2">
      <v-icon
        :icon="
          props.space.FoodAndBeverages.offerCatering
            ? 'mdi-food-variant'
            : 'mdi-food-variant-off'
        "
        size="small"
        
      ></v-icon>
      <span >
        {{
          props.space.FoodAndBeverages.offerCatering
            ? "Venue offers catering"
            : "Venue doesn't offers catering"
        }}
      </span>
    </v-col> -->
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-4"
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space: any) => space.key == '1'
        )?.answer === false
      "
    >
      <v-icon
        :icon="iconMapping.allowExternalCatering"
        size="small"
        class="mr-3"
      ></v-icon>
      <span>{{ textMapping.allowExternalCatering }}</span>
    </v-col>
    <!-- Show "Venue doesn't provide alcohol" only when data is present -->
    <v-col v-if="!hasAlcoholLicence" :cols="xs ? '12' : '6'" class="mb-4">
      <v-icon
        :icon="iconMapping.providesAlcohol"
        size="small"
        class="mr-3"
      ></v-icon>
      <span>{{ textMapping.providesAlcohol }}</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-4"
      v-if="
        props.specificSpace.venue.foods_and_beverages.find(
          (space: any) => space.key == '5'
        )?.answer === false
      "
    >
      <v-icon :icon="iconMapping.byoAlcohol" size="small" class="mr-3"></v-icon>
      <span>{{ textMapping.byoAlcohol }}</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      class="mb-2"
      v-if="
        specificSpace.venue?.foods_and_beverages?.filter(
          (food: any) =>
            food.question === 'The venue offers in-house catering services'
        )[0]?.answer === false
      "
    >
      <v-icon icon="mdi-food-variant-off" size="small" class="ml-2"></v-icon>
      <span class="ml-2"> Venue doesn't offers catering </span>
    </v-col>
  </v-row>
  <v-row no-gutters>
    <!-- <v-col cols="12" v-if="hasAlcoholLicence">
      <span>Alcohol licence until {{ alcoholLicence }}</span>
    </v-col> -->
    <v-col cols="12" v-if="hasCorkageFee">
      <span>Corkage fee for BYO alcohol</span>
    </v-col>
    <!-- <v-col :cols="colsForBuyoutFee" v-if="hasBuyoutFee">
      <span>Buyout fee for external catering</span>
    </v-col> -->
    <v-col :cols="colsForKitchenFacilities" v-if="hasKitchenFacilities">
      <span>Kitchen facilities available for guests</span>
    </v-col>
    <!-- <v-col :cols="colsForComplimentary" v-if="hasComplimentary">
      <span>Complimentary {{ complimentaryItems }}</span>
    </v-col> -->
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";

const { xs } = useDisplay();
const props = defineProps<{
  space: any;
  specificSpace: any;
}>();

const iconMapping = computed(() => ({
  allowExternalCatering: props.space.FoodAndBeverages.allowExternalCatering
    ? "mdi-food-outline"
    : "mdi-food-off-outline",
  providesAlcohol: props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "4"
  )?.answer
    ? "mdi-glass-cocktail"
    : "mdi-glass-cocktail-off",
  byoAlcohol: props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "5"
  )?.answer
    ? "mdi-glass-mug"
    : "mdi-glass-mug-off",
}));

const textMapping = computed(() => ({
  allowExternalCatering: props.space.FoodAndBeverages.allowExternalCatering
    ? "External catering allowed"
    : "External catering not allowed",
  providesAlcohol: props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "4"
  )?.answer
    ? "Venue provides alcohol"
    : "Venue doesn't provide alcohol",
  byoAlcohol: props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "5"
  )?.answer
    ? "BYO alcohol allowed"
    : "Bring your own alcohol not allowed",
}));

const hasAlcoholLicence = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "4"
    )?.answer
);
const alcoholLicence = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "4"
    )?.max_capacity
);

const hasCorkageFee = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "5.1"
    )?.answer
);

const hasBuyoutFee = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "2.1"
    )?.answer
);

const hasKitchenFacilities = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "2.2"
    )?.answer
);

const hasComplimentary = computed(
  () =>
    props.specificSpace.venue.foods_and_beverages.find(
      (space: any) => space.key == "3"
    )?.answer
);

const complimentaryItems = computed(() =>
  props.specificSpace.venue.foods_and_beverages
    .find((space: any) => space.key == "3")
    ?.options.join(", ")
    .toLowerCase()
);

const colsForBuyoutFee = computed(() =>
  props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "3"
  )?.options.length < 3 && !xs
    ? "6"
    : "12"
);
const colsForKitchenFacilities = computed(() =>
  props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "2.2"
  )?.answer
    ? "12"
    : "6"
);
const colsForComplimentary = computed(() =>
  props.specificSpace.venue.foods_and_beverages.find(
    (space: any) => space.key == "3"
  )?.options.length < 3 && !xs
    ? "6"
    : "12"
);
</script>
