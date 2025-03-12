<template>
  <v-dialog v-model="showPromoteDialog" max-width="700" persistent>
    <v-card min-height="450">
      <v-row no-gutters>
        <v-col cols="12" sm="7" class="bg-primary pa-8">
          <v-row no-gutters>
            <v-col cols="12" class="d-flex flex-column font-500" :class="xs ? 'text-30px' : 'text-35px'">
              <span style="line-height: 1.1">Venue4Use is</span>
              <span style="line-height: 1.1">Now Available on</span>
              <span style="line-height: 1.1" class="font-600 font-weight-bold">
                iOS & Android!
              </span>
            </v-col>
            <v-col cols="12" class="text-caption py-2">
              <p>
                Greate news! Venue4Use is now officially available on both iOS
                and Android, making it easier than ever to find and book venues
                on the go. Whether you need a space for events, meetings, or
                special occasions, our app lets you browse, book, and manage
                reservations seamlessly from your smarthphone.
              </p>
            </v-col>
            <v-col cols="12">
              <div
                v-for="(feature, index) in features"
                :key="index"
                class="d-flex flex-row align-center mb-1"
              >
                <v-checkbox
                  :model-value="true"
                  readonly
                  color="secondary"
                  hide-details
                  density="compact"
                />
                <span class="font-weight-bold text-base ml-2">
                  {{ feature }}
                </span>
              </div>
            </v-col>
            <v-col cols="12">
              <v-row no-gutters class="py-3">
                <v-col cols="6" :class="xs ? 'd-flex justify-center' : ''">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.venue4use"
                    target="_blank"
                    rel="noopener"
                  >
                    <v-img
                      src="/images/promote-mobile/download-btn-google.png"
                      height="50"
                      width="120"
                      alt="download app on play store button image"
                    />
                  </a>
                </v-col>
                <v-col cols="6" :class="xs ? 'd-flex justify-center' : ''">
                  <a
                    href="https://apps.apple.com/us/app/venue4use/id6736890246"
                    target="_blank"
                    rel="noopener"
                  >
                    <v-img
                      src="/images/promote-mobile/download-btn-apple.png"
                      height="50"
                      width="120"
                      alt="download app on app store button image"
                    ></v-img>
                  </a>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" :class="xs ? 'text-10px' : 'text-caption'">
              <span class="font-weight-bold"
                >Start discovering the perfect venue anytime, anywhere!</span
              >
              <p>#Venue4Use #NowOnMobile #BookYourSpace #Android</p>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="5" class="d-none d-sm-block">
          <v-img
            src="/images/promote-mobile/graphic.png"
            cover
            alt="Venue4use download app banner image"
            height="100%"
            class="w-100"
          ></v-img>
        </v-col>
      </v-row>
    </v-card>
    <v-icon class="close-icon" @click="emit('closeDialog')"> mdi-close </v-icon>
  </v-dialog>
</template>
<script setup>
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const emit = defineEmits(["closeDialog"]);
const showPromoteDialog = defineModel({ default: false });
const features = [
  "Quick & Easy Booking",
  "Wide Range of Venues",
  "Secure & Convenient Payments",
  "Real-time availability",
];
</script>
<style scoped>
.close-icon {
  position: absolute;
  top: 20px;
  right: 15px;
  cursor: pointer;
  z-index: 1001;
  font-size: 24px;
  color: black;
}
</style>
