<template>
    <v-dialog v-model="showDialog" max-width="500">
        <v-card elevation="3" rounded="lg" color="white" min-height="300px" class="text-secondary font-500 text-16px">
            <v-row no-gutters class="w-100" style="position: relative;">
        
                <v-col cols="12" class="pa-5" align="center" style="position: relative;">Filters <v-btn icon="mdi-close" @click="showDialog = false" size="20" flat style="position: absolute; right: 5%;"></v-btn></v-col>
                <v-divider class="my-2"></v-divider>
                <v-row no-gutters class="w-100 pa-5 d-flex flex-column ga-4">
                    <v-row no-gutters class="w-100">
                        <v-col cols="12" class="w-100 pb-1">Event Type</v-col>
                        <v-col cols=12 class="w-100">
                            <v-autocomplete v-model="filter.event_type" hide-details density="comfortable"
                                variant="outlined" :items="tagsItems" placeholder="Any event" rounded="lg" />
                        </v-col>
                    </v-row>
                    <v-row no-gutters class="w-100">
                        <v-col cols="12" class="w-100 pb-1">Guests</v-col>
                        <v-col cols=12 class="w-100">
                            <v-text-field v-model="filter.guests" type="number" min="1" hide-details density="comfortable" variant="outlined"
                                :items="tagsItems" placeholder="No. of Guests"
                                append-inner-icon="mdi-account-multiple-outline" rounded="lg" />
                        </v-col>
                    </v-row>
                    <v-row no-gutters class="w-100">
                        <v-col cols="12" class="w-100 pb-1">Date</v-col>
                        <v-col cols=12 class="w-100">
                            <v-menu
                            v-model="dateInput"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                          >
                            <template #activator="{ props }">
                              <v-text-field
                                dense
                                v-model="formattedDate"
                                readonly
                                persistent-hint
                                rounded="lg"
                                v-bind="props"
                                placeholder="Select Date"
                                append-inner-icon="mdi-calendar-badge"
                                variant="outlined"
                                density="comfortable"
                                hide-details
                              >
                              </v-text-field>
                            </template>
                            <v-date-picker
                              v-model="date_calendar"
                              @input="dateInput = false"
                              show-adjacent-months
                              elevation="24"
                              no-time
                              @update:model-value="handleDateChange"
                              placeholder="Select a date"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                    </v-row>
                </v-row>
                <v-divider class="my-2"></v-divider>
                <v-row no-gutters class="pa-5">
                    <v-col>
                        <v-btn variant="text" rounded="lg" class="text-16px font-500" @click="handleClear">Clear</v-btn>
                    </v-col>
                    <v-col align="end">
                        <v-btn variant="flat" color="secondary" rounded="lg" size="large"
                            class="text-16px font-500" @click="handleApplyFilter">Apply Filter</v-btn>
                    </v-col>

                </v-row>
            </v-row>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const { tags } = useVenueData();

const showDialog = defineModel<boolean>("show", { default: false, required: true });
const eventType = defineModel<string | null>("eventType", { default: null, required: true});
const date = defineModel< string | null>("date", { default: null, required: true});
const guests = defineModel< number | null>("guests", { default: null, required: true});

const filter = reactive({
    event_type: null as string | null,
    guests: null as number | null,
    date: null as string | null,
})

const date_calendar = ref(null);
const dateInput = ref(false);


const emit = defineEmits(['advance-filter'])

const tagsItems = computed(() => {
    const flattenedKeywords = Object.values(tags).flatMap((category) =>
        category.flatMap((item) => item.keywords),
    );

    const sortedKeywords = flattenedKeywords
        .slice()
        .sort((a, b) => a.localeCompare(b));
    return sortedKeywords;
});

const handleClear = () => {
    filter.date = null;
    filter.guests = null;
    filter.event_type = null;
    date_calendar.value  = null;
}

const handleApplyFilter = () => {
    date.value = filter.date;
    eventType.value = filter.event_type;
    guests.value = filter.guests;
    emit('advance-filter')
    showDialog.value = false;
}

// calendar
const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const handleDateChange = () => {
    filter.date = formattedDate.value
    dateInput.value = false
}

onMounted(() => {
    filter.date = date.value
    filter.guests = guests.value
    filter.event_type = eventType.value
})
</script>

<style scoped></style>