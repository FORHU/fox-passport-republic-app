<template>
  <v-row no-gutters class="w-100">
    <v-row no-gutters>
      <v-col cols="12" class="font-500 text-18px mb-1">Venue Name</v-col>
      <v-col cols="12">
        <v-text-field color="charcoal" base-color="charcoal" class="ma-0" rounded="lg" border="secondary sm"  placeholder="Venue Name"
          v-model="venue.name" :rules="nameRules" hide-details>
        </v-text-field>
        <p class="text-red text-14px mt-1 ml-2" style="line-height: 1.2;">* Please note that only the space name will be visible on the search page, while the venue name will not be displayed.</p>
      </v-col>
    </v-row>

    <v-row no-gutters class="w-100 my-3">
      <v-col cols="12">
        <v-row no-gutters class="font-500 text-18px mb-1">Venue Description</v-row>
        <v-textarea v-model="venue.description" variant="outlined"  auto-grow rounded="lg" no-resize counter
          :rows="smAndUp ? 5 : 10" :rules="textCountRules" color="charcoal" base-color="charcoal"></v-textarea>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-3">
      <v-col cols="12" class="font-500 text-18px">Venue Type</v-col>

      <v-chip-group v-model="selectedKeywords" multiple column selected-class="bg-secondary" :disabled="mode == 'view'"
        class="mt-3 d-flex flex-column">
        <v-row no-gutters class="d-flex ga-7">
          <v-col cols="12">
            <v-card elevation="0" height="100%" class="" rounded="lg">
              <p class="font-500 text-16px mb-2">
                {{ tags[0].category }}
              </p>
              <v-responsive>
                <v-chip v-for="x in tags[0].keywords" variant="outlined" border="secondary sm" class=""
                  :size="smAndUp ? 'default' : 'small'" :key="x" :text="x" :value="x"></v-chip>
              </v-responsive>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card elevation="0" height="100%" class="" rounded="lg">
              <p class="font-500 text-16px mb-2">
                {{ tags[1].category }}
              </p>
              <v-responsive>
                <v-chip v-for="x in tags[1].keywords" variant="outlined" border="secondary sm" class=""
                  :size="smAndUp ? 'default' : 'small'" :key="x" :text="x" :value="x"></v-chip>
              </v-responsive>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card elevation="0" class="" height="100%" rounded="lg">
              <p class="font-500 text-16px mb-2">
                {{ tags[2].category }}
              </p>
              <v-responsive>
                <v-chip v-for="x in tags[2].keywords" variant="outlined" border="secondary sm" class=""
                  :size="smAndUp ? 'default' : 'small'" :key="x" :text="x" :value="x"></v-chip>
              </v-responsive>
            </v-card>
          </v-col>
        </v-row>
      </v-chip-group>
    </v-row>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();

const props = defineProps<{
  submitted?: boolean;
}>();

const venue = defineModel<TVenue>({ required: true });

const { mode } = useVenue();

const emit = defineEmits(["save-draft"]);

const selectedKeywords = ref<string[]>([]);



const tags = [
  {
    category: "Popular",
    keywords: [
      "Apartment/Penthouse",
      "Auditorium",
      "Canvas",
      "Conference Center",
      "Hotel",
      "Hall",
      "Meeting Center",
      "Versatile Event Space",
    ],
  },
  {
    category: "Building",
    keywords: [
      "Academic Venue/University Bldg",
      "Barn / Farm",
      "Boat",
      "Bowling Alley",
      "Castle",
      "Church",
      "Cinema",
      "Country House",
      "Film/Photo Studio",
      "Dance Studio",
      "Gallery",
      "Golf Club",
      "Historic Building",
      "Library",
      "Museum",
      "Open Air/Outdoor Venue",
      "Party Bus",
      "Railway Arch",
      "School Hall",
      "Stadium/Football Club",
      "Sports Hall",
      "Theatre",
      "Warehouse",
      "Coworking Space",
    ],
  },
  {
    category: "Drinks and Dining",
    keywords: ["Restaurant", "Cafe", "Pub/Bar", "NightClub"],
  },
];

watch(
  () => selectedKeywords.value,
  (newValue) => {
    if (newValue.length > 0) {
      venue.value.keywords = selectedKeywords.value.map((x) => {
        const index = tags.findIndex((y) => y.keywords.includes(x));
        return {
          categories: [`${tags[index]?.category}`],
          keyword: x,
          type: "VENUE",
        };
      });

      // venue.value.keywords = venue.value.keywords.filter(x => newValue.includes(x.keyword))
    } else {
      venue.value.keywords = [];
    }
  },
);


const textCountRules = computed(() => [
  (v: string) => v?.length >= 300 || "Minimum of 300 characters",
  (v: string) => v?.length <= 2000 || "Maximum of 2000 characters",
]);

const chipRules = [
  (value: string[]) =>
    venue.value.keywords.length > 0 || "You must choose at least one keyword.",
];

const nameRules = [
  (value: string) => !!value || "You must enter a venue name.",
];

const representationRules = [
  (value: string) => !!value || "You must select an option.",
];

const descriptionRules = [
  (value: string) => !!value || "You must enter a description.",
];

// const keywordsRules = computed(() => {
//   return !!(venue.value.keywords.length > 0) || 'You must choose at least one keyword.';
// });



onMounted(() => {
  if (venue.value.keywords.length > 0) {
    selectedKeywords.value = venue.value.keywords.map(
      (x) => x.keyword,
    ) as string[];
  }
});
</script>
<style scoped>
.v-chip--disabled {
  opacity: 0.8;
}
</style>
