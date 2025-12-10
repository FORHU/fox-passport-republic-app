<template>
  <div>
    <v-lazy>
      <v-row no-gutters>
        <v-col cols="12">
          <v-img
            height="60rem"
            contain
            :src="defaultCountryImage"
            :lazy-src="defaultCountryImage"
            cover
            xxl="8"
            xl="10"
            lg="9"
            alt="Default Country Image"
          >
            <v-row
              no-gutters
              class="fill-height third-gradient"
              align-content="center"
              justify="center"
            >
              <v-col cols="12" sm="10" md="10" lg="10" xl="10">
                <v-row class="custom-padding mt-12">
                  <v-row no-gutters class="text-h2 text-white ml-2">
                    <v-col
                      :class="mdAndDown ? 'text-center text-42px font-700' : ''"
                      cols="12"
                      class="font-weight-bold text-h2-wrapper"
                    >
                      LET'S MAKE LIFE AN EVENT
                    </v-col>
                  </v-row>

                  <v-col cols="12" class="mt-4">
                    <v-row no-gutters class="text-h4 text-white">
                      <v-col
                        :class="mdAndDown ? 'text-center text-18px font-400' : ''"
                        cols="12"
                        class="mb-5 text-h4-wrapper"
                      >
                        FoxPassport returns the power of Happiness & Experience to You
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" :class="mdAndDown ? 'pa-0' : 'mr-16 pr-16'">
                    <v-form ref="formValid">
                      <v-card
                        color="white"
                        class="rounded-lg pa-5"
                        max-width="100%"
                      >
                        <v-row class="pa-2" justify="center">
                          <v-col cols="12" sm="6" md="3" lg="3" xl="3" class="pb-0">
                            <v-row no-gutters>
                              <v-col cols="11">
                                <p class="text-14px font-600">WHERE</p>
                                <v-autocomplete
                                  density="compact"
                                  persistent-placeholder
                                  placeholder="Anywhere"
                                  variant="plain"
                                  menu-icon="mdi-map-marker-outline"
                                  :items="municipalities"
                                  v-model="location"
                                  :rules="locationRules"
                                  required
                                  item-title="name"
                                  item-value="name"
                                  @keydown.enter="onSubmit"
                                  @click:append-inner=""
                                  :active="true"
                                />
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
                                  <v-menu
                                    v-model="checkInDateMenu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290px"
                                  >
                                    <template #activator="{ props }">
                                      <v-text-field
                                        v-model="formattedCheckInDate"
                                        readonly
                                        v-bind="props"
                                        density="compact"
                                        placeholder="DD/MM/YYYY"
                                        variant="plain"
                                        append-icon="mdi-calendar"
                                        style="flex: 1"
                                      ></v-text-field>
                                    </template>
                                    <v-date-picker
                                      v-model="checkInDate"
                                      @input="checkInDateMenu = false"
                                      no-title
                                      show-adjacent-months
                                      scrollable
                                      :min="new Date().toISOString().substring(0, 10)"
                                    >
                                      <template #actions>
                                        <v-btn color="primary" @click="checkInDateMenu = false">OK</v-btn>
                                      </template>
                                    </v-date-picker>
                                  </v-menu>
                                  <v-select
                                    density="compact"
                                    variant="plain"
                                    :items="timeOptions"
                                    v-model="checkInTime"
                                    placeholder="Time"
                                    style="flex: 0.8; max-width: 80px"
                                  ></v-select>
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
                                  <v-menu
                                    v-model="checkOutDateMenu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290px"
                                  >
                                    <template #activator="{ props }">
                                      <v-text-field
                                        v-model="formattedCheckOutDate"
                                        readonly
                                        v-bind="props"
                                        density="compact"
                                        placeholder="DD/MM/YYYY"
                                        variant="plain"
                                        append-icon="mdi-calendar"
                                        style="flex: 1"
                                      ></v-text-field>
                                    </template>
                                    <v-date-picker
                                      v-model="checkOutDate"
                                      @input="checkOutDateMenu = false"
                                      no-title
                                      show-adjacent-months
                                      scrollable
                                      :min="checkInDate || new Date().toISOString().substring(0, 10)"
                                    >
                                      <template #actions>
                                        <v-btn color="primary" @click="checkOutDateMenu = false">OK</v-btn>
                                      </template>
                                    </v-date-picker>
                                  </v-menu>
                                  <v-select
                                    density="compact"
                                    variant="plain"
                                    :items="timeOptions"
                                    v-model="checkOutTime"
                                    placeholder="Time"
                                    style="flex: 0.8; max-width: 80px"
                                  ></v-select>
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
                                <v-menu 
                                  v-model="guestMenu" 
                                  :close-on-content-click="false" 
                                  offset-y 
                                  min-width="380"
                                  max-height="500"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-text-field
                                      v-bind="props"
                                      v-model="displayTotalSummary"
                                      readonly
                                      density="compact" 
                                      variant="plain" 
                                      placeholder="Add guests..."
                                      append-icon="mdi-chevron-down"
                                      @click:append-inner="guestMenu = !guestMenu"
                                    ></v-text-field>
                                  </template>

                                  <v-card class="rounded-lg">
                                    <v-list density="compact" class="overflow-y-auto" style="max-height: 400px;">
                                      <template v-for="(item, index) in guestList" :key="index">
                                        <v-list-subheader 
                                          v-if="item.type === 'header'"
                                          class="text-high-emphasis font-weight-bold pt-2 text-uppercase text-caption bg-grey-lighten-5"
                                          style="color: #2193b0; letter-spacing: 1px; position: sticky; top: 0; z-index: 1;"
                                        >
                                          {{ item.title }}
                                        </v-list-subheader>

                                        <v-list-item v-else class="px-4 py-3" :ripple="false">
                                          <div class="d-flex align-center justify-space-between w-100">
                                            <div class="text-body-2 mr-4 text-high-emphasis font-weight-medium" style="flex: 1; white-space: normal; line-height: 1.3;">
                                              {{ item.title }}
                                            </div>
                                            <div class="d-flex align-center flex-shrink-0">
                                              <v-btn icon="mdi-minus" size="x-small" variant="outlined" color="grey" class="rounded-circle" @click.stop="decrementItem(item)" :disabled="item.count <= 0" elevation="0" style="width: 32px; height: 32px;"></v-btn>
                                              <span class="mx-3 font-weight-bold text-body-1 text-high-emphasis" style="min-width: 24px; text-align: center;">{{ item.count }}</span>
                                              <v-btn icon="mdi-plus" size="x-small" variant="outlined" color="primary" class="rounded-circle" @click.stop="incrementItem(item)" elevation="0" style="width: 32px; height: 32px;"></v-btn>
                                            </div>
                                          </div>
                                        </v-list-item>
                                        <v-divider v-if="item.type === 'item' && index < guestList.length - 1 && guestList[index+1].type === 'header'"></v-divider>
                                      </template>
                                    </v-list>
                                    <v-divider></v-divider>
                                    <v-card-actions class="pa-3 bg-grey-lighten-5">
                                      <span class="text-caption text-medium-emphasis ml-2">Total: <b>{{ totalGuestCount }}</b> Guests</span>
                                      <v-spacer></v-spacer>
                                      <v-btn color="primary" variant="text" size="small" @click="resetCounts">Clear</v-btn>
                                      <v-btn color="primary" variant="flat" size="small" @click="guestMenu = false">Done</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </v-menu>
                              </v-col>
                              <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                                <v-divider vertical thickness="2"></v-divider>
                              </v-col>
                            </v-row>
                          </v-col>

                          <v-col cols="12" sm="12" md="2" lg="2" xl="3" class="d-flex align-start pb-0">
                            <v-btn
                              block
                              color="primary"
                              elevation="0"
                              style="height: 60px"
                              class="text-h5 font-weight-bold rounded-lg"
                              @click="onSubmit"
                              :loading="isSearching"
                            >search</v-btn>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-form>
                  </v-col>

                  <v-col
                    cols="12"
                    :class="mdAndDown ? 'pa-0 mt-4' : 'mr-16 pr-16 mt-4'"
                    v-if="showMap"
                  >
                    <v-card class="rounded-lg overflow-hidden" max-width="100%" elevation="4">
                      <div class="map-header pa-4 d-flex align-center justify-space-between">
                        <div>
                          <h3 class="text-h6 font-weight-bold text-white">{{ searchedLocation }}</h3>
                          <p class="text-caption text-white" style="opacity: 0.95" v-if="venueList.length > 0">
                            {{ venueList.length }} venue{{ venueList.length !== 1 ? "s" : "" }} found
                          </p>
                          <p class="text-caption text-white" style="opacity: 0.95" v-else-if="locationDetails">{{ locationDetails }}</p>
                        </div>
                        <div class="d-flex align-center gap-2">
                          <v-btn v-if="venueList.length > 0" variant="tonal" color="white" size="small" prepend-icon="mdi-view-grid" @click="viewAllVenues">
                            View All Venues
                          </v-btn>
                          <v-btn icon="mdi-close" variant="text" size="small" class="text-white" @click="showMap = false"></v-btn>
                        </div>
                      </div>

                      <MapboxMapEnhanced
                        ref="mapboxRef"
                        :location="searchedLocation"
                        :venues="venueList"
                        :height="mdAndDown ? '550px' : '650px'"
                        :zoom="15"
                        marker-color="#2193b0"
                        :show-legend="true"
                        @location-found="onLocationFound"
                        @venue-details-click="openVenueDetails"
                        @error="(e) => console.error(e)"
                      />
                    </v-card>
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

    <VenueDetailsDialog 
      v-model="showVenueDialog"
      :venue="selectedVenueDetails"
      :check-in-date="formattedCheckInDate"
      :check-out-date="formattedCheckOutDate"
      :check-in-time="checkInTime"
      :check-out-time="checkOutTime"
      @book="bookVenue"
      @directions="getDirections"
      @share="shareVenue"
    />
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import philippineMunicipalities from "~/data/philippine-municipalities.json";
import VenueDetailsDialog from "~/components/VenueDetailsDialog.vue";
import { useGuestCalculator } from "~/composables/useGuestCalculator";
import { useVenueMapLogic, type Venue } from "~/composables/useVenueMapLogic";

