<template>
  <v-row no-gutters class="mt-10">
    <v-col cols="12">
      <span class="mb-5 mt-10 text-18px font-500">Pricing options</span>
      <div v-for="(item, index) in days" :key="item.name" class="mt-5">
        <v-row>
          <v-col cols="12">
            <v-row class="text-grey-darken-4">
              <v-col cols="12" class="d-flex align-center" style="position: relative">
                <v-checkbox :disabled="mode == 'view'" color="secondary" hide-details
                  v-model="space.pricing.hire_fee.days" :value="item"></v-checkbox>
                <p class="text-18px py-0 my-auto font-500 capitalize">
                  {{ item.name }}
                </p>
                <v-row v-if="
                  mode !== 'view' &&
                  space.pricing?.hire_fee?.days?.some(
                    (selectedItem) => item.name == selectedItem.name,
                  )
                " no-gutters justify="end" style="position: absolute; top: 20%; right: 2%">
                  <v-tooltip text="Apply this pricing for the whole week">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-content-copy" v-if="index == 0" class="cursor-pointer"
                        @click="handleCopyPricing(item)"></v-icon>
                    </template>
                  </v-tooltip>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row no-gutters>

          <v-col cols="12" class="ml-8">
            <div v-if="
              space.pricing.selected_pricing === 'HIRE_FEE' &&
              space.pricing?.hire_fee?.days.length > 0 &&
              space.pricing?.hire_fee?.days?.some(
                (selectedItem) => item.name == selectedItem.name,
              )
            ">
              <v-row no-gutters class="w-100" style="max-width: 610px">
                <v-col cols="12" sm="6" md="6">
                  <span class="text-16px font-500 pl-2">From</span>
                  <v-select :readonly="mode == 'view'" v-model="item.slots.start" :items="timesFrom" item-title="label"
                    item-value="value" placeholder="Select time" class="px-2 pt-1" rounded="lg" color="charcoal"
                    base-color="charcoal" variant="outlined" @update:model-value="updateTime(index)"
                    style="max-width: 300px;" :rules="[requiredInput]"></v-select>
                </v-col>

                <v-col cols="12" sm="6" md="6">
                  <span class="text-16px font-500 pl-2 ">To</span>

                  <v-select :readonly="mode == 'view'" v-model="item.slots.end" variant="outlined"
                    :items="timesTo(item.slots.start)" item-title="label" item-value="value" placeholder="Select time"
                    rounded="lg" color="charcoal" base-color="charcoal" class="px-2 pt-1" style="max-width: 300px;"
                    :rules="[requiredInput]"></v-select>

                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" md="10">
                  <v-row no-gutters>
                    <v-col cols="12" class="d-flex align-center">
                      <v-checkbox :disabled="mode == 'view'" color="secondary" hide-details
                        v-model="item.hourlyCheckBox"></v-checkbox>
                      <span class="text-18px font-500">Hourly rates</span>
                    </v-col>
                  </v-row>

                  <v-row no-gutters class="pa-2 mr-2" v-if="item.hourlyCheckBox">
                    <v-col cols="12">
                      <v-row no-gutters style="max-width: 610px">
                        <v-col cols="12" xl="6" lg="6" md="6" sm="12" xs="12">
                          <span class="text-16px font-500 pl-2">Amount per hour</span>
                          <v-text-field :readonly="mode == 'view'" variant="outlined" type="number" :min="0"
                            persistent-placeholder rounded="lg" color="charcoal" base-color="charcoal"
                            :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''"
                            v-model.number="item.slots.rate" class="px-2 pt-1"
                            :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
                            style="max-width: 300px;"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="12" md="10">
                  <v-row no-gutters>
                    <v-col cols="12" class="d-flex align-center">
                      <v-checkbox :disabled="mode == 'view'" color="secondary" hide-details
                        v-model="item.fullRateCheckkBox"></v-checkbox>
                      <span class="text-18px font-500">Full day rate</span>
                    </v-col>
                  </v-row>

                  <v-row no-gutters class="pa-2" v-if="item.fullRateCheckkBox">
                    <v-col cols="12">
                      <v-row no-gutters style="max-width: 610px">
                        <v-col cols="12" md="6">
                          <span class="text-16px font-500 pl-2">Full day hours</span>
                          <v-text-field :readonly="mode == 'view'" type="number" variant="outlined" rounded="lg"
                            color="charcoal" base-color="charcoal" :min="0" persistent-placeholder suffix="hours"
                            v-model.number="item.full_day_hours" class="px-2 pt-1"
                            :rules="[requiredInput, requiredNumber, requiredGreaterThanZero, fullDayHoursRules(item?.slots?.start, item?.slots?.end, item?.full_day_hours)]"
                            style="max-width: 300px;"></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                          <span class="text-16px font-500 pl-2">Amount per day</span>
                          <v-text-field :readonly="mode == 'view'" type="number" variant="outlined" rounded="lg"
                            color="charcoal" base-color="charcoal" :min="0" persistent-placeholder
                            :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''"
                            v-model.number="item.full_day_rate" class="px-2 pt-1"
                            :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
                            style="max-width: 300px;"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </div>
      <v-row no-gutters class="mt-10">
        <v-col cols="12" xs="12" sm="12" md="12" lg="12">
          <v-row no-gutters>
            <v-col cols="12">
              <span class="mx-3 mt-2 text-18px font-500">Additional Charges</span>
            </v-col>
          </v-row>
          <v-row no-gutter class="mt-0 w-100">
            <span class="d-flex align-center pl-3">
              <v-row class="">
                <v-col cols="12" class="d-flex align-center">
                  <v-checkbox :disabled="mode == 'view'" color="secondary" hide-details v-model="cleaning_feeSwitch"
                    @update:model-value="clearCleaningFee"></v-checkbox>
                  <p class="text-18px font-500">
                    Cleaning Fee
                  </p>
                </v-col>
              </v-row>
            </span>
            <span v-if="cleaning_feeSwitch" class="w-100 pl-12">
              <span class="text-16px font-500">Amount per event</span>
              <v-text-field :readonly="mode == 'view'" v-model.number="space.pricing.cleaning_fee"
                persistent-placeholder :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''" rounded="lg"
                color="charcoal" base-color="charcoal" class=""
                :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
                style="max-width: 300px;"></v-text-field>
            </span>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="mt-10">
          <span class="mx-2 text-16px font-500">Select minimum booking hours</span>
          <v-autocomplete :readonly="mode == 'view'" v-model.number="space.pricing.hire_fee.minimum_booking_hours"
            rounded="lg" color="charcoal" base-color="charcoal" :items="bookingHours" item-title="label"
            item-value="value" class="px-2 pt-1" style="max-width: 300px;"></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-row no-gutters>
            <v-col cols="12">
              <span class="mx-2 text-16px font-500">Pricing details comments (optional)</span>
            </v-col>
            <v-col cols="12">
              <v-textarea :readonly="mode == 'view'" v-model="space.pricing.hire_fee.hire_fee_comment" rounded="lg"
                auto-grow color="charcoal" base-color="charcoal" no-resize variant="outlined" :rows="3"
                class="pt-1 px-2"></v-textarea>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
