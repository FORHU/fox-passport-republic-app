<template>
  <v-row no-gutters class="w-100 text-secondary">
    <v-row no-gutters class="w-100 text-18px font-500">Parking</v-row>
    <v-row v-for="item in parkingQuestions
      .filter((x) => x.key !== '4' && x.key !== '5')
      .sort((a, b) => parseInt(a.key as string) - parseInt(b.key as string))" align-content="center"
      :key="item.question" class="text-secondary font-500 w-100">
      <v-col cols="12" style="position: relative">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="item.answer" class="checkbox-position"
          @update:model-value="updateData"></v-checkbox>
        <v-row no-gutters class="ml-7 font-500 text-18px">{{
          item.question
        }}</v-row>
      </v-col>
      <v-row v-if="item.key === '0' && item.answer" class="mx-10 my-1" align="center" no-gutters>
        <v-col cols="12" class="text-secondary">Number of spaces available</v-col>
        <v-col cols="8" class="mt-1">
          <v-text-field v-model.number="item.max_capacity" variant="outlined" type="number" rounded="lg" hide-details
            :rules="[requiredInput]" @update:model-value="updateData" style="max-width: 300px;"></v-text-field>
        </v-col>
      </v-row>

      <v-row v-if="item.key === '2' && item.answer" class="ml-10 my-1" align="center" no-gutters>
        <v-col cols="12" class="text-secondary">Number of spaces available</v-col>
        <v-col cols="8" class="mt-1">
          <v-text-field v-model.number="item.max_capacity" variant="outlined" type="number" rounded="lg" hide-details
            :rules="[requiredInput]" @update:model-value="updateData" style="max-width: 300px"></v-text-field>
        </v-col>
      </v-row>
    </v-row>

    <v-divider class="my-5" color="secondary"></v-divider>

    <v-row no-gutters class="w-100 text-18px font-500">Accommodation</v-row>
    <v-row v-for="item in parkingQuestions.filter((x) => x.key === '4')" :key="item.question" align-content="center"
      class="text-secondary">
      <v-col cols="12" style="position: relative">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="item.answer" @update:model-value="updateData"
          class="checkbox-position"></v-checkbox>
        <v-row no-gutters class="ml-7 font-500 text-18px">{{
          item.question
        }}</v-row>
      </v-col>
      <v-row v-if="item.key === '4' && item.answer" class="ml-10 my-1" align="center" no-gutters>
        <v-col cols="12" class="text-secondary text-16px font-500">Number of rooms available</v-col>
        <v-col cols="8" class="mt-1">
          <v-text-field v-model.number="item.max_capacity" variant="outlined" type="number" rounded="lg" hide-details
            :rules="[requiredInput]" @update:model-value="updateData" style="max-width: 300px;"></v-text-field>
        </v-col>
      </v-row>
    </v-row>

    <v-divider class="my-5" color="secondary"></v-divider>

    <v-row no-gutters class="w-100 text-18px font-500">Allowed Events</v-row>
    <v-row v-for="item in parkingQuestions.filter((x) => x.key === '5')" :key="item.question" align-content="center"
      class="text-secondary font-500">
      <v-col cols="12" style="position: relative;">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="item.answer" class="checkbox-position"
          @update:model-value="updateData"></v-checkbox>
        <v-row no-gutters class="ml-7 font-500 text-18px">{{
          item.question
        }}</v-row>
        <v-row no-gutters class="ml-7 text-16px text-subtitle font-400">
          {{ parkingQuestions[parseInt(item.key as string)].subtitle }}
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="my-5" color="secondary"></v-divider>

    <v-row no-gutters class="w-100 text-18px font-500">Age Policy</v-row>
    <v-row align-content="center" class="text-secondary font-500">

      <v-col cols="12" style="position: relative;">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="venue.age_restriction.answer" class="checkbox-position"
          @update:model-value="updateData"></v-checkbox>
        <v-row no-gutters class="ml-7 font-500 text-18px">Age restrictions at the venue</v-row>
        <v-row no-gutters class="ml-7 text-16px text-subtitle font-400">
          Specify if your venue has age limits for event attendees.
        </v-row>
      </v-col>
      <v-row v-if="venue.age_restriction.answer" class="mx-10 my-1" align="center" no-gutters>
        <v-col cols="12" sm="5">
          <v-row no-gutters class="font-500 text-secondary text-16px mb-1">Minimum age requirement</v-row>
          <v-select variant="outlined" rounded="lg" persistent-placeholder v-model="venue.age_restriction.min_age_requirement"
            :items="ageRequirementItems" item-title="label" item-value="option" placeholder="Select restriction"
            :rules="[requiredInput]"></v-select>
        </v-col>
        <v-col cols="12" sm="5" md="3" class="ml-sm-5">
          <v-row no-gutters class="font-500 text-secondary text-16px mb-1">Enforcement time</v-row>
          <v-select variant="outlined" rounded="lg" persistent-placeholder v-model="venue.age_restriction.enforcement_time"
            :items="enforcementTimeItems" placeholder="Select time" :rules="[requiredInput]"></v-select>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </v-row>
  </v-row>
</template>

<script setup lang="ts">
const { countries, ageRequirementItems, parkingAccommodationOptions } = useVenueData();
const { mode } = useVenue();
const { requiredInput } = useUtils();

const venue = defineModel<TVenue>({ required: true });

const emit = defineEmits<{
  (e: "save-draft"): void;
}>();

const parkingQuestions = ref(parkingAccommodationOptions);

onMounted(() => {
  if (venue.value.venue_details.length > 0) {
    // replacing the array with the new questions
    parkingQuestions.value = parkingQuestions.value.map((obj1) => {
      const obj2 = venue.value.venue_details.find(
        (obj) => obj.key === obj1.key && obj.reference === obj1.reference,
      );

      if (obj2) {
        obj1.answer = obj2.answer;
        obj1.max_capacity = obj2.max_capacity as any;
      }

      return obj1; // Return the updated object
    });
  }
});

const updateData = () => {
  venue.value.venue_details = parkingQuestions.value.map((item) => {
    const { subtitle, ...rest } = item;
    return rest;
  });

  const obj1 = venue.value.venue_details.find((x) => x.key === "2");
  if (obj1 && !obj1.answer) {
    parkingQuestions.value[2].max_capacity = null;
  }

  const obj2 = venue.value.venue_details.find((x) => x.key === "4");
  if (obj2 && !obj2.answer) {
    parkingQuestions.value[4].max_capacity = null;
  }

  if (!venue.value.age_restriction.answer) {
    venue.value.age_restriction.min_age_requirement = null;
    venue.value.age_restriction.enforcement_time = null;
  }
};

const enforcementTimeItems = [
  "The whole day",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "00:00",
];
</script>

<style scoped>
.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

.checkbox-position {
  position: absolute;
  top: -2%;
  left: 0
}
</style>
