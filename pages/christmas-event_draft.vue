<template>
  <v-form class="bg-primaryBG py-5">
    <v-container>
      <v-row>
        <v-col cols="3">
          <v-btn
            variant="text"
            @click="returnToEditVenue()"
            prepend-icon="mdi-arrow-left"
            >Back</v-btn
          >
        </v-col>
      </v-row>
      <span
        :style="'font-family: DM Sans;font-size: 35px;font-weight: 500;line-height: 45.57px;letter-spacing: 1.25px;text-align: left;'"
      >
        Creating a Christmas Party Offer</span
      >

      <v-card
        class="mt-4"
        :style="'width: 1325px;height: 384px;border-radius:20px'"
        elevation="0"
      >
        <v-card-title> Step 1 </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="7">
              <span class="font-weight-bold"
                >Show off your space prepared for a Christmas Party</span
              >
              <br />
              <small
                >Assign existing photos or upload new ones that show your space
                in a christmas party setting.</small
              >
              <br />
              <v-btn density="compact" class="mt-5" color="#8091AF"
                >Add Photos</v-btn
              >
            </v-col>
            <v-col cols="5">
              <v-card :style="'width: 344.25px;height: 229px;'" elevation="2">
                <v-card-text>
                  <img
                    width="320px"
                    height="150px"
                    src="https://picsum.photos/200/300"
                    alt="Sample Image"
                  />
                  <v-row>
                    <v-col cols="8">
                      <span>Unique Christmas Offer</span>
                      <br />
                      <span>at Social Space in Singapore</span>
                    </v-col>
                    <v-col cols="4">
                      <v-chip variant="text" label prepend-icon="mdi-account"
                        >30</v-chip
                      >
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card
        :style="'width: 1325px;height: 384px;border-radius:20px'"
        class="mt-6"
        elevation="0"
      >
        <v-card-title> Step 2 </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="7">
              <span class="font-weight-bold"
                >Optional: Add packages or sample menus to your event
                offer</span
              >
              <br />
              <small
                >Tell your clients about specific offers that you have in your
                venue for a Christmas party.</small
              >
              <br />
              <v-btn density="compact" class="mt-5" color="#8091AF"
                >Add Packages</v-btn
              >
            </v-col>
            <v-col cols="5">
              <v-card :style="'width: 344.25px;height: 229px;'" elevation="2">
                <v-card-text> </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <br />
      <v-btn @click="showDialog()" color="#8091AF" density="compact"
        >Publish Event Offer</v-btn
      >
      <ReviewPrompt v-if="showDialog" :showDialog="showDialog" />
    </v-container>
  </v-form>
</template>

<script>
import ReviewPrompt from "~/components/Dialog/ReviewPrompt.vue";

export default {
  components: {
    ReviewPrompt: ReviewPrompt,
  },
  data: () => ({
    showDialog: false,
  }),
  methods: {
    showDialog() {
      this.showDialog = true;
    },
  },
};
</script>
