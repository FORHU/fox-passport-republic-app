<template>
  <v-row>
    <v-col cols="12">
      <v-row align="left">
        <v-col cols="12">
          <v-img
            :height="smAndDown && mdAndDown ? '400px' : '380px'"
            src="/public/images/termsandcondition/seabackground.png"
            cover
          >
            <v-row class="pa-10"> </v-row>
            <v-row :class="smAndDown ? '' : 'pa-10'"> </v-row>
            <v-row class="pb-15"></v-row>
            <v-row
              class="pl-15 pt-10 pr-10 font-weight-bold text-h3 text-white"
            >
              <v-col cols="12"> Contact Us </v-col>
            </v-row>
          </v-img>
        </v-col>
      </v-row>
      <v-row class="pa-10">
        <v-col cols="12">
          <v-container>
            <v-row :class="smAndDown ? '' : 'pa-15'">
              <v-col cols="12" sm="12" md="4" lg="4">
                <v-row :justify="smAndDown ? 'center' : 'left'" class="w-100">
                  <img
                    height="60vh"
                    src="/public/images/navigation/questionmark1.png"
                  />
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  class="text-primary text-h6 font-weight-bold w-100"
                >
                  Do you have a question?
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  :class="smAndDown ? 'text-center align-center pb-4' : ''"
                >
                  <span
                    >Take a look at some of the questions most commonly asked by
                    the users of our platform at
                    <span class="text-decoration-underline"
                      >User's FAQ section</span
                    >.</span
                  >
                </v-row>
              </v-col>
              <v-col cols="12" sm="12" md="4" lg="4">
                <v-row :justify="smAndDown ? 'center' : 'left'" class="w-100">
                  <img
                    height="60vh"
                    src="/public/images/navigation/questionmark1.png"
                  />
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  class="text-primary text-h6 font-weight-bold w-100"
                >
                  Need to contact support?
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  :class="smAndDown ? 'text-center align-center pb-4' : 'w-80'"
                >
                  <span
                    >If you require assistance with your account,email us at
                    <span class="text-decoration-underline font-weight-bold"
                      >support@venue4use.com</span
                    >.</span
                  >
                </v-row>
              </v-col>
              <v-col cols="12" sm="12" md="4" lg="4">
                <v-row :justify="smAndDown ? 'center' : 'left'" class="w-100">
                  <img
                    height="60vh"
                    src="/public/images/navigation/headset1.png"
                  />
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  class="text-primary text-h6 font-weight-bold w-100"
                >
                  Want to list your venue?
                </v-row>
                <v-row
                  :justify="smAndDown ? 'center' : 'left'"
                  :class="smAndDown ? 'text-center align-center pb-4' : ''"
                >
                  <span
                    >Join the leading online marketplace for corporate and
                    private venue hire. Simply
                    <NuxtLink
                      class="text-decoration-underline text-black"
                      :to="{
                        path: `/${country}/`,
                      }"
                    >
                      List your Venue
                    </NuxtLink>
                    and start earning today.</span
                  >
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { country } = useLocal();
const { smAndDown, mdAndDown } = useDisplay();
onBeforeMount(() => {
  reloadNuxtApp();
  window.scrollTo(0, 0);
});
</script>