//IMPORT
const { country, getCurrencySymbol } = useLocal();
const { requiredInput, requiredNumber, requiredGreaterThanZero } = useUtils();
const { currentUser } = useLocalAuth();
const { withGST } = useTax();
const { timesFrom } = useSpace();

const { mode } = useVenue();
const space = defineModel<TVenueSpace>({ required: true });

const dateForm = ref(null);
const selectedDays = ref([]);

const currencyCode = computed(() => {
  return space?.value?.pricing?.currency;
});

const currencySymbol = computed(() => {
  return getCurrencySymbol(space?.value?.pricing?.currency);
});

const cleaning_feeSwitch = ref(false);
const days = ref([
  {
    name: "MONDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "TUESDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "WEDNESDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "THURSDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "FRIDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "SATURDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
  {
    name: "SUNDAY",
    fullRateCheckkBox: false,
    hourlyCheckBox: false,
    slots: {
      start: "06:00" as string | null,
      end: "06:30" as string | null,
      rate: null,
    },
    full_day_hours: null as number | null,
    full_day_rate: null,
    currency: currencyCode.value,
  },
]);


const timesTo = (startTime: string) => {
  if (!startTime || startTime == "") return;
  const startIndex = timesFrom.findIndex((time) => time.value === startTime);

  const newArr = timesFrom
    .slice(startIndex + 1, timesFrom.length)
    .map((x, index) => ({
      label: `${x.label} (${0.5 * (index + 1)} hours)`,
      value: x.value,
    }));

  return [
    ...newArr,
    {
      label: `06:00am (${(timesFrom.length - startIndex) * 0.5} hours)`,
      value: "06:00",
    },
  ];
};

const updateTime = (index: number) => {
  const dateFromValue = days.value[index].slots.start;
  const dateToValue = days.value[index].slots.end;

  const indexFrom = timesFrom.findIndex((x) => x.value == dateFromValue);
  const indexTo = timesFrom.findIndex((x) => x.value == dateToValue);
  if (indexFrom >= indexTo) {
    if (indexFrom && indexFrom !== -1 && dateFromValue !== "05:30") {
      days.value[index].slots.end = timesFrom[indexFrom + 1].value;
    }
    if (dateFromValue === "05:30") {
      days.value[index].slots.end = "06:00";
    }
  }
};

// const updateTimeFullDayRate = (index: number) => {
//   const dateFromValue = days.value[index].full_day_start;
//   const dateToValue = days.value[index].full_day_end;

//   const indexFrom = timesFrom.findIndex((x) => x.value == dateFromValue);
//   const indexTo = timesFrom.findIndex((x) => x.value == dateToValue);
//   if (indexFrom >= indexTo) {
//     if (indexFrom && indexFrom !== -1 && dateFromValue !== "05:30") {
//       days.value[index].full_day_end = timesFrom[indexFrom + 1].value;
//     }
//     if (dateFromValue === "05:30") {
//       days.value[index].full_day_end = "06:00";
//     }
//   }
// };

const fullDayHoursRules = (start: string, end: string, hours: number) => {
  const startKey = timesFrom.find(x => x.value == start)?.key;
  const endKey = timesFrom.find(x => x.value == end)?.key;

  let totalHours = 0;
  if (startKey && endKey) {
    totalHours = (endKey - startKey) * 0.5
  }
  console.log(hours, totalHours);
  if (hours && hours > totalHours) {
    
    
    return "Full day hours should not exceed your space's total opening hours";
  } else return true;

}

// const bookingHours = ref([
//   "1 hour",
//   "2 hours",
//   "3 hours",
//   "4 hours",
//   "5 hours",
//   "6 hours",
//   "7 hours",
//   "8 hours",
//   "9 hours",
//   "10 hours",
//   "11 hours",
//   "12 hours",
// ]);

const bookingHours = ref([
  { label: "1 hour", value: 1 },
  { label: "2 hours", value: 2 },
  { label: "3 hours", value: 3 },
  { label: "4 hours", value: 4 },
  { label: "5 hours", value: 5 },
  { label: "6 hours", value: 6 },
  { label: "7 hours", value: 7 },
  { label: "8 hours", value: 8 },
  { label: "9 hours", value: 9 },
  { label: "10 hours", value: 10 },
  { label: "11 hours", value: 11 },
  { label: "12 hours", value: 12 },
]);

watchEffect(() => {
  // retrieve existing data
  const arr = space.value?.pricing?.hire_fee?.days;
  if (arr && arr?.length > 0) {
    selectedDays.value = arr;
    days.value = days.value.map((obj1) => {
      const obj2 = selectedDays.value.find((obj) => obj.name == obj1.name);

      if (obj2) {
        obj1 = obj2;
      }

      return obj1; // Return the updated object
    });
  }

  //reset values
  days.value.forEach((obj) => {
    if (!obj.fullRateCheckkBox) {
      obj.full_day_rate = null;
      obj.full_day_hours = null;
    }
    if (!obj.hourlyCheckBox) {
      obj.slots.rate = null;
    }
  });

  //cleaning_fee watcher
  if (space.value.pricing.cleaning_fee !== null) {
    cleaning_feeSwitch.value = true;
  }
});

const clearCleaningFee = () => {
  if (!cleaning_feeSwitch.value) {
    space.value.pricing.cleaning_fee = null;
  }
};

const handleCopyPricing = (item: any) => {
  const weekdays = days.value.map((x) => x.name);
  let array: any[] = [];

  for (let day of weekdays) {
    const copiedObj = {
      name: day,
      fullRateCheckkBox: item.fullRateCheckkBox,
      hourlyCheckBox: item.hourlyCheckBox,
      slots: JSON.parse(JSON.stringify(item.slots)), // Deep copy of slots
      full_day_rate: item.full_day_rate,
      full_day_hours: item.full_day_hours,
      currency: item.currency,
    };

    array.push(copiedObj);
  }

  space.value.pricing.hire_fee!.days = array;
};
</script>

<style scoped>
/* .my-input:deep().v-input__control .v-field {
  border-radius: 10px;
  box-shadow: 0px 4px 2px 0px rgb(158, 158, 158);
  background-color: white;
} */

.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
