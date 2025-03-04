<template>

  <v-row v-if="loading" no-gutters class="pa-3">
    <v-skeleton-loader class="mx-auto w-100" height="70"  type="text@3"></v-skeleton-loader>
  </v-row>

  <v-card v-else flat :border="!withoutBorders ? 'secondary md' : false" rounded="lg" width="100%"
    class="text-secondary" :class="withoutBorders ? '' : 'pa-7'">
    <v-row justify="end" class="mb-2"><v-icon v-if="closeButton" icon="mdi-close" size="30" class="cursor-pointer"
        @click="emit('close-dialog')"></v-icon></v-row>
    <v-row v-if="!showComputationOnly" no-gutters class="d-flex align-center ga-3 flex-nowrap">
      <div>
        <v-img :src="featuredImage(space)" height="81px" width="81px" cover rounded="lg" :alt="space?.name + '-featured-image'"></v-img>
      </div>
      <div class="pl-3">
        <v-row class="font-500 text-16px text-hover hover-underlined text-secondary" @click="emit('go-to-space')">{{
          sliceContent(space?.name, 30) }}</v-row>
        <v-row class="text-16px text-charcoal">{{ sliceContent(space.venue?.name as string, 30) }}</v-row>
        <!-- <v-row class="text-16px text-charcoal">
          <v-icon icon="mdi-star" color="#FBBC05" class="mr-1"></v-icon>
          5.0 (423 reviews)
        </v-row> -->
      </div>
    </v-row>
    <v-row no-gutters v-if="computedData">
      <v-divider v-if="!showComputationOnly" class="my-3"></v-divider>
      <v-row v-if="!hidePriceDetailsLabel" no-gutters class="text-18px w-100 font-500 mb-2">Price Details</v-row>

      <!-- With Custom Offer -->
      <v-row v-if="!computedData?.type || !computedData?.computation_used" no-gutters class="text-16px">
        <v-col v-if="customOffer" cols="12" class="d-flex justify-space-between ga-2">
          <span>Custom Offer Amount ({{ totalHours }} {{ totalHours > 1 ? 'hours' : 'hour'
            }})</span>
          <span>{{ rentalAmount }}</span>
        </v-col>
        <v-col v-else cols="12" class="d-flex justify-space-between ga-2">
          <span>Rental Amount ({{ totalHours }} {{ totalHours > 1 ? 'hours' : 'hour'
            }})</span>
          <span>{{ rentalAmount }}</span>
        </v-col>
        <v-col v-if="cleaningFeeAmount" cols="12" class="d-flex justify-space-between ga-2">
          <span>Cleaning Fee</span>
          <span>{{ cleaningFeeAmount }}</span>
        </v-col>
        <v-col v-if="rebateAmount" cols="12" class="d-flex justify-space-between ga-2">
          <span>Platform Rebate</span>
          <span>- {{ rebateAmount }}</span>
        </v-col>
        <v-divider class="my-3" />
        <v-col cols="12" class="d-flex justify-space-between ga-2 font-700 text-18px">
          <span class="">Total</span>
          <span class="">{{
            userGrandTotalAmount
            }}</span>
        </v-col>
        <v-col cols="12" class="d-flex justify-end text-grey ga-2">
          <span>{{ withGST ? '(GST included)' : '' }}</span>
        </v-col>
      </v-row>
      <!-- With Custom Offer -->

      <!-- NEW COMPUTATION -->
      <v-row v-else no-gutters class="text-16px">
        <v-col v-if="computedData?.type == 'HIRE_FEE' && computedData.computation_used == 'PER_HOUR'" cols="12"
          class="d-flex justify-space-between ga-2">
          <span>{{ baseRate }} x ({{ totalHours }} {{ totalHours > 1 ? 'hours' : 'hour'
            }})</span>
          <span>{{ rentalAmount }}</span>
        </v-col>
        <v-col v-if="computedData?.type == 'HIRE_FEE' && computedData.computation_used == 'PER_DAY'" cols="12"
          class="d-flex justify-space-between ga-2">
          <span>{{ rentalAmount }} per day</span>
          <span>{{ rentalAmount }}</span>
        </v-col>

        <v-col v-if="computedData?.type == 'CUSTOM_PRICE'" cols="12" class="d-flex justify-space-between ga-2">
          <span>{{ rentalAmount }} <span v-if="customDuration">{{ customDuration }}</span></span>
          <span>{{ rentalAmount }}</span>
        </v-col>
        <v-col v-if="cleaningFeeAmount" cols="12" class="d-flex justify-space-between ga-2">
          <span>Cleaning Fee</span>
          <span>{{ cleaningFeeAmount }}</span>
        </v-col>
        <v-col v-if="rebateAmount" cols="12" class="d-flex justify-space-between ga-2">
          <span>Platform Rebate</span>
          <span>- {{ rebateAmount }}</span>
        </v-col>
        <v-divider class="my-3" />
        <v-col cols="12" class="d-flex justify-space-between ga-2 font-700 text-18px">
          <span class="">Total</span>
          <span class="">{{
            userGrandTotalAmount
            }}</span>
        </v-col>
        <v-col cols="12" class="d-flex justify-end text-grey ga-2">
          <span>{{ withGST ? '(GST included)' : '' }}</span>
        </v-col>
      </v-row>
      <!-- NEW COMPUTATION -->

    </v-row>


  </v-card>
