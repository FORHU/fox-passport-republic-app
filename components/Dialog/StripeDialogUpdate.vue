<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card rounded="lg">
      <v-row no-gutters justify="space-between" align="center" class="mx-2">
        <p class="text-16px font-500 text-center flex-grow-1 pa-5">
          Manage Space
        </p>
        <v-btn flat icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>

      <v-divider></v-divider>

      <v-form ref="form" v-model="formValid" @submit.prevent class="pa-5">
        <v-row no-gutters>
          <v-col>
            <v-text-field v-model.number="spaceCount" type="number" min="1" placeholder="No. of spaces" hide-details
              variant="outlined" rounded="lg"
              :rules="[customRequiredInput, requiredNumber, requiredInteger]"
              :error-messages="showDowngradeAlert ? 'Downgrade Error' : ''"></v-text-field>
          </v-col>

          <v-col>
            <p class="ml-4 text-15px font-500 mt-2">new space @ {{ currencySymbol }}{{ pricing?.amount }}/month each.
            </p>
          </v-col>
        </v-row>


        <v-row  no-gutters class="my-3">
          <v-alert v-if="showDowngradeAlert" type="warning" border="start" border-color="warning" color="warning" class="text-14px"
            variant="tonal">
            To downgrade your subscription, you must first free up active space by deleting any unused spaces.
            <br />
            Please note that spaces with active inquiries or bookings cannot be deleted until all events have been
            settled or completed.
          </v-alert>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row no-gutters class="mb-5">
          <p class="text-16px font-500">Space Credits</p>
          <p class="text-15px font-400 w-100">Current:  {{ spaceCredits }}</p>
          <p class="text-15px font-400 w-100">New: {{ spaceCount }}</p>
        </v-row>

        <v-row no-gutters justify="space-between">
          <p class="text-15px font-500">{{ spaceCount || 0 }} space x {{ currencySymbol + pricing?.amount }}</p>
          <p class="text-15px font-500">{{ currencySymbol + totalAmount }} <span class="text-14px">/month</span></p>
        </v-row>

        <v-row no-gutters justify="space-between">
          <p class="text-18px font-700">Total</p>
          <p class="text-18px font-700">{{ currencySymbol + totalAmount }} <span class="text-14px">/month</span></p>
        </v-row>

        <v-row no-gutters class="w-100">
          <v-btn class="mt-5" color="secondary" rounded="lg" block size="large"
            :disabled="!formValid || spaceCount == spaceCredits" @click="handleUpdateCredits" :loading="processing">
            Update Space Credits
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { requiredInput, requiredNumber, requiredGreaterThanZero, requiredInteger } = useUtils();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { updateSubscription } = useSubscription();
const { venue } = useVenue();

const props = defineProps<({
  pricing?: TSubscriptionPricing
  spaceCredits: number
  subscription?: TSubscription
  activeSpacesCount: number
})>();

const dialog = defineModel("dialog", { required: false, default: false });
const form = ref();
const formValid = ref(false);
const processing = ref(false);
const loading = ref(true);

const spaceCount = ref<number | null>(1);

const showDowngradeAlert = computed(() => {
  if(spaceCount.value == null) return;
  return (props.activeSpacesCount) > (spaceCount.value || 0)
})


const emit = defineEmits(['refresh-subscription'])

const somethingWentWrongMessage = {
  color: "error",
  text: "Something went wrong. Please try again.",
  modal: true,
}


const customRequiredInput = (val: number) => {
  return (!!val || val == 0) || 'This field is required'
}

const currencySymbol = computed(() => {
  if (!props.pricing?.currency) return;
  return getCurrencySymbol(props.pricing?.currency)
})

const totalAmount = computed(() => {
  return (spaceCount.value || 0) * (Number(props.pricing?.amount) || 0)
})

const handleUpdateCredits = async () => {
  await form.value?.validate();
  processing.value = true;
  const subscriptionId = props.subscription?._id
  try {
    const response = await updateSubscription(subscriptionId as string, spaceCount.value as number);
    if (response.value) {
      setSnackbar({ modal: true, color: "success", text: 'Space subscription updated successfully!' });
      dialog.value = false;
      emit('refresh-subscription');

    }

  } catch (error: any) {
    setSnackbar({ color: 'error', modal: true, text: error?.message })
    console.log(error);


  } finally {
    processing.value = false;
  }

}


watch(dialog, async () => {
  await nextTick(); // Ensure the DOM is updated
  loading.value = false;
  if (props.spaceCredits) {
    spaceCount.value = props.spaceCredits
  }
});
</script>
