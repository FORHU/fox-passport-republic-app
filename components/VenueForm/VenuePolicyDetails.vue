<template>
  <v-row no-gutters align="center">
    <div cols="3" class="mr-2 text-18px font-500" style="line-height: 0.8">
      Rules of the space
    </div>
    <v-col cols="12" sm="5" no-gutters justify="end"><span class="text-18px font-400" style="line-height: 1">(required
        for online payments)</span></v-col>
  </v-row>
  <v-row no-gutters class="my-3 w-100">Specify any regulations regarding guest conduct within the space.
    Customers must acknowledge and adhere to these rules when booking.
  </v-row>
  <v-row no-gutters class="w-100 my-3">
    <v-col cols="12" class="text-18px font-500">Sample Rules:</v-col>
    <ul class="ml-10">
      <li v-for="rule in rules" :key="rule" class="py-1">
        {{ rule }}
      </li>
    </ul>
  </v-row>
  <v-row no-gutters class="w-100 my-3">
    <v-col cols="12" class="text-18px font-500">Exclude:</v-col>

    <ul class="ml-10">
      <li>
        Cleaning Fee: The host is
        responsible for basic cleaning. If you impose a cleaning fee,
        ensure it is incorporated into your pricing.
      </li>
      <li class="py-1">
        Contracts: Please refrain from
        pasting your contract, cancellation policy, or liability policy.
      </li>
    </ul>

  </v-row>

  <v-row no-gutters class="w-100 my-3">
    <v-col cols="12" class="font-18px font-500">Enter rules of your space</v-col>
    <v-textarea v-model="venue.cancellation_policy.description" row-height="30" rounded="lg" rows="4" auto-grow
      :rules="textCountRules" class="pt-1"></v-textarea>
  </v-row>
  <v-row no-gutters class="mb-5">
    <v-col cols="12" class="font-500 text-18px">Cancellation policy:</v-col>
    <v-col cols="12" class="text-16px pt-2">
      Guests have the option to cancel their booking within 24 hours of
      confirmation (but no later than 48 hours before the event) to receive
      a full refund. Cancellations made after 24 hours (or less than 48
      hours before the event) will adhere to the selected cancellation
      policy below. Host-initiated cancellations are always eligible for a
      full refund.
    </v-col>
  </v-row>

  <v-row no-gutters class="w-100">
    <v-row class="w-100" no-gutters>
      <template v-for="item in cardPolicyArr" :key="item?.title">
        <v-col v-if="item.title !== 'Custom'" cols="12" class="py-2">
          <v-card class="rounded-lg pa-2 py-3" flat :ripple="false" :class="activeCard === item.key ? 'outline-selected' : 'outline-not-selected'
            " height="100%" @click="setActiveCard(item.key)">
            <v-row no-gutters class="w-100 d-flex ga-2 align-center">
              <span>
                <v-radio :model-value="activeCard == item.key" color="secondary" readonly
                  :disabled="mode === 'view'"></v-radio>
              </span>
              <v-col>
                <v-row no-gutters class="w-100 text-16px font-500 pb-1">{{ item.title }}</v-row>
                <template v-for="x in item.subtitle" :key="x">
                  <v-row no-gutters class="w-100 text-14px font-400">
                    {{ x }}
                  </v-row>
                </template>

              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- CUSTOM CARD -->
        <v-col v-if="item.title == 'Custom'" cols="12" class="py-2">
          <v-card class="rounded-lg pa-2" flat :ripple="false" :class="activeCard === item.key ? 'outline-selected' : 'outline-not-selected'" height="100%" @click="setActiveCard(item.key)">
            <v-row no-gutters class="w-100 d-flex ga-2 align-center">
              <span>
                <v-radio :model-value="activeCard == item.key" color="secondary" readonly :disabled="mode === 'view'"></v-radio>
              </span>
              <v-col>
                <v-row no-gutters class="w-100 text-16px font-500 pb-1">{{ item.title }}</v-row>
              </v-col>

              <!-- Horizontal Scroll Container for Mobile -->
              <div class="scrollable-container">
                <v-row no-gutters class="w-100" style="min-width: 900px">
                  <v-col cols="12" class="ml-3">
                    <v-row class="text-14px mt-1">
                      <v-col cols="6">
                        <v-row no-gutters style="max-width: 350px">NOTICE PERIOD FOR CANCELLATIONS (DAYS PRIOR TO THE EVENT)</v-row>
                      </v-col>
                      <v-col cols="6">
                        <v-row no-gutters style="max-width: 350px">CANCELLATION FEE PAYABLE TO THE VENUE</v-row>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="px-3">
                      <v-col cols="6" class="d-flex flex-row text-caption mt-5">
                        <span class="mt-2 mr-2">At least</span>
                        <v-responsive max-width="80">
                          <v-text-field min="0" type="number" v-model.number="venue.cancellation_policy.policy.custom.days_at_least.number_of_days" :rules="customInputRules" @update:model-value="updateOuterDaysAtLeast(venue.cancellation_policy.policy.custom.days_at_least.number_of_days)"></v-text-field>
                        </v-responsive>
                        <span class="mt-2 mx-2">days</span>
                      </v-col>
                      <v-col cols="6" class="d-flex flex-row text-caption mt-5">
                        <v-responsive max-width="90">
                          <v-text-field type="number" :min="0" :max="100" variant="outlined" v-model.number="venue.cancellation_policy.policy.custom.days_at_least.total_price" :rules="customInputRulesPercent"></v-text-field>
                        </v-responsive>
                        <span class="ml-2 mt-2">% of total hire cost (At least)</span>
                      </v-col>
                      <template v-for="(row, index) in venue.cancellation_policy.policy.custom.days_less_than_but_at_least" :key="index">
                        <v-divider v-if="index == 0" class="py-2"></v-divider>
                        <v-col cols="6" sm="6" class="d-flex flex-row text-caption mb-5">
                          <span class="mt-2 mr-1">Less than</span>
                          <v-responsive max-width="65">
                            <v-text-field :min="0" type="number" hide-details="true" :rules="customInputRules" v-model.number="venue.cancellation_policy.policy.custom.days_less_than_but_at_least[index].days_less_than" validate-on="submit" @update:model-value="updateInnerDaysLessThan(venue.cancellation_policy.policy.custom.days_less_than_but_at_least[index].days_less_than, index)"></v-text-field>
                          </v-responsive>
                          <span class="mt-2 ml-2 mr-1">days but at least</span>
                          <v-responsive max-width="65">
                            <v-text-field min="0" type="number" hide-details="true" :rules="customInputRules" v-model.number="venue.cancellation_policy.policy.custom.days_less_than_but_at_least[index].days_at_least" validate-on="submit" @update:model-value="updateInnerDaysAtLeast(venue.cancellation_policy.policy.custom.days_less_than_but_at_least[index].days_at_least, index)"></v-text-field>
                          </v-responsive>
                          <span class="mt-2 mx-2">days</span>
                        </v-col>
                        <v-col cols="6" sm="6" class="d-flex flex-row text-caption mb-5">
                          <v-responsive max-width="90">
                            <v-text-field type="number" :min="0" :max="100" variant="outlined" hide-details="true" :rules="customInputRulesPercent" v-model.number="venue.cancellation_policy.policy.custom.days_less_than_but_at_least[index].total_price" validate-on="submit"></v-text-field>
                          </v-responsive>
                          <span class="pl-2 mt-2">% of total hire cost (At least, Less than)</span>
                          <v-icon class="mt-2 mx-1" color="red" @click="removeRow(index)">mdi-trash-can-outline</v-icon>
                        </v-col>
                        <v-divider class="py-2"></v-divider>
                      </template>
                      <v-col cols="6" class="d-flex flex-row text-caption">
                        <span class="mt-2 mr-2 outer-days-less-than">Less than</span>
                        <v-responsive max-width="80">
                          <v-text-field min="0" type="number" v-model.number="venue.cancellation_policy.policy.custom.days_less_than.number_of_days" :rules="customInputRules" @update:model-value="updateOuterDaysLessThan(venue.cancellation_policy.policy.custom.days_less_than.number_of_days)"></v-text-field>
                        </v-responsive>
                        <span class="mt-2 mx-2">days</span>
                      </v-col>
                      <v-col cols="6" class="d-flex flex-row text-caption">
                        <v-responsive max-width="90">
                          <v-text-field type="number" :min="0" :max="100" variant="outlined" v-model.number="venue.cancellation_policy.policy.custom.days_less_than.total_price" :rules="customInputRulesPercent"></v-text-field>
                        </v-responsive>
                        <span class="ml-2 mt-2">% of total hire cost (Less than)</span>
                      </v-col>
                      <v-col cols="7" class=""></v-col>
                      <v-col cols="4" class="d-flex justify-start ml-2">
                        <v-btn color="secondary" variant="outlined" rounded="lg" class="mt-5" type="button" @click="addRow" v-if="venue.cancellation_policy.policy.custom.days_less_than_but_at_least.length < 3" text="add" width="200" :disabled="mode === 'view'" />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>
              
            </v-row>
            <v-row no-gutters class="text-white mx-3 mx-md-10 my-3" align="center" justify-content="center">
              <v-col cols="12" v-if="showCustomValidationDays" class="text-caption text-sm-subtitle-2" style="line-height: 1">
                <AlertSimpleText border-color="error" type="error" text="You have entered an invalid range of days." />
              </v-col>
              <v-col cols="12" v-if="showCustomValidationRates" class="mt-3 text-caption text-sm-subtitle-2" style="line-height: 1">
                <AlertSimpleText border-color="error" type="error" text="The cancellation fee should be higher for days nearer to the event date compared to days further away from the event." />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <!-- CUSTOM CARD -->
      </template>

    </v-row>
  </v-row>

  <v-row no-gutters class="w-100">
    <v-col cols="12" class="mt-10">
    <v-row>
      <v-col cols="12">
        <v-row no-gutters class="text-18px font-500">Do you allow rescheduling of events due to unforeseen
          circumstances?</v-row>

        <v-row no-gutters class="mt-2">

          <v-col cols="12" class="">
            <v-checkbox v-model="venue.cancellation_policy.allow_rescheduling.answer
              " :disabled="mode === 'view'" hide-details>
              <template v-slot:label>
                <v-row no-gutters class="ml-2 d-flex flex text-16px align-center" style="line-height:2;">
                  <span class="mr-1">Guest may move
                  </span>
                  <span class="mr-1">the event date
                  </span>
                  <span class="mr-1">of a confirmed
                  </span>
                  <span class="mr-1">booking to</span>
                  <span class="mr-1">another</span>
                  <span class="mr-1"> date within</span>

                    <v-text-field hide-details :rules="venue.cancellation_policy.allow_rescheduling.answer
                      ? [(v) => !!v || '']
                      : ''
                      " v-model.number="venue.cancellation_policy.allow_rescheduling.months
                        " type="number" :min="0" variant="underlined" style="display: inline-block; max-width: 70px ;" class="mx-2 mb-3" height="30"></v-text-field>
                  <span class="mr-1">months from</span>
                  <span class="mr-1">the original</span>
                  <span class="mr-1">date at no cost.</span>
                </v-row>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
  </v-row>
