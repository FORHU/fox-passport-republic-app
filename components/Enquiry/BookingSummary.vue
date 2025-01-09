<template>

  <v-card v-if="!refundOnly" color="transparent" border="secondary sm" rounded="lg" elevation="0" width="100%">
    <v-row no-gutters class="pa-5 pa-lg-7 text-secondary text-16px ">
      <v-col cols="12" class="text-18px font-500">Payment Details</v-col>
      <v-col cols="12" class="pt-5 d-flex flex-wrap ga-2 text-16px justify-space-between">
        <span>Paid Amount</span>
        <span>{{ currencySymbol }} {{ clientPaidAmount }}</span>
      </v-col>
      <v-divider class="my-5" thickness="2"></v-divider>
      <v-col cols="12" class="d-flex flex-wrap ga-2 justify-space-between text-18px font-700">
        <span>Total</span>
        <span>{{ currencySymbol }} {{ clientPaidAmount }}</span>
      </v-col>
    </v-row>
  </v-card>

  <v-card color="transparent" border="secondary sm" rounded="lg" elevation="0" width="100%" class="mt-5">
    <v-row no-gutters class="pa-5 pa-lg-7 text-secondary text-16px ">
      <v-col cols="12" class="text-18px font-500">Refund Amount</v-col>
      <v-col cols="12" class="pt-5 d-flex flex-wrap ga-2 text-16px justify-space-between">
        <span v-if="refundAmount">{{ refund?.percentage == 1 ? 'Full Refund' : `${Number(refund?.percentage) * 100}% refund` }}</span>
        <span v-else>No refund</span>
        <span>{{ currencySymbol }} {{ refundAmount || '0.00' }}</span>
      </v-col>
      <v-divider class="my-5" thickness="2"></v-divider>
      <v-col cols="12" class="d-flex flex-wrap ga-2 justify-space-between text-18px font-700">
        <span>Total</span>
        <span>{{ currencySymbol }} {{ refundAmount || '0.00' }}</span>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, smAndDown } = useDisplay();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { withGST } = useTax();

const props = defineProps<{
  refund: TRefund;
  offer?: TOffer;
  refundOnly?: boolean;
}>();

const refundAmount = computed(() => {
  if (!props.refund?.refund_amount && props.refund?.refund_amount !== 0) return;
  return Number(props.refund.refund_amount).toFixed(2);
});

const clientPaidAmount = computed(() => {
  if (!props.refund.grand_total) return;
  return Number(props.refund.grand_total).toFixed(2);
});

const currencySymbol = computed(() => {
  if (props.refund?.currency) {
    return getCurrencySymbol(props.refund.currency);
  } else return "";
});
</script>

<style scoped></style>
