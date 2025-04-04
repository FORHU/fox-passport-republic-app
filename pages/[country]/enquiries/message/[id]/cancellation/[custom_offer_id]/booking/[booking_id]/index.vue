<template>
  <v-form v-model="formValid" ref="formRef" @submit.prevent class="">
    <v-row no-gutters class="pa-5" align="center" justify="center">
      <v-col style="max-width: 1300px">
        <v-row no-gutters class="w-100">
          <v-col>
            <v-row no-gutters align="center">
              <v-col cols="12" :style="{ position: smAndUp ? 'relative' : 'absolute' }">
                <ButtonBack @click="handleBackButton" no-label />
              </v-col>
              <v-col cols="12" class="px-sm-5  text-22px font-500 text-center text-sm-start">Cancel Booking</v-col>
            </v-row>
            <v-card class="pa-3" rounded="lg" flat width="100%" height="100%">

              <v-row v-if="isUser" no-gutters class="w-100">
                <SpacesDetailsRules :specificSpace="space" style="line-height: 2;" />
              </v-row>
              <v-row no-gutters v-else class="mt-5">
                <v-alert border="start" borer-color="warning-darken-2" variant="tonal" color="warning">
                  <v-row no-gutters class="text-secondary">
                    <div>
                      Cancellations by hosts are very difficult for clients and may result in <span
                        class="font-600">&nbsp;penalties to your account.&nbsp;</span> The client will be fully refunded
                      if you cancel the booking.
                      <br />
                      <br />
                      Do not cancel bookings on a client’s behalf. Instead, ask them to cancel the booking themselves.
                      Cancellations by hosts are always fully refunded. Only cancellations by clients are eligible for
                      partial refunds and will follow your <span class="font-600" style="di">&nbsp;cancellation
                        policy.&nbsp;</span>
                      If you have any questions about the cancellations process, get in touch.
                    </div>
                  </v-row>
                </v-alert>
              </v-row>

              <v-row no-gutters class="my-5">
                <EnquiryBookingSummary :refund="refund" :offer="offer" />
              </v-row>



              <v-row no-gutters class="w-100">

                <v-row no-gutters class="w-100">
                  <v-col cols="12" class="font-500 text-18px">Reason for cancellation</v-col>
                  <v-col cols="12">
                    <v-radio-group v-model="form.reason_for_cancellation" class="" :rules="[requiredInput]">
                      <template v-for="item in isUser ? reasons_user : reasons">
                        <v-row no-gutters class="w-100">
                          <v-radio :label="item.label" :value="item.value" size="sm"></v-radio>
                        </v-row>
                      </template>
                    </v-radio-group>
                  </v-col>
                </v-row>

                <v-divider class="mb-5"></v-divider>
                <v-row no-gutters variant="outlined" rounded="lg" width="100%" height="100%">
                  <v-row class="font-500 text-18px" no-gutters>
                    <v-col cols="12">Tell {{ isUser ? ownerFullName : customerFullName }} why you need to
                      cancel</v-col>
                  </v-row>
                  <v-row no-gutters class="w-100 pt-4">
                    <v-textarea v-model="form.message" variant="outlined" rounded="lg" placeholder="Type your message"
                      spellcheck="false" no-resize :rules="[requiredInput]"></v-textarea>
                  </v-row>
                </v-row>
              </v-row>

              <v-row no-gutters class="w-100 mt-3">
                <v-btn @click="handleCancelClick" color="secondary" rounded="lg"
                  :disabled="cancellationInProgress">Cancel
                  Booking</v-btn>
              </v-row>

            </v-card>
          </v-col>
          <v-col class="d-none d-md-block ml-md-5" cols="4">
            <v-card width="100%" rounded="lg" border="secondary md" flat class="pa-5">
              <ReviewSpaceDetails :space="space" :enquiry="enquiry" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <ModalCancelBookingPrompt @agree="handleCancellation" @disagree="showCancelBookingDialog = false"
        v-model:show="showCancelBookingDialog" />
    </v-row>
    <LoadingTransparent v-if="cancellationInProgress" />
  </v-form>
</template>

<script setup lang="ts">
// const { enquiry, getEnquiry } = useEnquiry();
import MSpace from "~/models/space.model";
import MEnquiry from "~/models/enquiry.model";
import MOffer from "~/models/offer.model";
import { useDisplay } from "vuetify";
const { smAndUp, smAndDown } = useDisplay();

const { currentUser, cookieOptions } = useLocalAuth();
const { country, currentCurrency, setSnackbar } = useLocal();
const { enquiry, getEnquiry, offer, updateEnquiry } = useEnquiry();
const { socket, getMessages, connect, emitChat, conversation } = useChat();
const { requiredInput, longDateFormat } = useUtils();
const { id, custom_offer_id, booking_id } = useRoute().params;
const { space, getSpace } = useSpace();
const { emitGlobalSocket } = useGlobalSocket();


const formValid = ref(false);
const formRef = ref();
let showCancelBookingDialog = ref(false);
const showEventDetailsDialog = ref(false);
const cancellationInProgress = ref(false);

const form = reactive({
  reason_for_cancellation: null,
  message: "",
});

