<template>
  <v-lazy>
    <v-row no-gutters>
      <v-col cols="12">
        <v-img height="60rem" contain :src="defaultCountryImage" :lazy-src="defaultCountryImage" cover xxl="8" xl="10"
          lg="9" alt="Default Country Image">
          <v-row no-gutters class="fill-height third-gradient" align-content="center" justify="center">
            <v-col cols="12" sm="10" md="10" lg="10" xl="10">
              <v-row class="custom-padding mt-12">
                <v-row no-gutters class="text-h2 text-white ml-2">
                  <v-col :class="mdAndDown ? 'text-center text-42px font-700' : ''" cols="12"
                    class="font-weight-bold text-h2-wrapper">
                    Discover & Reserve Venues
                  </v-col>
                </v-row>

                <v-col cols="12" class="mt-4">
                  <v-row no-gutters class="text-h4 text-white">
                    <v-col :class="mdAndDown ? 'text-center text-18px font-400' : ''" cols="12"
                      class="mb-5 text-h4-wrapper">
                      Seamless Venue Solutions for Every Event Endeavor
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="12" :class="mdAndDown ? 'pa-0' : 'mr-16 pr-16'">
                  <v-form ref="formValid">
                    <v-card color="white" class="rounded-lg pa-5" max-width="100%">
                      <v-row class="pa-2" justify="center">
                        <v-col cols="12" sm="6" md="3" lg="3" xl="3" class="pb-0">
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">WHERE</p>
                              <v-autocomplete density="compact" persistent-placeholder placeholder="Anywhere"
                                variant="plain" menu-icon="mdi-map-marker-outline" :items="municipalities" v-model="location"
                                :rules="locationRules" required item-title="name" item-value="name"
                                 @keydown.enter="onSubmit"
                                @click:append-inner="" :active="true"/>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="mdAndUp">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col cols="12" sm="6" md="2" lg="2" xl="2" class="pb-0">
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">CHECK IN</p>
                              <div class="d-flex gap-2">
                                <v-menu v-model="checkInDateMenu" :close-on-content-click="false" :nudge-right="40"
                                  transition="scale-transition" offset-y min-width="290px">
                                  <template #activator="{ props }">
                                    <v-text-field v-model="formattedCheckInDate" readonly persistent-hint v-bind="props"
                                      density="compact" persistent-placeholder placeholder="DD/MM/YYYY" variant="plain"
                                      append-icon="mdi-calendar" @keydown.enter="onSubmit" @click:append-inner="checkInDateMenu = true"
                                      style="flex: 1;">
                                    </v-text-field>
                                  </template>
                                  <v-date-picker v-model="checkInDate" @input="checkInDateMenu = false" no-title
                                    show-adjacent-months scrollable :min="new Date().toISOString().substring(0, 10)">
                                    <template #actions>
                                      <v-btn color="primary" @click="checkInDateMenu = false">OK</v-btn>
                                    </template>
                                  </v-date-picker>
                                </v-menu>
                                <v-select density="compact" variant="plain" :items="timeOptions" v-model="checkInTime"
                                  persistent-placeholder placeholder="Time" style="flex: 0.8; max-width: 80px;">
                                </v-select>
                              </div>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col cols="12" sm="6" md="2" lg="2" xl="2" class="pb-0">
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">CHECK OUT</p>
                              <div class="d-flex gap-2">
                                <v-menu v-model="checkOutDateMenu" :close-on-content-click="false" :nudge-right="40"
                                  transition="scale-transition" offset-y min-width="290px">
                                  <template #activator="{ props }">
                                    <v-text-field v-model="formattedCheckOutDate" readonly persistent-hint v-bind="props"
                                      density="compact" persistent-placeholder placeholder="DD/MM/YYYY" variant="plain"
                                      append-icon="mdi-calendar" @keydown.enter="onSubmit" @click:append-inner="checkOutDateMenu = true"
                                      style="flex: 1;">
                                    </v-text-field>
                                  </template>
                                  <v-date-picker v-model="checkOutDate" @input="checkOutDateMenu = false" no-title
                                    show-adjacent-months scrollable :min="checkInDate || new Date().toISOString().substring(0, 10)">
                                    <template #actions>
                                      <v-btn color="primary" @click="checkOutDateMenu = false">OK</v-btn>
                                    </template>
                                  </v-date-picker>
                                </v-menu>
                                <v-select density="compact" variant="plain" :items="timeOptions" v-model="checkOutTime"
                                  persistent-placeholder placeholder="Time" style="flex: 0.8; max-width: 80px;">
                                </v-select>
                              </div>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col cols="12" sm="6" md="2" lg="2" xl="2" class="pb-0">
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">GUESTS & WEDDING</p>
                              <v-autocomplete density="compact" persistent-placeholder placeholder="Select type..."
                                variant="plain" :items="guestAndWeddingOptions" v-model="selectedGuestOption"
                                @keydown.enter="onSubmit"/>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>

                        <v-col cols="12" sm="12" md="2" lg="2" xl="3" class="d-flex align-start pb-0">
                          <v-btn block color="primary" elevation="0" style="height: 60px"
                            class="text-h5 font-weight-bold rounded-lg" @click="onSubmit">search</v-btn>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-form>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-img>
      </v-col>

      <v-col cols="12" v-intersect="onIntersect">
        <v-row no-gutters justify="center" class="pt-10 custom-padding">
          <v-col cols="12" sm="12" md="11" lg="10" xl="10" :class="smAndDown ? 'py-5' : 'py-10'">
            <SearchEliteVenue />
          </v-col>
          <v-col cols="12" sm="12" md="11" lg="10" xl="10" :class="smAndDown ? '' : 'py-10'">
            <SearchSpotLight />
          </v-col>
          <v-col cols="12" sm="12" md="11" lg="10" xl="10" :class="smAndDown ? 'py-5' : 'py-10'">
            <SearchDescription />
          </v-col>
        </v-row>
      </v-col>
      <layout-footer />
    </v-row>
  </v-lazy>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import philippineMunicipalities from "~/data/philippine-municipalities.json";

