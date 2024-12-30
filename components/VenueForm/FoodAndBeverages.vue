<template>
  <v-row no-gutters class="text-secondary">
    <v-row no-gutters class="text-h6">
      <v-col cols="12">
        <span class="font-500 text-18px">Catering options</span>
      </v-col>
    </v-row>
    <v-row no-gutters v-for="item in cateringQuestions
      .filter(
        (x) =>
          x.reference == 'catering_options' &&
          cateringOptionsKeysShown.includes(x.key as string),
      )
      .sort((a, b) => parseInt(a.key as string) - parseInt(b.key as string))" :key="item.question"
      class="w-100 d-flex  ga-3 align-start" :class="(item.key == '2.1' || item.key == '2.2') ? 'ml-10' : ''"
      style="position: relative;">
      <span style="position: absolute; left: -1%; top: 0">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details width="100%" class="py-0 my-0"
          v-model="item.answer" @update:model-value="updateData(item.key)"></v-checkbox>
      </span>
      <span class="py-3 ml-10">
        <v-row no-gutters class="font-500 text-18px">{{ item.question }}</v-row>
        <v-row no-gutters class="text-16px text-charcoal">
          {{ item.subtitle }}
        </v-row>
        <span class="w-100" v-if="item.key === '0' && item.answer">
          <v-row no-gutters class="text-16px font-500 mt-3">What menu your venue offers?</v-row>
          <v-row no-gutters style="max-width: 700px">
            <v-chip-group v-model="item.options" multiple selected-class="bg-secondary" :disabled="mode == 'view'"
              column @update:model-value="handleUpdateChipGroup">
              <v-chip v-for="x in menu" variant="outlined" border="secondary sm" :value="x" :text="x"></v-chip>
              <v-text-field v-if="item.options.includes('Others')" v-model="customMenu" variant="outlined" rounded="lg"
                border="secondary sm" :rules="customMenuRules" hide-details style="width: 200px; max-width: 200px;"
                class="ml-2" height="20px" @update:model-value="handleCustomMenu"></v-text-field>
            </v-chip-group>
          </v-row>
        </span>

        <span class="w-100" v-if="item.key === '3' && item.answer">
          <v-row no-gutters class="text-16px font-500 mt-3">What refreshments do you offer?</v-row>
          <v-row no-gutters style="max-width: 700px">
            <v-chip-group v-model="item.options" multiple selected-class="bg-secondary" :disabled="mode == 'view'"
              column @update:model-value="handleUpdateChipGroup">
              <v-chip v-for="x in beverages" :value="x" :text="x" variant="outlined" border="secondary sm"></v-chip>
              <v-text-field v-if="item.options.includes('Others')" v-model="customBeverages" variant="outlined"
                rounded="lg" border="secondary sm" :rules="customBeveragesRules" hide-details
                style="width: 200px; max-width: 200px;" class="ml-2" height="15px"
                @update:model-value="handleCustomBeverages"></v-text-field>
            </v-chip-group>
          </v-row>
        </span>
      </span>

    </v-row>
    <v-divider color="ongoing" class="my-5" :thickness="2"></v-divider>

    <v-row no-gutters class="mx-3 mt-2 font-500 text-18px w-100">The venue supplies alcohol</v-row>
    <v-row v-for="item in cateringQuestions
      .filter(
        (x) =>
          x.reference === 'alcohol_provided' &&
          alcoholLicenseShown.includes(x.key),
      )
      .sort((a, b) => parseInt(a.key as string) - parseInt(b.key as string))" :key="item.question"
      class="w-100  mx-auto mx-sm-5 " align="center" style="position: relative;">
      <span style="position: absolute; left: -1%; top: 0">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="item.answer"
          @update:model-value="updateData"></v-checkbox>
      </span>
      <span class="py-3 ml-10">
        <v-row no-gutters class="w-100 text-18px font-500">{{
          item.question
        }}</v-row>
        <v-row no-gutters class="w-100 text-16px text-charcoal mb-3">
          {{ item.subtitle }}
        </v-row>
        <span v-if="item.key === '4' && item.answer" class="">
          <span class="w-100text-secondary font-500 text-16px">Alcohol license until</span>
          <span class="w-100">
            <v-select variant="outlined" rounded="lg" class="mt-1" :items="timeArray" v-model="item.max_capacity"
              hide-details :rules="[requiredInput]" placeholder="Select time"
              @update:model-value="updateData"></v-select>
          </span>
        </span>
      </span>

    </v-row>
    <v-divider color="ongoing" class="my-5" :thickness="2"></v-divider>

    <span class="mx-3 mt-2 text-18px font-500 w-100">BYO alcohol</span>
    <v-row v-for="item in cateringQuestions
      .filter(
        (x) => x.reference === 'byo_alcohol' && BYOShown.includes(x.key),
      )
      .sort((a, b) => parseInt(a.key as string) - parseInt(b.key as string))" :key="item.question"
      class="w-100 mt-1 mx-auto mx-sm-5" align="center" style="position: relative;">
      <span style="position: absolute; left: -1%; top: 0">
        <v-checkbox color="secondary" base-color="light_gray_secondary" hide-details v-model="item.answer"
          @update:model-value="updateData"></v-checkbox>
      </span>
      <span class="w-100 py-3 ml-10">
        <v-row no-gutters class="text-18px font-500">{{
          item.question
        }}</v-row>
        <v-row no-gutters class="text-16px">
          {{ item.subtitle }}
        </v-row>
      </span>
    </v-row>
  </v-row>
  <!-- <DialogCustomInput v-model:show="showCustomInputDialog" /> -->
