<template>
  <v-row no-gutters>
    <v-col cols="12" class="text-18px font-500">License</v-col>
    <v-row no-gutters v-for="featuresItem in arr.filter((x) => x.reference === 'wedding')" class="w-100">
      <v-row no-gutters align="center">
        <v-col cols="12" sm="12" md="5" lg="5">
          <v-checkbox v-model="featuresItem.answer" hide-details base-color="light_gray_secondary"
            @update:model-value="updateData">
            <template v-slot:label>
              <v-col class="text-18px font-500 text-opacity-1">
                {{ featuresItem.question }}
              </v-col>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-row>

    <v-divider color="primary" class="mt-5"></v-divider>

    <v-row no-gutters class="w-100">
      <v-col cols="12" sm="5" md="5" lg="5" class="mt-5">
        <v-row no-gutters class="w-100">
          <v-row no-gutters cols="12" class="font-500 text-18px">Facilities</v-row>
          <v-row no-gutters class="w-100" v-for="featuresItem in arr
            .filter((x) => x.reference === 'facilities')
            .sort((a, b) => parseInt(a.key) - parseInt(b.key))">
            <v-row no-gutters>
              <v-checkbox v-model="featuresItem.answer" hide-details base-color="light_gray_secondary"
                @update:model-value="updateData" @click="clickedItem(featuresItem)">
                <template v-slot:label>
                  <v-col :class="featuresItem.question=='Custom Facilities' ?'font-700 font-weight-bold text-18px text-opacity-5 text-decoration-underline':'font-500 text-18px text-opacity-1'">
                    {{ featuresItem.question }}
                  </v-col>
                </template>
              </v-checkbox>
            </v-row>
          </v-row>
        </v-row>
        <!-- Custom Facilities -->
        <v-row no-gutters class="pl-5 ml-4" v-if="customFacility">
          <!-- Existing Facilities -->
          <v-row no-gutters class="ml-n6 w-100">
            <v-responsive>
              <v-col v-for="(item, index) in customFacilityArr" :key="index" cols="12" class="px-0">
                <v-row no-gutters align="center" class="pr-5">
                  <v-col cols="10" lg="10" md="10" sm="7" xs="7" class="d-flex align-center">
                    <v-text-field readonly :value="item" class="textField" dense hide-details
                      style="width: 100%">
                      <template v-slot:label>
                        <span class="font-600 font-weight-bold text-opacity-0">{{ item }}</span>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col xs="3" md="2" class="d-flex align-center justify-center">
                    <v-icon v-if="mode !='view' && !preview" @click="removeCustomFacility(index)" color="bg-secondary"  class="cursor-pointer" size="24">
                      mdi-trash-can-outline
                    </v-icon>
                  </v-col>
                </v-row>
              </v-col>

              <v-col v-if="mode !== 'view' && !preview" cols="12" class="px-0">
                <v-row no-gutters align="center" class="pr-5">
                  <v-col cols="10" lg="10" md="10" sm="7" xs="7" class="d-flex align-center">
                    <v-text-field :rules="[uniqueRule]" v-model="customFacilityItem" placeholder="Add Facility"
                      class="textField" dense hide-details style="width: 100%"></v-text-field>
                  </v-col>
                  <v-col xs="3" md="2" class="d-flex align-center justify-center">
                    <v-icon @click="addCustomFacility()" varian="solo" color="bg-secondary" icon="mdi-plus-box"
                      :ripple="false" slim class="cursor-pointer" flat>

                    </v-icon>
                  </v-col>
                </v-row>
              </v-col>
            </v-responsive>
          </v-row>
        </v-row>
      </v-col>

      <v-col cols="1">
        <v-divider vertical color="primary" class="mx-5"></v-divider>
      </v-col>

      <v-col cols="12" sm="6" md="6" lg="6" class="mt-5">
        <v-row no-gutters>
          <v-col cols="12" class="font-500 text-18px">Music & Sound</v-col>
          <v-row no-gutters class="w-100" v-for="featuresItem in arr
            .filter((x) => x.reference === 'music_sound')
            .sort((a, b) => parseInt(a.key) - parseInt(b.key))">
            <v-row no-gutters>
              <v-checkbox v-model="featuresItem.answer" base-color="light_gray_secondary" hide-details
                @update:model-value="updateData">
                <template v-slot:label>
                  <v-col class="font-500 text-18px">{{
                    featuresItem.question
                    }}</v-col>
                </template>
              </v-checkbox>
            </v-row>
            <v-row no-gutters v-if="featuresItem.key === '3' && featuresItem.answer" align="center" class="mx-4">
              <v-col cols="6" class="font-500 text-18px">Loud noise allowed until</v-col>
              <v-col cols="4">
                <v-select variant="outlined" :items="timeArray" v-model="featuresItem.max_capacity" hide-details
                  :rules="[requiredInput]" placeholder="Select time" @update:model-value="updateData"></v-select>
              </v-col>
            </v-row>
          </v-row>
        </v-row>
        <v-row no-gutters class="mt-5">
          <v-col cols="12" no-gutters class="font-500 text-18px">Accessibility</v-col>
          <v-row no-gutters class="w-100" v-for="featuresItem in arr
            .filter((x) => x.reference === 'accessibility')
            .sort((a, b) => parseInt(a.key) - parseInt(b.key))">
            <v-row no-gutters>
              <v-checkbox v-model="featuresItem.answer" base-color="light_gray_secondary" hide-details
                @update:model-value="updateData">
                <template v-slot:label>
                  <v-col cols="12" class="font-500 text-18px">{{
                    featuresItem.question
                    }}</v-col>
                </template>
              </v-checkbox>
            </v-row>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
