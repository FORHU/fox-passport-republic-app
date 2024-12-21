<template>
  <!-- Wrapper with max-width -->
  <v-row no-gutters class="w-100" style="max-width: 1024px">

    <v-row no-gutters class="w-100">
      <v-col cols="12" md="9">
        <h3 class="mb-4">
          Manage your billing details using your stripe account
        </h3>
        <v-row no-gutters class="my-3 w-100">
          <v-col cols="12" class="font-500">Stripe Setup Status:
            <span v-if="!isAccountCompleted" class="text-error">Pending</span>
            <span v-else class="text-success">Completed</span>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="!isUser">
          <v-btn v-if="!isAccountCompleted" class="mb-4" color="secondary" prepend-icon="mdi-credit-card-outline"
            @click="handleSetupStripeAccount" :loading="processing" rounded="lg" size="large">Setup Stripe
            Account</v-btn>
          <v-btn v-else class="mb-4" variant="outlined" color="primary" prepend-icon="mdi-credit-card-outline"
            @click="handleManageStripeAccount" :loading="manage_loading" rounded="lg" size="large">View Stripe
            Dashboard</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
</template>

<script setup lang="ts">
const { currentUser } = useLocalAuth();
const { countries } = useVenueData();

definePageMeta({
  layout: "profile",
});

const { drawer } = useVenue();
const processing = ref(false);
const manage_loading = ref(false);
const country = ref(currentUser.value.country);
const { setSnackbar } = useLocal();

const profilePicture = ref(currentUser.value?.profile_picture || "");
const profilePictureId = ref(null);
const sectionTitle = computed(() => "Billing Details");
const sectionDescription = computed(() => "Manage billing details");

const handleSetupStripeAccount = async () => {
  try {
    processing.value = true;
    const res = await useAPI("/v1/payment/create-account", {
      method: "POST",
      body: JSON.stringify({
        user_id: currentUser.value._id,
      }),
    });
    const url = res.data.value?.data.results.url;
    if (url) {
      await navigateTo(url, {
        external: true
      });
      // processing.value = false;
    }

  } catch (er) {
    console.log(er);
    processing.value = false;
  }
};

const isAccountCompleted = computed(() => {
  return currentUser.value.stripe_account == "COMPLETED";
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
  manage_loading.value = true;
  try {
    const { data, error } = await useAPI("/v1/payment/create-login");

    if (error.value) {
      setSnackbar({
        modal: true,
        text: "Something went wrong. Please try again later.",
        color: "true",
      });
      manage_loading.value = false;
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
    manage_loading.value = false;
    setSnackbar({
        modal: true,
        text: "Something went wrong. Please try again later.",
        color: "true",
      });
  }

};
</script>

<style scoped></style>
