<template>
  <v-row no-gutters class="py-5 py-md-10 px-2 px-md-5" justify="center" style="min-height: 100%">
    <v-col cols="12" sm="10" md="12" lg="9" xl="8">

      <v-row no-gutters class="w-100 " align="center">
        <v-col cols="auto" sm="12" :style="{ position: smAndUp ? 'relative' : 'absolute' }">
          <ButtonBack no-label @click="handleBack" />
        </v-col>
        <v-col cols="12" class="font-500 text-22px text-sm-h6 text-center px-sm-5 text-sm-start">
          <span>{{ step == 1 ? 'Create Offer' : 'Review Offer' }}</span>
        </v-col>
      </v-row>

      <v-row v-if="step == 1" no-gutters class="mt-md-5">
        <v-col class="mr-md-5">
          <v-row no-gutters>
            <v-form @submit.prevent v-model="formValid" :key="step" class="w-100">
              <v-card v-if="loading" flat rounded="lg" min-height="15dvh">
                <LoadingChat :lines="15" />
              </v-card>

              <v-row no-gutters v-else class="w-100">
                <CustomOfferForm v-model:old="paymentDetails" v-model:new="computedOffer" v-model:bookings="bookings"
                  @recompute="recompute" @load-bookings="loadBookings" />
                <v-row no-gutters class="w-100 px-5 mt-5">
                  <v-col align="end">
                    <v-btn type="submit" rounded="lg" variant="flat" color="secondary" :disabled="processing"
                      @click="handleContinue">Review offer</v-btn>
                  </v-col>
                </v-row>
              </v-row>

            </v-form>
          </v-row>
        </v-col>

        <v-col class="d-none d-md-block" cols="4">
          <v-card v-if="loading" elevation="5" rounded="lg" min-height="15dvh">
            <LoadingChat :lines="2" />
          </v-card>
          <EnquiryOfferDetailsCard v-else :enquiry="enquiry" :computed-offer="computedOffer"
            :customer-full-name="customerFullName" show-space-details-only @go-to-space="goToSpace" />
        </v-col>
      </v-row>

      <v-row v-if="step == 2" no-gutters class="w-100">
        <v-col class="mr-md-5">
          <v-form @submit.prevent v-model="form2Valid" class="w-100">
            <v-card rounded="lg" class="pa-5" flat>


              <EnquiryOfferCreateUpdateBreakdown :computed-offer="computedOffer" :enquiry="enquiry"
                :new-venue-grand-total="newVenueGrandTotal" :new-user-grand-total="newUserGrandTotal" />

              <v-divider class="my-5"></v-divider>
              <v-row no-gutters class="font-500 text-18px" style="line-height: 1.2;">Tell {{ customerFullName }} what’s
                included in the offered
                price</v-row>

              <v-row no-gutters class="mt-3 mb-2">
                <v-textarea v-model="notes" no-resize variant="outlined" rounded="lg"
                  placeholder="Type your message..."></v-textarea>
              </v-row>


              <v-row no-gutters>
                <v-col cols="6">
                  <v-btn variant="outlined" border="secondary md" rounded="lg" @click="handleBack">Back</v-btn>
                </v-col>
                <v-col cols="6" align="end">
                  <v-btn v-if="isVenueOwner || isVenueAdmin" type="submit" variant="flat" rounded="lg" color="secondary"
                    @click="handleSendOffer" :loading="processing">Send Offer</v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-form>
        </v-col>

        <v-col class="d-none d-md-block" cols="4">
          <EnquiryOfferDetailsCard :enquiry="enquiry" :computed-offer="computedOffer"
            :customer-full-name="customerFullName" @go-to-space="goToSpace" :show-space-details-only="step !== 2" />
        </v-col>
      </v-row>


    </v-col>
    <!-- <EnquiryModal v-model:show="showEventDetailsDialog">
      <EnquiryOfferDetailsCard :enquiry="enquiry" :computed-offer="computedOffer" :customer-full-name="customerFullName"
        close-button @close-dialog="showEventDetailsDialog = false" @go-to-space="goToSpace" />
    </EnquiryModal> -->
  </v-row>
</template>

<script setup lang="ts">
import MComputedOffer from "~/models/computed-offer.model";
import MSpace from "~/models/space.model";
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();


