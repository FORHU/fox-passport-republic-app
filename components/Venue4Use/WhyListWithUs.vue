<template>
  <v-row mo-gutters justify="center">
    <v-col cols="12" sm="12" md="10" lg="10" class="text-secondary">
      <!-- Content for tab 2 -->
      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Showcase Your Space to a Global Audience
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        Listing your venue on Venue4use means gaining access to a worldwide
        community of event planners, businesses, and individuals searching for
        the perfect space. Whether you own a cozy café or a luxurious ballroom,
        our platform helps you reach potential clients from all corners of the
        globe.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Simple and Free Listing
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        We believe in making things easy. That’s why listing your venue on
        Venue4use is both simple and free. Create a compelling profile with
        photos, descriptions, and availability details in just a few clicks, and
        start attracting bookings without any upfront costs.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Maximize Your Venue’s Potential
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        Our platform isn’t just about exposure—it’s about results. With
        Venue4use, you can manage your listings, track inquiries, and optimize
        your space’s visibility with our powerful tools. We give you the
        insights and control you need to turn interest into bookings.
      </p>

      <p
        :class="
          smAndDown
            ? 'text-26px font-700 mt-7 text-center'
            : 'text-30px font-700 mt-9'
        "
      >
        Trusted by Venue Owners Worldwide
      </p>
      <p
        :class="
          smAndDown
            ? 'text-18px text-center mx-5'
            : 'text-24px font-400 ml-10 mt-3'
        "
      >
        Venue4use is trusted by thousands of venue owners who want to make the
        most of their spaces. Our reputation for reliability, ease of use, and
        customer support makes us the go-to platform for those looking to fill
        their calendar with exciting events.
      </p>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
</script>
