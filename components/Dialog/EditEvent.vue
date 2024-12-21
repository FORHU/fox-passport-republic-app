<template>
  <!-- <v-dialog v-model="showDialog" max-width="700">
    <v-form @submit.prevent="onSubmit" ref="formValid" style="width: 100%">
      <v-card
        class="pa-5"
        style="overflow: scroll"
        height="100%"
      >
        <v-row no-gutters class="px-3">
          <v-col
            :cols="xs ? '12' : '3'"
            class="mt-2 d-flex justify-center font-weight-bold"
          >
            <span>{{ xs ? "Update Event" : "Update Event - " }}</span>
          </v-col>
          <v-col :cols="xs ? '12' : '4'" class="d-flex flex-row">
            <v-select
              placeholder="Select Venue"
              :items="venueList"
              item-title="name"
              item-value="_id"
              v-model="selectedVenue"
              :rules="venueRules"
            ></v-select>
          </v-col>
          <v-col
            :cols="xs ? '12' : '1'"
            class="d-flex justify-center"
            :class="xs ? 'mb-3' : ''"
          >
            <span class="mt-2">@</span>
          </v-col>
          <v-col :cols="xs ? '12' : '4'">
            <v-select
              placeholder="Select Space"
              :items="spaceList"
              item-title="name"
              item-value="_id"
              v-model="selectedSpace"
              :disabled="selectedVenue === null"
              :rules="spaceRules"
            ></v-select>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row no-gutters class="mt-3 px-4">
          <v-col
            cols="12"
            class="mb-2"
            v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
          >
            <span>
              <span class="text-primary">**</span>
              Old Schedule
            </span>
          </v-col>
          <v-col :cols="xs ? '12' : '3'">
            <span>Date</span>
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
                  v-bind="props"
                  placeholder="Select Date"
                  prepend-inner-icon="mdi-calendar-month"
                  :disabled="event.event_duration === 'BOOKED_PART_OF_DAY'"
                >
                </v-text-field>
              </template>
              <v-date-picker
                v-model="date_calendar"
                @input="dateInput = false"
                show-adjacent-months
                elevation="24"
                no-time
                @update:model-value="dateInput = false"
                :min="new Date().toISOString().substring(0, 10)"
                placeholder="Select a date"
                :allowed-dates="
                  (val) =>
                    getAllowedDates(
                      val,
                      event.event_duration === 'BOOKED_PART_OF_DAY'
                        ? true
                        : false
                    )
                "
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            :cols="xs ? '12' : '4'"
            :class="xs ? '' : 'mx-3'"
            v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
          >
            <span>From</span>
            <v-select
              v-model="updateStartTime"
              min="0"
              :items="checkAllowedTimeFrom"
              item-title="label"
              item-value="value"
              item-disabled="disabled"
              dense
              persistent-hint
              placeholder="From"
              prepend-inner-icon="mdi-clock-time-one-outline"
              :disabled="true"
            >
            </v-select>
          </v-col>
          <v-col
            :cols="xs ? '12' : '4'"
            v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
          >
            <span>To</span>
            <v-select
              v-model="updateEndTime"
              :items="checkAllowedTimeTo"
              min="0"
              item-title="label"
              item-value="value"
              item-disabled="disabled"
              dense
              persistent-hint
              placeholder="To"
              prepend-inner-icon="mdi-clock-time-ten-outline"
              :disabled="true"
            >
            </v-select>
          </v-col>
          <v-col cols="12" v-if="event.event_duration === 'BOOKED_PART_OF_DAY'">
            <v-row no-gutters>
              <v-col cols="12" class="mb-2">
                <span>
                  <span class="text-red">**</span>
                  New Schedule
                </span>
              </v-col>
              <v-col :cols="xs ? '12' : '3'">
                <span>Date</span>
                <v-menu
                  v-model="scheduleToUpdate.dateInput"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      v-model="formattedDateToUpdate"
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="Select Date"
                      prepend-inner-icon="mdi-calendar-month"
                      :rules="dateRules"
                      :disabled="selectedSpace === null"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="scheduleToUpdate.date"
                    @input="scheduleToUpdate.dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="scheduleToUpdate.dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="
                      (val) =>
                        getAllowedDates(
                          val,
                          event.event_duration === 'BOOKED_PART_OF_DAY'
                            ? true
                            : false
                        )
                    "
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col :cols="xs ? '12' : '4'" :class="xs ? '' : 'mx-3'">
                <span>From</span>
                <v-select
                  v-model="scheduleToUpdate.timeFrom"
                  min="0"
                  :items="checkAllowedTimeFrom"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  placeholder="From"
                  prepend-inner-icon="mdi-clock-time-one-outline"
                  :disabled="scheduleToUpdate.date === null"
                  :rules="
                    event.event_duration === 'BOOKED_PART_OF_DAY'
                      ? startTimeRules
                      : ''
                  "
                >
                </v-select>
              </v-col>
              <v-col :cols="xs ? '12' : '4'">
                <span>To</span>
                <v-select
                  v-model="scheduleToUpdate.timeTo"
                  :items="checkAllowedTimeTo"
                  min="0"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  placeholder="To"
                  prepend-inner-icon="mdi-clock-time-ten-outline"
                  :disabled="scheduleToUpdate.timeFrom === null"
                  :rules="
                    event.event_duration === 'BOOKED_PART_OF_DAY'
                      ? endTimeRules
                      : ''
                  "
                >
                </v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" v-if="xs" class="mr-5">
            <span>First Name</span>
            <v-text-field
              v-model="dynamicModelFirstName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col
            v-else
            :cols="event.event_duration !== 'BOOKED_PART_OF_DAY' ? '4' : '5'"
            class="mr-5"
            :class="event.event_duration !== 'BOOKED_PART_OF_DAY' ? 'ml-5' : ''"
          >
            <span>First Name</span>
            <v-text-field
              v-model="dynamicModelFirstName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col cols="12" v-if="xs">
            <span>Last Name</span>
            <v-text-field
              v-model="dynamicModelLastName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col
            v-else
            :cols="event.event_duration !== 'BOOKED_PART_OF_DAY' ? '4' : '6'"
          >
            <span>Last Name</span>
            <v-text-field
              v-model="dynamicModelLastName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col
            :cols="xs ? '12' : '7'"
            :class="
              event.event_duration !== 'BOOKED_PART_OF_DAY' ? 'mr-10' : 'mr-5'
            "
          >
            <span>Email</span>
            <v-text-field
              v-model="dynamicModelEmail"
              prepend-inner-icon="mdi-email-outline"
            ></v-text-field>
          </v-col>
          <v-col :cols="xs ? '12' : '4'">
            <span>Guests</span>
            <v-text-field
              v-model="event.total_guest"
              type="number"
              min="0"
              prepend-inner-icon="mdi-account-multiple-outline"
            ></v-text-field>
          </v-col>
        </v-row>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            class="text-uppercase"
            color="red"
            @click="emit('disagree')"
          >
            {{ disagreeButtonText }}
          </v-btn>
          <v-btn
            variant="flat"
            :color="showHeaderMessage ? 'error' : 'secondary'"
            class="text-uppercase"
            @click="onSubmit"
          >
            {{ agreeButtonText }}
          </v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog> -->
  <v-dialog v-model="showDialog" max-width="700">
    <v-form @submit.prevent="onSubmit" ref="formValid" style="width: 100%">
      <v-card class="pa-1 rounded-lg" style="overflow-y: auto" height="100%">
        <v-row no-gutters>
          <v-col cols="12" class="px-5 py-3">
            <v-row no-gutters>
              <v-col
                :cols="xs ? '10' : '11'"
                class="d-flex justify-center align-center ml-5"
              >
                <span class="font-weight-bold">Update Event</span>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn
                  icon="mdi-close"
                  size="30"
                  flat
                  @click="emit('disagree')"
                ></v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-divider></v-divider>
          <v-col cols="12" class="px-7 pt-5">
            <v-row>
              <v-col :cols="xs ? '12' : '6'">
                <span class="font-weight-bold">Venue</span>
                <v-select
                  placeholder="Select Venue"
                  :items="venueList"
                  item-title="name"
                  item-value="_id"
                  v-model="selectedVenue"
                  :rules="venueRules"
                  class="mt-2"
                ></v-select>
              </v-col>
              <v-col :cols="xs ? '12' : '6'">
                <span class="font-weight-bold">Space</span>
                <v-select
                  placeholder="Select Space"
                  :items="spaceList"
                  item-title="name"
                  item-value="_id"
                  v-model="selectedSpace"
                  :disabled="selectedVenue === null"
                  :rules="spaceRules"
                  class="mt-2"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-7 pt-5"></v-divider>
          <v-col
            cols="12"
            class="px-7 py-3 mb-2"
            v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
          >
            <v-row>
              <v-col cols="12" class="py-0">
                <span class="font-weight-bold">
                  <span class="text-primary">**</span>
                  Old Schedule
                </span>
              </v-col>
              <v-col :cols="xs ? '12' : '4'" class="mt-2 py-0">
                <span class="font-weight-bold">Date</span>
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
                      v-bind="props"
                      placeholder="Select Date"
                      prepend-inner-icon="mdi-calendar-month"
                      :disabled="event.event_duration === 'BOOKED_PART_OF_DAY'"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date_calendar"
                    @input="dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="
                      (val) =>
                        getAllowedDates(
                          val,
                          event.event_duration === 'BOOKED_PART_OF_DAY'
                            ? true
                            : false
                        )
                    "
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col
                :cols="xs ? '12' : '4'"
                class="mt-2 py-0"
                v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
              >
                <span class="font-weight-bold">From</span>
                <v-select
                  v-model="updateStartTime"
                  min="0"
                  :items="checkAllowedTimeFrom"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  placeholder="From"
                  menu-icon=""
                  append-inner-icon="mdi-clock-time-one-outline"
                  :disabled="true"
                >
                </v-select>
              </v-col>
              <v-col
                :cols="xs ? '12' : '4'"
                class="mt-2 py-0"
                v-if="event.event_duration === 'BOOKED_PART_OF_DAY'"
              >
                <span class="font-weight-bold">To</span>
                <v-select
                  v-model="updateEndTime"
                  :items="checkAllowedTimeTo"
                  min="0"
                  menu-icon=""
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  placeholder="To"
                  append-inner-icon="mdi-clock-time-ten-outline"
                  :disabled="true"
                >
                </v-select>
              </v-col>
              <v-col cols="12" class="mb-2 pb-0">
                <span class="font-weight-bold">
                  <span class="text-red">**</span>
                  New Schedule
                </span>
              </v-col>
              <v-col :cols="xs ? '12' : '4'" class="py-0">
                <span class="font-weight-bold">Date</span>
                <v-menu
                  v-model="scheduleToUpdate.dateInput"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      v-model="formattedDateToUpdate"
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="Select Date"
                      prepend-inner-icon="mdi-calendar-month"
                      :rules="dateRules"
                      :disabled="selectedSpace === null"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="scheduleToUpdate.date"
                    @input="scheduleToUpdate.dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="scheduleToUpdate.dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="
                      (val) =>
                        getAllowedDates(
                          val,
                          event.event_duration === 'BOOKED_PART_OF_DAY'
                            ? true
                            : false
                        )
                    "
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col :cols="xs ? '12' : '4'" class="py-0">
                <span class="font-weight-bold">From</span>
                <v-select
                  v-model="scheduleToUpdate.timeFrom"
                  min="0"
                  :items="checkAllowedTimeFrom"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  menu-icon=""
                  dense
                  persistent-hint
                  placeholder="From"
                  append-inner-icon="mdi-clock-time-one-outline"
                  :disabled="scheduleToUpdate.date === null"
                  :rules="
                    event.event_duration === 'BOOKED_PART_OF_DAY'
                      ? startTimeRules
                      : ''
                  "
                >
                </v-select>
              </v-col>
              <v-col :cols="xs ? '12' : '4'" class="py-0">
                <span class="font-weight-bold">To</span>
                <v-select
                  v-model="scheduleToUpdate.timeTo"
                  :items="checkAllowedTimeTo"
                  min="0"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  menu-icon=""
                  dense
                  persistent-hint
                  placeholder="To"
                  append-inner-icon="mdi-clock-time-ten-outline"
                  :disabled="scheduleToUpdate.timeFrom === null"
                  :rules="
                    event.event_duration === 'BOOKED_PART_OF_DAY'
                      ? endTimeRules
                      : ''
                  "
                >
                </v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" class="px-7 py-3 mb-2" v-else>
            <v-row>
              <v-col cols="12" class="pb-0">
                <span class="font-weight-bold">Date</span>
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
                      v-bind="props"
                      placeholder="Select Date"
                      prepend-inner-icon="mdi-calendar-month"
                      :disabled="event.event_duration === 'BOOKED_PART_OF_DAY'"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date_calendar"
                    @input="dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="
                      (val) =>
                        getAllowedDates(
                          val,
                          event.event_duration === 'BOOKED_PART_OF_DAY'
                            ? true
                            : false
                        )
                    "
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-7 my-3"></v-divider>
          <v-col cols="12" class="px-7">
            <v-row>
              <v-col :cols="xs ? '12' : '6'" class="pb-0">
                <span class="font-weight-bold"
                  >First Name
                  <span class="font-weight-regular text-disabled"
                    >(optional)</span
                  ></span
                >
                <v-text-field
                  v-model="dynamicModelFirstName"
                  class="mt-2"
                ></v-text-field>
              </v-col>
              <v-col :cols="xs ? '12' : '6'" class="pb-0">
                <span class="font-weight-bold"
                  >Last Name
                  <span class="font-weight-regular text-disabled"
                    >(optional)</span
                  ></span
                >
                <v-text-field
                  class="mt-2"
                  v-model="dynamicModelLastName"
                ></v-text-field>
              </v-col>
              <v-col :cols="xs ? '12' : '6'" class="py-0">
                <span class="font-weight-bold"
                  >Email
                  <span class="font-weight-regular text-disabled"
                    >(optional)</span
                  ></span
                >
                <v-text-field
                  class="mt-2"
                  v-model="dynamicModelEmail"
                  :rules="dynamicModelEmail !== '' ? emailRules : []"
                ></v-text-field>
              </v-col>
              <v-col :cols="xs ? '12' : '6'" class="py-0">
                <span class="font-weight-bold"
                  >Guests
                  <span class="font-weight-regular text-disabled"
                    >(optional)</span
                  ></span
                >
                <v-text-field
                  class="mt-2"
                  type="number"
                  min="0"
                  v-model="event.total_guest"
                  append-inner-icon="mdi-account-multiple-outline"
                  :rules="event.total_guest !== null ? maxCapacityRules : []"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="my-5"></v-divider>
          <v-col
            cols="12"
            class="pb-3 d-flex"
            :class="xs ? 'justify-center px-5 ml-2' : 'justify-end px-3'"
          >
            <v-btn
              color="secondary"
              class="mr-4 rounded-lg"
              @click="onSubmit"
              :width="xs ? '100%' : ''"
              >Update Event</v-btn
            >
          </v-col>
        </v-row>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script setup>
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const { validEmail } = useUtils();
const selectedSpace = defineModel("selectedSpace");
const selectedVenue = defineModel("selectedVenue");
const bookingData = defineModel("bookingData");
const event = defineModel("event");
const space = defineModel("space");
const props = defineProps({
  disagreeButtonText: String,
  agreeButtonText: String,
  venueList: Object,
  spaceList: Object,
});
const { getBooking, updateBooking } = useBookingAPI();
const { allowedDatesChecker, allowedTime, checkTimesToFunction } = useSpace();
const dateInput = ref(false);
const showDialog = defineModel("edit", { default: false });
const formValid = ref();
const date_calendar = ref(null);
const emit = defineEmits(["agree", "disagree"]);
let maxCapacity = null;
const scheduleToUpdate = ref({
  date: null,
  dateInput: null,
  timeFrom: null,
  timeTo: null,
});
const dateRules = [(value) => !!value || "Please select date"];
const spaceRules = [(value) => !!value || "Please select space"];
const venueRules = [(value) => !!value || "Please select venue"];
const startTimeRules = [(value) => !!value || "Please select start time"];
const endTimeRules = [(value) => !!value || "Please select end time"];
let emailRules = [
  (v) =>
    /.+@.+\..+/.test(v) ||
    "Invalid Email address, Please enter a valid email address e.g johndoe@mail.com",
  (v) => validEmail(v),
];
let maxCapacityRules = [
  (value) =>
    value <= maxCapacity.max_capacity ||
    `Guests (max ${maxCapacity.max_capacity})`,
];
function getAllowedDates(val, isPartOfTheDay) {
  if (isPartOfTheDay) {
    return allowedDatesChecker(space.value.pricing, val);
  } else {
    const getConfirmedDates = (bookings) => {
      return bookings.map(
        (booking) => new Date(booking.start_date).toISOString().split("T")[0]
      );
    };

    const confirmedDates = getConfirmedDates(bookingData.value);
    const dateObj = new Date(val);
    dateObj.setDate(dateObj.getDate() + 1);
    const dateStr = dateObj.toISOString().split("T")[0];

    if (allowedDatesChecker(space.value.pricing, val)) {
      if (confirmedDates.includes(dateStr)) {
        return false;
      } else {
        return true;
      }
    }
  }
}

