<template>
  <v-dialog v-model="signInForFavoritesDialog" max-width="400px">
    <v-card style="overflow-y:hidden;">
      <v-row class="pa-3" justify="center" no-gutters>
        <v-col cols="12" class="text-center pa-2 text-subtitle-1">
          <span style="font-size:18px;"> Please <span  role="button" class="text-decoration-underline text-primary" @click="goToLogin()">sign in</span> to add this to your favorites</span>
        </v-col>
        <v-divider /> 
        <v-col cols="12" class="text-center text-subtitle-2 pt-3">
          Don't have an account?
        </v-col>
        <v-col cols="12" class="text-center text-subtitle-2 ">
          <span role="button" class="text-decoration-underline text-primary" @click="goToSignUp()">Sign up here</span>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup lang='ts'>
const {country} = useLocal()
const signInForFavoritesDialog = defineModel({ required: true });

function goToLogin() {
  navigateTo({ name: "country-login", params: { country } });
}
function goToSignUp() {
     navigateTo({ name: "country-signup", params: { country } });
}
</script>