</template>

<script setup lang="ts">
//IMPORT
const { requiredInput } = useUtils();
const { updateFeatures } = useLocal();
const { mode } = useVenue();

const space = defineModel({ required: true });
let customFacility = ref(false);
let customFacilityArr = ref<string[]>([]);
let customFacilityItem = ref("");

const props = defineProps({
  preview: {
    type: Boolean,
    required: false,
    default: false,
  }
})
// let isButtonDisabled = ref(false);
const arr = ref([
  {
    answer: false,
    key: "1",
    options: [],
    question: "Wedding License",
    reference: "wedding",
    type: "SPACE",
  },

  {
    answer: false,
    key: "1",
    options: [],
    question: "Wi-Fi",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "2",
    options: [],
    question: "Projector",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "3",
    options: [],
    question: "Flatscreen TV",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "4",
    options: [],
    question: "Whiteboard",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "5",
    options: [],
    question: "Flipchart",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "6",
    options: [],
    question: "PA System/Speaker",
    reference: "facilities",
    type: "SPACE",
  },

  {
    answer: false,
    key: "7",
    options: [],
    question: "Conference Call Facility",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "8",
    options: [],
    question: "Air Conditioning",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "9",
    options: [],
    question: "Natural Light",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "10",
    options: [],
    question: "Storage Space",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "11",
    options: [],
    question: "Quiet Space",
    reference: "facilities",
    type: "SPACE",
  },
  {
    answer: false,
    key: "12",
    options: [],
    question: "Custom Facilities",
    reference: "facilities",
    type: "SPACE",
  },

  {
    answer: false,
    key: "1",
    options: [],
    question: "Customers can enjoy their own music.",
    reference: "music_sound",
    type: "SPACE",
  },
  {
    answer: false,
    key: "2",
    options: [],
    question: "Customers can bring their own DJ.",
    reference: "music_sound",
    type: "SPACE",
  },
  {
    answer: false,
    key: "3",
    options: [],
    max_capacity: null,
    question: "The space is subject to noise limitations.",
    reference: "music_sound",
    type: "SPACE",
  },

  {
    answer: false,
    key: "1",
    options: [],
    question: "Wheelchair Accessible",
    reference: "accessibility",
    type: "SPACE",
  },
  {
    answer: false,
    key: "2",
    options: [],
    question: "Toilets accessible",
    reference: "accessibility",
    type: "SPACE",
  },
  {
    answer: false,
    key: "3",
    options: [],
    question: "Step-free guest entrance",
    reference: "accessibility",
    type: "SPACE",
  },
  {
    answer: false,
    key: "4",
    options: [],
    question: "Accessible parking spot",
    reference: "accessibility",
    type: "SPACE",
  },
  {
    answer: false,
    key: "5",
    options: [],
    question: "Lift to all floors",
    reference: "accessibility",
    type: "SPACE",
  },
  {
    answer: false,
    key: "6",
    options: [],
    question: "Cargo lift",
    reference: "accessibility",
    type: "SPACE",
  },
]);

