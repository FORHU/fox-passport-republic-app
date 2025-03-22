<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-card rounded="lg">
      <v-row no-gutters
        class="bg-secondary pa-5 pa-md-7 text-subtitle-1 text-md-h6 font-weight-black d-flex justify-center">Complete
        Your Account Details</v-row>
      <v-row no-gutters class="pa-5 pa-md-10 d-flex ga-7 ga-sm-10">
        <v-col cols="12" class="px-5">
          <ul style="list-style-type:disc">
            <li v-if="!isEmailVerified" class="text-secondary text-18px" style="line-height: 1.5;">Verify your email to receive updates <span></span></li>
            <li v-if="!isAccountCompleted" class="text-secondary text-18px" style="line-height: 1.5;">Create your
              Stripe account to accept payments <span></span></li>
          </ul>
        </v-col>
        <v-row no-gutters class="w-100 d-flex justify-center ga-5">
          <v-btn variant="flat" color="secondary" size="large" width="250px" @click="goToBillingPage">Go to
            account settings</v-btn>
        </v-row>
        <v-row no-gutters class="w-100">
          <v-col cols="12" class="text-center text-error text-16px" style="line-height: 1.2;">
            Please note that your space(s) will only be publicly listed once you have completed all the required setup in the 'My Account Settings' page. This pop-up notification will disappear once the verification is done.
          </v-col>
        </v-row>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
const showDialog = defineModel({ required: true });
const { country } = useLocal();
const { loggedIn, currentUser } = useLocalAuth();
const { isVenueOwner } = useAccess();

const goToBillingPage = () => {
  navigateTo(`/${country}/profile/account-settings`);
};


const isAccountCompleted = computed(() => {
  return currentUser.value.stripe_account == "COMPLETED";
});

const isEmailVerified = computed(() => {
  return currentUser.value.status == 'ACTIVE';
});

//WATCHER FOR STRIPE ACCOUNT PROMPT
watchEffect(() => {
  if (loggedIn.value && (!isAccountCompleted.value || !isEmailVerified.value) && isVenueOwner) {
    showDialog.value = true;
  } else {
    showDialog.value = false;
  }
});






</script>
