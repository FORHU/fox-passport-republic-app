<template>
  <v-card
    flat
    border="secondary md"
    rounded="lg"
    class="pa-5 pa-md-7"
    style="border: 1px solid black"
  >
    <v-row no-gutters class="font-500 text-18px pb-5"
      >Client will pay</v-row
    >
    <!-- <v-row no-gutters>
                                            <v-col cols="6">S$66 x 5 hours</v-col>
                                            <v-col cols="6" align="end">S$330</v-col>
                                        </v-row> -->
    <v-row no-gutters>
      <v-col cols="12">
        <ul class="" style=" list-style-type: none;">
          <li class="text-subtitle-2 text-md-subtitle-1">
            <v-row
              no-gutters
              class="d-flex justify-space-between ga-3 align-start"
            >
              <v-col style="line-height: 1.5"
                >{{ enquiry.type }} for
                {{ computedOffer?.guests }} guests</v-col
              >
              <v-col cols="4" style="line-height: 1.5" align="end">{{
                rentalAmount
              }}</v-col>
            </v-row>
          </li>
          <li
            v-if="payment_computation?.user?.cleaning_fee"
            class="text-subtitle-2 text-md-subtitle-1"
          >
            <v-row
              no-gutters
              class="d-flex justify-space-between ga-3 align-start"
            >
              <v-col style="line-height: 1.5">Cleaning Fee</v-col>
              <v-col cols="4" style="line-height: 1.5" align="end">{{
                cleaningFeeAmount
              }}</v-col>
            </v-row>
          </li>

          <li class="text-subtitle-2 text-md-subtitle-1">
            <v-row
              no-gutters
              class="d-flex justify-space-between ga-3 align-center"
            >
              <v-col style="line-height: 1.5">Platform Rebate</v-col>
              <v-col cols="4" style="line-height: 1.5" align="end"
                >- {{ rebateAmount }}</v-col
              >
            </v-row>
          </li>
        </ul>
      </v-col>
    </v-row>

    <v-divider class="my-5"></v-divider>
    <v-row no-gutters>
      <v-col cols="6" class="font-700 text-18px"
        >Total</v-col
      >
      <v-col cols="6" align="end" class="font-700 text-18px"
        >{{ currencySymbol }} {{ newUserGrandTotal }}
      </v-col>
      <v-row
        no-gutters
        class="text-16px text-grey"
        justify="end"
        ><span>{{ withGST ? '(GST included)' : '' }}</span>
      </v-row>
    </v-row>
  </v-card>
  <v-card
    flat
    border="secondary md"
    rounded="lg"
    class="pa-5 pa-md-7 mt-7"
    style="border: 1px solid black"
  >
    <v-row no-gutters class="font-500 text-18px mb-5">Payout</v-row>
    <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1">
      <v-col cols="6" class="text-subtitle-2 text-md-subtitle-1"
        >Rental Amount</v-col
      >
      <v-col cols="6" align="end"> {{ totalVenueRental }}</v-col>
    </v-row>
    <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1">
      <v-col cols="6" class="text-subtitle-2 text-md-subtitle-1"
        >Cleaning Fee</v-col
      >
      <v-col cols="6" align="end"> {{ ownerCleaningFeeAmount }}</v-col>
    </v-row>
    <v-row no-gutters class="text-subtitle-2 text-md-subtitle-1">
      <v-col cols="6" class="text-subtitle-2 text-md-subtitle-1"
        >Commission ({{
          (
            Number(computedOffer?.payment_computation?.venue?.commission_fee) *
            100
          ).toFixed(2)
        }}
        %)</v-col
      >
      <v-col cols="6" align="end">- {{ commissionFeeAmount }}</v-col>
    </v-row>
    <v-divider class="my-5"></v-divider>
    <v-row no-gutters>
      <v-col cols="6" class="font-700 text-18px">Total </v-col>
      <v-col cols="6" align="end" class="font-700 text-18px">
        {{ currencySymbol }} {{ newVenueGrandTotal }}</v-col
      >
      <v-row
        no-gutters
        class="text-caption text-md-subtitle-2 font-weight-light text-grey"
        justify="end"
        ><span>{{ withGST ? '(GST included)': '' }}</span>
      </v-row>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, smAndDown } = useDisplay();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { withGST } = useTax();

