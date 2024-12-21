<template>
  <v-row no-gutters class="mt-">
    <v-chip-group v-model="arrayOfKeywords" multiple column selected-class="bg-secondary"
      @update:model-value="updatePayload" class="d-flex flex-column opacity-100 chip-custom"
      :disabled="mode === 'view' || preview" style="border: none">
      <v-row no-gutters>
        <v-sheet width="100%" height="auto" class="my-2" v-for="(value, key) in tags" :key="key" elevation="0"
          rounded="lg">
          <v-row no-gutters class="fill-height">
            <!-- Category Header -->
            <v-col cols="12" class="text-18px font-500">
              {{ key }}
            </v-col>
            <template v-for="item in value">
              <v-col cols="12" class="my-3">
                <v-row no-gutters align="center">
                  <!-- Category Name -->
                  <v-col class="font-500 text-16px">
                    {{ item.category }}
                  </v-col>
                  <!-- Select All Checkbox -->
                  <div v-if="mode !== 'view' && !preview">
                    <v-checkbox :model-value="isAllSelected(item.keywords)" class="text-caption" hide-details
                      @update:model-value="selectAll(item.keywords)">
                      <template v-slot:label>
                        <div class="font-400 text-16px text-secondary">Select All</div>
                      </template>
                    </v-checkbox>
                  </div>
                  <!-- Keywords Chips -->
                  <v-col cols="12">
                    <v-responsive>
                      <v-chip size="small" v-for="keyword in item.keywords" :key="keyword" :text="keyword"
                        variant="outlined" :value="keyword" class="border-thin font-400 text-16px px-3 px-md-5 py-4 py-md-4 my-sm-2"></v-chip>
                    </v-responsive>
                  </v-col>
                </v-row>
              </v-col>
            </template>
          </v-row>
        </v-sheet>

        <!-- Add Divider and Space between sections -->
        <v-divider v-if="shouldShowDivider(key)" class="my-4"></v-divider>
      </v-row>
    </v-chip-group>
  </v-row>
</template>

<script setup lang="ts">
// IMPORT

import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();
const { requiredInput } = useUtils();
const { mode } = useVenue();
const { tags } = useVenueData();
const space = defineModel<TVenueSpace>({ required: true });

const props = defineProps<{
  preview?: boolean;
}>();

//DATA
const arrayOfKeywords = ref(space.value.keywords.map((x) => x.keyword) || []);
const subHeader = ref([
  "Business",
  "Wedding and Dining",
  "Parties",
  "",
  "",
  "Art / Cultural",
  "",
  "Building / Style",
  "Space Types",
  "",
]);

const isAllSelected = (keywords: string[]) => {
  // check if every keyword is already selected
  // Convert string2 array to a Set for fast lookup
  const setSelectedString = new Set(arrayOfKeywords.value);

  return keywords.every((key: string) => setSelectedString.has(key));
};

const selectAll = (keywords: string[]) => {
  if (keywords.length > 0) {
    const allSelected = isAllSelected(keywords);

    if (!allSelected) {
      for (let key of keywords) {
        if (!arrayOfKeywords.value.includes(key)) {
          arrayOfKeywords.value.push(key);
        }
      }
    } else {
      keywords.forEach((key: string) => {
        arrayOfKeywords.value = arrayOfKeywords.value.filter(
          (key) => !keywords.includes(key)
        );
      });
    }

    updatePayload();
  }
};

const updatePayload = () => {
  // Implement logic to update the payload with the selected keywords
  // Example: payload.keywords = space.value.keywords;

  if (arrayOfKeywords.value.length > 0) {
    const selectedKeywords = arrayOfKeywords.value;

    type TKeywordPayload = {
      categories: string[];
      keyword: string;
      type: "SPACE";
    };

    const updatedKeywords: TKeywordPayload[] = [];

    // Loop through each selected keyword
    selectedKeywords.forEach((selectedKeyword) => {
      // Find the category for the selected keyword
      for (const category in tags) {
        const categoryKeywords = tags[category].flatMap(
          (item) => item.keywords
        );
        if (categoryKeywords.includes(selectedKeyword)) {
          // If the keyword is found, add it to the updatedKeywords array
          updatedKeywords.push({
            categories: [category],
            keyword: selectedKeyword,
            type: "SPACE",
          });
          break; // Exit the loop after finding the category
        }
      }
    });

    // Update space.value.keywords with the updatedKeywords array
    space.value.keywords = updatedKeywords;
  } else {
    // Clear space.value.keywords if no keywords are selected
    space.value.keywords = [];
  }
};

const shouldShowDivider = (key: string) => {
  const index = subHeader.value.indexOf(key);
  return (
    index !== -1 &&
    index < subHeader.value.length - 1 &&
    subHeader.value[index + 1] !== ""
  );
};
</script>

<style scoped>
.v-chip--disabled {
  opacity: 0.8;
}

/* vuetify checkbox label */
.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}
</style>