definePageMeta({
  layout: "landing",
});

const { xs, smAndDown, mdAndDown, mdAndUp } = useDisplay();
const { getDefaultCountryImage, defaultCountryImage, country } = useLocal();
const { venueLocation: location, date_calendar, numGuest: numberOfGuests } = useVenueSearch();

const municipalities = ref(philippineMunicipalities);

// Check In / Check Out date and time
const checkInDate = ref(null);
const checkOutDate = ref(null);
const checkInTime = ref("10:00");
const checkOutTime = ref("11:00");
const checkInDateMenu = ref(false);
const checkOutDateMenu = ref(false);

// Time options (24-hour format with 30-minute intervals)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

// Wedding-related options
const weddingOptions = [
  "Wedding",
  "Asian Wedding",
  "Outdoor Wedding",
  "Unusual Wedding",
  "Wedding Ceremony",
  "Wedding Reception",
  "Civil Ceremony",
  "Civil Partnership",
  "Marquee Wedding",
  "Unique Wedding",
  "Garden Wedding",
  "Dry Hire Wedding",
];

// Guest count options (1-500+)
const guestCountOptions = Array.from({ length: 100 }, (_, i) => `${(i + 1) * 5} Guests`);
guestCountOptions.unshift("1-5 Guests", "5-10 Guests", "10-25 Guests", "25-50 Guests", "50-100 Guests", "100-250 Guests", "250-500 Guests", "500+ Guests");

// Combine wedding and guest options
const guestAndWeddingOptions = computed(() => {
  const combined = [...weddingOptions, ...guestCountOptions];
  return combined.sort();
});

const selectedGuestOption = ref("");

// const date_calendar = ref(null);
const dateInput = ref(false);
const formValid = ref();
// const eventType = ref(null);
// const numberOfGuests = ref<number | null>(null);
// const location = ref<string | null>(null);

const isScrolled = ref(false);
const offsetTop = ref(0);

const { displayHeader } = useUtils();

function onIntersect(e: any) {
  displayHeader.value = e;
}

function onScroll(e: any) {
  offsetTop.value = e.target.scrollTop;
  isScrolled.value = offsetTop.value > 20;
}

onMounted(async () => {
  await nextTick();
  const scrollTarget = document.getElementById("scroll-target");
  if (scrollTarget) {
    scrollTarget.addEventListener("scroll", onScroll);
    onScroll({ target: scrollTarget });
  }
});

onUnmounted(() => {
  const scrollTarget = document.getElementById("scroll-target");
  if (scrollTarget) {
    scrollTarget.removeEventListener("scroll", onScroll);
  }
});

const locationRules = [(value: string) => !!value || "Please select a municipality"];

const onSubmit = () => {
  if (
    formValid.value?.validate().then(({ valid: isValid }) => {
      if (isValid) {
        searchVenue();
      }
    })
  ) {
  }
};

const searchVenue = () => {
  // Extract guest count from selectedGuestOption
  let guestCount = 0;
  if (selectedGuestOption.value) {
    // If it's a guest count option like "50 Guests"
    const guestMatch = selectedGuestOption.value.match(/^(\d+)\s+Guests$/);
    if (guestMatch) {
      guestCount = parseInt(guestMatch[1]);
    }
    // If it's a range like "10-25 Guests"
    const rangeMatch = selectedGuestOption.value.match(/^(\d+)-(\d+)\s+Guests$/);
    if (rangeMatch) {
      guestCount = parseInt(rangeMatch[1]); // Use lower bound
    }
  }

  navigateTo({
    name: "country-venues-search",
    params: { country: location.value.toLowerCase() },
    query: {
      location: location.value,
      date: formattedDateToQuery(),
      total_guest: guestCount,
      weddingType: weddingOptions.includes(selectedGuestOption.value) ? selectedGuestOption.value : null,
    },
  });
};

const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const formattedCheckInDate = computed(() => {
  if (!checkInDate.value) return "";
  const date = new Date(checkInDate.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const formattedCheckOutDate = computed(() => {
  if (!checkOutDate.value) return "";
  const date = new Date(checkOutDate.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const formattedDateToQuery = () => {
  if (!date_calendar.value) return null;
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

onBeforeMount(async () => {
  await getDefaultCountryImage()
})


function preventNegative(event) {
  if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
}
</script>

<style scoped>
.column-divider {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.gradient {
  background: linear-gradient(180deg, #2193b0 0%, #6dd5ed 100%);
}

.third-gradient {
  background: linear-gradient(180deg, #6dd5ed 0%, #2193b0 100%);
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.ml-10 {
  margin-left: 40px;
}

.ml-11 {
  margin-left: 44px;
}

.pr-16 {
  padding-right: 64px;
}

.mr-16 {
  margin-right: 64px;
}

.custom-padding {
  padding-top: 10px;
  padding-bottom: 10px;
}

@media (max-width: 1024px) {
  .custom-padding {
    padding-left: 30px;
    padding-right: 30px;
  }
}

/* prevent location menu-icon from rotating */
.v-autocomplete :deep(.v-field__append-inner .v-icon) {
  transform: rotate(0) !important;
}
</style>
