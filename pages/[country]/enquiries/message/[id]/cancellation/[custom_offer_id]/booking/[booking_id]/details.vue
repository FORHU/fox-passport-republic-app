<template>
  <v-row no-gutters class="w-100 text-secondary" justify="center">
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">
      <v-row no-gutters class="w-100 my-5">
        <v-row no-gutters align="center" class="w-100">
          <v-col cols="12" :style="{ position: smAndUp ? 'relative' : 'absolute' }">
            <ButtonBack @click="handleBackButton" no-label />
          </v-col>
          <v-col cols="12" class="px-sm-5  text-22px font-500 text-center text-sm-start">Cancellation Details</v-col>
        </v-row>

        <v-card v-if="loading" flat rounded="lg" min-height="15dvh" width="100%">
          <LoadingChat :lines="10" />
        </v-card>
        <v-card v-else flat rounded="lg" color="white" class="px-5 py-3 mt-3" min-height="500px">

          <ReviewSpaceDetails :space="space" :enquiry="enquiry" />

          <v-row v-if="cancelledBy" no-gutters class="my-5">
            <v-col cols="12" class="font-500 text-18px text-start">Cancelled by
              <span class="">{{
                cancelledBy
              }}</span></v-col>
          </v-row>
          <v-divider v-if="getReasonLabel(offer?.booking?.cancellation_reason)" class="my-5"></v-divider>

          <v-row v-if="getReasonLabel(offer?.booking?.cancellation_reason)" no-gutters class="">
            <v-col cols="12" class="text-18px font-500 text-start">Reason for cancellation
            </v-col>
            <v-col cols="12" class="mt-4">
              <span class="text-16px">{{
                getReasonLabel(offer?.booking?.cancellation_reason)
              }}</span>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>

          <v-row no-gutters class="w-100">
            <v-col cols="12" class="text-18px font-500">Message from {{ isCancelledByUser ? customerFullName :
              ownerFullName }}</v-col>
            <v-col cols="12" class="text-16px mt-4" style="white-space: pre-wrap">{{
              offer?.booking?.cancellation_message }}</v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>

          <v-row no-gutters>
            <EnquiryBookingSummary :refund="refund" refund-only />
          </v-row>
        </v-card>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import MEnquiry from "~/models/enquiry.model";
import MOffer from "~/models/offer.model";


const { enquiry, getEnquiry, offer } = useEnquiry();
const { id, custom_offer_id, booking_id } = useRoute().params;
const { currentUser } = useLocalAuth();
const { country, getCurrencySymbol, setSnackbar } = useLocal();
const { computeBadgeCount } = useNotification();
import { useDisplay } from "vuetify";
import MSpace from "~/models/space.model";
const { mdAndUp, smAndUp } = useDisplay();
const { space, getSpace } = useSpace();

const loading = ref(true);
const showDetailsModal = ref(false);

const refund = reactive<TRefund>({
  allowed: false,
  currency: "SGD",
  grand_total: null,
  percentage: 0,
  refund_amount: 0,
  status: null,
});

const fetchOffer = async () => {
  if (!custom_offer_id) return;
  try {
    const { data } = await useAPI(`/v1/custom-offer/${custom_offer_id}`, {});

    if (data && data.value) {
      const res = data.value as any;

      if (!res.data) return;

      const responseData = res.data;
      offer.value = new MOffer(responseData);
      // form.message = responseData?.booking?.cancellation_message
      // form.reason_for_cancellation = responseData?.booking?.cancellation_reason

      if (res.data.booking.refund_data) {
        const refundRes = res.data.booking.refund_data;
        refund.allowed = refundRes.allowed;
        refund.currency = refundRes.currency.toUpperCase();
        refund.grand_total = refundRes.grand_total;
        refund.percentage = refundRes.percentage;
        refund.refund_amount = refundRes.refund_amount;
        refund.status = refundRes.status;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchEnquiryData = async () => {
  if (!id) return;
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);

  }
};

const isUser = computed(() => {
  return currentUser.value.role == "USER";
});

const getReasonLabel = (value: string) => {
  if (!value) return;
  const obj = isCancelledByUser.value ? reasons_user.find((x) => x.value == value) : reasons.find((x) => x.value == value);
  if (obj) {
    return obj.label;
  } else return "";
};

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

const goToSpace = () => {
  const spaceId = enquiry.value.space._id as string;
  if (spaceId) {
    navigateTo({
      name: "country-venues-venue",
      params: { country, venue: spaceId },
    });
  }
};

const handleBackButton = () => {
  navigateTo({ name: "country-enquiries-message-id", params: { country, id } });
};

const customerFullName = computed(() => {
  const user = enquiry.value?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const ownerFullName = computed(() => {
  const user = enquiry.value?.venue?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const cancelledBy = computed(() => {
  const cancelledByCustomer = enquiry.value.cancelledBy.role == "USER";
  const cancelledByOwner = enquiry.value.cancelledBy.role == "VENUE_OWNER";

  if (cancelledByCustomer) {
    return customerFullName.value;
  } else if (cancelledByOwner) {
    return ownerFullName.value;
  } else return null;
});

const isCancelledByUser = computed(() => {
  return enquiry.value.cancelledBy.role == "USER";
});


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
  await fetchOffer();
  await fetchEnquiryData();
  await fetchSpaceData();
  loading.value = false;
  computeBadgeCount();
});
</script>

<style scoped></style>
