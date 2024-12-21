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
            <v-text-field :disabled="step != 1" v-model.number="spaceCount" type="number" min="1"
              placeholder="No. of spaces" hide-details variant="outlined" rounded="lg"
              :rules="[requiredInput, requiredNumber, requiredGreaterThanZero, requiredInteger]"></v-text-field>
          </v-col>

          <v-col>
            <p class="ml-4 text-15px font-500 mt-2">new space @ {{ currencySymbol }}{{ pricing?.amount }}/month each.
            </p>
          </v-col>
        </v-row>

        <v-row v-if="step == 2" no-gutters class="mt-5 mb-2">
          <v-col cols="6">
            <p class="text-18px font-500">Pay With:</p>
          </v-col>

          <v-col cols="6">
            <!-- <p>PICS</p> -->
          </v-col>
        </v-row>


        <form @submit.prevent="handleRequestToBook" id="payment-form">
          <div id="payment-element">
            <!-- Mount the Payment Element here -->
          </div>
          <v-btn type="submit" id="submit" class="d-none"></v-btn>
        </form>


        <v-divider class="my-4"></v-divider>

        <v-row no-gutters justify="space-between">
          <p class="text-15px font-500">{{ spaceCount || 0 }} space x {{ currencySymbol + pricing?.amount }}</p>
          <p class="text-15px font-500">{{ currencySymbol + totalAmount }}<span class="text-14px">/month</span></p>
        </v-row>

        <v-row no-gutters justify="space-between">
          <p class="text-18px font-700">Total</p>
          <p class="text-18px font-700">{{ currencySymbol + totalAmount }} <span class="text-14px">/month</span></p>
        </v-row>

        <v-row no-gutters class="w-100">
          <v-btn v-if="step == 1" class="mt-5" color="secondary" rounded="lg" block size="large" :disabled="!formValid"
            @click="handleCheckout" :loading="processing"> Proceed to Payment
          </v-btn>
          <v-btn v-else class="mt-5" color="secondary" rounded="lg" block size="large" :loading="processing"
            type="submit" @click="handleRequestToBookSubmit"> Pay
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  loadStripe,
  type Stripe,
  type StripeElement,
  type StripeElements,
  type StripeElementsOptions,
} from "@stripe/stripe-js";

const { requiredInput, requiredNumber, requiredGreaterThanZero, requiredInteger } = useUtils();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { createSubscription } = useSubscription();
const { venue } = useVenue();

const props = defineProps<({
  pricing?: TSubscriptionPricing
  spaceCredits?: number
})>();

const dialog = defineModel("dialog", { required: false, default: false });
const form = ref();
const formValid = ref(false);
const processing = ref(false);
const loading = ref(true);
const step = ref(1);

const spaceCount = ref<number | null>(1);

const emit = defineEmits(['refresh-subscription'])

const somethingWentWrongMessage = {
  color: "error",
  text: "Something went wrong. Please try again.",
  modal: true,
}

let stripe: Stripe | null;
let paymentElement: StripeElement;
let elements: StripeElements;

const options: StripeElementsOptions = reactive({
  clientSecret: 'pi_3Q2PCMRuNU3oIjnA00Seu0yN_secret_R6RfRPjvwvV3pkfwfph0qKbzy'
});

const runtime = useRuntimeConfig();

const mountStripe = async () => {
  if (!form.value) return; // make sure not to run if form is not yet initialized;


  stripe = await loadStripe(runtime.public.STRIPE_PUBLISHABLE_KEY);

  if (!stripe) return;
  elements = stripe.elements(options);
  paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
};

const handleRequestToBookSubmit = async () => {
  document.getElementById("submit")?.click();
};



const handleRequestToBook = async (event: Event) => {
  event.preventDefault();

  processing.value = true;
  // Trigger form validation and wallet collection
  const { error: submitError } = await elements!.submit();
  if (submitError) {
    processing.value = false;
    const el = document.getElementById('payment-element')
    el?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  let clientSecret;
  let subscriptionId;

  try {
    const { error, paymentIntent } = await stripe!.confirmPayment({
      elements,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
      redirect: "if_required",
    });

    let status;
    if (error) {
      status = "failed";
      setSnackbar({ modal: true, color: "error", text: error.message });
      processing.value = false;
    }

    if (paymentIntent && paymentIntent.status == "succeeded") {
      setSnackbar({ modal: true, color: "success", text: 'Space subscription updated successfully!' });
      emit('refresh-subscription')
      setTimeout(() => {
        dialog.value = false;
      }, 1500)
    }

  } catch (error) {
    let er = error as any;
    setSnackbar({ modal: true, color: "error", text: er?.message })
    return;
  } finally {
    processing.value = false;
    step.value = 1
  }

}

const getClientSecret = async () => {

  const price_id = props.pricing?.price_id;
  const venue_id = venue.value?._id;
  const space_number = spaceCount.value as number;

  if (!price_id || !venue_id || !space_number) {
    setSnackbar(somethingWentWrongMessage);
    processing.value = false;
    return;
  }
  // create subscription

  const payload = {
    venue_id, price_id, space_number
  }

  try {
    const response = await createSubscription(payload)

    if (response.value) {
      const res = response.value as any;
      options.clientSecret = res?.client_secret;
      step.value = 2;
      await mountStripe();
    }


  } catch (error) {
    let er = error as any;
    if (er.message) {
      setSnackbar({ modal: true, color: "error", text: er?.message })
    } else setSnackbar(somethingWentWrongMessage)

    return;
  } finally {
    processing.value = false;
  }
}

const currencySymbol = computed(() => {
  if (!props.pricing?.currency) return;
  return getCurrencySymbol(props.pricing?.currency)
})

const totalAmount = computed(() => {
  return (spaceCount.value || 0) * (Number(props.pricing?.amount) || 0)
})

const handleCheckout = async () => {
  await form.value.validate();
  processing.value = true;
  await getClientSecret();
}
watch(dialog, async () => {
  await nextTick(); // Ensure the DOM is updated
  loading.value = false;
  step.value = 1
  if (props.spaceCredits) {
    spaceCount.value = props.spaceCredits
  }
});
</script>
