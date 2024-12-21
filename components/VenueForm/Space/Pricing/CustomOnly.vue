<template>
  <v-row no-gutters class="w-100">
    <v-row no-gutters class="w-100">
      <v-col cols="12">
        <h2 class="mb-3 mt-10 text-18px font-500">Pricing options</h2>
      </v-col>
    </v-row>

    <!-- HIRE FEE PLUS PACK PER PERSON -->
    <template v-for="(pricingItem, qIndex) in pricingArray" :key="qIndex">
      <v-row no-gutters class="w-100">
        <v-col cols="12" sm="12" md="8" lg="8" class="d-flex flex-wrap align-center">
          <v-checkbox :disabled="mode == 'view'" color="secondary" v-model="checkedItems" :value="pricingItem.type"
            style="height: 55px" @update:model-value="updatePayload"></v-checkbox>
          <span class="text-18px py-0 my-auto font-500">{{
            pricingArray.find((x) => x.type == pricingItem.type)?.title
          }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters v-if="showPricing(pricingItem.type)">
        <v-col cols="12" class="">
          <v-row no-gutters>
            <v-col cols="12" class="d-flex flex-column"> </v-col>
          </v-row>
          <div v-for="(item, index) in pricingItem.prices" :key="index" style="position: relative">
            <v-divider v-if="index !== 0" class="my-5"></v-divider>
            <v-icon class="d-flex justify-center align-center" style="position: absolute; right: 2%; top: 2%"
              v-if="pricingItem.prices.length > 1 && mode !== 'view' && index > 0" icon="mdi-trash-can-outline"
              @click="handleDeleteRow(pricingItem.type, index)"></v-icon>
            <v-row no-gutters style="max-width: 915px">
              <v-col cols="12" sm="4" md="4" lg="4">
                <v-row no-gutters>
                  <v-col cols="12" class="d-flex align-center">
                    <span class="text-16px font-500 ml-2">Price</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="text-14px pl-2">{{
                      pricingItem.type == "PACKAGE_FEE"
                        ? "Pack. per person from:"
                        : "Hire fee from:"
                    }}</span>
                    <v-text-field :disabled="mode == 'view'" v-model.number="item.price" :prefix="currencySymbol" type="number"
                      :suffix="withGST ? 'inc. GST' : ''" persistent-placeholder class="px-2 my-input"
                      variant="outlined" rounded="lg" color="charcoal" base-color="charcoal" :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]" style="max-width: 300px;"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="pricingItem.type == 'HIRE_FEE_MINIMUM_SPEND'" cols="12" sm="6" md="4" lg="4"
                :style="{ marginTop: '22px' }">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="text-14px pl-2">Minimum spend:</span>
                    <v-text-field :disabled="mode == 'view'" type="number" v-model.number="item.minimum_spend"
                      :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''" persistent-placeholder
                      class="px-2 my-input" variant="outlined" rounded="lg" color="charcoal" base-color="charcoal"
                      :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]" style="max-width: 300px;"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <v-col v-if="pricingItem.type == 'HIRE_FEE_PACKAGE_FEE'" cols="12" sm="4" md="4" lg="4"
                :style="{ marginTop: '22px' }">
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="text-14px pl-2">Package per person:</span>
                    <v-text-field :disabled="mode == 'view'" v-model.number="item.package_per_person" type="number"
                      :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''" persistent-placeholder
                      class="px-2 my-input" variant="outlined" rounded="lg" color="charcoal" base-color="charcoal"
                      :rules="[
                        (v) => !!v || 'Field is required',
                        (v) => !isNaN(v) || 'Input number only',
                      ]" style="max-width: 300px;"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="4" md="4" lg="4" style="min-width: 150px">
                <v-row no-gutters>
                  <v-col cols="12" class="d-flex align-center">
                    <span class="text-16px font-500 ml-2">Duration</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="text-14px pl-2"></span>
                    <v-select :disabled="mode == 'view'" v-model="item.duration" :items="durationSelect"
                      class="px-2 my-input" variant="outlined" rounded="lg" color="charcoal" base-color="charcoal"
                      :rules="[(v) => !!v || 'Field is required']" style="max-width: 300px;"></v-select>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-row no-gutters>
                  <v-col cols="12" class="d-flex align-center">
                    <span class="text-16px font-500 ml-2">Time</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" sm="4" md="4">
                    <span class="text-14px pl-2">From:</span>
                    <v-select :disabled="mode == 'view'" v-model="item.time.from" :items="timesFromFiltered"
                      item-title="label" item-value="value" placeholder="Select time" class="px-2 rounded-xl my-input"
                      variant="outlined" rounded="lg" color="charcoal" base-color="charcoal" :rules="[requiredInput]"
                      @update:model-value="updateTime(index, pricingItem.type)" style="max-width: 300px;"></v-select>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <span class="text-14px pl-2">To:</span>
                    <v-select :disabled="mode == 'view'" v-model="item.time.to" :items="timesTo(item.time.from)"
                      item-title="label" item-value="value" placeholder="Select time" class="px-2 rounded-xl my-input"
                      variant="outlined" rounded="lg" color="charcoal" base-color="charcoal"
                      :rules="[requiredInput]" style="max-width: 300px;"></v-select>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-chip-group v-model="item.weekdays" multiple column selected-class="bg-secondary" class="d-flex">
                  <v-row no-gutters align="center">
                    <v-col cols="12">
                      <v-row no-gutters>
                        <v-col cols="12" align="start">
                          <span class="text-16px font-500 ml-2">Week/Days</span>
                        </v-col>
                        <v-col cols="12" align="start">
                          <v-chip v-for="x in days" :key="x" :text="x.name" :value="x.value" size="small" variant="outlined" class="border-thin font-400 text-16px px-5 py-4"></v-chip>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-chip-group>
              </v-col>
              <v-col v-if="
                checkTimeError(
                  pricingItem.type as TCustomPricingType,
                  item.duration,
                  item.time.from,
                  item.time.to,
                )
              " cols="12" class="mt-3 text-14px text-sm-subtitle-2" style="line-height: 1">
                <AlertSimpleText border-color="error" type="error"
                  text="The hours set do not correspond to the selected duration. Please use session or day." />
              </v-col>
              <v-col v-if="
                checkOverlapError(
                  pricingItem.type as TCustomPricingType,
                  item.weekdays,
                  item.duration,
                  item.time.from,
                  item.time.to,
                )
              " cols="12" class="mt-3 text-14px text-sm-subtitle-2" style="line-height: 1">
                <AlertSimpleText border-color="error" type="error"
                  text="Hours selected for some pricing rows overlap with each other. Please update the hours or select a different day of the week so that they don’t overlap." />
              </v-col>
              <v-col v-if="
                checkWeekdaysError(
                  item.type,
                  item.price,
                  item.minimum_spend,
                  item.package_per_person,
                  item.weekdays,
                  item.duration,
                )
              " cols="12" class="mt-3 text-14px text-sm-subtitle-2" style="line-height: 1">
                <AlertSimpleText border-color="error" type="error" text="Please select at least one day." />
              </v-col>
            </v-row>
            <v-row no-gutters> </v-row>
          </div>
        </v-col>
        <v-row no-gutters>
          <v-col cols="12" class="d-flex">
            <v-btn color="secondary" variant="outlined" rounded="lg" border="secondary sm"   @click="addObject(pricingItem.type)" :disabled="mode == 'view'" class="my-5 mb-10">
              Add Row
            </v-btn>
          </v-col>
        </v-row>
      </v-row>
    </template>



    <v-row no-gutters class="mt-10 w-100">
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
              <v-text-field :readonly="mode == 'view'" type="number" min="1" v-model.number="space.pricing.cleaning_fee"
                persistent-placeholder :prefix="currencySymbol" :suffix="withGST ? 'inc. GST' : ''" rounded="lg"
                color="charcoal" base-color="charcoal" class="" :rules="[requiredInput, requiredNumber, requiredGreaterThanZero
                ]" style="max-width: 300px;"></v-text-field>
            </span>
          </v-row>
        </v-col>
  </v-row>

    <v-row no-gutters class="mt-5 w-100">
      <v-col cols="12" class="mt-5 pr-3 pl-2">
        <span class="text-18px font-500" style="line-height: 1.2;">Do you allow clients to organize events outside regular
          private hire
          hours?</span>

        <v-row no-gutters>
          <v-col cols="12" class="d-flex align-center">
            <v-radio-group v-model="space.pricing.custom_price.opening_hours_private_hour">
              <v-radio class="text-14px py-0 font-400 text-secondary"
                label="Yes, we are flexible about enquiries outside our private hire hours." :value="true"></v-radio>
              <v-radio class="text-14px py-0  font-400 text-secondary"
                label="No, our private hire hours are fixed and we cannot accept off-hour bookings."
                :value="false"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-10 w-100">
      <v-col cols="12" class="mb-4">
        <span class="my-2 text-18px font-500">Pricing Details</span>
      </v-col>
      <v-col cols="12" class="px-1">
        <span class="mt-2 text-16px font-500">How flexible is your pricing?
        </span>
        <v-select v-model="space.pricing.custom_price.flexible_pricing_description" variant="outlined" rounded="lg"
          color="charcoal" base-color="charcoal" :items="[
            'Our prices are set at',
            'Prices are negotiable in certain cases',
            'Prices are open to negotiation',
          ]" :rules="[(v) => !!v || 'Field is required']" class="pt-1"></v-select>
      </v-col>
      <v-col cols="12" class="px-1">
        <span class="mt-2 text-16px font-500">Pricing comment (optional)</span>
        <v-textarea v-model="space.pricing.custom_price.pricing_description" variant="outlined" rounded="lg"
          color="charcoal" base-color="charcoal" counter no-resize :rows="smAndUp ? 4 : 8" class="pt-1" auto-grow></v-textarea>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="px-1">
        <span class="mt-2 text-16px font-500">Sample of catering prices - for Minimum Spend & Hire Free venue
          (Optional)</span>
        <v-textarea v-model="space.pricing.custom_price.catering_prices_description" variant="outlined" rounded="lg"
          color="charcoal" base-color="charcoal" counter no-resize :rows="smAndUp ? 4 : 8" class="pt-1" auto-grow></v-textarea>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="px-1">
        <span class="mt-2 text-16px font-500">Package per person - describe the package, what it includes and
          the
          price per person (Optional)</span>
        <v-textarea v-model="space.pricing.custom_price.package_per_person_description" variant="outlined" rounded="lg"
          color="charcoal" base-color="charcoal" counter no-resize :rows="smAndUp ? 4 : 8" class="pt-1" auto-grow></v-textarea>
      </v-col>
    </v-row>
  </v-row>