definePageMeta({ layout: "landing" });

// 1. Setup Utilities & Layout
const { xs, smAndDown, mdAndDown, mdAndUp } = useDisplay();
const { getDefaultCountryImage, defaultCountryImage } = useLocal();
const { displayHeader } = useUtils();

// 2. Setup New Composables
const { 
  guestMenu, guestList, incrementItem, decrementItem, resetCounts, totalGuestCount, displayTotalSummary 
} = useGuestCalculator();

const { 
  showMap, searchedLocation, locationDetails, venueList, isSearching, 
  showVenueDialog, selectedVenueDetails, searchForVenues, openVenueDetails 
} = useVenueMapLogic();

// 3. Local Form State
const location = ref(null);
const municipalities = ref(philippineMunicipalities);
const formValid = ref();
const mapboxRef = ref();

// Date & Time
const checkInDate = ref(null);
const checkOutDate = ref(null);
const checkInDateMenu = ref(false);
const checkOutDateMenu = ref(false);
const checkInTime = ref("10:00 AM");
const checkOutTime = ref("11:00 AM");

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12; 
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
});

const locationRules = [(value: string) => !!value || "Please select a municipality"];

// 4. Methods & Handlers
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

function onIntersect(e: any) {
  displayHeader.value = e;
}

const onSubmit = () => {
  formValid.value?.validate().then(({ valid }: any) => {
    if (valid && location.value) {
      searchedLocation.value = location.value;
      showMap.value = true;
      venueList.value = [];
    }
  });
};