</template>
<script setup lang="ts">
const { country } = useLocal();
const { venue, mode, showCustomValidationDays, showCustomValidationRates } =
  useVenue();
const { requiredInput } = useUtils();
const highly_adaptable = ref(false);
const adaptable = ref(false);
const typical_30 = ref(false);
const typical_60 = ref(false);
const custom = ref(false);
const other = ref(false);
const reschedule = ref(false);
const rules = ref([
  "Smoking is prohibited indoors.",
  "External catering is permitted.",
  "Alcohol is not permitted after 8pm.",
]);
const textCountRules = computed(() => {
  return [
    (v) => !!v || "This field is required",
    (v) => v?.length <= 2000 || "Maximum of 2000 characters",
  ]
});
function setActiveCard(number: number) {
  if (mode.value === "view") return;
  activeCard.value = number;
  if (activeCard.value === 1) {
    // highly_adaptable.value = true;
    // adaptable.value = false;
    // typical_30.value = false;
    // typical_60.value = false;
    // custom.value = false;
    // other.value = false;
    venue.value.cancellation_policy.policy.cancellation_range = "VERY_FLEXIBLE";
    venue.value.cancellation_policy.policy.no_cancellation = false;
  } else if (activeCard.value === 2) {
    // highly_adaptable.value = false;
    // adaptable.value = true;
    // typical_30.value = false;
    // typical_60.value = false;
    // custom.value = false;
    // other.value = false;
    venue.value.cancellation_policy.policy.cancellation_range = "FLEXIBLE";
    venue.value.cancellation_policy.policy.no_cancellation = false;
  } else if (activeCard.value === 3) {
    // highly_adaptable.value = false;
    // adaptable.value = false;
    // typical_30.value = true;
    // typical_60.value = false;
    // custom.value = false;
    // other.value = false;
    venue.value.cancellation_policy.policy.cancellation_range = "STANDARD_30";
    venue.value.cancellation_policy.policy.no_cancellation = false;
  } else if (activeCard.value === 4) {
    // highly_adaptable.value = false;
    // adaptable.value = false;
    // typical_30.value = false;
    // typical_60.value = true;
    // custom.value = false;
    // other.value = false;
    venue.value.cancellation_policy.policy.cancellation_range = "STANDARD_60";
    venue.value.cancellation_policy.policy.no_cancellation = false;
  } else if (activeCard.value === 5) {
    // highly_adaptable.value = false;
    // adaptable.value = false;
    // typical_30.value = false;
    // typical_60.value = false;
    // custom.value = true;
    // other.value = false;
    venue.value.cancellation_policy.policy.cancellation_range = "CUSTOM";
    venue.value.cancellation_policy.policy.no_cancellation = false;
  } else if (activeCard.value === 6) {
    // highly_adaptable.value = false;
    // adaptable.value = false;
    // typical_30.value = false;
    // typical_60.value = false;
    // custom.value = false;
    // other.value = true;
    venue.value.cancellation_policy.policy.cancellation_range = "OTHER";
    venue.value.cancellation_policy.policy.no_cancellation = true;
  } 
}