</template>

<script setup lang="ts">
const { countries, cateringAndDrinksOptions, menuOfferOptions } = useVenueData();
const { requiredInput } = useUtils();
const { mode } = useVenue();

const venue = defineModel<TVenue>({ required: true });

const customMenu = ref("");
const customBeverages = ref("")
const handleCustomMenu = () => {
  cateringQuestions.value[0].options =
    cateringQuestions.value[0].options.filter((item) => menu.value.includes(item));
  if (customMenu.value) {
    cateringQuestions.value[0].options.push(customMenu.value);
  }
  updateData();
};

const handleCustomBeverages = () => {
  cateringQuestions.value[5].options =
    cateringQuestions.value[5].options.filter((item) => beverages.includes(item));
  if (customBeverages.value) {
    cateringQuestions.value[5].options.push(customBeverages.value);
  }
  updateData();
};

const customMenuRules = computed(() => {
  return [
    (v: string) => !!v || "This field is required",
    (v: string) => !menu.value.includes(v) || "This menu is already listed",
  ];
});

const handleUpdateChipGroup = (val: any) => {
  handleCustomMenu();
  handleCustomBeverages();
}

const customBeveragesRules = computed(() => {
  return [
    (v: string) => !!v || "This field is required",
    (v: string) => !beverages.includes(v) || "This beverage is already listed",
  ];
});

const emit = defineEmits<{
  (e: "save-draft"): void;
}>();

// {
//       "question": "Do you provide catering services?",
//       "answer": true,
//       "type": "VENUE",
//       "options": ["Yes", "No"],
//       "reference": "Catering Services",
//       "key": "catering_services"
//     }

const cateringQuestions = ref<TFoodAndBeverages[]>(cateringAndDrinksOptions);

const menu = computed(() => {
  return menuOfferOptions.map(x => x.name).concat('Others');
})

const beverages = ["Tea & coffee", "Water", "Cookies", "Others"];

const timeArray = [
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
];

onMounted(() => {
  if (venue.value.foods_and_beverages.length > 0) {
    // replacing the array with the new answer
    cateringQuestions.value = cateringQuestions.value.map((obj1) => {
      const obj2 = venue.value.foods_and_beverages.find(
        (obj) => obj.key === obj1.key && obj.reference === obj1.reference,
      );

      if (obj2) {
        obj1.answer = obj2.answer;
        (obj1.max_capacity = obj2.max_capacity), (obj1.options = obj2.options);
        // Return the updated object
      }

      return obj1;
    });
  }

  // initialize custom menu
  const obj = venue.value.foods_and_beverages.find((item) => item.key == "0");
  const array = obj?.options || [];
  if (array.includes("Others")) {
    array.forEach((item: string) => {
      if (!menu.value.includes(item)) {
        customMenu.value = item;
      }
    });
  }

  const objBev = venue.value.foods_and_beverages.find((item) => item.key == "3");
  const arrayBev = objBev?.options || [];
  if (arrayBev.includes("Others")) {
    arrayBev.forEach((item: string) => {
      if (!beverages.includes(item)) {
        customBeverages.value = item;
      }
    });
  }
});

