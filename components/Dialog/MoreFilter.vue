<template>
  <v-dialog max-width="600">
    <v-card max-height="850" class="px-5" style="overflow-y: scroll">
      <v-row no-gutters>
        <v-col cols="12" class="stickyTop">
          <v-row no-gutters>
            <v-col col="11" class="d-flex justify-center pa-5">
              <span class="font-weight-bold">More filters</span>
            </v-col>
            <v-col cols="1" class="d-flex justify-center pa-5">
              <v-icon @click="emits('close-dialog')">mdi-close</v-icon>
            </v-col>
            <v-divider></v-divider>
          </v-row>
        </v-col>

        <v-row no-gutters v-if="xs || sm">
          <v-col cols="12" class="pb-3 pa-3">
            <v-row no-gutters>
              <v-col cols="12">
                <span class="font-weight-bold">Guests</span>
              </v-col>
              <v-col cols="12" class="mt-2">
                <v-text-field
                  type="number"
                  min="0"
                  append-icon=""
                  persistent-placeholder
                  placeholder="Number of guest"
                  prepend-inner-icon="mdi-account-multiple-outline"
                  v-model="guestModel"
                  :error-messages="
                    numGuest === 0
                      ? 'Enter number of guest to narrow results'
                      : ''
                  "
                  @keydown="preventNegative"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-2">
                <v-row no-gutters>
                  <v-col
                    :cols="xs ? '12' : '6'"
                    v-for="(item, index) in guestFilter"
                    :key="index"
                  >
                    <v-radio-group v-model="activeGuest" >
                      <v-radio :value="item.name" :label="item.name" ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-5"></v-divider>
          <v-col cols="12" class="pb-3 pa-3">
            <v-row no-gutters>
              <v-col cols="12">
                <span class="font-weight-bold">Date</span>
              </v-col>
              <v-col cols="12" class="mt-2">
                <v-menu
                  v-model="date_calendar_input"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      v-model="formatDate"
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="Select Date"
                      append-inner-icon="mdi-calendar-month"
                      label="DD/MM/YYYY"
                      class="mt-2"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date_calendar"
                    @input="date_calendar_input = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="date_calendar_input = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" class="mt-2">
                <span class="font-weight-bold">Time</span>
              </v-col>
              <v-col
                :cols="xs ? '12' : '6'"
                class="mt-2"
                :class="xs ? '' : 'pr-2'"
              >
                <v-select
                  v-model="filterDateFrom"
                  label="From"
                  prepend-inner-icon="mdi-clock-outline"
                  :items="timeOptionFrom"
                ></v-select>
              </v-col>
              <v-col
                :cols="xs ? '12' : '6'"
                class="mt-2"
                :class="xs ? '' : 'pl-2'"
              >
                <v-select
                  v-model="filterDateTo"
                  label="To"
                  prepend-inner-icon="mdi-clock-outline"
                  :items="filterDateFrom ? filteredTimeOptions : timeOptionTo"
                  :disabled="filterDateFrom === null"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-5"></v-divider>
          <v-col cols="12" class="pb-3 pa-3">
            <v-row no-gutters>
              <v-col cols="12">
                <span class="font-weight-bold">Price</span>
              </v-col>
              <v-col cols="5" class="mt-2 pr-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="font-weight-bold">Min Price</span>
                  </v-col>
                  <v-col cols="12">
                    <v-card
                      variant="outlined"
                      height="33"
                      class="d-flex justify-center"
                    >
                      <v-row no-gutters height="200">
                        <v-col cols="3" class="d-flex justify-center mt-2">
                          <span>S$</span>
                        </v-col>
                        <v-divider vertical></v-divider>
                        <v-col cols="8" class="ml-1">
                          <v-text-field
                            type="number"
                            min="0"
                            placeholder="0"
                            variant="plain"
                            v-model="priceValue[0]"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex justify-center mb-2 align-end"
                ><span>-</span></v-col
              >
              <v-col cols="5" class="mt-2 pl-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="font-weight-bold">Max Price</span>
                  </v-col>
                  <v-col cols="12">
                    <v-card
                      variant="outlined"
                      height="33"
                      class="d-flex justify-center"
                    >
                      <v-row no-gutters height="200">
                        <v-col cols="3" class="d-flex justify-center mt-2">
                          <span>S$</span>
                        </v-col>
                        <v-divider vertical></v-divider>
                        <v-col cols="8" class="ml-1">
                          <v-text-field
                            type="number"
                            min="0"
                            placeholder="1000+"
                            variant="plain"
                            v-model="priceValue[1]"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" class="mt-5">
                <v-range-slider
                  strict
                  v-model="priceValue"
                  step="10"
                  :max="10000"
                  :min="0"
                ></v-range-slider>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-5"></v-divider>
        </v-row>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Food & Beverages</span>
            </v-col>
            <v-col
              cols="12"
              class="d-flex flex-row align-center"
              v-for="(option, index) in displayedCateringAndDrinksOptions"
              :key="index"
              :style="smAndDown ?'height:70px':'height:50px'"
            >
              <v-checkbox
                class="pr-2 checkBox"
                v-model="selectedFoodAndBevOptions"
                 :label="option.name ===
                  'The venue exclusively collaborates with an approved roster of external caterers' &&
                mobile
                  ? 'Venue allow external catering'
                  : option.name"
                :value="option.question"
              >
              <template v-slot:label>
              <v-row no-gutters class=" text-opacity-1   mb-n2 mt-n2 py-2 pl-0 ml-0">
              <v-col cols="12" class="w-100 mt-2 mb-2">
               <span class="pt-2 pb-2 mb-n2 mt-n2">
                {{ option.name }}
                </span>
               
              </v-col>
               </v-row>
            </template>
            
            </v-checkbox>
              <!-- <v-row   class="mb-2 pl-0 ml-0  " :class="mobile ? '' : ''">{{
                option.name ===
                  "The venue exclusively collaborates with an approved roster of external caterers" &&
                mobile
                  ? "Venue allow external catering"
                  : option.name
              }}</v-row> -->
              <v-menu
                location="top end"
                open-on-hover
                v-if="option.name === 'Refreshments provided for guests.'"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    color="primary"
                    size="x-small"
                    class="mb-5 ml-1"
                    v-bind="props"
                    v-if="option.name === 'Refreshments provided for guests.'"
                    >mdi-information-slab-circle-outline</v-icon
                  >
                </template>
                <v-card width="200" class="pa-2 text-caption bg-primary"
                  >Complimentary water, tea, and coffee provided for guests at
                  no additional cost</v-card
                >
              </v-menu>
            </v-col>
            <v-col
              cols="6"
              class="d-flex flex-row align-center cursor-pointer ml-2"
              @click="showAllCateringAndDrinksOptions = true"
              v-if="!showAllCateringAndDrinksOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Menu Offer</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row align-center"
              v-for="(option, index) in displayedMenuOfferOptions"
              :key="index"
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedMenuOptions"
                :value="option.name"
              ></v-checkbox>
              <span class="mb-6">{{ option.name }}</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row align-center cursor-pointer ml-2"
              @click="showAllMenuOfferOptions = true"
              v-if="!showAllMenuOfferOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Facilities</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row align-center"
              v-for="(option, index) in displayedFacilitiesOptions"
              :key="index"
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedFacilitiesOptions"
                :value="option.name"
              ></v-checkbox>
              <span class="mb-6">{{ option.name }}</span>
              <v-menu
                location="top end"
                open-on-hover
                v-if="option.name === 'PA System/Speaker'"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    color="primary"
                    size="x-small"
                    class="mb-5 ml-1"
                    v-bind="props"
                    v-if="option.name === 'PA System/Speaker'"
                    >mdi-information-slab-circle-outline</v-icon
                  >
                </template>
                <v-card width="200" class="pa-2 text-caption bg-primary"
                  >A PA system is an audio setup designed to amplify sound,
                  ensuring clear music and announcements for events</v-card
                >
              </v-menu>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row align-center cursor-pointer ml-2"
              @click="showAllFacilitiesOptions = true"
              v-if="!showAllFacilitiesOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Allowed Events</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row align-center"
              v-for="(option, index) in allowdEventsOptions"
              :key="index"
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedAllowedEventsOptions"
                :value="option.name"
              ></v-checkbox>
              <span class="mb-6">{{ option.name }}</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Area type</span>
            </v-col>
            <v-col
              cols="12"
              class="px-3"
              v-for="(option, index) in displayedAreaTypeOptions"
              :key="index"
            >
              <v-card
                variant="outlined"
                class="mb-4"
                :class="option.value ? 'bg-primary' : 'bg-grey-lighten-1'"
                @click="toggleOption(index, option.key)"
              >
                <v-row no-gutters>
                  <v-col cols="1" class="d-flex align-center">
                    <v-img
                      :src="option.imagePath"
                      height="30"
                      width="30"
                      alt="More Filter Dialog Image"
                    ></v-img>
                  </v-col>
                  <v-col
                    cols="10"
                    class="py-4"
                    :class="mobile ? 'd-flex justify-center align-center' : ''"
                  >
                    <span class="font-weight-bold">{{ option.name }}</span>
                    <p class="text-caption" v-if="!mobile">
                      {{ option.subtitle }}
                    </p>
                  </v-col>
                  <v-col cols="1" v-if="!mobile">
                    <v-checkbox v-model="option.value"></v-checkbox>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              class="d-flex flex-row align-center cursor-pointer ml-2"
              @click="showAllAreaTypeOptions = true"
              v-if="!showAllAreaTypeOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Elite venues</span>
            </v-col>
            <v-col
              cols="12"
              class="px-3"
              v-for="(option, index) in areaTypeOptions.filter(
                (space) => space.name === 'Only show Elite Venues'
              )"
              :key="index"
            >
              <v-card
                variant="outlined"
                class="mb-4"
                :class="option.value ? 'bg-primary' : 'bg-grey-lighten-1'"
                @click="areaTypeOptions[6].value = !areaTypeOptions[6].value"
              >
                <v-row no-gutters>
                  <v-col cols="2" lg="1" class="d-flex align-center justify-center">
                    <!-- <v-img
                      :src="option.imagePath"
                      height="30"
                      width="30"
                    ></v-img> -->
                    <IconEliteHost/>
                  </v-col>
                  <v-col
                    cols="10"
                    class="py-4"
                    :class="mobile ? 'd-flex justify-center align-center' : ''"
                  >
                    <span class="font-weight-bold">{{ option.name }}</span>
                    <p class="text-caption" v-if="!mobile">
                      {{ option.subtitle }}
                    </p>
                  </v-col>
                  <v-col cols="1" v-if="!mobile">
                    <v-checkbox v-model="option.value"></v-checkbox>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Cancellation flexibility</span>
            </v-col>
            <v-col cols="12" class="px-3 d-flex flex-row justify-space-between">
              <span class="mt-4"
                >Only show venues that offer cancellation flexibility</span
              >
              <v-switch
                class="mr-2"
                v-model="cancellationFlexibility"
                hide-details
                color="primary"
                @click="
                  emits('update:updateObjectFilter', {
                    type: 'cancel',
                    value: !cancellationFlexibility,
                  })
                "
              ></v-switch>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Age restriction</span>
            </v-col>
            <v-col cols="12" class="px-3 d-flex flex-row justify-space-between">
              <span class="mt-4">Only show venues with age restriction</span>
              <v-switch
                class="mr-2"
                v-model="ageRestriction"
                hide-details
                color="primary"
                @click="
                  emits('update:updateObjectFilter', {
                    type: 'age',
                    value: !ageRestriction,
                  })
                "
              ></v-switch>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3 mb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Parking and Accommodation</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row"
              v-for="(option, index) in displayedParkingAccommodationsOptions"
              :key="index"
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedParkingAccommodationOptions"
                :value="option.question"
              ></v-checkbox>
              <span class="mt-4">{{ option.question }}</span>
            </v-col>
            <v-col
              cols="6"
              class="d-flex flex-row align-center cursor-pointer ml-2 mt-3"
              @click="showAllParkingAccommodationOptions = true"
              v-if="!showAllParkingAccommodationOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-divider class="mx-5"></v-divider>
        <v-col cols="12" class="pb-3">
          <v-row no-gutters>
            <v-col cols="12" class="pa-3">
              <span class="font-weight-bold">Accessibility features</span>
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="12"
              md="6"
              lg="6"
              xl="6"
              xxl="6"
              class="d-flex flex-row"
              v-for="(option, index) in displayedAccessibilityFeaturesOptions"
              :key="index"
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedAccessibilityOptions"
                :value="option.name"
              ></v-checkbox>
              <span class="mt-4">{{ option.name }}</span>
            </v-col>
            <v-col
              cols="6"
              class="d-flex flex-row align-center cursor-pointer ml-2 mt-3"
              @click="showAllaccessibilityFeaturesOptions = true"
              v-if="!showAllaccessibilityFeaturesOptions"
            >
              <v-icon color="primary">mdi-plus</v-icon>
              <span class="text-primary ml-2 font-weight-bold">Show all</span>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="stickyBottom py-5">
          <v-row no-gutters>
            <v-divider></v-divider>
            <v-col cols="6" class="mt-3 d-flex justify-start">
              <v-btn
                variant="plain"
                class="text-primary font-weight-bold"
                @click="handleClear()"
                >Clear</v-btn
              >
            </v-col>
            <v-col cols="6" class="mt-3 d-flex justify-end">
              <v-btn class="bg-primary" @click="emits('close-dialog')"
                >Show {{ venueCount }}
                {{ venueCount > 1 ? "results" : "result" }}</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { mobile, xs, sm,smAndDown } = useDisplay();
