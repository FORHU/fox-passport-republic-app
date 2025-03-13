<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-form @submit.prevent ref="form" v-model="formValid">
      <v-card class="pa-5 pa-md-7" rounded="lg" :key="showDialog">
        <v-row no-gutters class="mb-3">
        <v-alert v-if="isBooked"  type="info">Your selected time/date is either already booked or unavailable. Please update the event details to proceed.</v-alert>
       </v-row>
        <v-row no-gutters class="text-subtitle-1 text-md-h6 font-500 mb-2 d-flex justify-space-between">
          <span>Edit event details</span>
          <span>
            <v-icon icon="mdi-close" size="25" class="cursor-pointer" @click="showDialog = false"></v-icon>
          </span>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1 font-500 px-2 pb-1">Event type</v-row>
            <v-autocomplete v-model="details.event_type" hide-details density="compact" variant="outlined"
              :items="tagsItems" class="ml-2" placeholder="What event are you planning?" :rules="[requiredInput]" />
          </v-col>

          <v-col cols="12" class="mt-3">
            <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1 font-500 px-2 pb-1">Date</v-row>
            <v-row no-gutters style="position: relative" class="px-2">
              <v-menu v-model="dateInput" :close-on-content-click="false" :nudge-right="40"
                transition="scale-transition" offset-y min-width="290px">
                <template #activator="{ props }">
                  <v-text-field dense v-model="details.date" readonly persistent-hint v-bind="props"
                    placeholder="Select Date" prepend-inner-icon="mdi-calendar-badge" variant="outlined"
                    :rules="[requiredInput]" hide-details @update:model-value="handleDateChange">
                  </v-text-field>
                </template>
                <v-date-picker v-model="date_calendar" @input="dateInput = false" show-adjacent-months elevation="24"
                  no-time @update:model-value="handleDateChange" :min="new Date().toISOString().substring(0, 10)"
                  placeholder="Select a date" :allowed-dates="getAllowedDates"></v-date-picker>
              </v-menu>
            </v-row>
          </v-col>

          <v-col cols="12" class="mt-3">
            <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1 font-500 px-2 pb-1">Time</v-row>
            <v-row no-gutters class="w-100 d-flex flex-column flex-sm-row ga-2 px-2">
              <v-col>
                <v-select v-model="details.from" prepend-inner-icon="mdi-clock-time-five-outline" variant="outlined"
                  dense hide-details :items="checkAllowedTimeFrom" item-title="label" item-value="value"
                  :disabled="!details.date" :rules="[requiredInput]" @update:model-value="handleTimeFromChange"
                  placeholder="Select time">
                </v-select>
              </v-col>
              <v-col>
                <v-select :disabled="!details.from" v-model="details.to"
                  prepend-inner-icon="mdi-clock-time-five-outline" variant="outlined" dense hide-details
                  :items="checkAllowedTimeTo" item-title="label" item-value="value" :rules="[requiredInput]"
                  placeholder="Select time" @update:model-value="handleCheckoutValueChange">
                </v-select>
              </v-col>
            </v-row>
            <v-col cols="12" v-if="isBelowMinimumHours">
              <v-card variant="outlined" color="orange" class="py-2 px-7">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-icon icon="mdi-alert-box" class="mr-3" size="20"></v-icon>
                    <span class="text-black">{{ minimumHours }} hours minimum</span>
                  </v-col>
                  <v-col cols="12">
                    <span class="text-black">The host is more likely to accept if your request meets
                      their minimum duration.</span>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-col>

          <v-col cols="12" class="mt-3">
            <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1 font-500 px-2 pb-1">Guests</v-row>
            <v-text-field type="number" min="1" v-model.number="details.guests" hide-details density="compact"
              variant="outlined" :items="tagsItems" class="ml-2" :rules="maxCapacityRules"
              @update:model-value="handleGuestValueChange" />
            <v-row no-gutters class="text-subtitle-2 mx-2 text-grey-darken-1">Maximum capacity of the space is
              {{ space?.guest_capacity?.maximum }}</v-row>
          </v-col>

          <v-col v-if="showComputation" cols="12" class="py-3 px-2">
            <v-divider class="my-3"></v-divider>
            <p v-if="withCustomOffer" class="text-error text-12px py-1" style="line-height: 1.2;">Warning: Editing a
              custom offer
              will reset the pricing computation based on the default pricing details</p>
            <EnquiryReviewOfferComputation :enquiry="enquiry" :space="space" :computed-data="computedOffer"
              :custom-offer="withCustomOffer" show-computation-only without-borders :loading="loadingComputation" />
          </v-col>

          <v-col cols="12" class="mt-5" align="end">
            <v-btn color="primary" @click="handleSave" type="submit">Save</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script setup lang="ts">
import MComputedOffer from "~/models/computed-offer.model";

const props = defineProps<({
  withCustomOffer?: boolean
  enquiry: TEnquiry
  space: TVenueSpace
})>()

const {
  allowedTime,
  allowedDatesChecker,
  checkTimesToFunction,
  space,
  timesFrom,
} = useSpace();

const { eventDetails: details, computePayment } = useEnquiry();
const { requiredInput } = useUtils();

const { tags } = useVenueData();

const showDialog = defineModel("show", { default: false });
const isBooked = defineModel("isBooked", { default: false });
const eventType = defineModel<string>("eventType", {
  required: true,
  default: "",
});
const eventDetails = defineModel<TComputedOffer>("eventDetails", {
  required: true,
});
const bookings = defineModel("bookings", { required: true });

const menu = ref("");
const updateKey = ref(0);
const formValid = ref(false);
const form = ref();
const showComputation = ref(false);
const loadingComputation = ref(false);
const computedOffer = ref<TComputedOffer>()


