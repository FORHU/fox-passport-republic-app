<template>
  <v-row no-gutters class="ml-2">
    <v-col
      v-for="(accessibility, index) in filteredAccessibility"
      :key="index"
      :cols="xs ? '12' : '6'"
      class="mb-1"
    >
      <v-icon :icon="accessibility.icon" size="small" class="mr-1"></v-icon>
      <span>{{ accessibility.question }}</span>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const props = defineProps<{
  specificSpace: any;
}>();

const accessibilityIconMap = {
  "Wheelchair Accessible": "mdi-wheelchair-accessibility",
  "Toilets accessible": "mdi-toilet",
  "Step-free guest entrance": "mdi-door-open",
  "Accessible parking spot": "mdi-parking",
  "Lift to all floors": "mdi-elevator",
  "Cargo lift": "mdi-forklift",
};

const filteredAccessibility = computed(() => {
  return props.specificSpace.features
    .filter(
      (item) => item.reference === "accessibility" && item.answer === true,
    )
    .map((item) => ({
      ...item,
      icon: accessibilityIconMap[item.question] || "mdi-information-outline",
    }));
});
</script>