onMounted(() => {
  if (space.value.features.length > 0) {
    // replacing the array with the new feuture question if there is changes in question
    arr.value = arr.value.map((obj1) => {
      const obj2 = space.value.features.find(
        (obj) => obj.key === obj1.key && obj.reference === obj1.reference
      );

      if (obj2) {
        obj1.answer = obj2.answer;
        obj1.max_capacity = obj2.max_capacity;
        obj1.options = obj2.options;
      }

      return obj1; // Return the updated object
    });
  }
  // Update existing options
  const index = arr.value.findIndex(
    (x) => x.key == "12" && x.reference == "facilities"
  );
  if (index > -1) {
    if (arr.value[index].answer == true) {
      customFacility.value = true;
      customFacilityArr.value = arr.value[index].options;
    }
  }
});

const updateData = () => {
  space.value.features = arr.value;
  if (arr.value[12].key == "12") {
    customFacility.value = arr.value[12].answer;
  }


  //  REMOVE CUSTOM FACILITY ISSUE IF UNCHECKED
  const index = arr.value.findIndex(
    (x) => x.key == "12" && x.reference == "facilities"
  );
  const obj = arr.value[index]
  if (index && index !== -1 && obj && !obj?.answer) {
    arr.value[index].options = []
  }
};

const timeArray = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
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

function addCustomFacility() {
  const word = customFacilityItem.value
  if (!word || duplicateItem()) return;
  const capitalizedWord = word?.charAt(0).toUpperCase() + word?.slice(1)
  if (!capitalizedWord) return;
  customFacilityArr.value.push(capitalizedWord);
  customFacilityItem.value = "";

  //  ADD CUSTOM FACILITY ISSUE IF UNCHECKED
  const index = arr.value.findIndex(
    (x) => x.key == "12" && x.reference == "facilities"
  );
  const obj = arr.value[index]
  if (index && index !== -1 && obj) {
    arr.value[index].options = customFacilityArr.value as any
  }
}

const uniqueRule = computed(() => {
  if ((!customFacilityItem.value && customFacilityArr.value.length == 0) || duplicateItem()) {
    return 'This is not allowed'
  } else {
    return true
  }
})

const duplicateItem = () => {
  const normalizeValue = (str: string) => str.replace(/\s/g, "").toLowerCase();
  return customFacilityArr.value.some(x => normalizeValue(x) == normalizeValue(customFacilityItem.value))
}

function removeCustomFacility(index) {
  customFacilityArr.value.splice(index, 1);
}

// {
//     answer: false,
//     key: "12",
//     options: [],
//     question: "Custom Facilities",
//     reference: "facilities",
//     type: "SPACE",
//   },
// watch(customFacilityArr.value, (newValue, oldValue) => {
//   const index = arr.value.findIndex(
//     (x) => x.key == "12" && x.reference == "facilities"
//   );
//   if (index > -1) {
//     arr.value[index].options = newValue;
//     updateData();
//   }
// });


function toggleCustomFacilities() {
  customFacility.value = !customFacility.value;
}
</script>

<style scoped>
.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}

.v-checkbox :deep(.v-input--selection-controls__ripple) {
  border: 1.5px solid #dedfe3;
  border-radius: 4px;
}
</style>
