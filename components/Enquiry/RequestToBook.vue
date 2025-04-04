<template>
  <v-row no-gutters justify="center" style="min-height: 100svh" class="text-secondary">
    <v-col style="max-width: 1300px">
      <v-row no-gutters class="mt-3 mt-md-5">
        <v-row no-gutters align="center">
          <v-col cols="12" :style="{ position: smAndUp ? 'relative' : 'absolute' }">
            <ButtonBack @click="goBackToChat" no-label />
          </v-col>
          <v-col cols="12" class="px-sm-5  text-22px font-500 text-center text-sm-start">Request to book</v-col>
        </v-row>

      </v-row>
      <v-form class="" @submit.prevent ref="form">
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col class="mr-lg-5 mx-2">
                <v-card v-if="loading" flat rounded="lg" min-height="15dvh">
                  <LoadingChat :lines="10" />
                </v-card>
                <v-card v-else flat rounded="lg" height="100%" width="100%" class="pa-4 pa-md-7">
                  <v-row no-gutters class="mb-3 w-100">
                    <v-alert v-if="isNotAvailable"  type="info">Your selected time/date is either already booked or unavailable. Please update the event details to proceed.</v-alert>
                  </v-row>

                  <v-row no-gutters class="mt-5 font-weight-bold text-subtitle-1 text-sm-h6">
                    <v-col class="text-18px font-500">Your Event</v-col>
                    <v-col cols="2" align="end">
                      <v-btn variant="outlined" rounded="lg" @click="showEditEventDetailsDialog = true"
                        style="border: 2px solid #DEDFE3">Edit</v-btn>
                    </v-col>
                  </v-row>

                  <v-row no-gutters class="text-16px d-flex flex-column ga-3">
                    <v-row no-gutters class="w-100">
                      <v-col cols="12" class="font-500">Type</v-col>
                      <v-col cols="12">{{ eventType }}</v-col>
                    </v-row>
                    <v-row no-gutters class="w-100">
                      <v-col cols="12" class="font-500">Date</v-col>
                      <v-col cols="12">{{ computedOffer?.date }}</v-col>
                    </v-row>
                    <v-row no-gutters class="w-100">
                      <v-col cols="12" class="font-500">Time</v-col>
                      <v-col cols="12">{{ convertTimeToAMPM(computedOffer?.from) + ' - ' +
                        convertTimeToAMPM(computedOffer?.to) }}</v-col>
                    </v-row>
                    <v-row no-gutters class="w-100">
                      <v-col cols="12" class="font-500">Guests</v-col>
                      <v-col cols="12">{{ computedOffer?.guests }}</v-col>
                    </v-row>
                  </v-row>



                  <v-row class="d-lg-none" no-gutters>
                    <v-divider class="my-4" />
                    <EnquiryReviewOfferComputation :enquiry="enquiry" :space="space" :computed-data="computedOffer"
                      :custom-offer="withCustomOffer" @go-to-space="goToSpace" without-borders />
                  </v-row>


                  <v-divider class="my-4" />
                  <v-row no-gutters class="font-500 my-3 text-18px">Pay With:</v-row>

                  <form @submit.prevent="handleRequestToBook" id="payment-form">
                    <div id="payment-element">
                      <!-- Mount the Payment Element here -->
                    </div>
                    <v-btn type="submit" id="submit" class="d-none"></v-btn>
                  </form>


                  <!-- <v-row no-gutters class="d-flex ga-2 mt03 mt-md-5">
                    <div class="mr-2 mr-md-0" align="center">
                      <v-icon color="red">mdi-calendar-clock</v-icon>
                    </div>
                    <div>
                      <v-row no-gutters class="text-caption text-md-subtitle-2 font-500"
                        >No charges will be applied at this stage. Your booking
                        will only be confirmed once the host accepts your
                        request.</v-row
                      >
                    </div>
                  </v-row> -->

                  <v-divider class="my-3 my-md-5"></v-divider>
                  <v-row no-gutters class="text-secondary pb-5">
                    <v-row no-gutters class="text-18px font-500 w-100">Cancellation Policy</v-row>
                    <SpacesDetailsRules :specificSpace="space" hide-events />
                  </v-row>

                  <v-divider class="my-3 my-md-5"></v-divider>

                  <v-row no-gutters class="pl-2 pr-2 pt-5 font-500 text-18px text-secondary">Venue Rules</v-row>
                  <v-row no-gutters class="pl-2 pr-2 text-16px">You need to review and agree to the rules before booking
                    the space.</v-row>

                  <v-card elevation="0" flat color="transparent" rounded="lg" class="my-3 text-16px">
                    <v-row no-gutters class="pl-2 pr-2 text-16px text-secondary" style="white-space: pre-wrap">{{
                      space?.venue?.cancellation_policy?.description
                      }}</v-row>
                  </v-card>
                  <!-- <v-row class="pl-2 pr-2 pt-3 pt-md-5 text-subtitle-2">
                    <v-checkbox
                      v-model="agree_to_terms"
                      :rules="[(v) => v == true || '']"
                    >
                      <template v-slot:label>
                        <div class="text-caption text-md-subtitle-2">
                          I accept and understand these rules.
                        </div>
                      </template>