</template>

<script setup lang="ts">
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { featuredImage, timesFrom } = useSpace();
const { withGST } = useTax();

const props = defineProps<{
  space: TVenueSpace;
  closeButton?: boolean;
  customOffer?: boolean;
  withoutBorders?: boolean;
  hidePriceDetailsLabel?: boolean;
  showComputationOnly?: boolean;
  computedData?: TComputedOffer;
  loading?: boolean;
}>();


const spaceImageArray = computed(() => {
  if (props.space.space_photo) {
    return props.space.space_photo.map((x: TVenueSpace) => x.path);
  } else {
    return [];
  }
});

const emit = defineEmits(["close-dialog", "go-to-space"]);

const currencySymbol = computed(() => {
  const currency = props.computedData?.currency;
  if (currency) {
    return getCurrencySymbol(currency);
  } else return "";
});



// CUSTOMER COMPUTATION

const rentalAmount = computed(() => {
  const user = props.computedData?.payment_computation?.user;
  const user_subtotal = user?.subtotal
  if (!user_subtotal) return "";
  const result = Number(user_subtotal).toFixed(2);
  return currencySymbol.value + " " + result;
});

// base rate
const baseRate = computed(() => {
  const user = props.computedData?.payment_computation?.user;
  const user_subtotal = user?.subtotal

  const base_rate = user?.base_rate

  if (!user_subtotal && !base_rate) return "";
  // fall back incase no base_rate value
  const result = Number(Number(user_subtotal) / totalHours.value).toFixed(2);

  return currencySymbol.value + " " + (base_rate ? base_rate : result);
})

const cleaningFeeAmount = computed(() => {
  const user = props.computedData?.payment_computation?.user;
  const cleaning_fee = user?.cleaning_fee
  if (!cleaning_fee) return "";
  const result = Number(cleaning_fee).toFixed(2);
  return currencySymbol.value + " " + result;
});



const rebateAmount = computed(() => {
  const user = props.computedData?.payment_computation?.user;
  const user_subtotal = user?.subtotal;
  const rebate = user?.rebate;
  if (!user_subtotal || !rebate) return "";
  const result = (Number(user_subtotal) * (Number(rebate) || 0)).toFixed(2);
  return currencySymbol.value + " " + result;
});

const userGrandTotalAmount = computed(() => {
  const user = props.computedData?.payment_computation?.user;
  const user_grand_total = user?.grand_total;
  if (!user_grand_total) return "";
  const result = Number(user_grand_total).toFixed(2);
  return currencySymbol.value + " " + result;
});

const sliceContent = (content: string, max?: number) => {
  const maxNum = max || 30
  if (content.length > maxNum) {
    return content.slice(0, maxNum) + '...';
  } else return content;
}

// const { payment_computation, currency, from, to, type, computation_used } = computedOffer.value;

//   const fromKey = timesFrom.find(x => x.value == from)?.key
//   const toKey = timesFrom.find(x => x.value == to)?.key
//   let totalHours = 0

//   if (fromKey && toKey) {
//     totalHours = (toKey - fromKey) * 0.5
//   }



//   if (payment_computation?.user?.grand_total) {
//     return {
//       type,
//       computation_used,
//       cleaning_fee: payment_computation?.user?.cleaning_fee,
//       total_hours: totalHours || 0,
//       subtotal: payment_computation?.user?.subtotal,
//       currency: currency,
//       grand_total: payment_computation?.user?.grand_total,
//       rebate: payment_computation?.user?.rebate,
//     };
//   } else {
//     return null;
//   }


const totalHours = computed(() => {
  const fromKey = timesFrom.find(x => x.value == props.computedData?.from)?.key
  const toKey = timesFrom.find(x => x.value == props.computedData?.to)?.key
  let totalHours = 0

  if (fromKey && toKey) {
    totalHours = (toKey - fromKey) * 0.5
  }
  return totalHours;
})

const customDuration = computed(() => {
  const duration = props.computedData?.duration;
  return duration
})

</script>

<style scoped></style>
