<template>
  <v-row class="py-5" justify="center" style="min-height: 100dvh;">
    <v-col cols="12" lg="10" xl="9">
      <v-row no-gutters class="pa-5">
        <v-col>

          <v-row no-gutters justify="center">


            <v-col class="mr-md-5" cols="12" sm="8" md="6">
              <v-row no-gutters align="center">
                <v-col cols="12" :style="{ position: smAndUp ? 'relative' : 'absolute' }">
                  <ButtonBack @click="goBack" no-label />
                </v-col>
                <v-col cols="12" class="px-sm-5  text-22px font-500 text-center text-sm-start">{{ isUser ? 'Your Booking' : "Review Booking" }}</v-col>
              </v-row>

              <v-card class="pa-3" flat rounded="lg" width="100%" height="100%">


                <v-card v-if="loading" flat rounded="lg" min-height="15dvh" class="mt-5">
                  <LoadingChat :lines="12" />
                </v-card>
                <v-row v-else class="pa-5 mt-2">
                  <v-card flat rounded="lg" width="100%" height="100%">

                    <ReviewSpaceDetails :space="space" :enquiry="enquiry" />

                    <v-row class="w-100 mt-5 d-flex flex-column ga-3" no-gutters>
                      <v-row no-gutters class="text-16px w-100">
                        <v-col cols="3" class="font-500">Date</v-col>
                        <v-col align="end">{{ offer?.date?.date || '' }}</v-col>
                      </v-row>
                      <v-row no-gutters class="text-16px w-100">
                        <v-col cols="3" class="font-500">Check-in</v-col>
                        <v-col align="end">{{ convertTimeToAMPM(offer?.date?.from) || '' }}</v-col>
                      </v-row>

                      <v-row no-gutters class="text-16px w-100">
                        <v-col cols="3" class="font-500">Check-out</v-col>
                        <v-col align="end">{{ convertTimeToAMPM(offer?.date?.to) || '' }}</v-col>
                      </v-row>

                      <v-row no-gutters class="text-16px w-100">
                        <v-col cols="3" class="font-500">Guests</v-col>
                        <v-col align="end">{{ offer?.guests || '' }}</v-col>
                      </v-row>
                    </v-row>

                    <v-divider class="mt-4 mb-4" />

                    <v-card flat rounded="lg" border="secondary md" class="pa-5 pa-lg-7">
                      <v-row no-gutters class="text-18px w-100 font-500">Price Details</v-row>
                      <v-row no-gutters class="text-16px">
                        <v-col cols="12" class="d-flex justify-space-between ga-2">
                          <span>Rental Amount (6.5hours)</span>
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
                          <span class="">{{ getCurrencySymbol(offer?.currency) }}
                            {{ offer?.user_computation?.grand_total }}</span>
                        </v-col>
                        <v-col cols="12" class="d-flex justify-end text-grey ga-2">
                          <span>{{ withGST ? '(GST included)' : '' }}</span>
                        </v-col>
                      </v-row>
                    </v-card>

                  </v-card>

                  <v-row v-if="enquiry?.user?._id !== loggedUserId" class="pt-10  w-100" no-gutters>
                    <v-card flat rounded="lg" border="secondary md" class="pa-5 pa-lg-7 w-100">
                      <v-row no-gutters class="w-100 font-500 text-18px">
                        Your Payout
                      </v-row>

                      <v-row no-gutters class="w-100">
                        <v-col cols="12" class="d-flex justify-space-between ga-2">
                          <span>Rental Amount</span>
                          <span>{{ venueRentalAmount }}</span>
                        </v-col>
                        <v-col v-if="cleaningFeeAmount" cols="12" class="d-flex justify-space-between ga-2">
                          <span>Cleaning Fee</span>
                          <span>{{ cleaningFeeAmount }}</span>
                        </v-col>
                        <v-col cols="12" class="d-flex justify-space-between ga-2">
                          <span>Commission</span>
                          <span>- {{ commissionAmount }}</span>
                        </v-col>
                      </v-row>

                      <v-divider class="mt-4 mb-4" />

                      <v-row no-gutters class="">
                        <v-col cols="6">
                          <v-row no-gutters>
                            <span class="font-700 text-18px">Your Payout</span>
                          </v-row>
                        </v-col>
                        <v-col cols="6">
                          <v-row no-gutters justify="end" class="font-700 text-18px">
                            {{ getCurrencySymbol(offer?.currency) }}
                            {{ offer?.venue_computation?.grand_total }}
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-row class="pl-10 pr-10 pt-4 pb-4"> </v-row>
                    </v-card>

                  </v-row>
                  <v-row v-if="!isUser" no-gutters class="my-3 w-100 px-1">Check your Stripe Account &nbsp;<span
                      class="font-weight-black cursor-pointer text-decoration-underline"
                      @click="loadStripeLink">here</span>.</v-row>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
// const { enquiry, getEnquiry } = useEnquiry();
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();
const { computeBadgeCount } = useNotification();

const { withGST } = useTax();
definePageMeta({
  layout: 'enquiry-chat'
})

let open = ["Select a reason"];
let admins = ref([
  "The guest booked the incorrect event type",
  "The booking violates the rules of my space",
  "The guest is unresponsive",
  "My space is no longer available",
  "Other",
]);
import MEnquiry from "~/models/enquiry.model";
import MOffer from "~/models/offer.model";
import MSpace from "~/models/space.model";