</v-checkbox>
</v-row> -->
                  <v-divider class="my-3" />



                  <v-row no-gutters class="text-charcoal text-14px">By clicking the button below, I acknowledge and
                    accept the
                    Terms and Conditions, Privacy Policy, Cancellation and
                    Refund Policy, and I authorize Venue4use to charge my
                    payment method if I am liable for any damages.</v-row>
                  <v-row no-gutters class="my-5"><v-btn type="submit" id="submit" color="primary" :loading="processing"
                      :disabled="isNotAvailable || !options.amount" rounded="lg" size="large" @click="handleRequestToBookSubmit">Book
                      Now</v-btn></v-row>
                </v-card>
              </v-col>
              <v-col cols="4" class="d-none d-lg-block">
                <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
                  <LoadingChat :lines="6" />
                </v-card>
                <EnquiryReviewOfferComputation v-else :enquiry="enquiry" :space="space" :computed-data="computedOffer"
                  :custom-offer="withCustomOffer" @go-to-space="goToSpace" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-row>
  <EnquiryBookingDialogEditBookingDetails v-model:show="showEditEventDetailsDialog" v-model:eventDetails="computedOffer"
    v-model:eventType="eventType" v-model:bookings="bookings" v-model:is-booked="isNotAvailable"
    @check-booking="checkIfBookedInit" @recompute="handleSaveNewEventDetails" :with-custom-offer="withCustomOffer"
    :enquiry="enquiry" :space="space" />
  <!-- <pre>{{ activeCustomOfferData }}</pre> -->

</template>

<script setup lang="ts">
import MOffer from "~/models/offer.model";
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

import MSpace from "~/models/space.model";
import MEnquiry from "~/models/enquiry.model";
import MComputedOffer from "~/models/computed-offer.model";
import {
  loadStripe,
  type Stripe,
  type StripeElement,
  type StripeElements,
  type StripeElementsOptions,
} from "@stripe/stripe-js";


const props = defineProps<{
  withCustomOffer?: boolean;
}>();
const { getBooking } = useBookingAPI();
const { enquiry, getEnquiry } = useEnquiry();
const { getSpace, timesFrom, space,  allowedDatesChecker, allowedTime, checkTimeAvailability } = useSpace();
const { id } = useRoute().params;
const { country, currentCurrency, getCurrencySymbol, setSnackbar } = useLocal();
const { cookieOptions } = useLocalAuth();
const { socket, getMessages, connect, emitChat, conversation } = useChat();
const { longDateFormat, convertTimeToAMPM } = useUtils();
const { computePayment } = useEnquiry();
const { emitGlobalSocket } = useGlobalSocket();

const chatRoute = "country-enquiries-message-id";

const showModal = ref(false);

const eventType = ref("");
const inbox_id = ref("");
const showEditEventDetailsDialog = ref(false);
const errorMessage = {
  modal: true,
  color: "error",
  text: "Something went wrong. Please try again later.",
};
const bookings = ref([]);
const isNotAvailable = ref(false);

const activePage = ref(2);
const form = ref(null);
const loading = ref(true);
const processing = ref(false);
const agree_to_terms = ref(false);
const message_to_owner = ref("");
const computedOffer = ref(new MComputedOffer({}));


const convertCentsToDollars = (amountInCents: number): number => {
  if (isNaN(amountInCents)) {
    throw new Error("Invalid amount");
  }
  const amountInDollars = amountInCents * 100;

  return Math.ceil(amountInDollars);
};



const handleBackButton = () => {
  navigateTo({ name: "country-enquiries-message-id", params: { country, id } });
};

