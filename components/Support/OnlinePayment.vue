<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-card variant="text" class="pa-3">
        <v-row no-gutters v-if="xs">
          <v-col cols="12" class="font-weight-bold d-flex justify-center px-5">
            <span> What should be in my "rules of the space" section? </span>
          </v-col>
        </v-row>
        <v-card-title class="text-h4 font-weight-bold" v-else
          >What should be in my "rules of the space" section?</v-card-title
        >
        <v-card
          variant="text"
          prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
          title="Emma Stone"
          subtitle="2 years ago - Updated"
        />
        <v-card-text class="text-subtitle-1">
          Users are required by our
          <span class="text-teal-darken-3">Terms & Conditions</span> to follow
          both Venue4use policies and the rules of the space of the Venue they
          book. This means it is absolutely necessary for you to
          <span class="text-green-darken-2">add any rules</span> you may have
          about access, permitted activities, insurance requirements and other
          important day-of procedures.
        </v-card-text>
        <v-card-text class="text-subtitle-1">
          If you have multiple Venues listed with us, each can have its own
          rules that are specific to the activity each listing is under. Your
          rules of the space cannot be left blank, otherwise, you will not be
          able to
          <span class="text-green-darken-2"
            >enable payments for your spaces.
          </span>
        </v-card-text>
        <v-card-text class="text-subtitle-1">
          Requirements related to cleaning and removing trash from the space
          should not be included in this section and cannot be a requirement for
          booking your space. As a Venue Manager, you are responsible for
          cleaning your space after each Booking and preparing it for future
          use.
        </v-card-text>
        <v-card-text class="text-subtitle-1">
          Venue4use's booking policies covering
          <span class="text-green-darken-2">cancellations</span> or overtime
          apply to all Bookings between Venue Managers and Users. These policies
          are part of the Venue4use
          <span class="text-teal-darken-3">T&Cs</span> and are designed to
          ensure a smooth booking experience from start to finish. Because of
          that, your "rules of the space" cannot:
        </v-card-text>
        <v-row no-gutters v-if="xs">
          <v-col
            cols="12"
            v-for="item in terms"
            :key="index"
            class="px-15 text-subtitle-2 mb-3"
          >
            • <span>{{ item }}</span>
          </v-col>
        </v-row>
        <v-list
          class="px-15 text-subtitle-2"
          :items="terms"
          lines="one"
          v-else
        ></v-list>
        <v-card-text class="text-h6 font-weight-bold"
          >Examples of rules of the space that work:</v-card-text
        >
        <v-row no-gutters v-if="xs">
          <v-col
            cols="12"
            v-for="item in rules"
            :key="index"
            class="px-15 text-subtitle-2 mb-3"
          >
            • <span>{{ item }}</span>
          </v-col>
        </v-row>
        <v-list
          class="px-15 text-subtitle-2"
          :items="rules"
          lines="one"
          v-else
        ></v-list>
        <v-card-text class="text-subtitle-1">
          Venue4use does not allow Venue Managers to list rules with arbitrary
          fines. Any fines levied as a result of broken rules that are submitted
          as extra charges will require third party invoices and evidence.
        </v-card-text>
      </v-card>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" class="d-flex justify-center text-center mb-5">
      <v-card variant="text">
        <v-card-text>Was this article helpful?</v-card-text>
        <v-card-text class="py-0">
          <v-btn
            color="green-darken-2"
            variant="outlined"
            prepend-icon="mdi-check-circle"
            >Yes</v-btn
          >
          <v-btn
            class="ml-4"
            color="green-darken-2"
            variant="outlined"
            prepend-icon="mdi-close"
            >No</v-btn
          >
        </v-card-text>
        <v-card-text class="text-caption"
          >6 out 7 found this helpful</v-card-text
        >
        <v-card-text>
          Have more questions?
          <span class="text-teal-darken-3">Submit a request</span>
        </v-card-text>
      </v-card>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" class="py-4 d-flex flex-column">
      <span class="mb-3 font-weight-bold">Related articles</span>
      <span class="mb-3 text-teal-darken-3"
        >How should I define hire fee prices?</span
      >
      <span class="mb-3 text-teal-darken-3"
        >What is the Venue4use cancellation and refund policy?</span
      >
      <span class="mb-3 text-teal-darken-3"
        >How can I update "rules of the space"?</span
      >
      <span class="mb-3 text-teal-darken-3"
        >Do I supply clients with invoices?</span
      >
      <span class="mb-3 text-teal-darken-3"
        >How do payments work on Venue4use?</span
      >
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" class="mt-5 d-flex flex-column">
      <span class="font-weight-bold">Comments</span>
      <span>0</span>
      <span class="text-caption">comments</span>
    </v-col>
    <v-divider></v-divider>
    <v-col cols="12" class="mt-5">
      <span class="text-caption"
        >Please <span class="text-teal-darken-3">sign in</span> to leave a
        comment.</span
      >
    </v-col>
  </v-row>
</template>
<script setup>
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const terms = ref([
  "include contracts - Venue4use Bookings are covered by our T&Cs. Do not paste your contract, cancellation policy, or liability policy.",
  "include cleaning fees information - basic cleaning is the responsibility of the Venue Manager. If you charge a cleaning fee, you should include it in your pricing.",
  "encourage activities that would violate local laws.",
]);
const rules = ref([
  "No loud music after 11 pm",
  "No alcohol allowed after 8 pm",
  "No smoking in the building",
  "No pets allowed",
  "Outside catering is allowed",
  "Furniture must be moved back to where you found it",
]);
</script>
