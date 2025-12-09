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
                    Discover & Reserve Venues
                  </v-col>
                </v-row>

                <v-col cols="12" class="mt-4">
                  <v-row no-gutters class="text-h4 text-white">
                    <v-col
                      :class="mdAndDown ? 'text-center text-18px font-400' : ''"
                      cols="12"
                      class="mb-5 text-h4-wrapper"
                    >
                      Seamless Venue Solutions for Every Event Endeavor
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
                        <v-col
                          cols="12"
                          sm="6"
                          md="3"
                          lg="3"
                          xl="3"
                          class="pb-0"
                        >
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
                            <v-col
                              class="py-1 pb-5 d-flex justify-center align-end"
                              v-if="mdAndUp"
                            >
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col
                          cols="12"
                          sm="6"
                          md="2"
                          lg="2"
                          xl="2"
                          class="pb-0"
                        >
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">CHECK IN</p>
                              <div class="d-flex gap-2">
                                <v-menu
                                  v-model="checkInDateMenu"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="290px"
                                >
                                  <template #activator="{ props }">
                                    <v-text-field
                                      v-model="formattedCheckInDate"
                                      readonly
                                      persistent-hint
                                      v-bind="props"
                                      density="compact"
                                      persistent-placeholder
                                      placeholder="DD/MM/YYYY"
                                      variant="plain"
                                      append-icon="mdi-calendar"
                                      @keydown.enter="onSubmit"
                                      @click:append-inner="checkInDateMenu = true"
                                      style="flex: 1"
                                    >
                                    </v-text-field>
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
                                      <v-btn
                                        color="primary"
                                        @click="checkInDateMenu = false"
                                        >OK</v-btn
                                      >
                                    </template>
                                  </v-date-picker>
                                </v-menu>
                                <v-select
                                  density="compact"
                                  variant="plain"
                                  :items="timeOptions"
                                  v-model="checkInTime"
                                  persistent-placeholder
                                  placeholder="Time"
                                  style="flex: 0.8; max-width: 80px"
                                >
                                </v-select>
                              </div>
                            </v-col>
                            <v-col
                              class="py-1 pb-5 d-flex justify-center align-end"
                              v-if="!xs"
                            >
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col
                          cols="12"
                          sm="6"
                          md="2"
                          lg="2"
                          xl="2"
                          class="pb-0"
                        >
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">CHECK OUT</p>
                              <div class="d-flex gap-2">
                                <v-menu
                                  v-model="checkOutDateMenu"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="290px"
                                >
                                  <template #activator="{ props }">
                                    <v-text-field
                                      v-model="formattedCheckOutDate"
                                      readonly
                                      persistent-hint
                                      v-bind="props"
                                      density="compact"
                                      persistent-placeholder
                                      placeholder="DD/MM/YYYY"
                                      variant="plain"
                                      append-icon="mdi-calendar"
                                      @keydown.enter="onSubmit"
                                      @click:append-inner="checkOutDateMenu = true"
                                      style="flex: 1"
                                    >
                                    </v-text-field>
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
                                      <v-btn
                                        color="primary"
                                        @click="checkOutDateMenu = false"
                                        >OK</v-btn
                                      >
                                    </template>
                                  </v-date-picker>
                                </v-menu>
                                <v-select
                                  density="compact"
                                  variant="plain"
                                  :items="timeOptions"
                                  v-model="checkOutTime"
                                  persistent-placeholder
                                  placeholder="Time"
                                  style="flex: 0.8; max-width: 80px"
                                >
                                </v-select>
                              </div>
                            </v-col>
                            <v-col
                              class="py-1 pb-5 d-flex justify-center align-end"
                              v-if="!xs"
                            >
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col
                          cols="12"
                          sm="6"
                          md="2"
                          lg="2"
                          xl="2"
                          class="pb-0"
                        >
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">GUESTS & WEDDING</p>
                              <v-autocomplete
                                density="compact"
                                persistent-placeholder
                                placeholder="Select type..."
                                variant="plain"
                                :items="guestAndWeddingOptions"
                                v-model="selectedGuestOption"
                                @keydown.enter="onSubmit"
                              />
                            </v-col>
                            <v-col
                              class="py-1 pb-5 d-flex justify-center align-end"
                              v-if="!xs"
                            >
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>

                        <v-col
                          cols="12"
                          sm="12"
                          md="2"
                          lg="2"
                          xl="3"
                          class="d-flex align-start pb-0"
                        >
                          <v-btn
                            block
                            color="primary"
                            elevation="0"
                            style="height: 60px"
                            class="text-h5 font-weight-bold rounded-lg"
                            @click="onSubmit"
                            :loading="isSearching"
                            >search</v-btn
                          >
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-form>
                </v-col>

                <!-- Enhanced Map Section - Shows after search -->
                <v-col
                  cols="12"
                  :class="mdAndDown ? 'pa-0 mt-4' : 'mr-16 pr-16 mt-4'"
                  v-if="showMap"
                >
                  <v-card
                    class="rounded-lg overflow-hidden"
                    max-width="100%"
                    elevation="4"
                  >
                    <div
                      class="map-header pa-4 d-flex align-center justify-space-between"
                    >
                      <div>
                        <h3 class="text-h6 font-weight-bold text-white">
                          {{ searchedLocation }}
                        </h3>
                        <p
                          class="text-caption text-white"
                          style="opacity: 0.95"
                          v-if="venueList.length > 0"
                        >
                          {{ venueList.length }} venue{{
                            venueList.length !== 1 ? "s" : ""
                          }}
                          found
                        </p>
                        <p
                          class="text-caption text-white"
                          style="opacity: 0.95"
                          v-else-if="locationDetails"
                        >
                          {{ locationDetails }}
                        </p>
                      </div>
                      <div class="d-flex align-center gap-2">
                        <v-btn
                          v-if="venueList.length > 0"
                          variant="tonal"
                          color="white"
                          size="small"
                          prepend-icon="mdi-view-grid"
                          @click="searchVenue"
                        >
                          View All Venues
                        </v-btn>
                        <v-btn
                          icon="mdi-close"
                          variant="text"
                          size="small"
                          class="text-white"
                          @click="showMap = false"
                        ></v-btn>
                      </div>
                    </div>

                    <!-- Enhanced Map Component -->
                    <MapboxMapEnhanced
                      ref="mapboxRef"
                      :location="searchedLocation"
                      :venues="venueList"
                      :height="mdAndDown ? '650px' : '800px'"
                      :zoom="13"
                      marker-color="#2193b0"
                      :show-legend="true"
                      :enable-3d="true"
                      @location-found="onLocationFound"
                      @venue-selected="onVenueSelected"
                      @venue-details-click="onVenueDetailsClick"
                      @error="onMapError"
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
          <v-col
            cols="12"
            sm="12"
            md="11"
            lg="10"
            xl="10"
            :class="smAndDown ? 'py-5' : 'py-10'"
          >
            <SearchEliteVenue />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="11"
            lg="10"
            xl="10"
            :class="smAndDown ? '' : 'py-10'"
          >
            <SearchSpotLight />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="11"
            lg="10"
            xl="10"
            :class="smAndDown ? 'py-5' : 'py-10'"
          >
            <SearchDescription />
          </v-col>
        </v-row>
      </v-col>
      <layout-footer />
    </v-row>

    <!-- ==================== VENUE DETAILS DIALOG (moved outside v-lazy) ==================== -->
  </v-lazy>
  
  <v-dialog 
    v-model="showVenueDialog" 
    :max-width="mdAndDown ? '100%' : '700px'"
    :fullscreen="smAndDown"
    scrollable
    persistent
  >
      <v-card v-if="selectedVenueDetails" class="venue-dialog-card">
        <!-- Close Button -->
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="dialog-close-btn"
          @click="showVenueDialog = false"
        ></v-btn>

        <!-- Image Carousel -->
        <v-carousel
          v-if="selectedVenueDetails.images && selectedVenueDetails.images.length > 0"
          :height="smAndDown ? 250 : 350"
          show-arrows="hover"
          hide-delimiter-background
          cycle
          :interval="5000"
        >
          <v-carousel-item
            v-for="(img, i) in selectedVenueDetails.images"
            :key="i"
            :src="img"
            cover
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </template>
          </v-carousel-item>
        </v-carousel>
        <v-img
          v-else
          :src="selectedVenueDetails.image || 'https://via.placeholder.com/700x350?text=No+Image'"
          :height="smAndDown ? 250 : 350"
          cover
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </template>
        </v-img>

        <v-card-text class="pa-5">
          <!-- Venue Name -->
          <h2 class="text-h5 font-weight-bold mb-2">
            {{ selectedVenueDetails.name }}
          </h2>

          <!-- Rating -->
          <div class="d-flex align-center mb-4" v-if="selectedVenueDetails.rating">
            <v-rating
              :model-value="selectedVenueDetails.rating"
              color="amber"
              density="compact"
              half-increments
              readonly
              size="small"
            ></v-rating>
            <span class="font-weight-bold ml-2">{{ selectedVenueDetails.rating }}</span>
            <span class="text-grey ml-1">({{ selectedVenueDetails.reviewCount || 0 }} reviews)</span>
          </div>

          <!-- Venue Type Badge -->
          <v-chip 
            color="primary" 
            variant="tonal" 
            class="mb-4" 
            v-if="selectedVenueDetails.type"
          >
            <v-icon start size="small">mdi-tag</v-icon>
            {{ selectedVenueDetails.type }}
          </v-chip>

          <!-- Info Grid -->
          <v-row class="mb-4">
            <!-- Address -->
            <v-col cols="12">
              <div class="d-flex align-start">
                <v-icon color="primary" class="mr-3 mt-1">mdi-map-marker</v-icon>
                <div>
                  <p class="text-caption text-grey mb-1">Address</p>
                  <p class="text-body-1">{{ selectedVenueDetails.address }}</p>
                </div>
              </div>
            </v-col>

            <!-- Capacity -->
            <v-col cols="6" v-if="selectedVenueDetails.capacity">
              <div class="d-flex align-start">
                <v-icon color="primary" class="mr-3 mt-1">mdi-account-group</v-icon>
                <div>
                  <p class="text-caption text-grey mb-1">Capacity</p>
                  <p class="text-body-1 font-weight-medium">
                    Up to {{ selectedVenueDetails.capacity }} guests
                  </p>
                </div>
              </div>
            </v-col>

            <!-- Price -->
            <v-col cols="6" v-if="selectedVenueDetails.price">
              <div class="d-flex align-start">
                <v-icon color="success" class="mr-3 mt-1">mdi-cash</v-icon>
                <div>
                  <p class="text-caption text-grey mb-1">Price</p>
                  <p class="text-h6 font-weight-bold text-success">
                    ₱{{ selectedVenueDetails.price.toLocaleString() }}
                    <span class="text-body-2 font-weight-regular text-grey">/ hour</span>
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Amenities -->
          <div v-if="selectedVenueDetails.amenities && selectedVenueDetails.amenities.length > 0" class="mb-4">
            <p class="text-subtitle-2 font-weight-bold mb-3">
              <v-icon size="small" class="mr-1">mdi-check-circle</v-icon>
              Amenities
            </p>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="amenity in selectedVenueDetails.amenities"
                :key="amenity"
                size="small"
                variant="outlined"
                color="primary"
              >
                {{ amenity }}
              </v-chip>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedVenueDetails.description" class="mb-4">
            <p class="text-subtitle-2 font-weight-bold mb-2">
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              About this venue
            </p>
            <p class="text-body-2 text-grey-darken-1">
              {{ selectedVenueDetails.description }}
            </p>
          </div>

          <!-- Check-in/Check-out Info (if dates selected) -->
          <v-alert
            v-if="checkInDate && checkOutDate"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div>
                <strong>Check-in:</strong> {{ formattedCheckInDate }} at {{ checkInTime }}
              </div>
              <div>
                <strong>Check-out:</strong> {{ formattedCheckOutDate }} at {{ checkOutTime }}
              </div>
            </div>
          </v-alert>
        </v-card-text>

        <!-- Action Buttons -->
        <v-card-actions class="pa-5 pt-0">
          <v-row>
            <v-col cols="12">
              <v-btn
                color="primary"
                variant="flat"
                block
                size="large"
                class="mb-3"
                @click="bookVenue(selectedVenueDetails)"
              >
                <v-icon start>mdi-calendar-check</v-icon>
                Book This Venue
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                variant="outlined"
                block
                @click="getDirections(selectedVenueDetails)"
              >
                <v-icon start>mdi-directions</v-icon>
                Directions
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                variant="outlined"
                block
                @click="shareVenue(selectedVenueDetails)"
              >
                <v-icon start>mdi-share-variant</v-icon>
                Share
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ==================== END VENUE DETAILS DIALOG ==================== -->
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import philippineMunicipalities from "~/data/philippine-municipalities.json";