const props = defineProps<{
  computedOffer: TComputedOffer;
  enquiry: TEnquiry;
  newVenueGrandTotal: string;
  newUserGrandTotal: string;
}>();

const currencySymbol = computed(() => {
  const currency = props.computedOffer.currency;
  if (currency) {
    return getCurrencySymbol(currency);
  } else return "";
});

// CUSTOMER COMPUTATION
const { payment_computation } = props.computedOffer;

const rentalAmount = computed(() => {
  const user_subtotal = payment_computation.user.subtotal;
  if (!user_subtotal) return "";
  const result = Number(user_subtotal).toFixed(2);
  return currencySymbol.value + " " + result;
});

const cleaningFeeAmount = computed(() => {
  const cleaning_fee = payment_computation.user.cleaning_fee;
  if (!cleaning_fee) return "";
  const result = Number(cleaning_fee).toFixed(2);
  return currencySymbol.value + " " + result;
});

const rebateAmount = computed(() => {
  const user_subtotal = payment_computation.user.subtotal;
  const rebate = payment_computation.user.rebate;
  if (!user_subtotal) return "";
  const result = (Number(user_subtotal) * (Number(rebate) || 0)).toFixed(2);
  return currencySymbol.value + " " + result;
});

const userGrandTotalAmount = computed(() => {
  const user_subtotal = payment_computation.user.subtotal;
  const cleaning_fee = payment_computation.user.cleaning_fee;
  const rebate = payment_computation.user.rebate;
  if (!user_subtotal) return "";
  const result = (
    Number(user_subtotal) +
    (Number(cleaning_fee) || 0) -
    (Number(Number(rebate) * Number(user_subtotal)) || 0)
  ).toFixed(2);
  return currencySymbol.value + " " + result;
});

// VENUE OWNER PAYOUT COMPUTATION

const totalVenueRental = computed(() => {
  const subtotal = payment_computation.venue.subtotal;
  // const cleaning_fee = payment_computation.venue.cleaning_fee;
  if (!subtotal) return "";
  const result = (Number(subtotal)).toFixed(2);
  return currencySymbol.value + " " + result;
});

const ownerCleaningFeeAmount = computed(() => {
  const cleaning_fee = payment_computation.venue.cleaning_fee
  if(!cleaning_fee) return ''
  const result =  Number(cleaning_fee).toFixed(2)
  return currencySymbol.value + ' ' + result
})

// const commissionFeeAmount = computed(() => {
//   const subtotal = payment_computation.venue.subtotal;
//   const commission_fee = payment_computation.venue.commission_fee;
//   const cleaning_fee = payment_computation.venue.cleaning_fee;
//   if (!commission_fee || !subtotal) return "";
//   const result = ((Number(subtotal) + (Number(cleaning_fee) || 0)) * Number(commission_fee)).toFixed(2);
//   return currencySymbol.value + " " + result;
// });
const commissionFeeAmount = computed(() => {
  const subtotal = payment_computation.venue.subtotal;
  const commission_fee = payment_computation.venue.commission_fee;
  if (!commission_fee || !subtotal) return "";
  const result = ((Number(subtotal)) * Number(commission_fee)).toFixed(2);
  return currencySymbol.value + " " + result;
});

// const payoutAmount = computed(() => {
//   const venue_subtotal = payment_computation.venue.subtotal;
//   const cleaning_fee = payment_computation.venue.cleaning_fee
//   const commission_fee = payment_computation.venue.commission_fee
//   if(!venue_subtotal) return ''
//   const result = (Number(venue_subtotal) + (Number(cleaning_fee) || 0) - (Number(Number(commission_fee) * Number(venue_subtotal)) || 0)).toFixed(2)
//   return currencySymbol.value + ' ' + result
// })
</script>

<style scoped></style>
