<template>
  <v-row v-if="showStatus && adminKey" no-gutters :justify="showSentMessage ? 'end' : 'start'">
    <v-col cols="auto">
      <v-row no-gutters class="mt-1 text-caption text-sm-subtitle-2 mx-2" style="opacity: 60%"
        :justify="showSentMessage ? 'end' : 'start'">{{ timeStampDate(createdAt || "") }}</v-row>
      <v-card elevation="0" rounded="lg" :border="'black sm'" max-width="auto"
        style="border: 1px solid black !important">
        <v-row no-gutters class="pa-3 pa-sm-5 d-flex flex-column text-16px" align="start"
          style="max-width:max-content;">
          <v-col cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            :class="adminKey == 'CANCELLED' ? 'text-error' : ''" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-check" class="mr-2" :size="mdAndUp ? 25 : 20"></v-icon>
            {{ message }}
          </v-col>

          <!-- <v-divider class="my-2"></v-divider> -->
          <v-col cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-account-multiple-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>
            {{ content.event_type }} for {{ content.guests }} guests</v-col>
          <v-col v-if="enquiryMessage" cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center" style="max-width: max-content;"><v-icon icon="mdi-home-variant-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>
            {{ content.space_name || "" }} at
            {{ content.venue_name || "" }}</v-col>
          <v-col cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-calendar-blank-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>
            {{ longDateFormat(content.event_date) }}</v-col>
          <v-col cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-clock-time-three-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>
            {{ convertTimeToAMPM(content.timeFrom) }} -
            {{ convertTimeToAMPM(content.timeTo) }}</v-col>
          <v-col v-if="enquiryMessage && content.own_catering" cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-information-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>I want to bring my own catering</v-col>
          <v-col v-if="enquiryMessage && content.require_catering" cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1" justify="center"
            style="max-width: max-content;"><v-icon icon="mdi-information-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>I require catering</v-col>
          <v-col v-if="!enquiryMessage" cols="12" class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center" style="max-width: max-content;"><v-icon icon="mdi-tag-outline" class="mr-2"
              :size="mdAndUp ? 25 : 20"></v-icon>Total: {{ getCurrencySymbol(content?.currency) }}
            {{
              content.payment_computation?.user_computation?.grand_total
            }}</v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else-if="showStatus && !adminKey">
    <v-col cols="12" class="text-16px text-center">
      <v-row no-gutters class="mt-1 text-16px text-secondary font-500" justify="center">{{ timeStampDate(createdAt ||
        "") }}</v-row>
      {{ loggedUserId == sender?._id ? 'Your' : (sender?.first_name || '') + ' ' + (sender?.last_name || '') }} inquiry
      for {{ content?.guests }} guests on {{
        longDateFormat(content.event_date) }} has been sent. <span
        class="text-decoration-underline font-500 cursor-pointer" @click="emit('go-to-space')">Show
        listing</span></v-col>
  </v-row>
</template>

<script setup lang="ts">
const { longDateFormat, timeStampDate, convertTimeToAMPM } = useUtils();
const { cookieOptions, currentUser } = useLocalAuth();
const { country, currentCurrency, getCurrencySymbol, setSnackbar } = useLocal();

import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const emit = defineEmits(['go-to-space'])

type TEnquiryContent = {
  event_date: string;
  event_type: string;
  guests: string | number;
  message: string;
  space_name: string;
  timeFrom: string;
  timeTo: string;
  venue_name: string;
  own_catering: boolean;
  require_catering: boolean;
  currency: string;
  payment_computation: {
    venue_computation: {
      commission_fee: null | number;
      grand_total: null | number;
      subtotal: null | number;
    };
    user_computation: {
      rebate: null | number;
      grand_total: null | number;
      subtotal: null | number;
    };
  };
};

const props = defineProps<{
  content: TEnquiryContent;
  sender: {
    first_name: string;
    last_name: string;
    _id: string;
  };
  createdAt: string;
  adminKey?: string;
  showSentMessage?: boolean;
}>();

const loggedUserId = computed(() => currentUser.value._id);

const message = computed(() => {
  switch (props.adminKey) {
    case "CUSTOM_OFFER_SENT":
      return getOfferMessage("sent an offer");
    case "CUSTOM_OFFER_UPDATED":
      return getOfferMessage("sent an updated offer");
    case "OFFER_ACCEPTED":
      return getOfferMessage("accepted the offer");
    case "BOOKING_REQUESTED":
      return getOfferMessage("requested to book");
    case "BOOKING_CONFIRMED":
      return 'This booking is confirmed and paid';
    default:
      return getOfferMessage("sent an enquiry");
  }
});

const showStatus = computed(() => {
  const adminKey = props.adminKey;
  return (
    adminKey !== "DECLINED" &&
    adminKey !== "CANCELLED" &&
    adminKey !== "BOOKING_WITHDRAWN" &&
    adminKey !== "BOOKING_REQUEST_DECLINED" &&
    adminKey !== "REQUEST_PHONE_NUMBER" && 
    adminKey !== "ARCHIVED"
  );
});

const getOfferMessage = (action: string) => {
  if (props.sender._id == loggedUserId.value) {
    return `You ${action}`;
  } else {
    return `${props.sender.first_name} ${props.sender.last_name} ${action}`;
  }
};

const isUser = computed(() => {
  return currentUser.value?.role === 'USER'
});


const enquiryMessage = computed(() => {
  return !props.adminKey;
});
</script>

<style scoped></style>