const setActiveOption = () => {
  if (
    venue.value.cancellation_policy.policy.cancellation_range ===
    "VERY_FLEXIBLE"
  ) {
    highly_adaptable.value = true;
    return 1;
  } else if (
    venue.value.cancellation_policy.policy.cancellation_range === "FLEXIBLE"
  ) {
    adaptable.value = true;
    return 2;
  } else if (
    venue.value.cancellation_policy.policy.cancellation_range === "STANDARD_30"
  ) {
    typical_30.value = true;
    return 3;
  } else if (
    venue.value.cancellation_policy.policy.cancellation_range === "STANDARD_60"
  ) {
    typical_60.value = true;
    return 4;
  } else if (
    venue.value.cancellation_policy.policy.cancellation_range === "CUSTOM"
  ) {
    custom.value = true;
    return 5;
  } else if (venue.value.cancellation_policy.policy.no_cancellation === true) {
    other.value = true;
    return 6;
  } else {
    highly_adaptable.value = true;
    return 1;
  }
};
const activeOption = computed(() => setActiveOption());
const activeCard = ref<number>(setActiveOption() as number);

watch(
  venue,
  () => {
    activeCard.value = activeOption.value;
  },
  { immediate: true },
);
function addRow() {
  if (
    venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least
      .length < 3
  ) {
    venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least.push(
      {
        days_less_than: null,
        days_at_least: null,
        total_price: null,
      },
    );
  }
  venue.value.cancellation_policy.policy.custom.days_less_than.number_of_days =
    null;
}
function removeRow(index) {
  venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least.splice(
    index,
    1,
  );
  venue.value.cancellation_policy.policy.custom.days_less_than.number_of_days =
    null;
}

