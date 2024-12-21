<template>
  <v-row no-gutters class="bg-primaryBG" justify="center" style="min-height: 100svh">
    <v-col style="max-width: 1300px">
      <v-row no-gutters>
        <v-breadcrumbs v-model="activePage" :items="breadcrumbItems" class="px-0 d-block">
          <template v-slot:title="{ item, index }">
            <v-breadcrumbs-item>
              <span class="cursor-pointer text-no-wrap" :class="activePage === index
                  ? 'text-primary font-weight-bold'
                  : 'text-secondary font-weight-black'
                ">
                {{ item.title }}
              </span>
            </v-breadcrumbs-item>
          </template>
          <template v-slot:divider>
            <span class="text-primary">/</span>
          </template>
        </v-breadcrumbs>
      </v-row>

      <v-form class="py-5" @submit.prevent>
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col class="mr-lg-5 mx-2">
                <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
                  <LoadingChat :lines="10" />
                </v-card>
                <v-card v-else elevation="5" rounded="lg" height="100%" width="100%" class="pa-4 pa-md-7">
                  <v-row no-gutters class="pt-3 text-h6 font-weight-bold" align="center">
                    <v-col style="line-height: 1">Request To Book</v-col>
                    <v-col cols="5" md="4" align="end" class="d-lg-none"><v-btn type="submit" variant="flat"
                        color="primary" size="small" prepend-icon="mdi-information-outline" @click="showModal = true">
                        See Details
                      </v-btn></v-col>
                  </v-row>

                  <v-row no-gutters class="mt-5 font-weight-bold text-subtitle-1 text-sm-h6">Your Event</v-row>
                  <v-row :no-gutters="!smAndUp" class="mt-0">
                    <v-col cols="12" sm="6">
                      <v-list lines="one">
                        <v-list-item class="pa-5" rounded style="border-radius: 8px; border: 1px solid black"
                          title="Event Type" :subtitle="enquiry?.type"></v-list-item>
                        <v-list-item class="mt-4 pa-5" rounded style="border-radius: 8px; border: 1px solid black"
                          title="Time" :subtitle="offer?.date.from + ' - ' + offer?.date.to"></v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list lines="one">
                        <v-list-item class="pa-5" rounded style="border-radius: 8px; border: 1px solid black"
                          title="Date" :subtitle="longDateFormat(offer?.date.date)"></v-list-item>
                        <v-list-item class="mt-4 pa-5" rounded style="border-radius: 8px; border: 1px solid black"
                          title="Guests" :subtitle="offer?.guests"></v-list-item>
                      </v-list>
                      <!-- <v-row class="pt-5 pr-3 pl-5 pb-5" justify="end">
                                                <v-btn color="#8091AF">Edit</v-btn>
                                            </v-row> -->
                    </v-col>
                  </v-row>

                  <v-row no-gutters class="my05">
                    <EnquiryOfferBreakdown :offer="offer" :enquiry="enquiry" />
                  </v-row>

                  <v-row no-gutters class="pb-5 pt-3 font-weight-bold text-h6">Payment</v-row>
                  <v-divider />
                  <v-row no-gutters class="font-weight-bold my-3 text-subtitle-1">Pay With:</v-row>

                  <form @submit.prevent="handleRequestToBook" id="payment-form">
                    <div id="payment-element">
                      <!-- Mount the Payment Element here -->
                    </div>
                    <v-row no-gutters class="mt-5"><v-btn type="submit" id="submit" color="secondary"
                        :loading="processing">Book Offer</v-btn></v-row>
                  </form>

                  <!-- <v-row no-gutters class="pl-2 pb-5 pr-2 pt-5">
                    <v-col cols="1" class="mr-2 mr-md-0" align="center">
                      <v-icon color="red">mdi-calendar-clock</v-icon>
                    </v-col>
                    <v-col>
                      <v-row no-gutters class="text-caption text-md-subtitle-2">No charges will be applied at this
                        stage. Your
                        booking
                        will only be confirmed once the host accepts your
                        request.</v-row>
                    </v-col>
                  </v-row> -->
                </v-card>
              </v-col>
              <v-col cols="4" class="d-none d-lg-block">
                <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
                  <LoadingChat :lines="6" />
                </v-card>
                <EnquiryReviewOfferComputation v-else :enquiry="enquiry" :space="space" @go-to-space="goToSpace" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
    <EnquiryModal v-model="showModal">
      <EnquiryReviewOfferComputation :enquiry="enquiry" :space="space" close-button @close-dialog="showModal = false"
        @go-to-space="goToSpace" />
    </EnquiryModal>
  </v-row>
</template>

<script setup lang="ts">
import MOffer from "~/models/offer.model";
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

import MSpace from "~/models/space.model";
import MEnquiry from "~/models/enquiry.model";
import {
  loadStripe,
  type Stripe,
  type StripeElement,
  type StripeElements,
  type StripeElementsOptions,
} from "@stripe/stripe-js";

definePageMeta({
  layout: "enquiry-chat",
});

const { enquiry, getEnquiry } = useEnquiry();
const { getSpace } = useSpace();
const { id, custom_offer_id } = useRoute().params;
const { country, currentCurrency, getCurrencySymbol, setSnackbar } = useLocal();
const { cookieOptions } = useLocalAuth();
const { socket, getMessages, connect, emitChat, conversation } = useChat();
const { longDateFormat } = useUtils();
const chatRoute = "country-enquiries-message-id";

const showModal = ref(false);

const activePage = ref(2);
const space = ref();
const loading = ref(true);
const processing = ref(false);
const offer = ref();