// Types
interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  price?: number;
  capacity?: number;
  type?: string;
  amenities?: string[];
  description?: string;
}

definePageMeta({
  layout: "landing",
});

const { xs, smAndDown, mdAndDown, mdAndUp } = useDisplay();
const { getDefaultCountryImage, defaultCountryImage, country } = useLocal();
const {
  venueLocation: location,
  date_calendar,
  numGuest: numberOfGuests,
} = useVenueSearch();

const municipalities = ref(philippineMunicipalities);

// Map-related state
const showMap = ref(false);
const searchedLocation = ref("");
const locationDetails = ref("");
const isSearching = ref(false);
const mapboxRef = ref();
const venueList = ref<Venue[]>([]);
const searchCoordinates = ref<{ lat: number; lng: number } | null>(null);

// Venue Dialog state
const showVenueDialog = ref(false);
const selectedVenueDetails = ref<Venue | null>(null);

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
const guestCountOptions = Array.from(
  { length: 100 },
  (_, i) => `${(i + 1) * 5} Guests`
);
guestCountOptions.unshift(
  "1-5 Guests",
  "5-10 Guests",
  "10-25 Guests",
  "25-50 Guests",
  "50-100 Guests",
  "100-250 Guests",
  "250-500 Guests",
  "500+ Guests"
);