const customRequireRulesInput = computed(() => {
  return [(v) => !!v || ""]
});

watchEffect(() => {
  const policy = venue.value.cancellation_policy.policy;
  // if (policy.cancellation_range !== "CUSTOM") {
  //   venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least = []
  // }
});

const updateOuterDaysAtLeast = (days: number | null) => {
  const policyObj = venue.value?.cancellation_policy?.policy;
  const daysAtLeast = policyObj?.custom.days_at_least?.number_of_days || null;
  const arr =
    venue.value?.cancellation_policy?.policy?.custom?.days_less_than_but_at_least;
  if (arr && arr.length > 0) {
    venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least[0].days_less_than =
      daysAtLeast;
  } else {
    venue.value.cancellation_policy.policy.custom.days_less_than.number_of_days =
      daysAtLeast;
  }
};

const updateInnerDaysAtLeast = (days: number | null, index: number) => {
  const policyObj = venue.value?.cancellation_policy?.policy;
  const arr =
    venue.value?.cancellation_policy?.policy?.custom?.days_less_than_but_at_least;
  if (arr && arr.length > 0) {
    if (index == arr.length - 1) {
      venue.value.cancellation_policy.policy.custom.days_less_than.number_of_days =
        days;
    } else {
      venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least[
        index + 1
      ].days_less_than = days;
    }
  }
};