const breadCrumbRoute = `/${country}/enquiries/message/${id}`;
const breadcrumbItems = [
  {
    title: "Back to Enquiry Chat",
    href: breadCrumbRoute,
  },
  {
    title: "Review Offer",
    href: breadCrumbRoute + "/view-offer/" + custom_offer_id,
    disabled: true,
  },
  {
    title: "Payment",
    href: breadCrumbRoute + `/view-offer/${custom_offer_id}/review-payment`,
  },
];

const spaceImageArray = computed(() => {
  if (space.value && space.value.space_photo) {
    return space.value.space_photo.map((x: TVenueSpace) => x.path);
  } else {
    return [];
  }
});

const fetchEnquiryData = async () => {
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
  }
};

// get space data
const fetchSpaceData = async () => {
  const { data: spaceData, error } = await getSpace(
    enquiry.value.space._id as string,
  );
  if (!spaceData) return;
  const res = spaceData.value as any;
  space.value = new MSpace(res.data.data[0]);
};

const goBackToChat = () => {
  navigateTo({ name: chatRoute, params: { country, id } });
};

const convertCentsToDollars = (amountInCents: number): number => {
  if (isNaN(amountInCents)) {
    throw new Error("Invalid amount");
  }
  const amountInDollars = amountInCents * 100;

  return Math.ceil(amountInDollars);
};

const fetchOffer = async () => {
  try {
    const { data } = await useAPI("/v1/custom-offer", {
      query: {
        inbox_id: enquiry.value.inbox?._id,
      },
    });

    if (data && data.value) {
      const res = data.value as any;

      if (!res.data || !res.data[0]) return;

      offer.value = new MOffer(res.data[0]);
      options.currency = offer.value?.currency?.toLowerCase() || "sgd";
      options.amount = convertCentsToDollars(
        offer.value.user_computation.grand_total,
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const goToSpace = () => {
  const spaceId = enquiry.value.space._id as string;
  if (spaceId) {
    navigateTo({
      name: "country-venues-venue",
      params: { country, venue: spaceId },
    });
  }
};

let stripe: Stripe | null;
let paymentElement: StripeElement;
let elements: StripeElements;

const options: StripeElementsOptions = reactive({
  mode: "payment",
  currency: "sgd",
  amount: 1,
});

const runtime = useRuntimeConfig();

const mountStripe = async () => {
  stripe = await loadStripe(runtime.public.STRIPE_PUBLISHABLE_KEY);

  if (!stripe) return;
  elements = stripe.elements(options);
  paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
};

const handleRequestToBook = async (event: Event) => {
  event.preventDefault();

  processing.value = true;
  // Trigger form validation and wallet collection
  const { error: submitError } = await elements!.submit();
  if (submitError) {
    processing.value = false;
    return;
  }

  // Create the PaymentIntent and obtain clientSecret
  let clientSecret;
  let booking_id;
  let payment_id;
  try {
    const res = await useAPI("/v1/payment/process-payment", {
      method: "POST",
      body: JSON.stringify({
        enquiry_id: enquiry.value._id,
      }),
    });
    if (res.data && res.data.value) {
      const response = res.data.value as any;
      if (response.data && response.data.id) {
        clientSecret = response.data.id;
        booking_id = response.data.booking_id;
        payment_id = response.data.payment_id;
      }
    } else {
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later.",
      });
    }
  } catch (e) {
    console.log(e);

    processing.value = false;
  }

  if (!clientSecret || !booking_id || !payment_id)
    return (processing.value = false);

  // Use the clientSecret and Elements instance to confirm the setup
  const { error, paymentIntent } = await stripe!.confirmPayment({
    elements,
    clientSecret,
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
    status = "succeeded";
  }

  try {
    const res = await useAPI("/v1/payment/process-payment/status", {
      method: "POST",
      body: JSON.stringify({
        payment_id,
        booking_id,
        status,
      }),
    });
    // if (res.data && res.data.value) {
    //   const response = res.data.value as any;
    //   if (response.data && response.data.id) {
    //     clientSecret = response.data.id;
    //     booking_id = response.data.booking_id;
    //     payment_id = response.data.payment_id;
    //   }
    // }

    setSnackbar({
      modal: true,
      color: "success",
      text: "Payment Processed Successfully",
    });
  } catch (e) {
    console.log(e);
    setSnackbar({
      modal: true,
      color: "error",
      text: "Something went wrong. Please try again later.",
    });
    processing.value = false;
  }

  processing.value = false;
  if (status == "succeeded") {
    await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
      room_id: enquiry.value.inbox?.room_id,
      custom_offer_id: custom_offer_id,
      message: "null",
      key: "BOOKING_CONFIRMED",
    });
    navigateTo({ name: chatRoute, params: { country, id } });
  }
};

const publicConfig = useRuntimeConfig().public;
const accesToken = useCookie("accessToken", cookieOptions).value;

const joinRoom = async () => {
  if (!socket.value) {
    await connect(publicConfig, accesToken as string);
  }
};

onMounted(async () => {
  await fetchEnquiryData();
  await fetchSpaceData();
  await fetchOffer();
  loading.value = false;
  await mountStripe();
  await joinRoom();
});
</script>

<style scoped>
.StripeElement {
  background-color: transparent;
  border-radius: 8px;
  border: 1px solid #e4e4e4;
  padding: 15px;
}

.StripeElement--focus {
  border-color: black;
}

.StripeElement--invalid {
  border-color: #ff0033;
}

.StripeElement--webkit-autofill {
  background-color: #f9f9f9 !important;
}
</style>