</template>

<script setup lang="ts">
// IMPORT
const { timesFrom } = useSpace();
const { requiredInput, requiredNumber, requiredGreaterThanZero } = useUtils();
const { mode } = useVenue();
const { getCurrencySymbol, country } = useLocal();
const { checkTimeError, checkOverlapError, checkWeekdaysError } =
  usePricingValidation();
import { useDisplay } from "vuetify";
const { smAndUp } = useDisplay();
const { currentUser } = useLocalAuth();
const { withGST } = useTax();

const currencyCode = computed(() => {
  return space?.value?.pricing?.currency;
});

const currencySymbol = computed(() => {
  return getCurrencySymbol(space?.value?.pricing?.currency);
});

const space = defineModel<TVenueSpace>({ required: true });
const cleaning_feeSwitch = ref(false);

const durationSelect = ref([
  "Per session",
  "Per morning",
  "Per afternoon",
  "Per evening",
  "Per day",
]);

const days = ref([
  {
    name: "Sun",
    value: "SUNDAY",
  },
  {
    name: "Mon",
    value: "MONDAY",
  },
  {
    name: "Tue",
    value: "TUESDAY",
  },
  {
    name: "Wed",
    value: "WEDNESDAY",
  },
  {
    name: "Thu",
    value: "THURSDAY",
  },
  {
    name: "Fri",
    value: "FRIDAY",
  },
  {
    name: "Sat",
    value: "SATURDAY",
  },
]);