const updateData = (key?: string) => {
  setConditions(key);
  venue.value.foods_and_beverages = cateringQuestions.value.map((item) => {
    const { subtitle, name, ...rest } = item;
    return rest;
  });
};

const cateringOptionsKeysShown = computed(() => {
  const obj = cateringQuestions.value.find((x) => x.key === "2");
  return obj && obj.answer
    ? ["0", "1", "2", "2.1", "2.2", "3"]
    : ["0", "1", "2", "3"];
});

const alcoholLicenseShown = computed(() => {
  const obj = cateringQuestions.value.find((x) => x.key === "4");
  return obj && obj.answer ? ["4", "4.1"] : ["4"];
});

const BYOShown = computed(() => {
  const obj = cateringQuestions.value.find((x) => x.key === "5");
  return obj && obj.answer ? ["5", "5.1"] : ["5"];
});

const setConditions = (key?: string) => {
  const inhouseCateringObj = cateringQuestions.value.find((x) => x.key === "0");
  if (inhouseCateringObj && !inhouseCateringObj.answer) {
    const index = cateringQuestions.value.findIndex((x) => x.key === "0");
    if (index !== -1) cateringQuestions.value[index].options = [];
  }

  const cateringObj = cateringQuestions.value.find((x) => x.key === "2");
  const optionKey1 = cateringQuestions.value.find((x) => x.key === "1");
  if (cateringObj && !cateringObj.answer) {
    const index1 = cateringQuestions.value.findIndex((x) => x.key === "2.1");
    const index2 = cateringQuestions.value.findIndex((x) => x.key === "2.2");
    if (index1 !== -1) cateringQuestions.value[index1].answer = false;
    if (index2 !== -1) cateringQuestions.value[index2].answer = false;
  } else if (
    cateringObj &&
    cateringObj.answer &&
    optionKey1 &&
    optionKey1.answer
  ) {
    const indexOptionKey1 = cateringQuestions.value.findIndex(
      (x) => x.key === "1",
    );
    const indexOptionKey2 = cateringQuestions.value.findIndex(
      (x) => x.key === "2",
    );
    if (key == "2" && indexOptionKey1 !== -1)
      cateringQuestions.value[indexOptionKey1].answer = false;
    if (key == "1" && indexOptionKey2 !== -1)
      cateringQuestions.value[indexOptionKey2].answer = false;
  }

  const refreshmentsObj = cateringQuestions.value.find((x) => x.key === "3");
  if (refreshmentsObj && !refreshmentsObj.answer) {
    const index = cateringQuestions.value.findIndex((x) => x.key === "3");
    if (index !== -1) cateringQuestions.value[index].options = [];
  }

  const alcoholObj = cateringQuestions.value.find((x) => x.key === "4");
  if (alcoholObj && !alcoholObj.answer) {
    const index = cateringQuestions.value.findIndex((x) => x.key === "4.1");
    const alcoholIndex = cateringQuestions.value.findIndex(
      (x) => x.key === "4",
    );
    if (index !== -1) cateringQuestions.value[index].answer = false;
    if (alcoholIndex !== -1)
      cateringQuestions.value[alcoholIndex].max_capacity = null;
  }

  const BYOObj = cateringQuestions.value.find((x) => x.key === "5");
  if (BYOObj && !BYOObj.answer) {
    const index = cateringQuestions.value.findIndex((x) => x.key === "5.1");
    if (index !== -1) cateringQuestions.value[index].answer = false;
  }

  // remove custom menu when "Others" is not selected
  const obj = venue.value.foods_and_beverages.find((item) => item.key == "0");
  const array = obj?.options || [];
  if (!array.includes("Others")) {
    customMenu.value = "";
  }
  const obj2 = venue.value.foods_and_beverages.find((item) => item.key == "3");
  const array2 = obj2?.options || [];
  if (!array2.includes("Others")) {
    customBeverages.value = "";
  }
};
</script>

<style scoped>
.v-chip--disabled {
  opacity: 0.8;
}
</style>
