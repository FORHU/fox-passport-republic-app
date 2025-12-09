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
                                variant="plain" menu-icon="mdi-map-marker-outline" :items="municipalities"
                                v-model="location" :rules="locationRules" required item-title="name" item-value="name"
                                @keydown.enter="onSubmit" @click:append-inner="" :active="true" />
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
                                      append-icon="mdi-calendar" @keydown.enter="onSubmit"
                                      @click:append-inner="checkInDateMenu = true" style="flex: 1;">
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
                                  persistent-placeholder placeholder="Time" style="flex: 0.8; max-width: 120px; min-width: 100px;">
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
                                    <v-text-field v-model="formattedCheckOutDate" readonly persistent-hint
                                      v-bind="props" density="compact" persistent-placeholder placeholder="DD/MM/YYYY"
                                      variant="plain" append-icon="mdi-calendar" @keydown.enter="onSubmit"
                                      @click:append-inner="checkOutDateMenu = true" style="flex: 1;">
                                    </v-text-field>
                                  </template>
                                  <v-date-picker v-model="checkOutDate" @input="checkOutDateMenu = false" no-title
                                    show-adjacent-months scrollable
                                    :min="checkInDate || new Date().toISOString().substring(0, 10)">
                                    <template #actions>
                                      <v-btn color="primary" @click="checkOutDateMenu = false">OK</v-btn>
                                    </template>
                                  </v-date-picker>
                                </v-menu>

                                <v-select density="compact" variant="plain" :items="timeOptions" v-model="checkOutTime"
                                  persistent-placeholder placeholder="Time" style="flex: 0.8; max-width: 120px; min-width: 100px;">
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
                                    @keydown.enter="onSubmit"
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

                                      <v-list-item 
                                        v-else
                                        class="px-4 py-3"
                                        :ripple="false"
                                      >
                                        <div class="d-flex align-center justify-space-between w-100">
                                          <div class="text-body-2 mr-4 text-high-emphasis font-weight-medium" style="flex: 1; white-space: normal; line-height: 1.3;">
                                            {{ item.title }}
                                          </div>

                                          <div class="d-flex align-center flex-shrink-0">
                                            <v-btn
                                              icon="mdi-minus"
                                              size="x-small"
                                              variant="outlined"
                                              color="grey"
                                              class="rounded-circle"
                                              @click.stop="decrementItem(item)"
                                              :disabled="item.count <= 0"
                                              elevation="0"
                                              style="width: 32px; height: 32px;"
                                            ></v-btn>
                                            
                                            <span class="mx-3 font-weight-bold text-body-1 text-high-emphasis" style="min-width: 24px; text-align: center;">
                                              {{ item.count }}
                                            </span>

                                            <v-btn
                                              icon="mdi-plus"
                                              size="x-small"
                                              variant="outlined"
                                              color="primary"
                                              class="rounded-circle"
                                              @click.stop="incrementItem(item)"
                                              elevation="0"
                                              style="width: 32px; height: 32px;"
                                            ></v-btn>
                                          </div>
                                        </div>
                                      </v-list-item>

                                      <v-divider v-if="item.type === 'item' && index < guestList.length - 1 && guestList[index+1].type === 'header'"></v-divider>

                                    </template>
                                  </v-list>
                                  
                                  <v-divider></v-divider>
                                  <v-card-actions class="pa-3 bg-grey-lighten-5">
                                    <span class="text-caption text-medium-emphasis ml-2">
                                      Total: <b>{{ totalGuestCount }}</b> Guests
                                    </span>
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
const checkInDateMenu = ref(false);
const checkOutDateMenu = ref(false);

const checkInTime = ref("10:00 AM");
const checkOutTime = ref("11:00 AM");

// Time options generator (AM/PM format)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12; 
  
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
});

// --- GUEST CALCULATOR LOGIC ---

interface GuestItem {
  title: string;
  type: 'header' | 'item';
  count?: number; 
}

const guestMenu = ref(false);

const guestList = ref<GuestItem[]>([
  // 1. By Relationship - Immediate Family
  { title: 'Immediate Family', type: 'header' },
  { title: 'Parents of the Bride', type: 'item', count: 0 },
  { title: 'Parents of the Groom', type: 'item', count: 0 },
  { title: 'Siblings & In-Laws', type: 'item', count: 0 },
  { title: 'Grandparents', type: 'item', count: 0 },
  { title: 'Children of the Couple', type: 'item', count: 0 },

  // Extended Family
  { title: 'Extended Family', type: 'header' },
  { title: 'Aunts & Uncles', type: 'item', count: 0 },
  { title: 'Cousins', type: 'item', count: 0 },
  { title: 'Nieces & Nephews', type: 'item', count: 0 },

  // Social Circles
  { title: 'Social Circles', type: 'header' },
  { title: 'Childhood Friends', type: 'item', count: 0 },
  { title: 'High School / College Friends', type: 'item', count: 0 },
  { title: 'Work Colleagues', type: 'item', count: 0 },
  { title: 'Neighbors / Community Members', type: 'item', count: 0 },
  { title: 'Parents\' Friends', type: 'item', count: 0 },

  // Others
  { title: 'Others', type: 'header' },
  { title: 'Plus Ones / Partners', type: 'item', count: 0 },
  { title: 'Vendors (Photo/Video)', type: 'item', count: 0 },

  // 2. By Wedding Role
  { title: 'The Bridal Party', type: 'header' },
  { title: 'Maid / Matron of Honor', type: 'item', count: 0 },
  { title: 'Best Man', type: 'item', count: 0 },
  { title: 'Bridesmaids', type: 'item', count: 0 },
  { title: 'Groomsmen', type: 'item', count: 0 },

  { title: 'Principal Sponsors (VIPs)', type: 'header' },
  { title: 'Godparents (Ninong/Ninang)', type: 'item', count: 0 },
]);

const incrementItem = (item: GuestItem) => {
  if (item.count !== undefined) item.count++;
};

const decrementItem = (item: GuestItem) => {
  if (item.count !== undefined && item.count > 0) item.count--;
};

const resetCounts = () => {
  guestList.value.forEach(item => {
    if (item.count !== undefined) item.count = 0;
  });
};

const totalGuestCount = computed(() => {
  return guestList.value.reduce((sum, item) => sum + (item.count || 0), 0);
});

const displayTotalSummary = computed(() => {
  const count = totalGuestCount.value;
  if (count === 0) return "";
  return `${count} Guest${count > 1 ? 's' : ''}`;
});

// --- END GUEST CALCULATOR LOGIC ---

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
  navigateTo({
    name: "country-venues-search",
    params: { country: location.value ? location.value.toLowerCase() : 'default' },
    query: {
      location: location.value,
      date: formattedDateToQuery(),
      total_guest: totalGuestCount.value, 
    },
  });
};

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