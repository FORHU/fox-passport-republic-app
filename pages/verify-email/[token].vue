<template>
  <v-container fluid class="d-flex justify-center align-center fill-height">
    <v-card class="text-center pa-6" max-width="400" elevation="0">
      <v-avatar :color="dialogContent.color" size="80" class="mb-4">
        <v-icon size="50" color="white">{{ dialogContent.icon }}</v-icon>
      </v-avatar>
      <v-card-title class="text-h6 font-weight-bold">
        {{ dialogContent.title }}
      </v-card-title>
      <v-card-text>{{ dialogContent.message }}</v-card-text>
      <v-card-actions class="justify-center">
        <v-btn :color="dialogContent.color" @click="redirectToLogin">
          {{ roleCondition?.label }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "venue-management-new",
});


const dialog = ref(true);
const dialogContent = ref({
  title: "",
  message: "",
  icon: "",
  color: "",
  buttonText: "Continue",
});

const { country } = useLocal();
const { role } = useRoute().query;
const { token } = useRoute().params;
const { verifyEmailToken } = useVerify();

const roleCondition = computed(() => {
  let label = "";
  let nameRoute = "";
  if(role == "ADMIN"){
    return {
      label: "Back to Admin Login",
      nameRoute: "login-admin",
    };
  } else if( role == "VENUE_OWNER" || role == "VENUE_LISTER"){
    return {
      label: "Back to Lister Login",
      nameRoute: "login-venue",
    };
  } else if ( role == "USER"){
    return {
      label: "Back to User Login",
      nameRoute: "login-user",
    };
  } else {
    label = "Back to Login";
    nameRoute = "login";
  }
})

const redirectToLogin = () => {
  navigateTo({
    name: `country-${roleCondition.value?.nameRoute}`,
    params: { country: country || "sg" },
  });
};

onMounted(async () => {
  try {
    const res: any = await verifyEmailToken(token as string);
    if (res && res.message === "EMAIL_VERIFIED_SUCCESSFULLY") {
      dialogContent.value = {
        title: "Email Verified",
        message: "Your email address was successfully verified.",
        icon: "mdi-check",
        color: "success",
        buttonText: "Continue",
      };
      dialog.value = true;
    }
  } catch (err: any) {
    const code = err?.code;

    if (code === "ERROR_EMAIL_VERIFICATION_FAILED") {
      dialogContent.value = {
        title: "Invalid Token",
        message: "The email verification link is invalid or has expired.",
        icon: "mdi-alert",
        color: "error",
        buttonText: "Close",
      };
    } else if (code === "EMAIL_ALREADY_VERIFIED") {
      dialogContent.value = {
        title: "Already Verified",
        message: "Your email address is already verified.",
        icon: "mdi-information",
        color: "info",
        buttonText: "Continue",
      };
    } else {
      dialogContent.value = {
        title: "Error",
        message: "Something went wrong. Please try again later.",
        icon: "mdi-close",
        color: "error",
        buttonText: "Close",
      };
    }

    dialog.value = true;
  }
});
</script>

<style scoped>
.v-avatar {
  margin: 0 auto;
}
</style>
