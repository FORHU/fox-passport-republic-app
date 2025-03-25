<template>
  <!-- <LayoutSearchHeader /> -->

  <v-app-bar app flat elevation="1" extended height="80">
    <LayoutSearchHeader />
    <template v-slot:extension>
      <v-row class="pb-8 pr-5 search-bar">
        <v-col cols="5" sm="5" md="2" lg="2">
          <v-row class="pt-3 pl-3">
            <v-autocomplete
              hide-details
              variant="outlined"
              append-inner-icon="mdi-menu-down"
              menu-icon=""
              :items="tagsItems"
              v-model="eventType"
              class="ml-2"
              rounded="lg"
              @update:model-value="handleUpdateEventType"
            />
          </v-row>
        </v-col>
        <v-col cols="5" sm="5" md="2" lg="2">
          <v-row class="pt-3 pr-1">
            <v-autocomplete
              hide-details
              append-inner-icon="mdi-map-marker-outline"
              menu-icon=""
              :items="registeredCountries"
              item-title="country_name"
              item-value="cca2"
              v-model="venueLocation"
              class="ml-2"
              block
              rounded="lg"
              @update:model-value="handleUpdateLocation"
            />
          </v-row>
        </v-col>

        <v-col cols="2" class="d-none d-md-inline">
          <v-row class="pt-3 px-1">
            <v-menu :close-on-content-click="false" v-model="isGuestMenuOpen">
              <template v-slot:activator="{ props }">
                <v-btn
                  class="custom-outline button-with-icon"
                  block
                  height="40px"
                  variant="outlined"
                  v-bind="props"
                  rounded="lg"
                >
                  <v-row class="w-100">
                    <span class="font-400 button-text">
                      {{ numGuest === 0 ? "" : numGuest }}
                      {{ numGuest > 1 ? "guests" : "guest"
                      }}{{ activeGuest !== "" ? "," : "" }}
                      {{ activeGuest }}
                    </span>
                    <v-img
                      src="/public/svg/people.svg"
                      height="18px"
                      width="30px"
                      alt="guest count icon"
                    ></v-img>
                  </v-row>
                </v-btn>
              </template>
              <v-card width="400" class="pa-5">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      type="number"
                      min="0"
                      append-icon=""
                      persistent-placeholder
                      placeholder="Number of guest"
                      prepend-inner-icon="mdi-account-multiple-outline"
                      @keydown="preventNegative"
                      v-model="guestModel"
                      :error-messages="
                        numGuest === 0
                          ? 'Enter number of guest to narrow results'
                          : ''
                      "
                      @update:model-value="handleUpdateGuest"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-card
                      variant="outlined"
                      height="50"
                      class="d-flex justify-center"
                    >
                      <v-row no-gutters class="text-h7 font-400">
                        <v-col
                          cols="5"
                          class="d-flex align-center justify-center cursor-pointer"
                          @click="setActiveCard('Standing')"
                          :class="
                            activeGuest === 'Standing' ? 'bg-primary' : ''
                          "
                        >
                          <v-icon>mdi-human-male</v-icon><span>Standing</span>
                        </v-col>
                        <v-divider vertical thickness="2"></v-divider>
                        <v-col
                          cols="5"
                          class="d-flex align-center justify-center cursor-pointer"
                          @click="setActiveCard('Seating')"
                          :class="
                            activeGuest !== '' && activeGuest !== 'Standing'
                              ? 'bg-primary'
                              : ''
                          "
                        >
                          <v-icon>mdi-seat</v-icon
                          ><span class="ml-1">{{
                            activeGuest === "Standing" || activeGuest === ""
                              ? "Seating"
                              : activeGuest
                          }}</span>
                        </v-col>
                        <v-divider vertical thickness="2"></v-divider>
                        <v-col
                          cols="1"
                          class="d-flex align-center justify-center"
                        >
                          <v-icon
                            class="ml-5 cursor-pointer"
                            @click="showGuestFilter = !showGuestFilter"
                            >mdi-menu-down</v-icon
                          >
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col cols="12" v-if="showGuestFilter">
                    <v-list>
                      <v-radio-group hide-details v-model="activeGuest">
                        <v-list-item
                          v-for="(item, index) in guestFilter.filter(
                            (layout) => layout.name !== 'Standing'
                          )"
                          :key="index"
                        >
                          <v-list-item-title
                            class="d-flex flex-row justify-space-around"
                          >
                            <v-row no-gutters>
                              <v-col
                                cols="12"
                                @click="setActiveCard(item.name)"
                                class="cursor-pointer"
                              >
                                <v-row no-gutters>
                                  <v-col cols="2" class="mt-2">
                                    <v-radio :value="item.name"></v-radio>
                                  </v-col>
                                  <v-col cols="8" class="mt-4">{{
                                    item.name
                                  }}</v-col>
                                  <v-col cols="2"
                                    ><v-img
                                      class="ml-1"
                                      :src="item.svgSource"
                                      max-width="60"
                                      height="60"
                                      contain
                                      alt="guest icon"
                                    ></v-img
                                  ></v-col>
                                </v-row>
                              </v-col>
                            </v-row>
                          </v-list-item-title>
                        </v-list-item>
                      </v-radio-group>
                    </v-list>
                  </v-col>
                  <v-col cols="6" v-if="!showGuestFilter">
                    <v-btn
                      variant="text"
                      class="text-primary font-400"
                      @click="clearFilter('guest')"
                      >Clear</v-btn
                    >
                  </v-col>
                  <v-col
                    cols="6"
                    v-if="!showGuestFilter"
                    class="d-flex justify-end"
                  >
                    <v-btn class="bg-primary" @click="isGuestMenuOpen = false"
                      >Show {{ venues.length }}
                      {{ venues.length > 1 ? "results" : "result" }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-row>
        </v-col>

        <v-col cols="2" class="d-none d-md-inline">
          <v-row class="pt-3 px-1" justify="space-between">
            <v-menu :close-on-content-click="false" v-model="isDateMenuOpen">
              <template v-slot:activator="{ props }">
                <v-btn
                  block
                  class="custom-outline custom-date-btn"
                  variant="outlined"
                  height="40px"
                  v-bind="props"
                  rounded="lg"
                >
                  <v-row no-gutters justify="space-between">
                    <span class="font-400">
                      {{ formattedButtonDate }}
                    </span>
                    <v-img
                      src="/public/svg/calendar.svg"
                      height="18px"
                      width="30px"
                      alt="date icon"
                    ></v-img>
                  </v-row>
                </v-btn>
              </template>
              <v-card
                width="650"
                height="370"
                class="d-flex justify-center"
                variant="text"
              >
                <v-row no-gutters>
                  <v-col cols="6" style="height: 250px">
                    <v-date-picker
                      :min="new Date().toISOString().substring(0, 10)"
                      :hide-header="true"
                      v-model="date_calendar"
                      no-title
                      scrollable
                      @update:model-value="handelUpdateDate"
                    >
                    </v-date-picker>
                  </v-col>
                  <v-col cols="6" height="100%">
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-5 d-flex justify-center"
                        ><span class="font-400 weight-bold">{{
                          date_calendar !== null
                            ? formattedDate
                            : "Select date and time"
                        }}</span>
                      </v-col>
                      <v-col cols="12" class="pa-5">
                        <v-select
                          v-model="filterDateFrom"
                          label="From"
                          prepend-inner-icon="mdi-clock-outline"
                          :items="timeOptionFrom"
                        ></v-select>
                        <v-select
                          v-model="filterDateTo"
                          label="To"
                          prepend-inner-icon="mdi-clock-outline"
                          :items="
                            filterDateFrom ? filteredTimeOptions : timeOptionTo
                          "
                          :disabled="filterDateFrom === null"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6" class="mt-15 d-flex justify-start px-2">
                    <v-btn
                      variant="text"
                      class="text-primary font-400"
                      @click="clearFilter('date')"
                      >Clear</v-btn
                    >
                  </v-col>
                  <v-col cols="6" class="mt-15 d-flex justify-end px-5">
                    <v-btn class="bg-primary" @click="isDateMenuOpen = false"
                      >Show {{ venues.length }}
                      {{ venues.length > 1 ? "results" : "result" }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-row>
        </v-col>

        <v-col cols="2" class="d-none d-md-inline">
          <v-row class="pt-3 px-1" justify="center">
            <v-menu
              :close-on-content-click="false"
              v-model="isPriceMenuOpen"
              class="font-400"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="custom-outline font-400"
                  block
                  variant="outlined"
                  height="40px"
                  v-bind="props"
                  append-icon="mdi-menu-down"
                  rounded="lg"
                  ><span class="font-400">{{
                    `${currencySymbol}${priceValue[0]}-${currencySymbol}${priceValue[1]}`
                  }}</span></v-btn
                >
              </template>
              <v-card width="400" height="280">
                <v-row no-gutters>
                  <v-col cols="6" class="pa-5 mt-2 pr-0">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <span class="font-400">Min Price</span>
                      </v-col>
                      <v-col cols="11">
                        <v-card
                          variant="outlined"
                          height="33"
                          class="d-flex justify-center"
                        >
                          <v-row no-gutters height="200">
                            <v-col cols="3" class="d-flex justify-center mt-2">
                              <span>{{ `${currencySymbol}` }}</span>
                            </v-col>
                            <v-divider vertical></v-divider>
                            <v-col cols="8" class="ml-1">
                              <v-text-field
                                type="number"
                                min="0"
                                placeholder="0"
                                variant="plain"
                                @update:model-value="
                                  handleUpdatePriceValueIndexZero
                                "
                                v-model="priceValue[0]"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                      <v-col cols="1" class="d-flex justify-center mt-1"
                        ><span>-</span></v-col
                      >
                    </v-row>
                  </v-col>
                  <v-col cols="6" class="pa-5 mt-2 pl-0">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <span>Max Price</span>
                      </v-col>
                      <v-col cols="12">
                        <v-card
                          variant="outlined"
                          height="33"
                          class="d-flex justify-center"
                        >
                          <v-row no-gutters height="200">
                            <v-col cols="3" class="d-flex justify-center mt-2">
                              <span>{{ `${currencySymbol}` }}</span>
                            </v-col>
                            <v-divider vertical></v-divider>
                            <v-col cols="8" class="ml-1">
                              <v-text-field
                                type="number"
                                min="0"
                                max="10000"
                                placeholder="1000+"
                                variant="plain"
                                @update:model-value="
                                  handleUpdatePriceValueIndexOne
                                "
                                v-model="priceValue[1]"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" class="pa-5">
                    <v-range-slider
                      @update:model-value="handleUpdatePriceValue"
                      strict
                      v-model="priceValue"
                      step="10"
                      :max="10000"
                      :min="0"
                    ></v-range-slider>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col cols="6" class="mt-5 d-flex justify-start px-2">
                    <v-btn
                      variant="text"
                      class="text-primary"
                      @click="clearFilter('price')"
                      >Clear</v-btn
                    >
                  </v-col>
                  <v-col cols="6" class="mt-5 d-flex justify-end px-5">
                    <v-btn class="bg-primary" @click="isPriceMenuOpen = false"
                      >Show {{ venues.length }}
                      {{ venues.length > 1 ? "results" : "result" }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row class="pt-3 pl-1" justify="center">
            <v-btn
              class="custom-outline"
              block
              height="40px"
              variant="outlined"
              append-icon="mdi-tune"
              @click="showMoreFilterDialog = true"
              rounded="lg"
              ><span class="d-none d-md-inline font-400">Filters</span></v-btn
            >
          </v-row>
        </v-col>
        <!-- <v-divider class="mt-4"/> -->
      </v-row>
    </template>
  </v-app-bar>

  <DialogMoreFilterNew
    @close-dialog="showMoreFilterDialog = false"
    @searchVenues="searchVenues"
    @update:selectedKeys="updateSelectedKeys"
    @update:updateObjectFilter="updateObjectFilter"
    v-model="showMoreFilterDialog"
    :selectedKeysRepresentation="selectedKeysRepresentation"
    v-model:numGuest="numGuest"
    v-model:date_calendar="date_calendar"
    v-model:activeGuest="activeGuest"
    v-model:filterDateFrom="filterDateFrom"
    v-model:filterDateTo="filterDateTo"
    v-model:priceValue="priceValue"
  />

  <v-main class="hide-scrollbars">
    <v-row no-gutters class="px-2 pr-6 pt-5">
      <v-col cols="12" class="left">
        <v-row v-if="loader" no-gutters class="w-100">
          <v-col
            cols="12"
            sm="12"
            md="7"
            lg="7"
            class="d-flex flex-wrap justify-center justify-md-start ga-2"
          >
            <template v-for="item in 8" :key="item">
              <v-skeleton-loader
                class="ma-6"
                width="300"
                type="card, paragraph"
              ></v-skeleton-loader>
            </template>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col
            cols="12"
            sm="12"
            md="7"
            lg="7"
            class="left"
            v-if="
              (smAndDown &&
                showingMethod == 'List' &&
                showingMethod != 'Map') ||
              !smAndDown
            "
          >
            <v-row class="pl-6 font-400 pt-4 pb-3" v-if="venues.length > 0">
              <span class="font-600">
                {{
                  `${venues.length} ${venues.length > 1 ? "results" : "result"} for ${eventType} ${
                    venues.length > 1 ? "Venues" : "Venue"
                  }`
                }}
              </span>
            </v-row>

            <div class="scrollable-content">
              <v-row class="pl-4">
                <v-col cols="12" v-if="venues.length === 0">
                  <CardEmptyState :showButton="false" :search="true" />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="6"
                  lg="4"
                  xl="3"
                  v-for="(venue, index) in venues"
                  :key="index"
                >
                  <CardSpotlightCard
                    :space="venue"
                    :imageSrc="imageSrc"
                    :numGuest="numGuest"
                    :date_calendar="date_calendar"
                    :event_type="eventType"
                    :navigateTo="navigateTo"
                    :country="country"
                    :favoriteCount="favoriteCount"
                    @folderCreated="folderCreated"
                    :favoriteObj="favoriteObj"
                    :priceFilter="priceValue"
                    @deselectFavorite="deselectFavorite"
                  />
                </v-col>
              </v-row>
            </div>

            <v-col cols="12" :class="smAndDown ? 'mb-16' : 'fixed-pagination'">
              <v-pagination
                v-if="venues.length > 0 && totalPages > 1"
                v-model="page"
                :length="totalPages"
              ></v-pagination>
              <p :class="smAndDown ? 'mb-16' : ''"></p>
            </v-col>
          </v-col>

          <!-- Maps -->
          <v-col
            cols="12"
            sm="12"
            md="5"
            lg="5"
            class="right pa-0 ma-0"
            v-if="
              (smAndDown &&
                showingMethod == 'Map' &&
                showingMethod != 'List') ||
              !smAndDown
            "
          >
            <MapGoogleMap
              :country="venueLocation"
              :coordinates="coordinates"
              :showDetails="true"
              :selectedSpace="selectedSpace"
              @marker-selected="showMarkerDetails"
              :mobile="false"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-row>
        <v-snackbar
          style="z-index: 1200"
          @click.stop="changeShowMethod()"
          rounded="pill"
          :timeout="-1"
          min-width="100px"
          v-model="snackbar"
          class="hidden-md-and-up mb-4"
        >
          <v-row>
            <v-col v-if="showingMethod == 'List'" class="d-flex mr-2">
              <v-img
                src="/public/svg/map.svg"
                height="20px"
                width="20px"
                alt="map icon"
              ></v-img>
              <span class="text-14px">Map</span>
            </v-col>

            <v-col v-if="showingMethod == 'Map'" class="d-flex mr-2">
              <v-img
                src="/public/svg/list.svg"
                height="20px"
                width="20px"
                alt="list icon"
              ></v-img>
              <span class="text-14px">List</span>
            </v-col>
          </v-row>
        </v-snackbar>
      </v-row>

      <!-- <v-col> -->
      <v-dialog
        style="z-index: 1199"
        v-model="mobileMap"
        fullscreen
        width="100%"
        height="100%"
      >
        <MapGoogleMap
          :country="venueLocation"
          :coordinates="coordinates"
          :showDetails="true"
          :mobile="true"
          @closeMap="mobileMap = false"
        />
      </v-dialog>
      <!-- </v-col> -->
    </v-row>
  </v-main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "bare",
});
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
import { useRoute, useRouter } from "vue-router";
const {
  timeOptionFrom,
  searchVenues,
  updateSelectedKeys,
  updateObjectFilter,
  selectedKeysRepresentation,
  timeOptionTo,
  guestFilter,
  registeredCountries,
  showGuestFilter,
  priceValue,
  showMoreFilterDialog,
  isGuestMenuOpen,
  isDateMenuOpen,
  isPriceMenuOpen,
  activeGuest,
  date_calendar,
  filterDateFrom,
  filterDateTo,
  venues,
  numGuest,
  eventType,
  venueLocation,
  clearFilter,
  setActiveCard,
  guestModel,
  filteredTimeOptions,
  formattedDate,
  formattedButtonDate,
  tagsItems,
  loadInitialData,
  debouncedSearchVenues,
  snackbar,
  showingMethod,
  // country,
  favoriteCount,
  favoriteObj,
  mobileMap,
  loader,
  page,
  totalPages,
  coordinates,
  imageSrc,
  navigateTo,
  changeShowMethod,
  folderCreated,
  deselectFavorite,
} = useVenueSearch();

const { loggedIn, currentUser, logout } = useLocalAuth();
const { country, loadCountries, getCurrencySymbol, currentCurrency } =
  useLocal();
const baseUrl = "country";

// State to track if the menu is open or closed
const menuOpen = ref(false);

const isAdmin = currentUser.value.role == "ADMIN";
const isUser = currentUser.value.role == "USER";
const isVenueOwner = currentUser.value.role == "VENUE_OWNER";
const isVenueLister = currentUser.value.role == "VENUE_LISTER";

const navigation = computed(() => {
  const items = [];

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: isAdmin ? "Inquiries" : "My Inquiries",
      icon: "mdi-message-text-outline",
      to: `${baseUrl}-enquiries`,
      params: { country },
    });
  }

  if (isUser) {
    items.push({
      title: "My Inquiries",
      icon: "mdi-message-text-outline",
      to: `${baseUrl}-enquiries`,
      params: { country },
    });
  }

  if (isUser) {
    items.push({
      title: "Favorites",
      icon: "mdi-heart-outline",
      to: `${baseUrl}-favorites`,
      params: { country },
    });
  }

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: "Availability",
      icon: "mdi-calendar-today-outline",
      to: `${baseUrl}-availability`,
      params: { country },
    });
  }

  // if (isAdmin || isVenueOwner || isVenueLister) {
  //   items.push({
  //     title: "Team Members",
  //     icon: "mdi-account-group-outline",
  //     to: `${baseUrl}-team-members`,
  //     params: { country },
  //   });
  // }

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: "My Venues",
      icon: "mdi-home-outline",
      to: `${baseUrl}-venues-management`,
      params: { country },
    });
  }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Insights",
  //     icon: "mdi-poll",
  //     to: `${baseUrl}-insights`,
  //     params: { country },
  //   });
  // }

  // if (isAdmin) {
  //   items.push({
  //     title: "Countries",
  //     icon: "mdi-earth-plus",
  //     to: "settings-country",
  //   });
  // }

  return items;
});

