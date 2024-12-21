<template>
  <v-dialog
    v-model="reviewDialog"
    max-width="900px"
    max-height="96vh"
    class="fixed-dialog"
  >
    <v-card class="rounded-xl pa-4">
      <v-row no-gutters>
        <!-- LEFT -->
        <v-col cols="12" sm="4" class="font-500 pa-2">
          <p class="display-rating text-center">{{ spaceRatingOverall }}</p>
          <p class="text-18px">Overall Rating</p>
          <v-row no-gutters>
            <v-col cols="6" sm="12" class="pr-sm-0 pr-4">
              <!-- LINEAR RATING -->
              <div class="linear mt-2">
                <div class="d-flex align-center">
                  <p class="mr-3">5</p>
                  <v-progress-linear
                    bg-color="pink-lighten-3"
                    color="#8091AF"
                    model-value="100"
                    rounded
                  ></v-progress-linear>
                </div>
                <div class="d-flex align-center">
                  <p class="mr-3">4</p>
                  <v-progress-linear
                    bg-color="pink-lighten-3"
                    color="#8091AF"
                    model-value="80"
                    rounded
                  ></v-progress-linear>
                </div>
                <div class="d-flex align-center">
                  <p class="mr-3">3</p>
                  <v-progress-linear
                    bg-color="pink-lighten-3"
                    color="#8091AF"
                    model-value="15"
                    rounded
                  ></v-progress-linear>
                </div>
                <div class="d-flex align-center">
                  <p class="mr-3">2</p>
                  <v-progress-linear
                    bg-color="pink-lighten-3"
                    color="#8091AF"
                    model-value="15"
                    rounded
                  ></v-progress-linear>
                </div>
                <div class="d-flex align-center">
                  <p class="mr-3">1</p>
                  <v-progress-linear
                    bg-color="pink-lighten-3"
                    color="#8091AF"
                    model-value="5"
                    rounded
                  ></v-progress-linear>
                </div>
              </div>
            </v-col>
            <v-col cols="6" sm="12" class="pl-sm-0">
              <!-- RATE EACH -->
              <div class="mt-2">
                <div class="d-flex justify-space-between">
                  <p>Cleanliness</p>
                  <p>4.9</p>
                </div>
                <div class="d-flex justify-space-between">
                  <p>Accuracy</p>
                  <p>4.9</p>
                </div>
                <div class="d-flex justify-space-between">
                  <p>Communication</p>
                  <p>4.9</p>
                </div>
                <div class="d-flex justify-space-between">
                  <p>Location</p>
                  <p>4.9</p>
                </div>
                <div class="d-flex justify-space-between">
                  <p>Value</p>
                  <p>4.9</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <!-- RIGHT -->
        <v-col cols="12" sm="8" class="pa-2">
          <div class="d-flex justify-space-between my-5">
            <p class="text-26px font-500">234 Reviews</p>
            <v-autocomplete
              density="compact"
              placeholder="Most Recent"
              auto-select-first
              max-width="170px"
              rounded="lg"
            ></v-autocomplete>
          </div>

          <v-autocomplete
            density="compact"
            placeholder="Search reviews"
            prepend-inner-icon="mdi-magnify"
            auto-select-first
            rounded="lg"
          ></v-autocomplete>

          <div class="review-list">
            <v-col v-for="n in 6" :key="n">
              <CardReviewVenueCardAll
                avatar-src="/path/to/avatar.jpg"
                user-name="Sarah M."
                user-details="2 years on Venue4use"
                :rating="5"
                review-date="1 week ago"
                review-text="I Do in Our Eden exceeded all our expectations. The venue is breathtaking, the staff is professional yet friendly, and they helped us create a wedding that was both elegant and unforgettable. We received endless compliments on the..."
              />
            </v-col>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
const reviewDialog = defineModel("reviewDialog", { required: false });
</script>
