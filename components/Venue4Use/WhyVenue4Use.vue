<template>
  <v-row mo-gutters justify="center">
    <v-col cols="12" sm="12" md="10" lg="10" class="text-secondary">
      <!-- Content for tab 1 -->
      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Zero Fees, Maximum Value
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        At Venue4use, we believe in transparency. That’s why our platform is
        completely free to use—no hidden fees, no surprise charges. Whether
        you're booking a venue for your event or listing your space to reach a
        global audience, you only pay what the venue or space owner charges.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        User-Friendly Experience
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        We’ve designed Venue4use with simplicity in mind. Our intuitive platform
        allows you to find or list event spaces with just a few clicks.
        Searching for a venue? Easily filter by location, event type, capacity,
        and more. Listing your space? Our straightforward process lets you
        showcase your venue to potential clients in minutes.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Global Reach, Local Focus
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        Whether you're hosting a conference in Singapore or listing a beachfront
        property in Philippines, Venue4use connects you with a global network of
        event spaces and clients. Our platform bridges the gap between local
        charm and international demand, helping you find the perfect venue or
        audience, no matter where in the world you are.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Dedicated Support, Anytime
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        Your success is our priority. That’s why we offer round-the-clock
        customer support to ensure your experience with Venue4use is seamless.
        Need assistance finding a venue or optimizing your listing? Our support
        team is here to help with quick, personalized solutions.
      </p>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
</script>