const recompute = async () => {
  const { from, to, date, guests } = computedOffer.value
  if (
    !from ||
    !to ||
    !guests ||
    !date || !enquiry.value.space._id
  )
    return;

  processing.value = true;
  try {
    const payload = {
      space_id: enquiry.value.space._id,
      date,
      time_start: from,
      time_end: to,
      guests,
    };
    const res = await computePayment(payload);
    if (res) {
      computedOffer.value = new MComputedOffer(res);
      const { payment_computation, currency, from, to } = computedOffer.value;
      options.currency = currency.toLowerCase();
      options.amount = convertCentsToDollars(parseFloat(payment_computation.user.grand_total as string));
    }
    processing.value = false;
  } catch (err) {
    console.log(err);
    processing.value = false;
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
  if (!options.amount || +options.amount <= 0) return;

  stripe = await loadStripe(runtime.public.STRIPE_PUBLISHABLE_KEY);

  if (!stripe) return;
  elements = stripe.elements(options);
  paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
};

const handleRequestToBookSubmit = async () => {
  await form.value!.validate();
  const buttonElement = document.getElementById("submit")?.click();
};


const handleRequestToBook = async (event: Event) => {
  event.preventDefault();

  if(isNotAvailable.value) return;
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

  // Create the PaymentIntent and obtain clientSecret
  let clientSecret;
  let booking_id;
  let payment_id;
  let customOfferId;

  const { date, from, to, guests, payment_computation, currency } = computedOffer.value;
  if (!payment_computation.user.grand_total)
    return setSnackbar(errorMessage);

  const { base_rate: userBaseRate, ...restUserComputationObj } = payment_computation.user

  try {

    const res = await useAPI(`/v1/custom-offer/request-book`, {
      method: "POST",
      body: JSON.stringify({
        inbox_id: inbox_id.value,
        date: {
          date: date,
          from: from,
          to: to,
        },
        guests: guests,
        venue_computation: payment_computation.venue,
        user_computation: restUserComputationObj,
        currency: currency,
        event_type: eventType.value,
      }),
    });

    if (res.error.value) {
      setSnackbar(errorMessage);
      return;
    }


    /// ASSIGN RESPONSES
    if (res.data.value) {
      const resData = res.data.value?.data
      console.log(resData);

      customOfferId = resData.custom_offer_id;
      booking_id = resData.booking_id;
      clientSecret = resData.client_secret;
      payment_id = resData.payment_id;
    }


    if (!clientSecret || !booking_id || !payment_id || !customOfferId) {
      processing.value = false;
      setSnackbar(errorMessage);
      return
    }


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
      setSnackbar({ modal: true, color: "error", text: error.message });
      processing.value = false;
      status = "failed";
    }


    if (paymentIntent && paymentIntent.status == "succeeded") {
      status = "succeeded";
    }


    try {
      const { data, error } = await useAPI("/v1/payment/process-payment/status", {
        method: "POST",
        body: JSON.stringify({
          payment_id,
          booking_id,
          status
        }),
      });

      if (data.value && status == "succeeded") {
        setSnackbar({
          modal: true,
          color: "success",
          text: "Booking Confirmed Successfully",
        });

        const publicConfig = useRuntimeConfig().public;
        const accessToken = useCookie("accessToken", cookieOptions).value;

        // add socket info
        if (!socket.value) {
          await connect(publicConfig, accessToken as string);
        }
        await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
          room_id: enquiry.value.inbox?.room_id,
          custom_offer_id: customOfferId,
          message: "null",
          key: "BOOKING_CONFIRMED",
        });

        await emitGlobalSocket(SOCKET_EVENTS.NOTIFICATION_COUNT, {custom_offer_id: customOfferId,})
        navigateTo({ name: chatRoute, params: { country, id } });
      }


    } catch (e) {
      console.log(e);
      setSnackbar(errorMessage);
      processing.value = false;
      return;
    }


  } catch (error) {

  }

};

const fetchEnquiryData = async () => {
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
    inbox_id.value = enquiry.value?.inbox?._id || "";
    eventType.value = enquiry.value?.type;

    // if without custom-offer, assign the enquiry data
    if (!props.withCustomOffer) {
      computedOffer.value.date = enquiry.value.date.date;
      computedOffer.value.from = enquiry.value.date.from;
      computedOffer.value.to = enquiry.value.date.to;
      computedOffer.value.guests = enquiry.value.guests;
    }

    await recompute();
  }
};

const activeCustomOfferData = ref(new MOffer());