const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { getEnquiry, enquiry } = useEnquiry();
const { requiredInput, longDateFormat } = useUtils();
const { computePayment } = useEnquiry();
const { cookieOptions, currentUser } = useLocalAuth();
const { socket, getMessages, connect, emitChat, conversation } = useChat();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser } = useAccess();
const { createCustomOffer } = useCustomOffer();
const {
  space,
  getSpace,
  allowedDatesChecker,
  timesFrom,
  allowedTime,
  checkTimesToFunction,
} = useSpace();
const { id } = useRoute().params;
const step = ref(1);
const formValid = ref(false);
const form2Valid = ref(false);
const processing = ref(false);
const logString = ref("");
const updateKey = ref(0);
const loading = ref(true);
const computedOffer = ref(new MComputedOffer({}));
const somethingWentWrongMessageObj = {
  modal: true,
  text: "Something went wrong. Please try again later.",
  color: "error",
}



const paymentDetails = ref({
  currency: "" as string,
  date: "" as string,
  from: "" as string,
  guests: null as null | number,
  to: "" as string,
  payment_computation: {
    venue: {
      commission_fee: null,
      grand_total: null,
      subtotal: null,
      cleaning_fee: null,
    },
    user: {
      rebate: null,
      grand_total: null,
      subtotal: null,
      cleaning_fee: null,
    },
  },
});
const inbox_id = ref<string | null>(null);
const notes = ref("");

const bookings = ref([]);
const showEventDetailsDialog = ref(false);


const loadBookings = async () => {
  try {
    const params: any = {
      space_id: space.value._id,
      limit: 100,
      status: "CONFIRMED",
    };

    if (computedOffer.value?.date) {
      params.start_date = computedOffer.value?.date
    }
    const { data, error } = await useAPI(`v1/bookings`, {
      method: "GET",
      query: params,
    });
    if (data && data.value) {
      const res = data.value as any;
      if (res.data && res.data.data) {
        bookings.value = res.data.data;
      }
    }
  } catch (error) {
    console.log(error);
  }
};


const recompute = async () => {
  const { from, to, date, guests } = computedOffer.value
  if (!from || !to || !guests || !date || !enquiry.value.space._id) {
    return;
  }
  processing.value = true;
  try {
    const payload = {
      space_id: enquiry.value.space._id,
      date,
      time_start: from,
      time_end: to,
      guests: guests,
    };
    const res = await computePayment(payload);
    if (res) {
      computedOffer.value = new MComputedOffer(res);
    }
    processing.value = false;
  } catch (err) {
    console.log(err);
    setSnackbar(somethingWentWrongMessageObj)
    processing.value = false;
  }
};



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
  const user = enquiry.value?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const fetchEnquiry = async () => {
  const { data } = await getEnquiry(id as string);
  if (data && data.value) {
    const res = data.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = res.data.data as any;
    inbox_id.value = res.data.data.inbox._id;
  }
};

const fetchComputePayment = async () => {
  const payload = {
    space_id: enquiry.value.space._id,
    date: enquiry.value.date.date,
    time_start: enquiry.value.date.from,
    time_end: enquiry.value.date.to,
    guests: enquiry.value.guests,
  };

  if (!payload.time_start || !payload.time_end || !payload.date || !payload.guests || !payload.space_id) {
    setSnackbar(somethingWentWrongMessageObj);
    return
  }
  const res = await computePayment(payload);
  if (res) {
    paymentDetails.value = res as any;
    computedOffer.value.date = paymentDetails.value?.date;
    computedOffer.value.guests = Number(paymentDetails.value?.guests);
    // computedOffer.value.payment_computation = paymentDetails.value?.payment_computation;
    computedOffer.value.currency = paymentDetails.value?.currency;
  } else {
    setSnackbar(somethingWentWrongMessageObj)
  }
};

const handleBack = () => {
  if (step.value == 1) {
    navigateTo({ name: chatRoute, params: { country, id } });
  } else {
    step.value--;
  }
};