const { venueCount } = useVenue();
const {
  cateringAndDrinksOptions,
  menuOfferOptions,
  allowdEventsOptions,
  parkingAccommodationOptions,
  timeOptionFrom,
  timeOptionTo,
} = useVenueData();
const {
  facilitiesOptions,
  areaTypeOptions,
  accessibilityFeaturesOptions,
  guestFilter,
} = useSpaceData();
const date_calendar_input = ref(false);
const showAllCateringAndDrinksOptions = ref(false);
const showAllMenuOfferOptions = ref(false);
const showAllFacilitiesOptions = ref(false);
const showAllAreaTypeOptions = ref(false);
const showAllaccessibilityFeaturesOptions = ref(false);
const showAllParkingAccommodationOptions = ref(false);
const ageRestriction = ref(false);
const cancellationFlexibility = ref(false);
const selectedFoodAndBevOptions = ref([]);
const selectedMenuOptions = ref([]);
const selectedFacilitiesOptions = ref([]);
const selectedAllowedEventsOptions = ref([]);
const selectedParkingAccommodationOptions = ref([]);
const selectedAccessibilityOptions = ref([]);
const props = defineProps<{
  selectedKeysRepresentation: any;
}>();

const date_calendar: any = defineModel("date_calendar");
const activeGuest = defineModel("activeGuest");
const numGuest = defineModel("numGuest");
const filterDateFrom: any = defineModel("filterDateFrom");
const filterDateTo: any = defineModel("filterDateTo");
const priceValue: any = defineModel("priceValue");
const emits = defineEmits([
  "close-dialog",
  "searchVenues",
  "update:selectedKeys",
  "update:updateObjectFilter",
]);

