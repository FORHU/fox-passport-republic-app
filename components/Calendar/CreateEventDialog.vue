<template>
  <!-- <v-dialog v-model="showCreateEventDialog" max-width="700">
    <v-form @submit.prevent="onSubmit" ref="formValid" style="width: 100%">
      <v-card height="100%" class="pa-1" style="overflow-y: scroll">
        <v-row class="pt-10 pl-10 pr-10 font-weight-bold text-h6" no-gutters>
          <v-col :cols="xs ? '12' : '3'" class="mt-1 d-flex justify-center">
            <span>{{ xs ? "New Event" : "New Event - " }}</span>
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
            <span>@</span>
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
        <v-row class="px-10 pt-3" no-gutters>
          <v-col cols="12">
            <v-radio-group
              v-model="bookValue"
              :disabled="selectedSpace === null"
              :rules="eventRules"
            >
              <v-row no-gutters>
                <v-col :cols="xs ? '12' : '4'">
                  <v-radio
                    label="Part of the Day"
                    value="BOOKED_PART_OF_DAY"
                  ></v-radio>
                  <v-row
                    class="pt-4 text-subtitle-2"
                    v-if="bookValue == 'BOOKED_PART_OF_DAY'"
                    no-gutters
                  >
                    <v-col cols="12">
                      <v-menu
                        v-model="partOfTheDay.dateInput"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            dense
                            v-model="formattedDatePOD"
                            readonly
                            persistent-hint
                            v-bind="props"
                            placeholder="Select Date"
                            prepend-icon="mdi-calendar-month"
                            variant="underlined"
                            label="Date"
                            :rules="
                              bookValue === 'BOOKED_PART_OF_DAY'
                                ? dateRules
                                : ''
                            "
                          >
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="partOfTheDay.date"
                          @input="partOfTheDay.dateInput = false"
                          show-adjacent-months
                          elevation="24"
                          no-time
                          @update:model-value="partOfTheDay.dateInput = false"
                          :min="new Date().toISOString().substring(0, 10)"
                          placeholder="Select a date"
                          :allowed-dates="(val) => getAllowedDates(val, true)"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        v-model="partOfTheDay.from"
                        min="0"
                        :items="checkAllowedTimeFrom"
                        item-title="label"
                        item-value="value"
                        item-disabled="disabled"
                        dense
                        persistent-hint
                        placeholder="From"
                        variant="underlined"
                        label="From"
                        :disabled="!partOfTheDay.date"
                        :rules="
                          bookValue === 'BOOKED_PART_OF_DAY'
                            ? timeFromRules
                            : ''
                        "
                      >
                      </v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        v-model="partOfTheDay.to"
                        :items="checkAllowedTimeTo"
                        min="0"
                        item-title="label"
                        item-value="value"
                        item-disabled="disabled"
                        dense
                        persistent-hint
                        placeholder="To"
                        variant="underlined"
                        label="To"
                        :disabled="!partOfTheDay.from"
                        class="pl-2"
                        :rules="
                          bookValue === 'BOOKED_PART_OF_DAY' ? timeToRules : ''
                        "
                      >
                      </v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        prepend-inner-icon="mdi-repeat-variant"
                        :items="repeatOption"
                        placeholder="Repeat Event"
                        v-model="partOfTheDay.repeatEvent"
                        item-title="text"
                        item-value="value"
                        :rules="
                          bookValue === 'BOOKED_PART_OF_DAY' ? repeatRules : ''
                        "
                        :disabled="!partOfTheDay.to"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col :cols="xs ? '12' : '4'">
                  <v-radio label="All Day" value="BOOKED_ALL_DAY"></v-radio>
                  <v-row
                    class="pt-4 text-subtitle-2"
                    v-if="bookValue == 'BOOKED_ALL_DAY'"
                  >
                    <v-col cols="12">
                      <v-menu
                        v-model="allDay.dateInput"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            dense
                            v-model="formattedDateAllDay"
                            readonly
                            persistent-hint
                            v-bind="props"
                            placeholder="Select Date"
                            prepend-icon="mdi-calendar-month"
                            variant="underlined"
                            label="Date"
                            :rules="
                              bookValue === 'BOOKED_ALL_DAY' ? dateRules : ''
                            "
                          >
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="allDay.date"
                          @input="allDay.dateInput = false"
                          show-adjacent-months
                          elevation="24"
                          no-time
                          @update:model-value="allDay.dateInput = false"
                          :min="new Date().toISOString().substring(0, 10)"
                          placeholder="Select a date"
                          :allowed-dates="(val) => getAllowedDates(val, false)"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        prepend-inner-icon="mdi-repeat-variant"
                        :items="repeatOption"
                        placeholder="Repeat Event"
                        v-model="allDay.repeatEvent"
                        item-title="text"
                        item-value="value"
                        :rules="
                          bookValue === 'BOOKED_ALL_DAY' ? repeatRules : ''
                        "
                        :disabled="!allDay.date"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col :cols="xs ? '12' : '4'">
                  <v-radio
                    label="Multiple Dates"
                    value="BOOKED_MULTIPLE_DAYS"
                  ></v-radio>
                  <v-row
                    class="pt-4 text-subtitle-2"
                    v-if="bookValue == 'BOOKED_MULTIPLE_DAYS'"
                    no-gutters
                  >
                    <v-col cols="12">
                      <v-menu
                        v-model="multipleDays.dateInput"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            dense
                            readonly
                            persistent-hint
                            v-bind="props"
                            placeholder="Select Multiple Dates"
                            prepend-icon="mdi-calendar-month"
                            variant="underlined"
                            :rules="
                              !multipleDateRulesChecker ? '' : multipleDateRules
                            "
                          >
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="multipleDays.date"
                          show-adjacent-months
                          elevation="24"
                          no-time
                          :min="new Date().toISOString().substring(0, 10)"
                          placeholder="Select a date"
                          :allowed-dates="(val) => getAllowedDates(val, false)"
                          :multiple="true"
                        >
                          <template #actions>
                            <v-btn
                              color="primary"
                              @click="multipleDays.dateInput = false"
                              >OK</v-btn
                            >
                          </template>
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col
                      cols="12"
                      class="d-flex justify-center"
                      v-for="(row, index) in formattedDateMultipleDay"
                      :key="index"
                    >
                      <span>{{ row }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-radio-group>
          </v-col>
          <v-col
            cols="12"
            class="mb-3"
            v-if="bookingMessageChecker === 'SPACE_IS_NOT_AVAILABLE'"
          >
            <v-card variant="outlined" color="orange" style="width: 100%">
              <div class="d-flex flex-column px-6 pt-5">
                <span
                  >Sorry. The venue/space is not available on the desired
                  date.</span
                >
                <span>Would you like to proceed with alternative options?</span>
              </div>
              <v-radio-group
                class="text-black d-flex justify-start"
                :class="xs ? 'text-caption' : 'pa-3'"
                v-model="proceed_alternative_opt"
              >
                <v-radio :value="true">
                  <template #label>
                    <span :class="xs ? 'text-caption' : ''"
                      ><span class="font-weight-bold">Yes. </span>Follow space
                      availability.</span
                    >
                  </template>
                </v-radio>
                <v-radio
                  label="No. (Note: The event will be not created)"
                  :value="false"
                >
                  <template #label>
                    <span :class="xs ? 'text-caption' : ''"
                      ><span class="font-weight-bold">No. </span>
                      <span class="text-red" v-if="!xs"
                        >(Note: The event will be not created)</span
                      >
                      <span class="text-red" v-else
                        >(The event will be not created)</span
                      >
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-card>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row no-gutters class="px-6 py-3">
          <v-col cols="12">
            <span class="font-weight-bold">• Optional inputs</span>
          </v-col>
          <v-col :cols="xs ? '12' : '5'" class="mr-5 mt-3">
            <v-text-field
              placeholder="First Name"
              label="First Name"
              v-model="optionalInputs.firstName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col :cols="xs ? '12' : '6'" class="mt-3">
            <v-text-field
              placeholder="Last Name"
              label="Last Name"
              v-model="optionalInputs.lastName"
              prepend-inner-icon="mdi-card-account-details-outline"
            ></v-text-field>
          </v-col>
          <v-col :cols="xs ? '12' : '7'" class="mr-5">
            <v-text-field
              placeholder="Email"
              label="Email"
              v-model="optionalInputs.email"
              prepend-inner-icon="mdi-email-outline"
            ></v-text-field>
          </v-col>
          <v-col :cols="xs ? '12' : '4'">
            <v-text-field
              type="number"
              min="0"
              placeholder="Guests"
              label="Guests"
              v-model="optionalInputs.guests"
              prepend-inner-icon="mdi-account-multiple-outline"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row class="pa-2 mt-2">
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="secondary" class="mr-4" @click="onSubmit">Save</v-btn>
            <v-btn
              variant="outlined"
              @click="emit('exitNewEventDialog')"
              color="red"
              >Cancel</v-btn
            >
          </v-col>
        </v-row>
      </v-card>
    </v-form>
    <LoadingTransparent v-if="processing" />
  </v-dialog> -->
  <v-dialog v-model="showCreateEventDialog" max-width="700">
    <v-form @submit.prevent="onSubmit" ref="formValid" style="width: 100%">
      <v-card height="100%" class="pa-1 rounded-lg" style="overflow-y: auto">
        <v-row no-gutters>
          <v-col cols="12" class="px-5 py-3">
            <v-row no-gutters>
              <v-col
                :cols="xs ? '10' : '11'"
                class="d-flex justify-center align-center ml-5"
              >
                <span class="font-weight-bold">Create Event</span>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn
                  icon="mdi-close"
                  size="30"
                  flat
                  @click="emit('exitNewEventDialog')"
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
          <v-col cols="12" class="px-6">
            <v-radio-group
              v-model="bookValue"
              :disabled="selectedSpace === null"
              :rules="eventRules"
            >
              <v-radio value="BOOKED_PART_OF_DAY">
                <template #label>
                  <span class="font-weight-bold">Part of the Day</span>
                </template>
              </v-radio>
              <v-radio value="BOOKED_ALL_DAY">
                <template #label>
                  <span class="font-weight-bold">All Day</span>
                </template>
              </v-radio>
              <v-radio value="BOOKED_MULTIPLE_DAYS">
                <template #label>
                  <span class="font-weight-bold">Multiple Dates</span>
                </template></v-radio
              >
            </v-radio-group>
          </v-col>
          <v-col cols="12" class="px-7">
            <v-row v-if="bookValue == 'BOOKED_PART_OF_DAY'">
              <v-col cols="12" class="pb-0">
                <span class="font-weight-bold">Date</span>
                <v-menu
                  v-model="partOfTheDay.dateInput"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      v-model="formattedDatePOD"
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="Select Date"
                      append-inner-icon="mdi-calendar-month"
                      label="DD/MM/YYYY"
                      class="mt-2"
                      :rules="
                        bookValue === 'BOOKED_PART_OF_DAY' ? dateRules : ''
                      "
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="partOfTheDay.date"
                    @input="partOfTheDay.dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="partOfTheDay.dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="(val) => getAllowedDates(val, true)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" class="pt-0">
                <span class="font-weight-bold">Time</span>
              </v-col>
              <v-col :cols="xs ? '12' : '6'" class="py-0">
                <v-select
                  v-model="partOfTheDay.from"
                  min="0"
                  :items="checkAllowedTimeFrom"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  menu-icon=""
                  append-inner-icon="mdi-clock-outline"
                  placeholder="From"
                  label="From"
                  :disabled="!partOfTheDay.date"
                  :rules="
                    bookValue === 'BOOKED_PART_OF_DAY' ? timeFromRules : ''
                  "
                >
                </v-select>
              </v-col>
              <v-col :cols="xs ? '12' : '6'" class="py-0">
                <v-select
                  v-model="partOfTheDay.to"
                  :items="checkAllowedTimeTo"
                  min="0"
                  item-title="label"
                  item-value="value"
                  item-disabled="disabled"
                  dense
                  persistent-hint
                  menu-icon=""
                  append-inner-icon="mdi-clock-outline"
                  placeholder="To"
                  label="To"
                  :disabled="!partOfTheDay.from"
                  :class="xs ? '' : 'pl-2'"
                  :rules="bookValue === 'BOOKED_PART_OF_DAY' ? timeToRules : ''"
                >
                </v-select>
              </v-col>
              <v-col cols="12" class="py-0">
                <span class="font-weight-bold">Repeat Event</span>
                <v-select
                  append-inner-icon="mdi-repeat-variant"
                  :items="repeatOption"
                  menu-icon=""
                  class="mt-2"
                  placeholder="Repeat Event"
                  v-model="partOfTheDay.repeatEvent"
                  item-title="text"
                  item-value="value"
                  :rules="bookValue === 'BOOKED_PART_OF_DAY' ? repeatRules : ''"
                  :disabled="!partOfTheDay.to"
                ></v-select>
              </v-col>
            </v-row>
            <v-row v-if="bookValue == 'BOOKED_ALL_DAY'">
              <v-col cols="12" class="pb-0">
                <span class="font-weight-bold">Date</span>
                <v-menu
                  v-model="allDay.dateInput"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      v-model="formattedDateAllDay"
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="DD/MM/YYYY"
                      append-inner-icon="mdi-calendar-month"
                      label="Date"
                      :rules="bookValue === 'BOOKED_ALL_DAY' ? dateRules : ''"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="allDay.date"
                    @input="allDay.dateInput = false"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    @update:model-value="allDay.dateInput = false"
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="(val) => getAllowedDates(val, false)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" class="py-0">
                <span class="font-weight-bold">Repeat Event</span>
                <v-select
                  append-inner-icon="mdi-repeat-variant"
                  menu-icon=""
                  class="mt-2"
                  :items="repeatOption"
                  placeholder="Repeat Event"
                  v-model="allDay.repeatEvent"
                  item-title="text"
                  item-value="value"
                  :rules="bookValue === 'BOOKED_ALL_DAY' ? repeatRules : ''"
                  :disabled="!allDay.date"
                ></v-select>
              </v-col>
            </v-row>
            <v-row v-if="bookValue == 'BOOKED_MULTIPLE_DAYS'">
              <v-col cols="12" class="pb-0">
                <span class="font-weight-bold">Date</span>
                <v-menu
                  v-model="multipleDays.dateInput"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      dense
                      readonly
                      persistent-hint
                      v-bind="props"
                      placeholder="Select Multiple Dates"
                      append-inner-icon="mdi-calendar-month"
                      :rules="
                        !multipleDateRulesChecker ? [] : multipleDateRules
                      "
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    v-model="multipleDays.date"
                    show-adjacent-months
                    elevation="24"
                    no-time
                    :min="new Date().toISOString().substring(0, 10)"
                    placeholder="Select a date"
                    :allowed-dates="(val) => getAllowedDates(val, false)"
                    :multiple="true"
                  >
                    <template #actions>
                      <v-btn
                        color="primary"
                        @click="multipleDays.dateInput = false"
                        >OK</v-btn
                      >
                    </template>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col
                cols="12"
                class="py-0"
                v-for="(row, index) in formattedDateMultipleDay"
                :key="index"
              >
                <span>{{ row }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-divider class="mx-7 my-5"></v-divider>
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
                  v-model="optionalInputs.firstName"
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
                  v-model="optionalInputs.lastName"
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
                  v-model="optionalInputs.email"
                  :rules="optionalInputs.email !== '' ? emailRules : []"
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
                  v-model="optionalInputs.guests"
                  append-inner-icon="mdi-account-multiple-outline"
                  :rules="
                    optionalInputs.guests !== null ? maxCapacityRules : []
                  "
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
              >Create Event</v-btn
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
let bookValue = ref("");
const props = defineProps({
  venueList: Object,
  spaceList: Object,
});
const { validEmail } = useUtils();
const { getBooking, addBooking, checkBookingDate } = useBookingAPI();
const selectedSpace = defineModel("selectedSpace");
const selectedVenue = defineModel("selectedVenue");
const showCreateEventDialog = defineModel("review", { default: false });
const emit = defineEmits(["addedSuccess", "exitNewEventDialog"]);
const space = ref(null);
const maxCapacity = ref(null);
const bookings = ref(null);
const { allowedDatesChecker, allowedTime, checkTimesToFunction } = useSpace();
const formValid = ref();
const processing = ref(false);
const proceed_alternative_opt = ref(false);
const multipleDateRulesChecker = ref(true);
const bookingMessageChecker = ref("");
const partOfTheDay = ref({
  dateInput: false,
  date: null,
  from: null,
  to: null,
  repeatEvent: null,
});
const allDay = ref({
  dateInput: false,
  date: null,
  repeatEvent: null,
});
const multipleDays = ref({
  dateInput: false,
  date: [],
});
const optionalInputs = ref({
  firstName: "",
  lastName: "",
  email: "",
  guests: null,
});
const venueRules = [(value) => !!value || "Please select venue"];
const spaceRules = [(value) => !!value || "Please select space"];
const dateRules = [(value) => !!value || "Please select date"];
const timeFromRules = [(value) => !!value || "Please select start time"];
const timeToRules = [(value) => !!value || "Please select end time"];
const eventRules = [(value) => !!value || "Please choose event duration"];
const repeatRules = [(value) => !!value || "Please select repeat duration"];
const multipleDateRules = [
  (value) => multipleDays.value.date.length > 0 || "Please select date",
];
let emailRules = [
  (v) =>
    /.+@.+\..+/.test(v) ||
    "Invalid Email address, Please enter a valid email address e.g johndoe@mail.com",
  (v) => validEmail(v),
];
let maxCapacityRules = [
  (value) =>
    value <= maxCapacity.value.max_capacity ||
    `Guests (max ${maxCapacity.value.max_capacity})`,
];

const repeatOption = [
  {
    text: "Never",
    value: "DOES_NOT_REPEAT",
  },
  {
    text: "Daily",
    value: "DAILY",
  },
  {
    text: "Weekly",
    value: "WEEKLY",
  },
  {
    text: "Monthly",
    value: "MONTHLY",
  },
  {
    text: "Annually",
    value: "YEARLY",
  },
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

    const confirmedDates = getConfirmedDates(bookings.value);
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

const checkAllowedTimeFrom = computed(() => {
  return allowedTime(
    space.value.pricing,
    partOfTheDay.value.date,
    bookings.value
  );
});

const checkAllowedTimeTo = computed(() => {
  return checkTimesToFunction(
    space.value.pricing,
    partOfTheDay.value.date,
    partOfTheDay.value.from,
    bookings.value
  );
});

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
      maxCapacity.value = space.value.capacity_layout
        .filter((layout) => layout.answer === true)
        .reduce(
          (max, current) =>
            current.max_capacity > max.max_capacity ? current : max,
          space.value.capacity_layout[0]
        );
    }
  } catch (error) {
    console.error(error);
  }
};