const handleContinue = () => {
  if (!formValid.value) return;
  const content = document.querySelector('body');
  if (content) {
    content.scrollTop = 0;
  }


  if (Number(computedOffer.value.payment_computation.venue.subtotal) <= 0) {
    setSnackbar({
      modal: true,
      text: "Please select a different date or time",
      color: "error",
    });
    return;
  }

  step.value++;
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

// const newVenueGrandTotal = computed(() => {
//   const { payment_computation } = computedOffer.value;
//   return (
//     Number(payment_computation.venue.subtotal) +
//     (Number(payment_computation.venue.cleaning_fee) || 0) -
//     (Number(
//       (Number(payment_computation.venue.subtotal) + (Number(payment_computation.venue.cleaning_fee) || 0)) *
//       Number(payment_computation.venue.commission_fee),
//     ) || 0)
//   ).toFixed(2);
// });
const newVenueGrandTotal = computed(() => {
  const { payment_computation } = computedOffer.value;
  return (
    Number(payment_computation.venue.subtotal) +
    (Number(payment_computation.venue.cleaning_fee) || 0) -
    (Number(
      (Number(payment_computation.venue.subtotal)) *
      Number(payment_computation.venue.commission_fee),
    ) || 0)
  ).toFixed(2);
});

const newUserGrandTotal = computed(() => {
  const { payment_computation } = computedOffer.value;
  return (
    Number(payment_computation.user.subtotal) +
    (Number(payment_computation.user.cleaning_fee) || 0) -
    (Number(
      Number(payment_computation.user.subtotal) *
      Number(payment_computation.user.rebate),
    ) || 0)
  ).toFixed(2);
});

const handleSendOffer = async () => {
  if (!form2Valid.value) return;
  if (!inbox_id.value) return location.reload();
  processing.value = true;

  const { date, from, to, guests, payment_computation, currency } =
    computedOffer.value;

  if (!payment_computation.user.cleaning_fee)
    payment_computation.user.cleaning_fee = 0;
  if (!payment_computation.venue.cleaning_fee)
    payment_computation.venue.cleaning_fee = 0;

  if (!date || !from || !to || !guests || !payment_computation || !currency) {
    return;
  }

  let payload: TCreateCustomOfferPayload = {
    date: {
      date: date,
      from: from,
      to: to,
    },
    guests: guests,
    venue_computation: {
      subtotal: payment_computation.venue.subtotal as string,
      commission_fee: payment_computation.venue.commission_fee as number,
      cleaning_fee: payment_computation.venue.cleaning_fee as number,
      grand_total: newVenueGrandTotal.value, // NEW GRAND TOTAL
    },
    user_computation: {
      subtotal: payment_computation.user.subtotal as string,
      rebate: payment_computation.user.rebate as number,
      cleaning_fee: payment_computation.user.cleaning_fee,
      grand_total: newUserGrandTotal.value, // NEW GRAND TOTAL
    },
    inbox_id: inbox_id.value,
    currency: currency,
  };

  try {
    const { data } = await createCustomOffer(payload)
    if (
      !data ||
      !data.value ||
      !data.value?.data ||
      !data.value?.data?.insertedId
    )
      return;
    const res = data.value as any;

    const publicConfig = useRuntimeConfig().public;
    const accessToken = useCookie("accessToken", cookieOptions).value;

    // add socket info
    if (!socket.value) {
      await connect(publicConfig, accessToken as string);
    }

    await emitChat(SOCKET_EVENTS.GENERATE_CUSTOM_OFFER, {
      room_id: enquiry.value.inbox?.room_id,
      custom_offer_id: res.data.insertedId,
      message: "Custom Offer created",
    });
    if (notes.value !== "") {
      await joinRoom();
      await emitChat(SOCKET_EVENTS.SEND_MESSAGE_ROOM, {
        message: notes.value,
        attachments: [],
        room_id: enquiry.value.inbox?.room_id,
      });
    }

    navigateTo({ name: chatRoute, params: { country, id } });
  } catch (err) {
    console.log(err);
    processing.value = false;
  }
  processing.value = false;
};

const publicConfig = useRuntimeConfig().public;
const accesToken = useCookie("accessToken", cookieOptions).value;

const joinRoom = async () => {
  if (!socket.value) {
    await connect(publicConfig, accesToken as string);
    // await emitChat(SOCKET_EVENTS.JOIN_ROOM, {
    //   room_id: enquiry.value.inbox?.room_id,
    // });
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


onMounted(async () => {
  await fetchEnquiry();
  await fetchSpaceData();
  await fetchComputePayment();
  await loadBookings();
  loading.value = false;
});
</script>

<style scoped></style>