const { country, currentCurrency, getCurrencySymbol, setSnackbar } = useLocal();
const { featuredImage, space, getSpace } = useSpace();
const { enquiry, getEnquiry } = useEnquiry();
const { requiredInput, longDateFormat, convertTimeToAMPM } = useUtils();
const { currentUser } = useLocalAuth();
const { id } = useRoute().params;
const step = ref(1);
const formValid = ref(false);
const form2Valid = ref(false);
const loading = ref(true);
let showCancelBookingDialog = ref(false);
const showEventDetailsDialog = ref(false);
const { offer } = useEnquiry();

const chatRoute = "country-enquiries-message-id";

const items = [
  {
    title: "Booking Details",
    subtitle: "Update Booking Details",
    disabled: false,
  },
  { title: "Review", disabled: false },
];

const customerFullName = computed(() => {
  return `${enquiry.value.user.first_name} ${enquiry.value.user.last_name}`;
});

const ownerFullName = computed(() => {
  return `${enquiry.value.venue?.user?.first_name} ${enquiry.value.venue?.user?.last_name}`;
});

const loggedUserId = computed(() => currentUser.value._id);

const fetchEnquiryData = async () => {
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
  }
};

const handleBack = () => {
  if (step.value == 1) {
    navigateTo({ name: chatRoute, params: { country, id } });
  } else {
    step.value--;
  }
};
const goBack = () => {
  navigateTo({ name: chatRoute, params: { country, id } });
};

const handleContinue = () => {
  if (!formValid.value) return;
  step.value++;
};

const goToVenue = () => {
  if (enquiry.value.venue._id) {
    navigateTo({
      name: "country-venues-management-venue-venueId",
      params: { country, venueId: enquiry.value.venue._id },
    });
  }
};

const handleSendOffer = async () => {
  if (!form2Valid.value) return;

  navigateTo({ name: chatRoute, params: { country, id } });
};

const isUser = computed(() => {
  return currentUser.value.role == "USER";
});

const openCancelBookingDialog = () => {
  showCancelBookingDialog.value = true;
};
function closeCancelBooking() {
  showCancelBookingDialog.value = false;
}
function sendCancelBooking() {
  showCancelBookingDialog.value = false;
  console.log("Will Cancel Booking");
}

const fetchOffer = async () => {
  try {
    const { data } = await useAPI("/v1/custom-offer", {
      query: {
        inbox_id: enquiry.value.inbox?._id,
        // status: 'PENDING,BOOKING_CONFIRMED'
      },
    });

    if (data && data.value) {
      const res = data.value as any;

      if (!res.data || !res.data[0]) return;

      offer.value = new MOffer(res.data[0]);
    }
  } catch (err) {
    console.log(err);
  }
};

const currencySymbol = computed(() => {
  const currency = offer.value.currency;
  if (currency) {
    return getCurrencySymbol(currency);
  } else return "";
});

// CUSTOMER COMPUTATION

const rentalAmount = computed(() => {
  const subtotal = offer.value.user_computation.subtotal;
  if (!subtotal) return "";

  const result = Number(subtotal).toFixed(2);
  return currencySymbol.value + " " + result;
});

const cleaningFeeAmount = computed(() => {
  const cleaning_fee = offer.value.user_computation.cleaning_fee;
  if (!cleaning_fee) return "";

  const result = Number(cleaning_fee).toFixed(2);
  return currencySymbol.value + " " + result;
});

const rebateAmount = computed(() => {
  const subtotal = offer.value.user_computation.subtotal;
  const rebate = offer.value.user_computation.rebate;
  if (!subtotal || !rebate) return "";

  const result = (Number(subtotal) * (Number(rebate) || 0)).toFixed(2);
  return currencySymbol.value + " " + result;
});

// VENUE COMPUTATION
const venueRentalAmount = computed(() => {
  const subtotal = offer.value.venue_computation.subtotal;
  if (!subtotal) return "";

  const result = (Number(subtotal)).toFixed(2);
  return currencySymbol.value + " " + result;
});


const commissionAmount = computed(() => {
  const subtotal = offer.value.venue_computation.subtotal;
  const commission_fee = offer.value.venue_computation.commission_fee;
  if (!subtotal || !commission_fee) return "";

  const result = (Number(subtotal) * (Number(commission_fee) || 0)).toFixed(2);
  return currencySymbol.value + " " + result;
});



const loadStripeLink = async () => {
  const { data, error } = await useAPI('/v1/payment/create-login')

  if (error.value) {
    setSnackbar({ modal: true, text: 'Something went wrong. Please try again later.', color: 'true' })
    return;
  }

  if (data && data.value) {
    const res = data.value as any;

    if (res?.data?.url) {
      const url = res.data.url;
      await navigateTo(url, {
        open: {
          target: "_blank",
        },
      });
    }

  }

}


// get space data
const fetchSpaceData = async () => {
  const { data: spaceData, error } = await getSpace(
    enquiry.value.space._id as string,
  );
  if (!spaceData) return;
  const res = spaceData.value as any;
  space.value = new MSpace(res.data.data[0]);
};

onMounted(async () => {
  await fetchEnquiryData();
  await fetchOffer();
  await fetchSpaceData();
  loading.value = false;
  computeBadgeCount();
});
</script>

<style scoped>
.selected-item {
  background-color: black;
  color: white;
}
</style>