const checkBookings = async () => {
  let eventDate = null;
  if (bookValue.value === "BOOKED_PART_OF_DAY") {
    eventDate = [formattedDatePOD.value];
  } else {
    eventDate = [formattedDateAllDay.value];
  }
  const params = {
    space: selectedSpace.value,
    start_date: eventDate,
    start_time:
      bookValue.value === "BOOKED_PART_OF_DAY" ? partOfTheDay.value.from : "",
    end_time:
      bookValue.value === "BOOKED_PART_OF_DAY" ? partOfTheDay.value.to : "",
    repeat_event:
      bookValue.value === "BOOKED_PART_OF_DAY"
        ? partOfTheDay.value.repeatEvent
        : allDay.value.repeatEvent,
  };

  bookingMessageChecker.value = await checkBookingDate(params);
};

const loadBookings = async (id) => {
  try {
    bookings.value = await getBooking(id);
  } catch (error) {
    console.error(error);
  }
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const formattedDateAllDay = computed(() => formatDate(allDay.value.date));
const formattedDatePOD = computed(() => formatDate(partOfTheDay.value.date));
const formattedDateMultipleDay = computed(() =>
  formatDates(multipleDays.value.date)
);
function formatDates(dates) {
  if (!dates || dates.length === 0) return "";
  return dates.map(formatDate);
}

const onSubmit = async () => {
  const validationResult = await formValid.value?.validate();
  if (validationResult.valid) {
    let eventDate = null;
    let repeatEvent = "";
    if (bookValue.value === "BOOKED_PART_OF_DAY") {
      eventDate = [formattedDatePOD.value];
      repeatEvent = partOfTheDay.value.repeatEvent;
    } else if (bookValue.value === "BOOKED_MULTIPLE_DAYS") {
      eventDate = formattedDateMultipleDay.value;
      repeatEvent = "";
    } else {
      eventDate = [formattedDateAllDay.value];
      repeatEvent = allDay.value.repeatEvent;
    }
    try {
      const payload = {
        space: selectedSpace.value,
        venue: selectedVenue.value,
        start_date: eventDate,
        start_time:
          bookValue.value === "BOOKED_PART_OF_DAY"
            ? partOfTheDay.value.from
            : "",
        end_time:
          bookValue.value === "BOOKED_PART_OF_DAY" ? partOfTheDay.value.to : "",
        total_guest:
          optionalInputs.value.guests === null
            ? optionalInputs.value.guests
            : Number(optionalInputs.value.guests),
        status: "CONFIRMED",
        repeat_event: repeatEvent,
        event_duration: bookValue.value,
        optional_input: {
          first_name: optionalInputs.value.firstName,
          last_name: optionalInputs.value.lastName,
          email: optionalInputs.value.email,
        },
      };
      if (bookingMessageChecker.value === "SPACE_IS_NOT_AVAILABLE")
        payload.proceed_alternative_opt = proceed_alternative_opt.value;

      const { data } = await addBooking(payload);
      if (data.value.data.acknowledged) {
        partOfTheDay.value.date = null;
        partOfTheDay.value.from = null;
        partOfTheDay.value.to = null;
        partOfTheDay.value.repeatEvent = null;
        allDay.value.date = null;
        allDay.value.repeatEvent = null;
        multipleDays.value.date = [];
        optionalInputs.value.firstName = "";
        optionalInputs.value.lastName = "";
        optionalInputs.value.email = "";
        optionalInputs.value.guests = null;
        emit("addedSuccess");
        if (selectedSpace.value) {
        await getSpace(selectedSpace.value);
        await loadBookings(selectedSpace.value);
      }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

watch(selectedSpace, async (oldValue, newwVal) => {
  if (oldValue) {
    await getSpace(oldValue);
    await loadBookings(oldValue);
  }
});

watch(
  () => partOfTheDay.value.repeatEvent,
  async (newVal, oldVal) => {
    if (newVal) {
      processing.value = true;
      await checkBookings();
      processing.value = false;
    }
  }
);

watch(
  () => allDay.value.repeatEvent,
  async (newVal, oldVal) => {
    if (newVal) {
      processing.value = true;
      await checkBookings();
      processing.value = false;
    }
  }
);

watch(
  () => multipleDays.value.date,
  (newValue) => {
    if (newValue.length > 0) {
      multipleDateRulesChecker.value = false;
    } else {
      multipleDateRulesChecker.value = true;
    }
  },
  { deep: true }
);

onBeforeMount(async () => {
  if (selectedSpace.value) {
    await getSpace(selectedSpace.value);
    await loadBookings(selectedSpace.value);
  }
});
</script>

<style></style>