// Combine wedding and guest options
const guestAndWeddingOptions = computed(() => {
  const combined = [...weddingOptions, ...guestCountOptions];
  return combined.sort();
});

const selectedGuestOption = ref("");

const dateInput = ref(false);
const formValid = ref();

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

const locationRules = [
  (value: string) => !!value || "Please select a municipality",
];

const onSubmit = () => {
  if (
    formValid.value?.validate().then(({ valid: isValid }) => {
      if (isValid) {
        showLocationOnMap();
      }
    })
  ) {
  }
};

// Generate sample venues near the search location
const generateSampleVenues = (lat: number, lng: number, locationName: string): Venue[] => {
  const venueTypes = [
    'Grand Ballroom', 
    'Garden Venue', 
    'Conference Hall',
    'Rooftop Terrace', 
    'Beach Resort', 
    'Function Room',
    'Event Space',
    'Private Estate',
    'Convention Center',
    'Pavilion'
  ];
  
  const amenities = [
    'WiFi', 
    'Parking', 
    'Catering', 
    'AV Equipment', 
    'Stage', 
    'Air Conditioning', 
    'Kitchen',
    'Bridal Suite',
    'Dressing Room',
    'Sound System',
    'LED Screen',
    'Outdoor Area',
    'Pool Access',
    'Garden',
    'Bar Service'
  ];
  
  const venueNames = [
    'The Grand Palace',
    'Sunset Gardens',
    'Crystal Ballroom',
    'Royal Pavilion',
    'Azure Heights',
    'Golden Hall',
    'Emerald Garden',
    'Starlight Venue',
    'Diamond Event Center',
    'Pearl Function Room',
    'Sapphire Terrace',
    'Ruby Ballroom',
    'Ivory Hall',
    'Platinum Plaza'
  ];
  
  const sampleVenues: Venue[] = [];
  const numVenues = Math.floor(Math.random() * 8) + 8;
  
  for (let i = 0; i < numVenues; i++) {
    const latOffset = (Math.random() - 0.5) * 0.045;
    const lngOffset = (Math.random() - 0.5) * 0.045;
    
    const randomAmenities = amenities
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 4);
    
    const venueName = venueNames[i % venueNames.length];
    const venueType = venueTypes[i % venueTypes.length];
    const imageId = Math.floor(Math.random() * 1000);
    
    sampleVenues.push({
      id: `venue-${Date.now()}-${i}`,
      name: `${venueName} ${locationName}`,
      address: `${Math.floor(Math.random() * 999) + 1} ${locationName} Avenue, ${locationName}, Philippines`,
      latitude: lat + latOffset,
      longitude: lng + lngOffset,
      image: `https://picsum.photos/seed/venue${imageId}/600/400`,
      images: [
        `https://picsum.photos/seed/venue${imageId}a/600/400`,
        `https://picsum.photos/seed/venue${imageId}b/600/400`,
        `https://picsum.photos/seed/venue${imageId}c/600/400`,
        `https://picsum.photos/seed/venue${imageId}d/600/400`,
      ],
      rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 300) + 20,
      price: Math.floor(Math.random() * 20000) + 8000,
      capacity: Math.floor(Math.random() * 400) + 50,
      type: venueType,
      amenities: randomAmenities,
      description: `Beautiful ${venueType.toLowerCase()} perfect for weddings, corporate events, and special celebrations in ${locationName}. Features modern facilities and professional event support to make your occasion memorable.`
    });
  }
  
  return sampleVenues.sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

