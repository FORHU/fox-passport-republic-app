<template>
  <v-row no-gutters class="py-10">
    <v-row>
      <v-col cols="12">
        <h1 class="text-center text-lg-start">
          Find the right venue <br />
          for your event
        </h1>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        class="d-flex flex-column align-center align-sm-start text-center text-sm-left"
      >
        <div
          class="rounded-lg d-flex justify-center align-center mt-7"
          style="background-color: #e3edff; padding: 15px"
        >
          <v-icon color="black" size="30" :icon="item.icon" />
        </div>
        <h2 class="my-3 my-sm-5">{{ item.title }}</h2>
        <p class="mr-5">{{ item.description }}</p>
      </v-col>
    </v-row>
  </v-row>

  <v-row no-gutters class="py-10" align="center">
    <v-col color="12">
      <v-card class="venue-card rounded-lg overflow-hidden">
        <v-img
          src="/images/landingpage/background-cta.png"
          height="500"
          width="100%"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
          cover
          alt="Background cta Image"
        >
          <v-container class="fill-height pa-0">
            <v-row align="center" justify="center" no-gutters>
              <v-col cols="12" sm="10" md="8" lg="8" class="text-center px-6">
                <h2 class="text-h4 text-sm-h3 font-weight-bold text-white mb-4">
                  List your venue for free and get more bookings!
                </h2>
                <p class="text-body-1 text-white mb-6">
                  Seeking a distinctive and adaptable location for your upcoming
                  occasion? Explore our array of rental venues and spaces! Our
                  assortment offers diverse choices to accommodate events of any
                  scale and nature.
                </p>
                <NuxtLink :to="`/${country}/signup/venue`">
                  <v-btn
                    class="mt-4 mx-auto text-white"
                    style="
                      border-radius: 8px;
                      padding: 17px 34px;
                      width: 195px;
                      height: 50px;
                      background-color: rgba(0, 0, 0, 0.5);
                      gap: 10px;
                    "
                  >
                    List Your Venue
                  </v-btn>
                </NuxtLink>
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
// let location = ref("SG")
const { country } = useLocal();

const items = ref([
  {
    icon: "mdi-map-marker-radius-outline",
    title: "Find the right space",
    description:
      "Browse the marketplace and customize your search that suits your activity needs.",
  },
  {
    icon: "mdi-book-open-blank-variant-outline",
    title: "Seamless booking",
    description:
      "Find your ideal space, reserve and pay securely with our payment system online.",
  },
  {
    icon: "mdi-account-group-outline",
    title: "Make memories",
    description:
      "Create an unforgettable experience in a memorable space and enjoy!",
  },
]);
</script>

<style scoped>
.overlay-sheet {
  position: absolute;
  bottom: 30px;
  right: 11px;
  background-color: #212b36;
  color: white;
  padding: 10px;
  z-index: 1;
}

.center-padding {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0px;
}

.venue-card {
  max-width: 100%;
}

@media (max-width: 600px) {
  .venue-card :deep(.v-img) {
    height: 500px !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-body-1 {
    font-size: 0.875rem !important;
  }
}
</style>
