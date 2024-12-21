<template>
  <v-row no-gutters justify="center">
    <v-col cols="auto">
      <v-card
        elevation="0"
        rounded="lg"
        :border="'black sm'"
        :max-width="mdAndUp ? '450px' : '320px'"
        style="border: 1px solid black !important"
      >
        <v-row no-gutters class="pa-3 pa-sm-5" align="start">
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-account-box"
              class="mr-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon>
            {{ message }}
          </v-col>

          <v-divider class="my-2"></v-divider>
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-phone"
              class="mr-2"
              :size="mdAndUp ? 25 : 18"
            ></v-icon>
            {{ content?.user_info?.first_name }}
            {{ content?.user_info?.last_name }}
            <a
              class="text-decoration-none text-secondary font-weight-black"
              :href="`whatsapp://send?phone=${content?.user_info?.phone_number}`"
              >{{ content?.user_info?.phone_number }}</a
            ></v-col
          >
        </v-row>
      </v-card>
      <v-row
        no-gutters
        class="mt-1 text-caption text-sm-subtitle-2 mx-2"
        style="opacity: 60%"
        >{{ timeStampDate(createdAt || "") }}</v-row
      >
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { longDateFormat, timeStampDate } = useUtils();
const { cookieOptions, currentUser } = useLocalAuth();
const { country, currentCurrency, getCurrencySymbol, setSnackbar } = useLocal();
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();

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
  user_info?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
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
}>();

const loggedUserId = computed(() => currentUser.value._id);

const message = computed(() => {
  return getOfferMessage("asked for contact number");
});

const getOfferMessage = (action: string) => {
  if (props.sender._id == loggedUserId.value) {
    return `You ${action}`;
  } else {
    return `${props.sender.first_name} ${props.sender.last_name} ${action}`;
  }
};
</script>

<style scoped></style>
