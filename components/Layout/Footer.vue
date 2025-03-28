<template>
  <v-row no-gutters class="pb-16" justify="center">
    <v-col cols="12" xxl="10" xl="10" lg="10" md="10">
      <v-footer class="d-flex flex-column flex-md-row justify-space-between">
        <!-- Footer Text Section -->
        <div class="d-flex flex-column flex-md-row align-center mb-md-0">
          <p :class="smAndDown ? 'mb-4 text-center' : 'mr-2'">
            &copy; 2025 All rights reserved by <b>Venue4use</b>
          </p>
          <p class="mr-2 text-grey hidden-md-and-down">•</p>
          <NuxtLink
            :to="{
              path: `/${country}/about-us/terms-and-condition`,
              query: { key: '2' },
            }"
            target="_blank"
            class="mr-2 text-decoration-none text-black"
          >
            Terms of Service
          </NuxtLink>
          <p class="mr-2 text-grey hidden-md-and-down">•</p>
          <nuxt-link
            :to="{
              path: `/${country}/about-us/privacy-policy`,
              query: { key: '1' },
            }"
            target="_blank"
            class="mr-2 text-decoration-none text-black"
          >
            Privacy Policy
          </nuxt-link>
          <p class="mr-2 text-grey hidden-md-and-down">•</p>
          <nuxt-link
            :to="{
              path: `/${country}/contact-us`,
              query: { key: '1' },
            }"
            target="_blank"
            class="mr-2 text-decoration-none text-black"
          >
            Contact Us
          </nuxt-link>
          <br />
          <!-- <span v-if="versionNumber" class="text-secondary mt-md-n6 ml-md-n2 mr-md-2 text-14px text-sm-18px text-grey" style="font-size: 18px;"><span class="mr-2 mr-md-1 text-grey hidden-sm-and-down">•</span>v{{versionNumber}}</span> -->
        </div>

        <!-- Footer Social and Language/ Currency Section -->
        <div class="d-flex flex-column flex-md-row align-center">
          <!-- Language and Currency -->
          <v-row no-gutters class="mx-2 mb-2">
            <v-icon class="mr-1 mt-2" icon="mdi-web"></v-icon>
            <!-- <p class="mr-2 mb-2 mb-md-0 mt-2">English (US)</p> -->
            <span> <GoogleTranslate /></span>
          </v-row>

          <!-- Social Media Icons -->
          <div class="d-flex flex-wrap">
            <nuxt-link
              to="https://x.com/venue4use"
              target="_blank"
              class="mx-1"
            >
              <v-btn
                class="rounded-lg mt-2"
                color="#e3edff"
                elevation="0"
                width="45"
                height="45"
              >
                <v-img
                  src="/svg/x.svg"
                  width="24"
                  height="24"
                  contain
                  class="d-flex align-center justify-center"
                  alt="Twitter Logo"
                ></v-img>
              </v-btn>
            </nuxt-link>

            <nuxt-link
              to="https://linkedin.com/company/venue4use"
              target="_blank"
              class="mx-1"
            >
              <v-btn
                class="rounded-lg mt-2"
                color="#e3edff"
                elevation="0"
                width="45"
                height="45"
              >
                <v-img
                  src="/svg/linkedin.svg"
                  width="24"
                  height="24"
                  contain
                  class="d-flex align-center justify-center"
                  alt="LinkedIn Logo"
                ></v-img>
              </v-btn>
            </nuxt-link>

            <nuxt-link
              to="https://www.instagram.com/venue4use"
              target="_blank"
              class="mx-1"
            >
              <v-btn
                class="rounded-lg mt-2"
                color="#e3edff"
                elevation="0"
                width="45"
                height="45"
              >
                <v-img
                  src="/svg/ig.svg"
                  width="24"
                  height="24"
                  contain
                  class="d-flex align-center justify-center"
                  alt="Instagram Logo"
                ></v-img>
              </v-btn>
            </nuxt-link>

            <nuxt-link
              to="https://www.facebook.com/venue4use"
              target="_blank"
              class="mx-1"
            >
              <v-btn
                class="rounded-lg mt-2"
                color="#e3edff"
                elevation="0"
                width="45"
                height="45"
              >
                <v-img
                  src="/svg/fb.svg"
                  width="24"
                  height="24"
                  contain
                  class="d-flex align-center justify-center"
                  alt="Facebook Logo"
                ></v-img>
              </v-btn>
            </nuxt-link>
          </div>
        </div>
      </v-footer>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";

const { country } = useLocal();
const { smAndDown } = useDisplay();
</script>
