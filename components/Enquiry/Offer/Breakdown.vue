<template>
  <v-card width="100%" class="pa-5 pa-md-7">
    <v-row no-gutters class=""
      ><span class="text-primary font-weight-black"
        >The Offer Includes</span
      ></v-row
    >
    <v-row no-gutters>
      <v-col cols="12">
        <ul
          class="pl-2 pl-md-5"
          style="line-height: 1.5; list-style-type: none"
        >
          <li class="text-subtitle-2 text-md-subtitle-1">
            <v-row
              no-gutters
              class="d-flex justify-space-between ga-3 align-start"
            >
              <v-col style="line-height: 1.5"
                >{{ enquiry.type }} for {{ offer?.guests }} guests</v-col
              >
              <v-col cols="4" style="line-height: 1.5" align="end">{{
                rentalAmount
              }}</v-col>
            </v-row>
          </li>
          <li
            v-if="user_computation?.cleaning_fee"
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

        <v-row
          no-gutters
          class="font-weight-bold text-end text-subtitle-1"
          justify="end"
          >Total: {{ totalAmount }}
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, smAndDown } = useDisplay();
const { country, getCurrencySymbol, setSnackbar } = useLocal();

const props = defineProps<{
  offer: TOffer;
  enquiry: TEnquiry;
}>();

const currencySymbol = computed(() => {
  if (props.offer?.currency) {
    return getCurrencySymbol(props.offer.currency);
  } else return "";
});

const { user_computation } = props.offer;

const rentalAmount = computed(() => {
  const subtotal = user_computation.subtotal;

  if (!subtotal) return "";
  const result = Number(subtotal).toFixed(2);
  return currencySymbol.value + " " + result;
});

const cleaningFeeAmount = computed(() => {
  const cleaning_fee = user_computation.cleaning_fee;
  if (!cleaning_fee) return "";
  const result = Number(cleaning_fee).toFixed(2);
  return currencySymbol.value + " " + result;
});

const rebateAmount = computed(() => {
  const rebate = user_computation.rebate;
  const subtotal = user_computation.subtotal;
  if (!subtotal || !rebate) return "";
  const result = (Number(subtotal) * (Number(rebate) || 0)).toFixed(2);
  return currencySymbol.value + " " + result;
});

const totalAmount = computed(() => {
  const grand_total = user_computation.grand_total;

  if (!grand_total) return "";
  const result = Number(grand_total).toFixed(2);
  return currencySymbol.value + " " + result;
});
</script>

<style scoped></style>