const toggleOption = (index: number, key?: string) => {
  areaTypeOptions[index].value = !areaTypeOptions[index].value;
  const newSelectedKeys = new Set(props.selectedKeysRepresentation);
  if (areaTypeOptions[index].value) {
    newSelectedKeys.add(key);
  } else {
    newSelectedKeys.delete(key);
  }
  emits("update:selectedKeys", newSelectedKeys);
  emits("searchVenues");
};

watch(selectedFoodAndBevOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "f&b",
      value: selectedFoodAndBevOptions.value,
    });
  }
});

watch(selectedMenuOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "menu",
      value: selectedMenuOptions.value,
    });
  }
});

watch(selectedFacilitiesOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "facilities",
      value: selectedFacilitiesOptions.value,
    });
  }
});

watch(selectedAllowedEventsOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "events",
      value: selectedAllowedEventsOptions.value,
    });
  }
});

watch(selectedParkingAccommodationOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "parking",
      value: selectedParkingAccommodationOptions.value,
    });
  }
});

watch(selectedAccessibilityOptions, (oldValue, newwVal) => {
  if (oldValue) {
    emits("update:updateObjectFilter", {
      type: "accessibility",
      value: selectedAccessibilityOptions.value,
    });
  }
});

watch(activeGuest, async (oldValue, newwVal) => {
  if (oldValue) {
    emits("searchVenues");
  }
});
let timeoutId: ReturnType<typeof setTimeout>;
watch(priceValue, async (oldValue, newwVal) => {
  if (newwVal) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      emits("searchVenues");
    }, 1000); 
  }
}, { deep: true });

