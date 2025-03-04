<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-img height="400" src="/public/images/about-us/background-cta.png" cover alt="Venue4use About Us Header Image">
        <v-row no-gutters class="fill-height third-gradient" align="center" justify="center">
          <v-col cols="12" class="pa-4 text-center">
            <h1 class="font-700 text-60px text-white">About Us</h1>
            <p class="font-500 text-30px text-white">
              Your Memories, Our Venue
            </p>
          </v-col>
        </v-row>
      </v-img>
    </v-col>

    <!-- BODY -->
    <v-col cols="12">
      <v-row no-gutters justify="center" class="pt-10 custom-padding">
        <!-- Premier Rental Section -->
        <v-col cols="12" sm="12" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <v-row align="center" justify="space-between" class="pa-md-4">
            <v-col cols="12" sm="6" md="6" lg="6" class="mb-4 mb-md-0">
              <v-lazy>
                <v-img height="325px" width="520px" src="/public/images/about-us/premier-img.png" cover
                  class="rounded-lg elevation-2" alt="Venue4use About Us Header Image 2"></v-img>
              </v-lazy>
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="5" class="text-center text-md-left d-flex flex-column justify-center">
              <h2 class="font-500 text-30px mb-4">
                Premier Online Venue Rental Marketplace
              </h2>
              <p class="font-400 text-18px mb-0">
                We are dedicated to transforming the way events are planned and
                executed by providing a seamless, efficient, and comprehensive
                platform for venue rentals worldwide.
              </p>
            </v-col>
          </v-row>
        </v-col>

        <!-- Our Mission Section -->
        <v-col cols="12" sm="10" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <h2 class="text-45px font-700 text-center mb-16">Our Mission</h2>
          <v-row align="center" justify="space-between" class="pa-md-4">
            <v-col cols="12" sm="6" md="6" lg="5"
              class="text-center text-md-left d-flex flex-column justify-center mb-4 mb-md-0">
              <h2 class="font-500 text-30px mb-4">
                Eliminate the challenges event organizers face in finding the
                perfect venue.
              </h2>
              <p class="font-400 text-18px mb-0">
                We aim to streamline the venue rental process, offering a
                user-friendly platform that provides comprehensive listings,
                transparent pricing, easy-to-use filters, and secure booking
                systems. We strive to empower our clients with the tools they
                need to make informed decisions quickly and effortlessly.
              </p>
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="4" class="d-flex justify-center justify-md-end mb-4 mb-md-0">
              <v-img height="325px" width="520px" src="/public/images/about-us/mission-img.png" cover
                class="rounded-lg elevation-2" alt="Venue4use About Us Missions Image"></v-img>
            </v-col>
          </v-row>
        </v-col>

        <!-- What We Offer Section -->
        <v-col cols="12" sm="10" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <h2 class="text-45px font-700 text-center mb-16">What we offer</h2>
          <v-row align="start" justify="space-between" class="pa-md-4">
            <v-col cols="12" sm="6" md="3" lg="2"
              class="d-flex flex-column align-center align-sm-start text-center text-sm-left mb-8">
              <div class="rounded-lg shadow-lg" style="background-color: #fff; padding: 20px">
                <v-lazy>
                  <v-icon color="black" size="30" icon="mdi-map-marker-radius-outline"></v-icon>
                </v-lazy>
              </div>
              <h2 class="font-700 text-25px">Diverse Listings</h2>
              <p>
                Our platform features a wide variety of local and international
                venues to cater to any event need, from weddings and corporate
                events to workshops and unique celebrations.
              </p>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2"
              class="d-flex flex-column align-center align-sm-start text-center text-sm-left mb-8">
              <div class="rounded-lg shadow-lg" style="background-color: #fff; padding: 20px">
                <v-lazy>
                  <v-icon color="black" size="30" icon="mdi-tag-outline"></v-icon>
                </v-lazy>
              </div>
              <h2 class="font-700 text-25px">Transparent Pricing</h2>
              <p>
                We offer clear and upfront pricing, eliminating the frustration
                of hidden fees and unclear terms.
              </p>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2"
              class="d-flex flex-column align-center align-sm-start text-center text-sm-left mb-8">
              <div class="rounded-lg shadow-lg" style="background-color: #fff; padding: 20px">
                <v-lazy>
                  <v-icon color="black" size="30" icon="mdi-magnify"></v-icon>
                </v-lazy>
              </div>
              <h2 class="font-700 text-25px">Advanced Search Tools</h2>
              <p>
                Our easy-to-use filters and interactive maps help you find the
                perfect venue quickly.
              </p>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2"
              class="d-flex flex-column align-center align-sm-start text-center text-sm-left mb-8">
              <div class="rounded-lg shadow-lg" style="background-color: #fff; padding: 20px">
                <v-lazy>
                  <v-icon color="black" size="30" icon="mdi-lock-outline"></v-icon>
                </v-lazy>
              </div>
              <h2 class="font-700 text-25px">Secure Booking</h2>
              <p>
                Enjoy peace of mind with our secure online booking and payment
                systems.
              </p>
            </v-col>
          </v-row>
        </v-col>

        <!-- Unique Value Section -->
        <v-col cols="12" sm="10" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <h2 class="text-45px font-700 text-center mb-6">Our Unique Value</h2>
          <p class="font-400 text-center text-25px mb-16">
            Venue4use stands out in the competitive venue rental market by
            offering:
          </p>
          <v-row align="center" justify="space-between" class="pa-md-4">
            <v-col cols="12" sm="6" md="3" lg="2" class="d-flex flex-column align-center text-center">
              <div class="rounded-lg" style="padding: 20px">
                <v-img src="/svg/app-box.svg" width="30" height="30" contain
                  class="d-flex align-center justify-center" alt="Venue4use About Us Offers Image"></v-img>
              </div>
              <h2 class="font-700 text-25px mt-4">A user-friendly interface</h2>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2" class="d-flex flex-column align-center text-center">
              <div class="rounded-lg" style="padding: 20px">
                <v-img src="/svg/setting-circular.svg" width="30" height="30" contain
                  class="d-flex align-center justify-center" alt="Venue4use About Us Options Image"></v-img>
              </div>
              <h2 class="font-700 text-25px mt-4">
                A wider variety of venue options
              </h2>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2" class="d-flex flex-column align-center text-center">
              <div class="rounded-lg" style="padding: 20px">
                <v-img src="/svg/app-box.svg" width="30" height="30" contain
                  class="d-flex align-center justify-center" alt="Venue4use About Us Customer Support Image"></v-img>
              </div>
              <h2 class="font-700 text-25px mt-4">
                Dedicated customer support
              </h2>
            </v-col>

            <v-col cols="12" sm="6" md="3" lg="2" class="d-flex flex-column align-center text-center">
              <div class="rounded-lg" style="padding: 20px">
                <v-icon color="black" size="30" icon="mdi-tune"></v-icon>
              </div>
              <h2 class="font-700 text-25px mt-4">
                Advanced search and filter options
              </h2>
            </v-col>
          </v-row>
        </v-col>

        <!-- Our Vision Section -->
        <v-col cols="12" sm="10" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <v-row align="center" class="pa-md-4">
            <v-col cols="12">
              <h2 class="text-45px font-700 text-center mb-16">Our Vision</h2>
              <p class="font-400 text-center text-25px mb-16">
                We envision a future where finding and booking the perfect venue
                is a hassle-free experience. By leveraging technology and
                innovation, we aim to set new standards in the venue rental
                industry, ensuring our clients can focus on creating memorable
                events without the stress of venue logistics.
              </p>
            </v-col>
          </v-row>
        </v-col>

        <!-- Join Us -->
        <v-col cols="12" sm="10" md="10" lg="10" xl="10" class="py-12 mx-auto">
          <v-row align="center" justify="space-between" class="pa-0">
            <!-- Text Content Column -->
            <v-col cols="12" sm="12" md="6" lg="6"
              class="text-center text-md-left d-flex flex-column justify-center pa-4">
              <h2 class="font-500 text-30px mb-4">Join Us</h2>
              <p class="font-400 text-18px mb-6">
                Join Venue4use in revolutionizing the event venue rental
                industry. Whether you're an event planner, a host, or an
                individual looking for a unique space, we are here to make your
                venue search simple and efficient.
              </p>
              <p>
                For more information and to start your venue search, visit us at
                <NuxtLink to="/"> www.venue4use.com</NuxtLink>.
              </p>
            </v-col>
            <!-- Images Column -->
            <v-col cols="12" sm="12" md="6" lg="3" class="d-flex flex-column align-center pa-4">
              <!-- First Row with Two Columns -->
              <v-row no-gutters class="pa-0 ma-0" align="end" justify="center">
                <!-- First Image -->
                <v-col cols="6" sm="6" md="6" lg="6" class="d-flex justify-center align-center pa-2">
                  <v-lazy>
                    <div style="width: 130px; height: 130px">
                      <v-img src="/public/images/about-us/join-img-1.png" cover class="rounded-lg elevation-2"
                        style="aspect-ratio: 1 / 1" alt="Venue4use About Us Join Us Image"></v-img>
                    </div>
                  </v-lazy>
                </v-col>

                <!-- Second Image -->
                <v-col cols="6" sm="6" md="6" lg="6" class="d-flex justify-center align-center pa-2">
                  <v-lazy>
                    <v-img height="184px" width="184px" src="/public/images/about-us/join-img-2.png" cover
                      class="rounded-lg" style="width: 184px; height: 164px; object-fit: cover" alt="Venue4use About Us Join Us 2 Image"></v-img>
                  </v-lazy>
                </v-col>
              </v-row>

              <!-- Second Row with Two Columns -->
              <v-row no-gutters class="pa-0 ma-0" align="start" justify="center">
                <!-- Third Image -->
                <v-col cols="6" sm="6" md="6" lg="6" class="d-flex justify-center align-center pa-2">
                  <v-lazy>
                    <v-img height="184px" width="184px" src="/public/images/about-us/join-img-3.png" cover
                      class="rounded-lg" style="width: 184px; height: 164px; object-fit: cover" alt="Venue4use About Us Join us 3 Image"></v-img>
                  </v-lazy>
                </v-col>

                <!-- Fourth Image -->
                <v-col cols="6" sm="6" md="6" lg="6" class="d-flex justify-center align-center pa-2">
                  <v-lazy>
                    <div style="width: 130px; height: 130px">
                      <v-img src="/public/images/about-us/join-img-4.png" cover class="rounded-lg elevation-2"
                        style="aspect-ratio: 1 / 1" alt="Venue4use About Us Join Us 4 Image"></v-img>
                    </div>
                  </v-lazy>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup>
onBeforeMount(() => {
  reloadNuxtApp();
  window.scrollTo(0, 0);
});
</script>
