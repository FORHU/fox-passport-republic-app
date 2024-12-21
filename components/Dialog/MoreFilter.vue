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
              style="height: 50px"
            >
              <v-checkbox
                v-model="selectedFoodAndBevOptions"
                :value="option.name"
              ></v-checkbox>
              <span class="mb-6" :class="mobile ? 'text-caption' : ''">{{
                option.name ===
                  "The venue exclusively collaborates with an approved roster of external caterers" &&
                mobile
                  ? "Venue allow external catering"
                  : option.name
              }}</span>
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
                (space) => space.name === 'Only show Elite Venues',
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
                  <v-col cols="1" class="d-flex align-center">
                    <v-img
                      :src="option.imagePath"
                      height="30"
                      width="30"
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
              <span class="mt-4">Only show venues without age restriction</span>
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
                :value="option.name"
              ></v-checkbox>
              <span class="mt-4">{{ option.name }}</span>
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
const { mobile } = useDisplay();
const { venueCount } = useVenue();
const {
  cateringAndDrinksOptions,
  menuOfferOptions,
  allowdEventsOptions,
  parkingAccommodationOptions,
} = useVenueData();
const { facilitiesOptions, areaTypeOptions, accessibilityFeaturesOptions } =
  useSpaceData();
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
</style>