const startTimeToShow = ref(null);
const updateStartTime = computed(() => {
  if (!event.value?.start_date) return null;
  const start = new Date(event.value?.start_date);
  if (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    start.getSeconds() === 0
  ) {
    startTimeToShow.value = null;
  } else {
    startTimeToShow.value = start.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  }
  return startTimeToShow.value;
});

const endTimeToShow = ref("");
const updateEndTime = computed(() => {
  if (!event.value.end_date) return null;
  const start = new Date(event.value?.end_date);
  return (endTimeToShow.value = start.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }));
});
const formattedDate = computed(() => {
  if (!event.value.start_date) return "";
  const date = new Date(event.value.start_date);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const formattedDateToUpdate = computed(() => {
  if (!scheduleToUpdate.value.date) return null;
  const date = new Date(scheduleToUpdate.value.date);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});
const dynamicModelFirstName = computed({
  get() {
    return (
      event.value.optional_input?.first_name ||
      event.value.booker_user_first_name
    );
  },
  set(value) {
    if (event.value.optional_input?.first_name !== "") {
      event.value.optional_input.first_name = value;
    } else {
      event.value.booker_user_first_name = value;
    }
  },
});
const dynamicModelLastName = computed({
  get() {
    return (
      event.value.optional_input?.last_name || event.value.booker_user_last_name
    );
  },
  set(value) {
    if (event.value.optional_input?.last_name !== "") {
      event.value.optional_input.last_name = value;
    } else {
      event.value.booker_user_last_name = value;
    }
  },
});

const dynamicModelEmail = computed({
  get() {
    return event.value.optional_input?.email || event.value.booker_user_email;
  },
  set(value) {
    if (event.value.optional_input?.email !== "") {
      event.value.optional_input.email = value;
    } else {
      event.value.booker_user_email = value;
    }
  },
});

const loadBookings = async (id) => {
  try {
    bookingData.value = await getBooking(id);
  } catch (error) {
    console.error(error);
  }
};

const getSpace = async (id) => {
  try {
    const params = {
      space_id: id,
    };
    const queryString = new URLSearchParams(params).toString();
    const { data, error } = await useAPI(`v1/space/?${queryString}`, {
      method: "GET",
    });
    if (data) {
      space.value = data.value.data.data[0];
    }
  } catch (error) {
    console.error(error);
  }
};

const checkAllowedTimeFrom = computed(() => {
  if (!scheduleToUpdate.value.date) return [];
  return allowedTime(
    space.value.pricing,
    new Date(scheduleToUpdate.value.date),
    bookingData.value
  );
});

const checkAllowedTimeTo = computed(() => {
  return checkTimesToFunction(
    space.value.pricing,
    new Date(scheduleToUpdate.value.date),
    scheduleToUpdate.value.timeFrom,
    bookingData.value
  );
});

const onSubmit = async () => {
  const validationResult = await formValid.value?.validate();
  if (validationResult.valid) {
    try {
      const payload = {
        space: selectedSpace.value,
        venue: selectedVenue.value,
        start_date:
          event.value.event_duration === "BOOKED_PART_OF_DAY"
            ? [formattedDateToUpdate.value]
            : [formattedDate.value],
        total_guest: Number(event.value.total_guest),
        status: "CONFIRMED",
        optional_input: {
          first_name: dynamicModelFirstName.value,
          last_name: dynamicModelLastName.value,
          email: dynamicModelEmail.value,
        },
      };
      if (event.value.event_duration === "BOOKED_PART_OF_DAY") {
        payload.start_time = scheduleToUpdate.value.timeFrom;
        payload.end_time = scheduleToUpdate.value.timeTo;
      }

      const { data } = await updateBooking(payload, event.value._id);

      if (data.value.data.acknowledged) {
        scheduleToUpdate.value.date = null;
        scheduleToUpdate.value.timeFrom = null;
        scheduleToUpdate.value.timeTo = null;
        emit("updatedSuccess");
      }
    } catch (error) {
      console.error(error);
    }
  }
};

watch(date_calendar, async (oldValue, newwVal) => {
  if (oldValue) {
    event.value.start_date = oldValue;
  }
});

watch(startTimeToShow, (newVal) => {
  startTimeToShow.value = newVal;
});

watch(selectedVenue, async (oldValue, newwVal) => {
  scheduleToUpdate.value.date = null;
  scheduleToUpdate.value.timeFrom = null;
  scheduleToUpdate.value.timeTo;
});

watch(selectedSpace, async (oldValue, newwVal) => {
  scheduleToUpdate.value.date = null;
  scheduleToUpdate.value.timeFrom = null;
  scheduleToUpdate.value.timeTo;
});

watch(space, (newVal) => {
  maxCapacity = space.value?.capacity_layout
    .filter((layout) => layout.answer === true)
    .reduce(
      (max, current) =>
        current.max_capacity > max.max_capacity ? current : max,
      space.value.capacity_layout[0]
    );
});
</script>
