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
                              <p class="text-14px font-600">EVENT TYPE</p>
                              <v-autocomplete density="compact" persistent-placeholder placeholder="Any Event"
                                variant="plain" :items="tagsItems" v-model="eventType" :rules="eventTypeRules" required
                                @keydown.enter="onSubmit"/>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col cols="12" sm="6" md="3" lg="3" xl="2" class="pb-0">
                          <v-row no-gutters>
                            <v-col cols="11">
                              <p class="text-14px font-600">WHERE</p>
                              <v-autocomplete density="compact" persistent-placeholder placeholder="Anywhere"
                                variant="plain" menu-icon="mdi-map-marker-outline" :items="registeredCountries" v-model="location"
                                :rules="countryRules" required item-title="country_name" item-value="cca2"
                                 @keydown.enter="onSubmit"
                                @update:model-value="handleChangeCountry" @click:append-inner="" :active="true"/>
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
                              <p class="text-14px font-600">WHEN</p>
                              <div class="d-flex">
                                <v-menu v-model="dateInput" :close-on-content-click="false" :nudge-right="40"
                                  transition="scale-transition" offset-y min-width="290px">
                                  <template #activator="{ props }">
                                    <v-text-field v-model="formattedDate" readonly persistent-hint v-bind="props"
                                      density="compact" persistent-placeholder placeholder="DD/MM/YYYY" variant="plain"
                                      append-icon="mdi-calendar" @keydown.enter="onSubmit" @click:append-inner="dateInput = true">
                                    </v-text-field>
                                  </template>
                                  <v-date-picker v-model="date_calendar" @input="dateInput = false" no-title
                                    show-adjacent-months scrollable :min="new Date().toISOString().substring(0, 10)
                                      ">
                                    <template #title>
                                      <p>Select a Date</p>
                                    </template>

                                    <template #header>
                                      <p class="ml-5" style="font-size: 30px">
                                        Enter Date
                                      </p>
                                    </template>
                                    <template #actions>
                                      <v-btn color="primary" @click="dateInput = false">OK</v-btn>
                                    </template>
                                  </v-date-picker>
                                </v-menu>
                              </div>
                            </v-col>
                            <v-col class="py-1 pb-5 d-flex justify-center align-end" v-if="!xs">
                              <v-divider vertical thickness="2"></v-divider>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-divider v-if="xs"></v-divider>
                        <v-col cols="12" sm="6" md="2" lg="2" xl="2" class="pb-0">
                          <p class="text-14px font-600">GUESTS</p>
                          <v-text-field density="compact" persistent-placeholder placeholder="Number of Guests"
                            type="number" variant="plain" min="0" step="5" v-model="numberOfGuests"
                            @keydown.enter="onSubmit" @keydown="preventNegative"/>
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

definePageMeta({
  layout: "landing",
});

const { xs, smAndDown, mdAndDown, mdAndUp } = useDisplay();
const { tags } = useVenueData();
const { loadCountries, registeredCountries, getDefaultCountryImage, defaultCountryImage, country } = useLocal();
const { venueLocation: location, eventType, date_calendar, numGuest: numberOfGuests } = useVenueSearch();

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

function handleChangeCountry(countryCode: string) {
  if (!countryCode) return;
  navigateTo({ name: 'country', params: { country: countryCode.toLocaleLowerCase() } })
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

const eventTypeRules = [
  (value: string) => !!value || "Please enter an event type",
];

const countryRules = [(value: string) => !!value || "Please enter a country"];

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
  if (!numberOfGuests.value || isNaN(numberOfGuests.value)) {
    numberOfGuests.value = 0;
  }
  navigateTo({
    name: "country-venues-search",
    params: { country: location.value.toLowerCase() },
    query: {
      location: location.value,
      date: formattedDateToQuery(),
      total_guest: numberOfGuests.value,
      categories: eventType.value,
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

const formattedDateToQuery = () => {
  if (!date_calendar.value) return null;
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};



const tagsItems = computed(() => {
  const flattenedKeywords = Object.values(tags).flatMap((category) =>
    category.flatMap((item) => item.keywords)
  );

  const sortedKeywords = flattenedKeywords
    .slice()
    .sort((a, b) => a.localeCompare(b));

  return sortedKeywords;
});

// set pre-selected country based on url
const setCurrentCountry = () => {
  if (!country) return;

  const isCountryListed = registeredCountries.value.find(x => x.cca2?.toUpperCase() == country?.toUpperCase())
  if (isCountryListed) {
    location.value = country?.toUpperCase();
  }


}

onBeforeMount(async () => {
  await loadCountries();
  await getDefaultCountryImage()
  setCurrentCountry()
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
