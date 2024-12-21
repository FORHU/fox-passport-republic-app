<template>
  <v-row no-gutters>
    <v-col :cols="xs ? '12' : '6'" class="mb-2">
      <v-icon
        :icon="
          props.space.FoodAndBeverages.offerCatering
            ? 'mdi-food-variant'
            : 'mdi-food-variant-off'
        "
        size="small"
        class="ml-2"
      ></v-icon>
      <span class="ml-2">
        {{
          props.space.FoodAndBeverages.offerCatering
            ? "Venue offers catering"
            : "Venue doesn't offers catering"
        }}
      </span>
    </v-col>
    <v-col :cols="xs ? '12' : '6'" class="mb-2">
      <v-icon
        :icon="
          props.space.FoodAndBeverages.allowExternalCatering
            ? 'mdi-food-outline'
            : 'mdi-food-off-outline'
        "
        size="small"
        class="ml-2"
      ></v-icon>
      <span class="ml-2">
        {{
          props.space.FoodAndBeverages.allowExternalCatering
            ? "External catering allowed"
            : "External catering not allowed"
        }}
      </span>
    </v-col>
    <v-col :cols="xs ? '12' : '6'">
      <v-icon
        :icon="
          props.specificSpace.venue.foods_and_beverages.filter(
            (space: any) => space.key == '4',
          )[0]?.answer
            ? 'mdi-glass-cocktail'
            : 'mdi-glass-cocktail-off'
        "
        size="small"
        class="ml-2"
      ></v-icon>
      <span class="ml-2">
        {{
          props.specificSpace.venue.foods_and_beverages.filter(
            (space: any) => space.key == "4",
          )[0]?.answer
            ? "Venue provides alcohol"
            : "Venue doesn't provides alcohol"
        }}
      </span>
    </v-col>
    <v-col :cols="xs ? '12' : '6'">
      <v-icon
        :icon="
          props.specificSpace.venue.foods_and_beverages.filter(
            (space: any) => space.key == '5',
          )[0]?.answer
            ? 'mdi-glass-mug'
            : 'mdi-glass-mug-off'
        "
        size="small"
        class="ml-2"
      ></v-icon>
      <span class="ml-2">
        {{
          props.specificSpace.venue.foods_and_beverages.filter(
            (space: any) => space.key == "5",
          )[0]?.answer
            ? "BYO alcohol allowed"
            : "BYO alcohol not allowed"
        }}
      </span>
    </v-col>
  </v-row>
  <v-divider class="my-3"></v-divider>
  <v-row no-gutters>
    <v-col
      cols="12"
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '4',
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span
        >Alcohol licence until
        {{
          props.specificSpace.venue.foods_and_beverages.filter(
            (space: any) => space.key == "4",
          )[0].max_capacity
        }}
        (extension available)</span
      >
    </v-col>
    <v-col
      cols="12"
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '5.1',
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Corkage fee for BYO alcohol</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '2.1',
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Buyout fee for external catering</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '2.2',
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>Kitchen facilities available for guests</span>
    </v-col>
    <v-col
      :cols="xs ? '12' : '6'"
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '0',
        )[0]?.answer === true
      "
      v-for="(
        data, index
      ) in props.specificSpace.venue.foods_and_beverages.filter(
        (space: any) => space.key == '0',
      )[0].options"
      :key="index"
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span>{{ data }}</span>
    </v-col>
    <v-col
      :cols="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '3',
        )[0].options.length < 3 && !xs
          ? '6'
          : '12'
      "
      v-if="
        props.specificSpace.venue.foods_and_beverages.filter(
          (space: any) => space.key == '3',
        )[0]?.answer
      "
    >
      <v-icon icon="mdi-check" size="small" class="mr-1"></v-icon>
      <span
        >Complimentary
        {{
          props.specificSpace.venue.foods_and_beverages
            .filter((space: any) => space.key == "3")[0]
            .options.join(", ")
            .toLowerCase()
        }}</span
      >
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const props = defineProps<{
  space: any;
  specificSpace: any;
}>();
</script>