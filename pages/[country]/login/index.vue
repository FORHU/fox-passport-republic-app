<template>
    <v-row no-gutters justify="center">
        <v-row no-gutters class="my-5 my-md-10 mx-3 mx-md-5 text-secondary w-100" style="max-width: 436px;">


            <v-row no-gutters class="w-100 mb-15" style="position: relative;">
                <ButtonBack label="Back to homepage" @click="goToHome" style="position: absolute; left: -5%" />
            </v-row>

            <v-row no-gutters class="w-100 my-7 my-md-10">
                <v-col cols="12" class="text-24px font-700">Log in as</v-col>
                <v-col cols="12" class="text-16px text-subtitle">Don't have an account? <NuxtLink
                        :to="{ name: 'country-signup', params: { country } }"
                        class="text-secondary text-decoration-underline">Create Account</NuxtLink></v-col>
            </v-row>

            <v-row no-gutters>
                <v-col cols="12">
                    <v-btn variant="outlined" rounded="lg" class="font-500" width="100%" size="large" @click="goToUserLogin">User</v-btn>
                </v-col>
                <v-col cols="12 mt-2">
                    <v-btn variant="outlined" rounded="lg" class="font-500" width="100%" size="large" @click="goToVenueLogin">Lister</v-btn>
                </v-col>
            </v-row>
        </v-row>
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

const goToUserLogin = () => {
    navigateTo({ name: 'country-login-user', params: { country}});
}

const goToVenueLogin= () => {
    navigateTo({ name: 'country-login-venue', params: { country}});
}

const goToHome = () => {
    navigateTo({ name: 'country', params: { country}});
}
</script>

<style scoped>
.slightly-gray {
    color: #b0b0b0;
}
</style>