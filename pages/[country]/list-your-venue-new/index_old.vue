<template>
  <v-row>
    <v-col cols="12">
      <v-row align="left">
        <v-col cols="12" style="z-index: 2">
          <v-img :height="smAndDown && mdAndDown ? '400px' : '380px'"
            src="/public/images/termsandcondition/seabackground.png" cover>
            <v-row class="pa-10"> </v-row>
            <v-row :class="smAndDown ? '' : 'pa-10'"> </v-row>
            <v-row class="pb-15"></v-row>
            <v-row class="pl-15 pt-10 pr-10 font-weight-bold text-h3 text-white">
              <v-col cols="12"> Maximize your Venue's Potential </v-col>
            </v-row>
          </v-img>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <v-row></v-row>
      <v-row class="pa-10">
        <v-col cols="1"></v-col>
        <v-col cols="6">
          <v-row class="w-100 text-h4 font-weight-bold">
            Get Started Today
          </v-row>
          <v-row class="pt-5 pb-5"> Every Venue is a Venue4use Venue </v-row>
          <v-row class="pb-5">
            From private parties and corporate events to meetings and photo
            shoots, you decide which bookings to accept. Showcase your space to
            thousands of customers searching for venues just like yours.
          </v-row>
          <v-row>
            <v-btn density="compact" color="primary">
              <NuxtLink class="text-decoration-none text-white" :to="{
                path: `/${country}/venues/management/status/all`,
              }">
                List your Venue
              </NuxtLink>
            </v-btn>
          </v-row>
        </v-col>

        <v-col cols="5" style="position: relative">
          <img style="
              position: absolute;
              top: 0;
              right: 0;
              transform: translateX(100px) translateY(-250px);
            " height="700vh" class="pr-2" src="/public/images/list-your-venue/weddingreception1.png" />

          <!-- bottom: 0; left: 0; right: 0; transform: translateX(190px) translateY(-60px) -->
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <v-row class="pl-10 pr-10 pt-10 text-center align-center text-h4 font-weight-bold" justify="center">
        Let Ready-to-Book Customers
      </v-row>
      <v-row class="pb-5 text-center align-center text-h4 font-weight-bold" justify="center">
        Find Your Venue
      </v-row>
      <v-row class="pb-10 text-center align-center" justify="center">
        List your space with Venue4use for free and boost your revenue by up to
        30%.
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row justify="center" class="pa-10">
        <v-card variant="flat" width="70%" height="100%" style="
            background-color: rgba(230, 233, 239, 0.42);
            border-radius: 10px;
          ">
          <v-row no-gutters class="pt-10 pb-10" style="position: relative">
            <v-col cols="6">
              <img src="/public/images/list-your-venue/restauranthall.png" style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  transform: translateX(10px) translateY(-10px);
                  width: 30%;
                  height: 35%;
                " />
              <img src="/public/images/list-your-venue/weddingpic.png" style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  transform: translateX(190px) translateY(-60px);
                  width: 18%;
                  height: 65%;
                " />
            </v-col>
            <v-col cols="6">
              <v-row class="font-weight-bold text-h5">30,000+ Events Booked</v-row>
              <v-row class="font-weight-bold text-h5">Every Year</v-row>
              <v-row class="pt-5"><img height="25vh" class="pr-2" src="/public/images/list-your-venue/film1.png" />
                Film and Photo Shoots</v-row>
              <v-row class="pt-5"><img height="25vh" class="pr-2" src="/public/images/list-your-venue/building1.png" />
                Corporate Events</v-row>
              <v-row class="pt-5"><img height="25vh" class="pr-2" src="/public/images/list-your-venue/fireworks1.png" />
                Parties and Private Dining</v-row>
              <v-row class="pt-5"><img height="25vh" class="pr-2" src="/public/images/list-your-venue/heart1.png" />
                Weddings</v-row>
              <v-row class="pt-5"><img height="25vh" class="pr-2" src="/public/images/list-your-venue/monitor1.png" />
                Meetings and Conferences</v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row class="pa-10">
        <v-col col="6">
          <v-row class="pt-10 pb-10 pl-15 text-h4 font-weight-bold w-70">
            Monetize Your Space with Venue4use
          </v-row>

          <v-row class="pl-15 pb-10">
            <v-row>
              <v-col cols="2">
                <img height="40vh" class="pr-2" src="/public/images/list-your-venue/checklist1.png" />
              </v-col>
              <v-col cols="10">
                <v-row class="pb-2 text-h6">List Your Space for Free</v-row>
                <v-row class="pb-2 text-subtitle-2">No listing fees, ever. Create a profile, add your spaces, and
                  set your prices with ease.</v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <img height="40vh" class="pr-2" src="/public/images/list-your-venue/calendar1.png" />
              </v-col>
              <v-col cols="10">
                <v-row class="pb-2 text-h6">Control Availability, Rules, and Event Types</v-row>
                <v-row class="pb-2 text-subtitle-2">Whether on weekdays, weekends, or specific event types, you
                  decide. Sync your calendar to manage availability
                  seamlessly.</v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <img height="40vh" class="pr-2" src="/public/images/list-your-venue/chat1.png" />
              </v-col>
              <v-col cols="10">
                <v-row class="pb-2 text-h6">Engage and Quote</v-row>
                <v-row class="pb-2 text-subtitle-2">Chat with customers, provide price quotes, and get
                  notifications of new requests. Respond directly from your
                  mailbox, our messenger, or by phone.</v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <img height="40vh" class="pr-2" src="/public/images/list-your-venue/account1.png" />
              </v-col>
              <v-col cols="10">
                <v-row class="pb-2 text-h6">Secure Bookings and Collect Reviews</v-row>
                <v-row class="pb-2 text-subtitle-2">Convert bookings quickly and receive positive reviews.
                  Satisfied customers keep you at the top of search results,
                  maximizing your exposure.</v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <img height="40vh" class="pr-2" src="/public/images/list-your-venue/care1.png" />
              </v-col>
              <v-col cols="10">
                <v-row class="pb-2 text-h6">A Win-Win Partnership</v-row>
                <v-row class="pb-2 text-subtitle-2">We earn only when you do. We charge a commission ranging from
                  10% to 15%, depending on the country and event type.</v-row>
              </v-col>
            </v-row>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row class="pa-15">
            <img height="530vh" width="120%" src="/public/images/list-your-venue/weddingvenue2.png" />
          </v-row>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row class="pl-15 pb-5">
        <v-row class="pl-2 pt-10 pr-10 font-weight-bold text-h4">
          Diverse Venues, Unique Spaces
        </v-row>
        <v-row class="text-subtitle-2 pb-10">
          <v-col cols="6">
            We cater to all types of venues, from local bars and meeting rooms
            to industrial lofts and prestigious locations. With thousands of
            venues globally, we celebrate diversity and uniqueness.
          </v-col>
        </v-row>
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row class="pl-15 pr-15 pb-5">
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/bars1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Bars
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5 pb-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/meetingspaces1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Meeting Spaces
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/studio1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Studios
          </v-row>
        </v-col>

        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/restaurants1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Restaurants
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/warehouse1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Warehouses
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/conference1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Conference Centers
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/eventvenue1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Event Venues
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="3" class="pt-5">
          <v-row>
            <img height="220vh" width="100%" class="pr-2" src="/public/images/list-your-venue/outdoorspace1.png" />
          </v-row>
          <v-row class="pb-2 pt-1 font-weight-bold text-subtitle-2">
            Outdoor Spaces
          </v-row>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" class="pt-10">
      <CommonListYourVenueCard />
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { smAndDown, mdAndDown } = useDisplay();
const { country } = useLocal();
onBeforeMount(() => {
  reloadNuxtApp();
  window.scrollTo(0, 0);
});
</script>