const timesFromFiltered = computed(() => {
  return timesFrom.filter((x) => x.key !== 49);
});

const timesTo = (startTime: string) => {
  if (!startTime || startTime == "") return;
  const startIndex = timesFrom.findIndex((time) => time.value === startTime);

  return [
    ...timesFrom.slice(startIndex + 1, timesFrom.length),
    // { label: "06:00am", value: "06:00" },
  ];
};

const updateTime = (mIndex: number, type: TCustomPricingType) => {
  const qIndex = pricingArray.value.findIndex((x) => x.type == type);

  if (qIndex == -1) return;
  let dateFromValue;
  let dateToValue;

  dateFromValue = pricingArray.value[qIndex].prices[mIndex].time.from;
  dateToValue = pricingArray.value[qIndex].prices[mIndex].time.to;

  const indexFrom = timesFrom.findIndex((x) => x.value == dateFromValue);
  const indexTo = timesFrom.findIndex((x) => x.value == dateToValue);

  if (indexFrom >= indexTo) {
    if (indexFrom !== -1 && dateFromValue !== "05:30") {
      pricingArray.value[qIndex].prices[mIndex].time.to =
        timesFrom[indexFrom + 1].value;
    }
    if (dateFromValue === "05:30") {
      pricingArray.value[qIndex].prices[mIndex].time.to = "06:00";
    }
  }
};

