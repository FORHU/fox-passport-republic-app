<template>
<v-row class="pt-10 pl-10" rounded="lg" no-gutters
  align="center"
  justify="center"
  align-content="center"
  style="position: relative"

   >
    <!-- <v-col class="d-none d-md-block d-lg-none" md="4"></v-col> -->
    <v-col cols="12" md="4" lg="12">
        <v-row class="pb-6" >
            <v-col cols="12">
            <v-row class="text-subtitle-2" >
                <router-link :to="{ name: 'index' }" class="d-inline-flex align-center" style="text-decoration: none;">
                <span><v-icon>mdi-keyboard-backspace</v-icon>  </span>
                </router-link> 
                Back to homepage
            </v-row>
            </v-col>
        </v-row>
        <v-row class="font-weight-bold " style="font-size:24px;" >
            Create an account as
        </v-row>
        <v-row>
            <span><span class="text-subtitle-2 slightly-gray">Already have an account?</span>
             <NuxtLink :to="{ name: 'country-login' }" style="text-decoration: none; text-decoration:underline;" class="text-secondary text-subtitle-2">
                    Log in
             </NuxtLink>
           </span>
        </v-row>
        <v-row class="pt-10">
            <v-btn variant="outlined"
             :to="{ name: 'country-sign-up', params: { country } }"
             style="width:400px; border-color: rgba(0, 0, 0, 0.2) !important;">
                <v-row justify="center">
                    User
                </v-row>
            </v-btn>
        </v-row>
        <v-row class="pt-2" >
            <v-btn
            :to="{ name: 'country-list-your-venue', params: { country } }"
             variant="outlined" style="width:400px;border-color: rgba(0, 0, 0, 0.2) !important;" >
                <v-row justify="center">
                    Lister
                </v-row>
            </v-btn>
        </v-row>
    </v-col>
</v-row>
</template>



<script setup lang="ts">


import { useDisplay } from "vuetify";
const { mdAndUp, xs } = useDisplay();

definePageMeta({
  layout: "auth-layout",
});

// definePageMeta({
//   layout: "plain",
// });

const { country } = useLocal();

const cardData = [
  {
    title: "User Login",
    description: "Discover ideal event venues.",
    image: "/svg/user-login.svg",
    link: { name: "country-login-user", params: { country } },
    additional: {
      question: "Don't have a User Account?",
      link: { name: "country-sign-up", params: { country } },
      linkText: "Sign Up here",
    },
  },
  {
    title: "Venue Lister Login",
    description: "Handle inquiries, update listings.",
    image: "/svg/venue-lister-login.svg",
    link: { name: "country-login-venue", params: { country } },
    additional: {
      question: "Don't have a Venue Account?",
      link: { name: "country-list-your-venue", params: { country } },
      linkText: "List your venue with us",
    },
  },
];
</script>

<style scoped>
.slightly-gray {
    color: #b0b0b0;
}
</style>