<template>
  <v-container class="pa-5">
    <!-- <v-tabs class="mx-0" v-model="tab" selected-class="bg-primary" slider-color="transparent" :show-arows="true">
      <v-tab v-for="x in tabList" :key="x" :value="x" variant="flat" :ripple="false" fixed rounded="lg" slim size="medium"   class="mx-2 p-0 rounded-md bg-black">
        {{ x }}
      </v-tab>
    </v-tabs> -->
    <v-row class="d-flex ga-2 justify-space-between align-center">
      <PageTitle title="Additional Listing" />
      <ButtonFlatLooseButton label="Save as Draft" />
    </v-row>
    <v-row>
      <p class="text-subtitle-1">Venue Details</p>
    </v-row>

    <v-card
      variant="outlined"
      color="primary"
      class="my-5 pa-5"
      align-self="center"
    >
      <v-text-field label="Venue Name:" v-model="venue.name" required>
      </v-text-field>

      <v-sheet :border="1" color="#E8E8E8" class="my-5 pa-5">
        <p class="text-h6 text-black">Popular</p>
        <v-row class="d-flex ga-2 ma-5">
          <v-chip
            v-for="x in popularTags"
            :color="venue.selectedTags.includes(x) ? 'primary' : ''"
            :variant="venue.selectedTags.includes(x) ? 'elevated' : undefined"
            @click.stop="handleTagClick(x)"
            >{{ x }}</v-chip
          >
        </v-row>

        <v-divider></v-divider>

        <v-row class="d-flex ga-2 ma-5">
          <v-chip
            v-for="x in otherTags"
            :color="venue.selectedTags.includes(x) ? 'primary' : ''"
            :variant="venue.selectedTags.includes(x) ? 'elevated' : undefined"
            @click.stop="handleTagClick(x)"
            >{{ x }}</v-chip
          >
        </v-row>

        <v-divider></v-divider>
        <p class="text-h6 text-black mt-5">Drinks and Dining</p>
        <v-row class="d-flex ga-2 ma-5">
          <v-chip
            v-for="x in drinksDiningTags"
            :color="venue.selectedTags.includes(x) ? 'primary' : ''"
            :variant="venue.selectedTags.includes(x) ? 'elevated' : undefined"
            @click.stop="handleTagClick(x)"
            >{{ x }}</v-chip
          >
        </v-row>
      </v-sheet>

      <v-row>
        <v-col col="6">
          <p class="text-subtitle-1 text-black mb-2">
            Please choose the option that most accurately represents your venue:
          </p>
          <v-select
            v-model="venue.primary_type"
            label="Select Primary Type"
            :items="[
              'Apartment/Penthouse',
              'Auditorium',
              'Conference Center',
              'Event Space',
              'Hotel',
              'Restaurant',
            ]"
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row class="d-flex flex-column ga-2">
        <p class="text-h6 text-black mt-5 mx-5">Venue Description</p>
        <v-textarea v-model="venue.description" variant="outlined"></v-textarea>
      </v-row>
    </v-card>
    <v-row class="d-flex justify-end"
      ><ButtonCompactSmall label="Next"
    /></v-row>
    <pre>{{ venue }}</pre>
  </v-container>
</template>

<script setup lang="ts">
const tab = ref("Overview");
const venue = reactive({
  name: "",
  primary_type: "",
  selectedTags: [] as String[],
  description: "",
});
const tabList = [
  "Overview",
  "Address and Location",
  "Food & Beverages",
  "Venue Details",
  "Functions",
  "Venue Policy",
];

const popularTags = [
  "Apartment/Penthouse",
  "Auditorium",
  "Black Canvas",
  "Conference Center",
  "Hotel",
  "Hall",
  "Meeting Center",
  "Versatile Event Space",
];
const otherTags = [
  "Academic Venue / University Bldg",
  "Barn / Farm",
  "Boat",
  "Bowling Alley",
  "Castle",
  "Church",
  "Cinema",
  "Country House",
  "Film / Photo Studio",
  "Dance Studio",
  "Gallery",
  "Golf Club",
  "Historic Building",
  "Library",
  "Museum",
  "Open Air / Outdoor Venue",
  "Party Bus",
  "Railway Arch",
  "School Hall",
  "Stadium / Football Club",
  "Sports Hall",
  "Theatre",
  "Warehouse",
  "Coworking Space",
];

const drinksDiningTags = ["Restaurant", "Cafe", "Pub / Bar", "NightClub"];

const handleTagClick = (tag: String) => {
  if (venue.selectedTags.includes(tag)) {
    venue.selectedTags = venue.selectedTags.filter((x) => x !== tag);
  } else {
    venue.selectedTags.push(tag);
  }
};
</script>

<style scoped>
.v-tab--selected {
  background-color: #1f4b3f !important;
}
</style>