// cleaning fee watchEffect

watchEffect(() => {
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

type TPricingObject = {
  title: string;
  type: TCustomPricingType;
  prices: TPricesObject[];
};

type TPricesObject = {
  price: null | number;
  package_per_person?: null | number;
  minimum_spend?: null | number;
  duration: null | string;
  time: { from: string; to: string };
  weekdays: string[] | [];
  type: TCustomPricingType;
};

// REVAMPED CODE
const checkedItems = ref<TCustomPricingType[]>([]);

const showPricing = (type: TCustomPricingType) => {
  if (checkedItems.value.length > 0) {
    const index = checkedItems.value.findIndex((x) => x == type);
    return index !== -1;
  } else return false;
};

const pricingArray = ref<TPricingObject[]>([
  {
    title: "Minimum Spend",
    type: "MINIMUM_SPEND",
    prices: [
      {
        price: null,
        duration: null,
        time: { from: "06:00", to: "06:30" },
        weekdays: [],
        type: "MINIMUM_SPEND",
      },
    ],
  },
  {
    title: "Hire Fee",
    type: "HIRE_FEE",
    prices: [
      {
        price: null,
        duration: null,
        time: { from: "06:00", to: "06:30" },
        weekdays: [],
        type: "HIRE_FEE",
      },
    ],
  },
  {
    title: "Package per Person",
    type: "PACKAGE_FEE",
    prices: [
      {
        price: null,
        duration: null,
        time: { from: "06:00", to: "06:30" },
        weekdays: [],
        type: "PACKAGE_FEE",
      },
    ],
  },
  {
    title: "Hire Fee +  Minimum Spend",
    type: "HIRE_FEE_MINIMUM_SPEND",
    prices: [
      {
        price: null,
        minimum_spend: null,
        duration: null,
        time: { from: "06:00", to: "06:30" },
        weekdays: [],
        type: "HIRE_FEE_MINIMUM_SPEND",
      },
    ],
  },
  {
    title: "Hire Fee + Package per Person",
    type: "HIRE_FEE_PACKAGE_FEE",
    prices: [
      {
        price: null,
        package_per_person: null,
        duration: null,
        time: { from: "06:00", to: "06:30" },
        weekdays: [],
        type: "HIRE_FEE_PACKAGE_FEE",
      },
    ],
  },
]);

const addObject = (type: TCustomPricingType) => {
  const index = pricingArray.value.findIndex((x) => x.type == type);
  if (index === -1) return;

  const emptyObject = {
    price: null,
    duration: null,
    time: { from: "06:00", to: "06:30" },
    weekdays: [],
  };
  const emptyObject1 = {
    price: null,
    minimum_spend: null,
    duration: null,
    time: { from: "06:00", to: "06:30" },
    weekdays: [],
    type: "HIRE_FEE_MINIMUM_SPEND",
  };
  const emptyObject2 = {
    price: null,
    package_per_person: null,
    duration: null,
    time: { from: "06:00", to: "06:30" },
    weekdays: [],
    type: "HIRE_FEE_PACKAGE_FEE",
  };
  if (type == "HIRE_FEE_MINIMUM_SPEND") {
    pricingArray.value[index].prices.push(emptyObject1 as TPricesObject);
  } else if (type == "HIRE_FEE_PACKAGE_FEE") {
    pricingArray.value[index].prices.push(emptyObject2 as TPricesObject);
  } else {
    emptyObject.type = type;
    pricingArray.value[index].prices.push(emptyObject as TPricesObject);
  }
};

const handleDeleteRow = (type: TCustomPricingType, index: number) => {
  const qIndex = pricingArray.value.findIndex((x) => x.type == type);
  if (qIndex === -1) return;

  pricingArray.value[qIndex].prices.splice(index, 1);
};

// catch existing data

onMounted(() => {
  const arr = space.value.pricing.custom_price?.prices;
  if (!arr) return;

  let minSpendArr = [];
  let hireFeeArr = [];
  let packageFeeArr = [];
  let hireFeeMinSpendArr = [];
  let hireFeePackageFeeArr = [];

  arr.forEach((item) => {
    let type = item.type;
    const index = pricingArray.value.findIndex((x) => x.type == type);
    if (index === -1) return;
    if (type == "MINIMUM_SPEND") {
      minSpendArr.push(item);
      if (!checkedItems.value.includes(type)) {
        checkedItems.value.push(type);
      }
      pricingArray.value[index].prices = minSpendArr;
    }

    if (type == "HIRE_FEE") {
      hireFeeArr.push(item);
      if (!checkedItems.value.includes(type)) {
        checkedItems.value.push(type);
      }
      pricingArray.value[index].prices = hireFeeArr;
    }

    if (type == "PACKAGE_FEE") {
      packageFeeArr.push(item);
      if (!checkedItems.value.includes(type)) {
        checkedItems.value.push(type);
      }
      pricingArray.value[index].prices = packageFeeArr;
    }

    if (type == "HIRE_FEE_MINIMUM_SPEND") {
      hireFeeMinSpendArr.push(item);
      if (!checkedItems.value.includes(type)) {
        checkedItems.value.push(type);
      }
      pricingArray.value[index].prices = hireFeeMinSpendArr;
    }

    if (type == "HIRE_FEE_PACKAGE_FEE") {
      hireFeePackageFeeArr.push(item);
      if (!checkedItems.value.includes(type)) {
        checkedItems.value.push(type);
      }
      pricingArray.value[index].prices = hireFeePackageFeeArr;
    }
  });
});

// watch changes

watch(pricingArray.value, (newVal) => {
  updatePayload();
});

const updatePayload = () => {
  space.value.pricing.custom_price.prices = pricingArray.value
    .filter((x) => checkedItems.value.includes(x.type))
    .flatMap((item) => item.prices);
};
</script>

<style scoped>
/* .my-input:deep().v-input__control .v-field {
  border-radius: 10px;
  box-shadow: 0px 4px 2px 0px rgb(158, 158, 158);
} */

.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

/* vuetify checkbox label */
.v-radio :deep(.v-label) {
  opacity: 1 !important;
}
</style>