watch(numGuest, async (oldValue, newwVal) => {
  if (oldValue) {
    emits("searchVenues");
  }
});

const handleClear = (): void => {
  areaTypeOptions.forEach((option) => {
    option.value = false;
  });
  selectedFoodAndBevOptions.value = [];
  selectedMenuOptions.value = [];
  selectedFacilitiesOptions.value = [];
  selectedAllowedEventsOptions.value = [];
  selectedParkingAccommodationOptions.value = [];
  selectedAccessibilityOptions.value = [];
  ageRestriction.value = false;
  cancellationFlexibility.value = false;
  emits("update:selectedKeys", new Set());
  emits("update:updateObjectFilter", {
    type: "clear",
  });
};

const displayedCateringAndDrinksOptions = computed(() => {
  return showAllCateringAndDrinksOptions.value
    ? cateringAndDrinksOptions
    : cateringAndDrinksOptions.slice(0, 4);
});

const displayedMenuOfferOptions = computed(() => {
  return showAllMenuOfferOptions.value
    ? menuOfferOptions
    : menuOfferOptions.slice(0, 4);
});

const displayedFacilitiesOptions = computed(() => {
  return showAllFacilitiesOptions.value
    ? facilitiesOptions
    : facilitiesOptions.slice(0, 4);
});