const onLocationFound = (data: { lat: number; lng: number; placeName: string }) => {
  searchForVenues(location.value || "", data.lat, data.lng);
};

const bookVenue = (venue: Venue) => {
  showVenueDialog.value = false;
  navigateTo({
    path: `/${location.value?.toLowerCase() || 'ph'}/venues/${venue.id}/book`,
    query: {
      checkIn: formattedCheckInDate.value || undefined,
      checkOut: formattedCheckOutDate.value || undefined,
      checkInTime: checkInTime.value,
      checkOutTime: checkOutTime.value,
      guests: totalGuestCount.value > 0 ? totalGuestCount.value : undefined,
    },
  });
};

const viewAllVenues = () => {
  navigateTo({
    name: "country-venues-search",
    params: { country: location.value ? location.value.toLowerCase() : 'default' },
    query: {
      location: location.value,
      total_guest: totalGuestCount.value,
    },
  });
};

const getDirections = (venue: Venue) => {
  window.open(`http://maps.google.com/?q=${venue.latitude},${venue.longitude}`, '_blank');
};

const shareVenue = async (venue: Venue) => {
  const shareData = {
    title: venue.name,
    text: `Check out ${venue.name} in ${venue.address}`,
    url: window.location.href, // Simplified for now
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied!');
    }
  } catch (err) {
    console.error('Error sharing:', err);
  }
};

onBeforeMount(async () => {
  await getDefaultCountryImage();
});
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
.v-autocomplete :deep(.v-field__append-inner .v-icon) {
  transform: rotate(0) !important;
}
.map-header {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
}
.gap-2 {
  gap: 8px;
}
</style>