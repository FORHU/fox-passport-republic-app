<template>
  <!-- Wrapper with max-width -->
  <v-row no-gutters class="w-100" style="max-width: 1024px">
    <v-row no-gutters class="w-100">
      <v-col cols="12" md="9">
        <v-row no-gutters class="my-3 w-100 d-flex ga-2" :class="xs ? 'mx-2' : ''">
          <v-row no-gutters class="w-100">
            <v-col cols="12" class="font-500 d-flex align-center">Email Verification:
              <ChipVerify :is-verified="isEmailVerified" class="ml-2" />
            </v-col>
            <v-col v-if="!isEmailVerified" cols="12">
              <v-btn class="text-decoration-underline pa-0 ma-0" variant="text" density="compact" :text="'Verify Email'"
                style="min-width: 0; min-height: 0;" @click="handleVerifyEmail">
                <template v-slot:append v-if="verifying_email">
                  <v-progress-circular indeterminate :size="20" />
                </template>
              </v-btn>
            </v-col>
          </v-row>
          <!-- <v-row no-gutters>
            <v-row no-gutters class="w-100">
              <v-col cols="6" class="font-500 d-flex align-center">Dark Mode:</v-col>
              <v-col cols="6" class="font-500 d-flex align-center">
                <v-switch v-model="isDarkMode" hide-details></v-switch>
              </v-col>
            </v-row>
          </v-row> -->
          <v-row v-if="isVenueOwner" no-gutters class="w-100">
            <v-divider class="my-2"></v-divider>
            <v-col cols="12" class="font-500 d-flex align-center">Stripe Setup:
              <ChipVerify :is-verified="isAccountCompleted" class="ml-2" />
            </v-col>
            <v-col cols="12">
              <v-btn class="text-decoration-underline pa-0 ma-0" variant="text" density="compact"
                :text="isAccountCompleted ? 'View Stripe Dashboard' : 'Setup Stripe Account'"
                style="min-width: 0; min-height: 0;" @click="handleStripeButtonClick">
                <template v-slot:append v-if="processing_stripe">
                  <v-progress-circular indeterminate :size="20" />
                </template>
              </v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
  <DialogEmailVerification v-model="showVerifyEmailPrompt" v-model:email="currentUser.email" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const { currentUser } = useLocalAuth();
const { countries } = useVenueData();
const { verifyEmail } = useVerify();

definePageMeta({
  layout: "profile",
});

const processing_stripe = ref(false);
const verifying_email = ref(false);
const { setSnackbar, isDarkMode } = useLocal();
const { isVenueOwner } = useAccess();
const showVerifyEmailPrompt = ref(false);


const handleSetupStripeAccount = async () => {
  
  try {
    processing_stripe.value = true;
    const res = await useAPI("/v1/payment/create-account", {
      method: "POST",
      body: JSON.stringify({
        user_id: currentUser.value._id,
        return_url: window.location.href
      }),
    });
    const url = res.data.value?.data.results.url;
    if (url) {
      await navigateTo(url, {
        external: true
      });
      // processing_stripe.value = false;
    }

  } catch (er) {
    console.log(er);
    processing_stripe.value = false;
  }
};

const isAccountCompleted = computed(() => {
  return currentUser.value.stripe_account == "COMPLETED";
});

const isEmailVerified = computed(() => {
  return currentUser.value.status == 'ACTIVE';
});

const isUser = computed(() => {
  return currentUser.value.role == "USER";
});

const name = computed(() => {
  if (currentUser.value) {
    return (
      `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim() ||
      "Unknown"
    );
  }
  return "Unknown";
});

const handleManageStripeAccount = async () => {
  processing_stripe.value = true;
  try {
    const { data, error } = await useAPI("/v1/payment/create-login");

    if (error.value) {
      setSnackbar({
        modal: true,
        text: "Something went wrong. Please try again later.",
        color: "true",
      });
      processing_stripe.value = true;
      return;
    }

    if (data && data.value) {
      const res = data.value as any;

      if (res?.data?.url) {
        const url = res.data.url;
        if (url) {
          await navigateTo(url, {
            external: true
          });
        }
      }
      // manage_loading.value = false;
    }

  } catch (error) {
    processing_stripe.value = true;
    setSnackbar({
      modal: true,
      text: "Something went wrong. Please try again later.",
      color: "true",
    });
  }

};

const handleStripeButtonClick = async () => {
  if (isAccountCompleted.value) {
    handleManageStripeAccount();
  } else {
    handleSetupStripeAccount();
  }
}

const handleVerifyEmail = async () => {

  try {
    verifying_email.value = true;

    const res = await verifyEmail()
    if (res) {
      showVerifyEmailPrompt.value = true
    }

  } catch (error) {
    console.log('error');


  } finally {
    verifying_email.value = false;
  }


}
</script>

<style scoped></style>