// const name = computed(() => {
//   return currentUser.value.first_name && currentUser.value.last_name
//     ? `${currentUser.value.first_name} ${currentUser.value.last_name}`
//     : "Unknown";
// });

const loginItems = [
  {
    title: "List your venue",
    to: `/${country}/signup/venue`,
  },
  {
    title: "Signup",
    to: `/${country}/signup`,
  },
  {
    title: "Login",
    to: `/${country}/login`,
  },
];
const route = useRoute();
const router = useRouter();

const handleUpdateLocation = (newLocation: string) => {
  router.push({
    name: "country-venues-search",
    params: { country: newLocation.toLowerCase() },
    query: {
      ...route.query,
      location: newLocation,
    },
  });
};

const handleUpdateEventType = (newEventType: string) => {
  router.push({
    query: {
      ...route.query,
      categories: newEventType,
    },
  });
  searchVenues();
};

const handleUpdateGuest = async (newGuestModel: number) => {
  await router.push({
    query: {
      ...route.query,
      total_guest: newGuestModel,
    },
  });
  debouncedSearchVenues();
};

const handelUpdateDate = (newValue: string) => {
  const date = new Date(newValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0"); // Get the day of the month
  const formattedDateEdited = `${year}-${month}-${day}`;
  router.push({
    query: {
      ...route.query,
      date: formattedDateEdited,
    },
  });
  searchVenues();
};
// const handleUpdatePriceValue = (newValue: string) => {
//   loader.value = true;
//   setTimeout(() => {
//     debouncedSearchVenues();
//   }, 1000);
// };

// const handleUpdatePriceValueIndexZero = (newValue: string) => {
//   setTimeout(() => {
//     debouncedSearchVenues();
//   }, 1000);
// };

// const handleUpdatePriceValueIndexOne = (newValue: string) => {
//   setTimeout(() => {
//     debouncedSearchVenues();
//   }, 1000);
// };

const currencySymbol = computed(() => {
  const currency = currentCurrency(country.toUpperCase());
  return currency?.symbol;
});

function preventNegative(event) {
  if (event.key === "-" || event.key === "e") {
    event.preventDefault();
  }
}

interface MappedCoordinate {
  id: string;
  lat: number;
  lng: number;
  title: string;
  photo: string;
  location: string;
  rating: number;
  price: number;
  duration: string;
  currency: string;
}

const dialogVisible = ref(false);
const selectedMarker = ref<MappedCoordinate | null>(null);

const showMarkerDetails = (marker: MappedCoordinate) => {
  selectedMarker.value = marker;
  dialogVisible.value = true;
};

const selectedSpace = computed(() => {
  const obj = venues.value.find(
    (venue) => venue._id === selectedMarker.value?.id
  );
  return obj || null;
});
</script>

<style scoped>
.hidden-md-and-up {
  @media (min-width: 960px) {
    display: none !important;
  }
}

.left {
  display: inline-block;
  vertical-align: top;
  float: left;
  max-height: 100vh;
}

.right {
  position: fixed;
  right: 0;
  top: 8rem;
  height: calc(100vh - 8rem);
  overflow-x: hidden;
}

.fixed-pagination {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 10;
}

.custom-outline {
  border-color: rgba(0, 0, 0, 0.35);
}
</style>