const refund = reactive<TRefund>({
  allowed: false,
  currency: "SGD",
  grand_total: null,
  percentage: 0,
  refund_amount: 0,
  status: null,
});

const reasons = [
  {
    label: "The guest booked the incorrect event type",
    value: "THE_GUEST_BOOKED_INCORRECT_TYPE",
  },
  {
    label: "The booking violates the rules of my space",
    value: "THE_BOOKING_VIOLATES_THE_RULES_OF_MY_SPACE",
  },
  {
    label: "The guest is unresponsive",
    value: "THE_GUEST_IS_UNRESPONSIVE",
  },
  {
    label: "My space is no longer available",
    value: "MY_SPACE_IS_NO_LONGER_AVAILABLE",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

const reasons_user = [
  {
    label: "Changed my mind",
    value: "CHANGE_MY_MIND",
  },
  {
    label: "Scheduling conflict",
    value: "SCHEDULING_CONFLICT",
  },
  {
    label: "Weather concerns",
    value: "WEATHER_CONCERNS",
  },
  {
    label: "Event rescheduled",
    value: "EVENT_SCHEDULED",
  },
  {
    label: "Health and safety concerns",
    value: "HEALTH_AND_SAFETY_CONCERNS",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

const chatRoute = "country-enquiries-message-id";

const ownerFullName = computed(() => {
  const user = enquiry.value?.venue?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const items = [
  {
    title: "Booking Details",
    subtitle: "Update Booking Details",
    disabled: false,
  },
  { title: "Review", disabled: false },
];

// const customerFullName = computed(() => {
//   return `${enquiry.value.user.first_name} ${enquiry.value.user.last_name}`;
// });
const customerFullName = computed(() => {
  const user = enquiry.value?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const fetchEnquiryData = async () => {
  if (!id) return;
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
  }
};

const fetchOffer = async () => {
  if (!custom_offer_id) return;
  try {
    const { data } = await useAPI(`/v1/custom-offer/${custom_offer_id}`, {});

    if (data && data.value) {
      const res = data.value as any;

      if (!res.data) return;

      const responseData = res.data;

      offer.value = new MOffer(responseData);
      form.message = responseData?.booking?.cancellation_message;
      form.reason_for_cancellation = responseData?.booking?.cancellation_reason;
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

const goBack = () => {
  navigateTo({ name: chatRoute, params: { country, id } });
};

const isUser = computed(() => {
  return currentUser.value.role == "USER";
});

const handleCancelClick = () => {
  formRef.value.validate();
  if (formValid.value) {
    showCancelBookingDialog.value = true;
  }
};

const handleCancellation = async () => {
  if (!formValid.value || !booking_id) return;
  const { reason_for_cancellation, message } = form;
  cancellationInProgress.value = true;
  try {
    const { error } = await useAPI(`/v1/bookings/cancel/${booking_id}`, {
      method: "PATCH",
      body: JSON.stringify({
        reason_for_cancellation,
        message,
      }),
    });
    if (error.value) {
      setSnackbar({
        modal: true,
        color: "error",
        text: "Something went wrong. Please try again later.",
      });
      return;
    }
    // await updateEnquiry(id as string, { status: "CANCELLED" });
    await emitGlobalSocket(SOCKET_EVENTS.NOTIFICATION_COUNT, {custom_offer_id})

    showCancelBookingDialog.value = false;
    setSnackbar({
      color: "info",
      text: "You cancelled this booking.",
      modal: true,
    });

    await joinRoom();
    await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
      room_id: enquiry.value.inbox?.room_id,
      custom_offer_id: custom_offer_id,
      message: "null",
      key: "CANCELLED",
    });

    

    navigateTo({
      name: "country-enquiries-message-id",
      params: { country, id },
    });
    cancellationInProgress.value = false;
  } catch (err) {
    console.log(err);
    showCancelBookingDialog.value = false;
    cancellationInProgress.value = false;
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

const publicConfig = useRuntimeConfig().public;
const accessToken = useCookie("accessToken", cookieOptions).value;

const joinRoom = async () => {
  if (!socket.value) {
    await connect(publicConfig, accessToken as string);
    // await emitChat(SOCKET_EVENTS.JOIN_ROOM, {
    //   room_id: enquiry.value.inbox?.room_id,
    // });
  }
};

const handleBackButton = () => {
  navigateTo({ name: "country-enquiries-message-id", params: { country, id } });
};

const fetchRefundData = async () => {
  try {
    const { data } = await useAPI(
      `/v1/bookings/cancel/computation/${booking_id}`,
    );
    const res = data.value as any;

    if (res.data) {
      refund.allowed = res.data.allowed;
      refund.currency = res.data.currency.toUpperCase();
      refund.grand_total = res.data.grand_total;
      refund.percentage = res.data.percentage;
      refund.refund_amount = res.data.refund_amount;
      refund.status = res.data.status;
    }
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  await fetchEnquiryData();
  await fetchRefundData();
  await fetchOffer();
  await fetchSpaceData();
});
</script>

<style scoped>
.selected-item {
  background-color: black;
  color: white;
}
</style>