const dateInput = ref(false);
const date_calendar = ref<null | Date[]>(null);

const emit = defineEmits(["agree", "disagree", "recompute", "check-booking"]);

const tagsItems = computed(() => {
  const flattenedKeywords = Object.values(tags).flatMap((category) =>
    category.flatMap((item) => item.keywords),
  );

  const sortedKeywords = flattenedKeywords
    .slice()
    .sort((a, b) => a.localeCompare(b));
  return sortedKeywords;
});

const minimumHours = ref(0);

const isBelowMinimumHours = computed(() => {
  const getTimeKey = (timeValue: string) => {
    return timesFrom.find((t) => t.value == timeValue)?.key;
  };

  const startTimeKey = getTimeKey(details.value?.from);
  const endTimeKey =
    details.value?.to == "06:00" ? 49 : getTimeKey(details.value?.to);

  const hours = (endTimeKey - startTimeKey) * 0.5;

  const minHours = space.value?.pricing?.hire_fee?.minimum_booking_hours;

  if (minHours) {
    if (typeof minHours == "string") {
      let pattern = /\d+/;
      // Extract numerical values
      let num = parseInt(minHours.match(pattern)[0]);
      minimumHours.value = num;
      return hours < num;
    } else if (typeof minHours == "number") {
      minimumHours.value = minHours;
      return hours < minHours;
    }
  } else return false;
});

const dateConverter = (dateString: string) => {
  if (!dateString) return;

  const dd = dateString.slice(0, 2);
  const mm = dateString.slice(3, 5);
  const yyyy = dateString.slice(6, 10);

  return `${yyyy}-${mm}-${dd}`;
};

watch(details.value, (newVal) => {
  if (details.value.date) {
    date_calendar.value = [new Date(dateConverter(details.value.date))];
  }
});

const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

watch(date_calendar, () => {
  details.value.date = formattedDate.value;
});

const checkAllowedTimeFrom = computed(() => {
  if (!date_calendar.value || !date_calendar.value[0]) return [];
  return allowedTime(
    space.value.pricing,
    date_calendar.value[0],
    bookings.value,
  );
});

const checkAllowedTimeTo = computed(() => {
  if (!date_calendar.value || !date_calendar.value[0] || !details.value.from)
    return [];
  return checkTimesToFunction(
    space.value.pricing,
    date_calendar.value[0],
    details.value.from,
    bookings.value,
  );
});

function getAllowedDates(val: any) {
  return allowedDatesChecker(space.value.pricing, val);
}

const handleDateChange = () => {
  dateInput.value = false;
  details.value.from = null;
  details.value.to = null;
  isBooked.value = false;
  showComputation.value = false;
};

const handleTimeFromChange = () => {
  // details.value.to = null;


  const checkInTimeVal = details.value?.from
  const checkOutTimeVal = details.value?.to
  if (checkOutTimeVal && checkInTimeVal) {
    const checkInKey = timesFrom.find(x => x.value == checkInTimeVal)?.key
    const checkoutKey = timesFrom.find(x => x.value == checkOutTimeVal)?.key

    if (checkInKey && checkoutKey && checkInKey >= checkoutKey) {
      let newCheckoutKey = checkInKey + 1;
      const newCheckoutKeyObj = timesFrom.find(x => x.key == newCheckoutKey);
      if (newCheckoutKeyObj && newCheckoutKeyObj?.value && newCheckoutKeyObj?.props?.disabled == false) {
        details.value.to = newCheckoutKeyObj?.value || null;

      } else {
        details.value.to = null;
      }
    }
  }

  isBooked.value = false;
  showComputation.value = false;
  nextTick(async () => {
    await computePricing();
  })

};

const handleSave = async () => {
  await form.value!.validate();
  if (!formValid.value) return;
  eventDetails.value.date = details.value.date;
  eventDetails.value.from = details.value.from;
  eventDetails.value.to = details.value.to;
  eventDetails.value.guests = details.value.guests;
  eventType.value = details.value.event_type;
  emit("recompute");
  showDialog.value = false;
};

const maxCapacityRules = computed(() => {
  return [
    (v: number) => !!v || "Guests count is required",
    (v: number) => v > 0 || "Guests count is required",
    (v: number) => !isNaN(v) || "Guest capacity is not a number",
    (v: number) => v <= (Number(space.value?.guest_capacity?.maximum || 0)) || "Guest capacity exceeds maximum",
  ]
})

watch(showDialog, async () => {
  details.value.date = eventDetails.value?.date;
  details.value.from = eventDetails.value?.from;
  details.value.to = eventDetails.value?.to;
  details.value.guests = eventDetails.value?.guests;
  details.value.event_type = eventType.value;
  nextTick(async () => {
    await computePricing()
  })
})


// compute preview computation

const computePricing = async () => {

  const { date, guests, from, to } = details.value
  const spaceId = props.space?._id
  if (
    !from ||
    !to ||
    !guests ||
    !date || !spaceId
  ) {
    showComputation.value = false;
    return;
  }
  showComputation.value = true;
  try {
    const payload = {
      space_id: spaceId,
      date: date,
      time_start: from,
      time_end: to,
      guests,
    };
    loadingComputation.value = true;
    const res = await computePayment(payload);
    if (res) {
      computedOffer.value = new MComputedOffer(res);
      loadingComputation.value = false;
    }
  } catch (err) {
    console.log(err);
  }
}

const handleCheckoutValueChange = async () => {
  nextTick(async () => {
    await computePricing()
  })
}

let timeoutId: ReturnType<typeof setTimeout>;

const handleGuestValueChange = async () => {
  nextTick(async () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await computePricing();
    }, 300); // Adjust the delay as needed (1000ms = 1s)
  })
}


</script>
