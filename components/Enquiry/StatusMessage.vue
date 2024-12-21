<template>
  <v-row v-if="showStatus" no-gutters :justify="showSentMessage ? 'end' : 'start'">
    <v-col cols="auto">
      <v-row
        no-gutters
        class="mt-1 text-caption text-sm-subtitle-2 mx-2"
        :justify="showSentMessage ? 'end' : 'start'"
        style="opacity: 60%"
        >{{ timeStampDate(createdAt || "") }}</v-row
      >
      <v-card
        elevation="0"
        rounded="lg"
        :border="'black sm'"
        :max-width="mdAndUp ? '450px' : '370px'"
        style="border: 1px solid black !important"
        min-height="40px"
      >
        <v-row no-gutters class="pa-2 pa-sm-3" align="start">
          <v-col
            cols="12"
            class="font-weight-regular text-caption text-sm-subtitle-1 d-flex align-center"
            justify="center"
            ><span><v-icon
              icon="mdi-alert-box"
              color="error"
              class="mr-1 mr-sm-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon></span>
            <div style="line-height: 1.2;">{{ message }}</div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { cookieOptions, currentUser } = useLocalAuth();
const { longDateFormat, timeStampDate } = useUtils();
const loggedUserId = computed(() => currentUser.value._id);

import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

const props = defineProps<{
  sender: {
    first_name: string;
    last_name: string;
    _id: string;
  };
  createdAt: string;
  adminKey?: string;
  showSentMessage?: boolean;
}>();

const showStatus = computed(() => {
  const adminKey = props.adminKey;
  return (
    adminKey == "DECLINED" ||
    adminKey == "CANCELLED" ||
    adminKey == "BOOKING_WITHDRAWN" ||
    adminKey == "BOOKING_REQUEST_DECLINED" ||
    adminKey == "ARCHIVED"
  );
});

const message = computed(() => {
  switch (props.adminKey) {
    case "DECLINED":
      return getOfferMessage("declined the offer");
    case "CANCELLED":
      return getOfferMessage("cancelled this booking");
    case "BOOKING_WITHDRAWN":
      return getOfferMessage("have withdrawn this booking request");
    case "BOOKING_REQUEST_DECLINED":
      return getOfferMessage("have declined this booking request");
    case "ARCHIVED":
      return getOfferMessage("archived this inquiry");
    default:
      return null;
  }
});

const getOfferMessage = (action: string) => {
  if (props.sender._id == loggedUserId.value) {
    return `You ${action}`;
  } else {
    return `${props.sender.first_name} ${props.sender.last_name} ${action}`;
  }
};

const enquiryMessage = computed(() => {
  return !props.adminKey;
});
</script>

<style scoped></style>