// Fetch venues
const fetchVenues = async (lat: number, lng: number, locationName: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateSampleVenues(lat, lng, locationName);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return generateSampleVenues(lat, lng, locationName);
  }
};

// Helper function to extract guest count
const extractGuestCount = (option: string): number => {
  if (!option) return 0;
  
  const exactMatch = option.match(/^(\d+)\s+Guests?$/);
  if (exactMatch) return parseInt(exactMatch[1]);
  
  const rangeMatch = option.match(/^(\d+)-(\d+)\s+Guests?$/);
  if (rangeMatch) return parseInt(rangeMatch[1]);
  
  const plusMatch = option.match(/^(\d+)\+\s+Guests?$/);
  if (plusMatch) return parseInt(plusMatch[1]);
  
  return 0;
};

// Helper function to extract wedding type
const extractWeddingType = (option: string): string | null => {
  return weddingOptions.includes(option) ? option : null;
};

// Show location on map
const showLocationOnMap = async () => {
  console.log('🗺️ showLocationOnMap called with location:', location.value);
  
  if (location.value) {
    isSearching.value = true;
    searchedLocation.value = location.value;
    showMap.value = true;
    venueList.value = [];
    
    console.log('✅ Map visibility set to true');
  }
};

// Handle location found from map
const onLocationFound = async (data: {
  lat: number;
  lng: number;
  placeName: string;
}) => {
  console.log('📍 Location found:', data);
  locationDetails.value = data.placeName;
  searchCoordinates.value = { lat: data.lat, lng: data.lng };

  console.log('🏢 Fetching venues...');
  const venues = await fetchVenues(data.lat, data.lng, searchedLocation.value);
  console.log('✅ Venues fetched:', venues.length);
  venueList.value = venues;

  isSearching.value = false;
};