// fetch offer
const fetchCustomOffer = async () => {
  const { data } = await useAPI("/v1/custom-offer", {
    query: {
      inbox_id: enquiry.value.inbox?._id,
      //  status: 'PENDING,BOOKING_CONFIRMED'
    },
  });

  if (data && data.value) {
    const res = data.value as any;
    if (res.data && res.data[0] && res.data[0]._id) {
      activeCustomOfferData.value = new MOffer(res.data[0]);

      // if with custom-offer, assign the custom offer data
      if (props.withCustomOffer) {
        computedOffer.value.date = activeCustomOfferData.value.date.date;
        computedOffer.value.from = activeCustomOfferData.value.date.from;
        computedOffer.value.to = activeCustomOfferData.value.date.to;
        computedOffer.value.guests = activeCustomOfferData.value.guests;
        computedOffer.value.payment_computation.user =
          activeCustomOfferData.value.user_computation;
        computedOffer.value.payment_computation.venue =
          activeCustomOfferData.value.venue_computation;
        computedOffer.value.currency = activeCustomOfferData.value.currency;

        options.currency = computedOffer.value.currency.toLowerCase();
        options.amount = convertCentsToDollars(parseFloat(computedOffer.value.payment_computation.user.grand_total as string));
      }
    }
  }
};

const handleSaveNewEventDetails = async () => {
  await recompute();
  loadBookings();
  checkIfBookedInit();
  mountStripe();
};

const loadBookings = async () => {
  try {
    bookings.value = await getBooking(space.value?._id as string)
  } catch (error) {
    console.log(error);
  }
};

const checkIfSelectedTimeIsBooked = (
  booking: any = [],
  date: string,
  eventTimeStart: string,
  eventTimeEnd: string,
) => {
  function formatLocalDate(date: any) {
    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().split("T")[0];
  }

  const getTimeKey = (timeValue: string) => {
    return timesFrom.find((t) => t.value == timeValue)?.key;
  };

  function getTimeOnly(isoString: any) {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // map through all booked durations
  const checkIfBooked = (timeKey: number): boolean => {
    return booking.some((item: any) => {
      if (
        item.status == "CONFIRMED" &&
        new Date(item.start_date).toISOString().split("T")[0] ==
        formatLocalDate(date)
      ) {
        const bookedStartKey = getTimeKey(getTimeOnly(item?.start_date));
        const bookedEndKey = getTimeKey(getTimeOnly(item?.end_date));

        // console.log(bookedStartKey, bookedEndKey);

        if (!bookedStartKey || !timeKey || !bookedEndKey) return false;
        return timeKey >= bookedStartKey && timeKey <= bookedEndKey;
      } else return false;
    });
  };

  const eventStartKey = getTimeKey(eventTimeStart);
  const eventEndKey = eventTimeEnd == "06:00" ? 49 : getTimeKey(eventTimeEnd);

  // console.log('event', eventStartKey, eventEndKey);

  return checkIfBooked(eventStartKey) || checkIfBooked(eventEndKey);
};

const dateConverter = (dateString: string) => {
  if (!dateString) return;

  const dd = dateString.slice(0, 2);
  const mm = dateString.slice(3, 5);
  const yyyy = dateString.slice(6, 10);

  return `${yyyy}-${mm}-${dd}`;
};

// convert DD/MM/YYYY to "2025-04-15T16:00:00.000Z"
const convertDateToISO = (dateString: string) => {
  const parts = dateString.split('/'); // Split the input date by '/'
  const day = +parts[0];
  const month = +parts[1] - 1; // Month is 0-indexed in JavaScript (0 = January, 11 = December)
  const year = +parts[2]; // Full year (YYYY)

  return new Date(year, month, day); // Create and return the Date object
}

const checkIfBookedInit = () => {
  const date = convertDateToISO(computedOffer.value?.date as string);
  const from = computedOffer.value?.from as string
  const to = computedOffer.value?.to as string

  const dateAvailable = allowedDatesChecker(space.value.pricing, date) //checker if date is available

  const arr = allowedTime(space.value.pricing, date, bookings.value) as bookingTimeArray[]
  const isTimeSAvailable = checkTimeAvailability({ from, to, arrayToCheck: arr }) as boolean

  const isEventBooked = checkIfSelectedTimeIsBooked(bookings.value,
    new Date(dateConverter(computedOffer.value?.date)),
    computedOffer.value?.from,
    computedOffer.value?.to,
  )

  if (isEventBooked || !dateAvailable || !isTimeSAvailable) {
    isNotAvailable.value = true;
    showEditEventDetailsDialog.value = true;
  } else {
    isNotAvailable.value = false;
  }
}



onMounted(async () => {
  await fetchEnquiryData();
  await fetchCustomOffer();
  await fetchSpaceData();
  await loadBookings();
  loading.value = false;
  checkIfBookedInit();
  await mountStripe();

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
