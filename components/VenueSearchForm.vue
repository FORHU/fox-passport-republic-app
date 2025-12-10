<template>
  <v-form ref="formValid">
    <v-card color="white" class="rounded-lg pa-5" max-width="100%">
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
                item-title="name" 
                item-value="name"
                @keydown.enter="forceNavigate" 
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
                <v-menu v-model="checkInDateMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y min-width="290px">
                  <template #activator="{ props }">
                    <v-text-field v-model="formattedCheckInDate" readonly persistent-hint v-bind="props"
                      density="compact" persistent-placeholder placeholder="DD/MM/YYYY" variant="plain"
                      append-icon="mdi-calendar" @keydown.enter="forceNavigate"
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
                      variant="plain" append-icon="mdi-calendar" @keydown.enter="forceNavigate"
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
                    @keydown.enter="forceNavigate"
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
                            <v-btn icon="mdi-minus" size="x-small" variant="outlined" color="grey" class="rounded-circle"
                              @click.stop="decrementItem(item)" :disabled="item.count <= 0" elevation="0" style="width: 32px; height: 32px;"></v-btn>
                            <span class="mx-3 font-weight-bold text-body-1 text-high-emphasis" style="min-width: 24px; text-align: center;">
                              {{ item.count }}
                            </span>
                            <v-btn icon="mdi-plus" size="x-small" variant="outlined" color="primary" class="rounded-circle"
                              @click.stop="incrementItem(item)" elevation="0" style="width: 32px; height: 32px;"></v-btn>
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
            type="button" 
            block 
            color="primary" 
            elevation="0" 
            style="height: 60px"
            class="text-h5 font-weight-bold rounded-lg" 
            @click="forceNavigate"
          >
            search
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import philippineMunicipalities from "~/data/philippine-municipalities.json";

// 1. Get the Router instance directly
const router = useRouter(); 
const { xs, mdAndUp } = useDisplay();

// --- DATA SETUP ---
const location = ref(null);
const municipalities = ref(philippineMunicipalities);

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

const formattedCheckInDate = computed(() => {
  if (!checkInDate.value) return "";
  const date = new Date(checkInDate.value);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
});

const formattedCheckOutDate = computed(() => {
  if (!checkOutDate.value) return "";
  const date = new Date(checkOutDate.value);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
});

const formattedDateToQuery = () => {
  if (!checkInDate.value) return null;
  const date = new Date(checkInDate.value);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

// --- GUEST LOGIC ---
interface GuestItem { title: string; type: 'header' | 'item'; count?: number; }
const guestMenu = ref(false);
const guestList = ref<GuestItem[]>([
  { title: 'Immediate Family', type: 'header' },
  { title: 'Parents of the Bride', type: 'item', count: 0 },
  { title: 'Parents of the Groom', type: 'item', count: 0 },
  { title: 'Siblings & In-Laws', type: 'item', count: 0 },
  { title: 'Grandparents', type: 'item', count: 0 },
  { title: 'Children of the Couple', type: 'item', count: 0 },
  { title: 'Extended Family', type: 'header' },
  { title: 'Aunts & Uncles', type: 'item', count: 0 },
  { title: 'Cousins', type: 'item', count: 0 },
  { title: 'Nieces & Nephews', type: 'item', count: 0 },
  { title: 'Social Circles', type: 'header' },
  { title: 'Childhood Friends', type: 'item', count: 0 },
  { title: 'High School / College Friends', type: 'item', count: 0 },
  { title: 'Work Colleagues', type: 'item', count: 0 },
  { title: 'Neighbors', type: 'item', count: 0 },
  { title: 'Parents\' Friends', type: 'item', count: 0 },
  { title: 'Others', type: 'header' },
  { title: 'Plus Ones', type: 'item', count: 0 },
  { title: 'Vendors', type: 'item', count: 0 },
  { title: 'The Bridal Party', type: 'header' },
  { title: 'Maid of Honor', type: 'item', count: 0 },
  { title: 'Best Man', type: 'item', count: 0 },
  { title: 'Bridesmaids', type: 'item', count: 0 },
  { title: 'Groomsmen', type: 'item', count: 0 },
  { title: 'Principal Sponsors', type: 'header' },
  { title: 'Godparents', type: 'item', count: 0 },
]);

const incrementItem = (item: GuestItem) => { if (item.count !== undefined) item.count++; };
const decrementItem = (item: GuestItem) => { if (item.count !== undefined && item.count > 0) item.count--; };
const resetCounts = () => { guestList.value.forEach(item => { if (item.count !== undefined) item.count = 0; }); };
const totalGuestCount = computed(() => guestList.value.reduce((sum, item) => sum + (item.count || 0), 0));
const displayTotalSummary = computed(() => {
  const count = totalGuestCount.value;
  return count === 0 ? "" : `${count} Guest${count > 1 ? 's' : ''}`;
});

// --- FORCE NAVIGATION FUNCTION ---
const forceNavigate = () => {
  console.log("🚀 Button Clicked: Starting force navigation sequence...");

  const activeGuests = guestList.value.filter(g => g.count && g.count > 0);
  const locationQuery = location.value || "Anywhere";
  const dateQuery = formattedDateToQuery() || new Date().toISOString().split('T')[0];

  const queryParams = {
    location: locationQuery, 
    date: dateQuery,
    total_guest: totalGuestCount.value,
    guest_breakdown: JSON.stringify(activeGuests),
  };

  try {
    // METHOD 1: Construct the URL manually string
    const queryString = new URLSearchParams(queryParams as any).toString();
    const targetUrl = `/confirm-details?${queryString}`;
    
    // METHOD 2: The "Nuclear" Option (Browser Hard Redirect)
    console.log("Force navigating to:", targetUrl);
    window.location.href = targetUrl;
    
  } catch (err) {
    console.error("Navigation failed entirely:", err);
    alert("Navigation failed. Check console.");
  }
};
</script>

<style scoped>
.v-autocomplete :deep(.v-field__append-inner .v-icon) {
  transform: rotate(0) !important;
}
</style>