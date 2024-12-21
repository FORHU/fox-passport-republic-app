<template>
  <v-row no-gutters justify="center">
    <v-col cols="auto">
      <v-card
        elevation="0"
        rounded="lg"
        :border="'black sm'"
        :max-width="mdAndUp ? '450px' : '370px'"
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
            <span v-if="customerRequestedToBook"
              >{{ customerName }} requested to book</span
            >
            <span v-if="ownerApprovedRequest"
              >{{ ownerName }} accepted the booking</span
            >
          </v-col>
          <v-divider class="my-2"></v-divider>
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-account-multiple-outline"
              class="mr-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon>
            {{ eventType }} for {{ guestsCount }} guests</v-col
          >
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-calendar-blank-outline"
              class="mr-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon>
            {{ date }} at {{ timeFrom }} - {{ timeTo }}</v-col
          >
          <v-col
            cols="12"
            class="font-weight-regular text-subtitle-2 text-sm-subtitle-1"
            justify="center"
            ><v-icon
              icon="mdi-information-outline"
              class="mr-2"
              :size="mdAndUp ? 30 : 20"
            ></v-icon
            >Total: {{ totalCost }} {{ withGST ? '(GST included)' : '' }}</v-col
          >
        </v-row>
      </v-card>
      <v-row
        no-gutters
        class="mt-1 text-caption text-sm-subtitle-2 mx-2"
        style="opacity: 60%"
        >{{ timeStamp }}</v-row
      >
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp } = useDisplay();
const { withGST } = useTax();

defineProps<{
  customerName: string;
  guestsCount: number;
  eventType: string;
  spaceName: string;
  venueName: string;
  date: string;
  timeTo: string;
  timeFrom: string;
  totalCost: string;
  timeStamp: string;
  customerRequestedToBook?: boolean;
  ownerApprovedRequest?: boolean;
  ownerName: string;
}>();
</script>

<style scoped></style>