const displayedAccessibilityFeaturesOptions = computed(() => {
  return showAllaccessibilityFeaturesOptions.value
    ? accessibilityFeaturesOptions
    : accessibilityFeaturesOptions.slice(0, 4);
});

const displayedParkingAccommodationsOptions = computed(() => {
  return showAllParkingAccommodationOptions.value
    ? parkingAccommodationOptions
    : parkingAccommodationOptions.slice(0, 4);
});

const displayedAreaTypeOptions = computed(() => {
  return showAllAreaTypeOptions.value
    ? areaTypeOptions.filter((space) => space.name !== "Only show Elite Venues")
    : areaTypeOptions.slice(0, 3);
});

const formatDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const filteredTimeOptions = computed(() => {
  const fromIndex = timeOptionTo.indexOf(filterDateFrom.value);
  const newTimeOptionTo = timeOptionTo.slice(fromIndex + 1);
  const result = newTimeOptionTo.reduce(
    (accumulator: string[], currentValue) => {
      const [fromHours, fromMinutes] = filterDateFrom.value
        .split(":")
        .map(Number);

      const [toHours, toMinutes] = currentValue.split(":").map(Number);

      const fromDate: any = new Date();
      fromDate.setHours(fromHours, fromMinutes, 0, 0);

      const toDate: any = new Date();
      toDate.setHours(toHours, toMinutes, 0, 0);

      let diffMs = toDate - fromDate;
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }
      let diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours === 0) diffHours = 24;
      accumulator.push(`${currentValue} (${diffHours} hrs)`);
      return accumulator;
    },
    []
  );
  return result;
});

const guestModel = computed({
  get() {
    return numGuest.value === 0 ? "" : numGuest.value;
  },
  set(value) {
    numGuest.value = value === "" ? 0 : value;
  },
});
function preventNegative(event) {
  if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
}
</script>
<style scoped>
.stickyTop {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 20px 0;
  z-index: 1000;
}
.stickyBottom {
  position: sticky;
  bottom: 0;
  background-color: white;
  padding: 20px 0;
  z-index: 1000;
}
.checkBox :deep(.v-label){
 opacity: 1 !important;
}
.v-radio :deep(.v-label) {
  opacity: 1 !important;
}
</style>