// Handle venue selection from map
const onVenueSelected = (venue: Venue) => {
  console.log("Venue selected:", venue);
};

// Handle venue details click - OPENS DIALOG
const onVenueDetailsClick = (venue: Venue) => {
  console.log("Opening venue details dialog:", venue);
  selectedVenueDetails.value = venue;
  showVenueDialog.value = true;
};

// Handle map error
const onMapError = (message: string) => {
  console.error("Map error:", message);
  isSearching.value = false;
};

// Book venue - navigate to booking page
const bookVenue = (venue: Venue) => {
  showVenueDialog.value = false;
  
  navigateTo({
    path: `/${location.value?.toLowerCase() || 'ph'}/venues/${venue.id}/book`,
    query: {
      checkIn: formattedCheckInDate.value || undefined,
      checkOut: formattedCheckOutDate.value || undefined,
      checkInTime: checkInTime.value,
      checkOutTime: checkOutTime.value,
      guests: extractGuestCount(selectedGuestOption.value) || undefined,
      weddingType: extractWeddingType(selectedGuestOption.value) || undefined,
    },
  });
};

// Get directions to venue
const getDirections = (venue: Venue) => {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`,
    '_blank'
  );
};

// Share venue
const shareVenue = async (venue: Venue) => {
  const shareData = {
    title: venue.name,
    text: `Check out ${venue.name} - ${venue.type} in ${venue.address}`,
    url: `${window.location.origin}/${location.value?.toLowerCase() || 'ph'}/venues/${venue.id}`,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  } catch (err) {
    console.error('Error sharing:', err);
  }
};

const searchVenue = () => {
  let guestCount = 0;
  if (selectedGuestOption.value) {
    const guestMatch = selectedGuestOption.value.match(/^(\d+)\s+Guests$/);
    if (guestMatch) {
      guestCount = parseInt(guestMatch[1]);
    }
    const rangeMatch = selectedGuestOption.value.match(/^(\d+)-(\d+)\s+Guests$/);
    if (rangeMatch) {
      guestCount = parseInt(rangeMatch[1]);
    }
  }

  navigateTo({
    name: "country-venues-search",
    params: { country: location.value.toLowerCase() },
    query: {
      location: location.value,
      date: formattedDateToQuery(),
      total_guest: guestCount,
      weddingType: weddingOptions.includes(selectedGuestOption.value)
        ? selectedGuestOption.value
        : null,
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
  await getDefaultCountryImage();
});

function preventNegative(event: KeyboardEvent) {
  if (event.key === "-" || event.key === "e") {
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

.map-header {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
}

.map-header h3,
.map-header p {
  color: white;
}

.map-header .v-btn {
  color: white;
}

.gap-2 {
  gap: 8px;
}

/* Venue Dialog Styles */
.venue-dialog-card {
  position: relative;
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  backdrop-filter: blur(4px);
}

.venue-dialog-card :deep(.v-carousel__controls) {
  background: transparent;
}

.venue-dialog-card :deep(.v-carousel__controls__item) {
  color: white;
}
</style>