const updateInnerDaysLessThan = (days: number | null, index) => {
  const arr =
    venue.value?.cancellation_policy?.policy?.custom?.days_less_than_but_at_least;
  if (arr && arr.length > 0) {
    if (index == 0) {
      venue.value.cancellation_policy.policy.custom.days_at_least.number_of_days =
        days;
    } else {
      venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least[
        index - 1
      ].days_at_least = days;
    }
  }
};

const updateOuterDaysLessThan = (days: number | null) => {
  const policyObj = venue.value?.cancellation_policy?.policy;
  const daysLessThan = policyObj?.custom.days_less_than?.number_of_days || null;
  const arr =
    venue.value?.cancellation_policy?.policy?.custom?.days_less_than_but_at_least;

  if (arr && arr.length > 0) {
    venue.value.cancellation_policy.policy.custom.days_less_than_but_at_least[
      arr.length - 1
    ].days_at_least = daysLessThan;
  } else {
    venue.value.cancellation_policy.policy.custom.days_at_least.number_of_days =
      daysLessThan;
  }
};

if (venue.value.cancellation_policy.allow_rescheduling.answer) {
  reschedule.value = true;
}

const customInputRules = computed(() => {
  return venue.value.cancellation_policy.policy.cancellation_range === "CUSTOM"
    ? [(v) => !!v || ""]
    : [];
});

const customInputRulesPercent = computed(() => {
  return venue.value.cancellation_policy.policy.cancellation_range === "CUSTOM"
    ? [(v) => (!!v || v == 0 ) || "Required", (v) => v < 101 || "Max 100", (v) => v >= 0 || '' ]
    : [];
});


const cardPolicyArr = ref([
  {
    title: 'Highly Adaptable',
    subtitle: [
      'Cancellations made within 24 hours of the event start time will be refunded in full.',
    ],
    key: 1,
  },
  {
    title: 'Adaptable',
    subtitle: [
      'Cancellations 7 days in advance will receive a full refund.',
      'Cancellations 7 days to 24 hours in advance will receive a 50% refund.',
      'Cancellations for events starting within 24 hours are non-refundable'
    ],
    key: 2,
  },
  {
    title: 'Typical 30-day',
    subtitle: [
      'Cancellations made 30 days in advance will be refunded in full.',
      'Cancellations 30 days to 7 days in advance will receive a 50% refund.',
      'Cancellations for events starting within 7 days are non-refundable.'
    ],
    key: 3,
  },
  {
    title: 'Typical 60-day',
    subtitle: [
      'Cancellations 60 days in advance will be refunded in full.',
      'Cancellations 60 days to 30 days in advance will receive a 50% refund.',
      'Cancellations for events starting within 30 days are non-refundable.'
    ],
    key: 4,
  },
  {
    title: 'Custom',
    subtitle: [],
    key: 5,
  },
  {
    title: 'Other',
    subtitle: ['None of the cancellation policies can be applied to my venue.'],
    key: 6,
  },
])
</script>

<style scoped>
.outline-selected {
  border: 2px solid rgba(var(--v-theme-secondary));
}

.outline-not-selected {
  border: 2px solid rgba(var(--v-theme-light_gray_secondary));
}

.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}

.scrollable-container {
  overflow-x: auto;
  white-space: nowrap;
}

@media (min-width: 900px) { 
  .scrollable-container {
    overflow-x: hidden; 
  }
}
</style>
