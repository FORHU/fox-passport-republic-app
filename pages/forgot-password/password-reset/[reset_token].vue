<template>
  <v-row class="pa-10" no-gutters justify="center">
    <!-- <v-col class="d-none d-md-block d-lg-none" md="4"></v-col> -->
    <v-form v-model="formValid" @submit.prevent="onSubmit" class="text-secondary w-100" style="max-width: 436px;">
      <v-row no-gutters class="w-100 mb-15" style="position: relative;">
        <ButtonBack label="Back" @click="goToLoginOptions" style="position: absolute; left: -5%" />
      </v-row>
      <v-row no-gutters class="w-100 my-7 my-md-10">
        <v-col cols="12" class="text-24px font-weight-black">Set New password</v-col>
        <v-col cols="12" class="text-16px text-subtitle">Enter your password</v-col>
      </v-row>

      <v-row class="pt-10">
        Password
      </v-row>
      <v-row class="pt-2 pr-7">
        <v-text-field v-model="password" variant="outlined" :type="showPassword ? 'text' : 'password'"
          placeholder="+6 characters" density="comfortable" rounded="lg" class="mt-1"
          :rules="[requiredInput, minPasswordLength]">
          <template v-slot:append-inner>
            <v-icon :icon="!showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click="showPassword = !showPassword"
              class="cursor-pointer"></v-icon>

          </template>
        </v-text-field>
      </v-row>

      <v-row class="pt-3">
        Confirm Password
      </v-row>
      <v-row class="pt-2 pr-7">
        <v-text-field v-model="confirmPassword" variant="outlined" :type="showRePassword ? 'text' : 'password'"
          placeholder="+6 characters" density="comfortable" rounded="lg" class="mt-1"
          :rules="[(v) => v === password || 'Password does not match']">
          <template v-slot:append-inner>
            <v-icon :icon="!showRePassword ? 'mdi-eye' : 'mdi-eye-off'" @click="showRePassword = !showRePassword"
              class="cursor-pointer"></v-icon>

          </template>
        </v-text-field>
      </v-row>
      <v-row class="pt-8 pr-7">
        <v-btn type="submit" :disabled="confirmPassword!==password ||(!confirmPassword&&!password)" size="large" block @click.once="onSubmit" color="primary"
          style="width:400px; border-color: rgba(0, 0, 0, 0.2) !important;">
          <v-row justify="center">
            Set New Password
          </v-row>
        </v-btn>
      </v-row>
    </v-form>
    <DialogSuccessWithButton v-model="showSucessDialog" text="Password Reset Successfully." buttonText="Back to Login"
      @button-click="
        navigateTo({ name: 'country-login', params: { country } })
        " />
  </v-row>
</template>



<script setup lang="ts">

definePageMeta({
  layout: "auth-layout",
});

import { useDisplay } from "vuetify";
const { xs, xlAndUp } = useDisplay();
const { country } = useLocal();
const { requiredInput, minPasswordLength, validEmail } = useUtils();
const { setSnackbar } = useLocal();
const { resetPassword } = useLocalAuth();
const showPassword = ref(false);
const showRePassword = ref(false);

const formValid = ref(false);
const showSucessDialog = ref(false);
const { reset_token } = useRoute().params;

const password = ref("");
const confirmPassword = ref("");
const email = ref("");

watch([password, confirmPassword], () => {
  validateForm();
});

const validateForm = () => {
  formValid.value =
    password.value.length >= 6 &&
    confirmPassword.value.length >= 6 &&
    password.value === confirmPassword.value;
};


const onSubmit = async () => {
  validateForm()
  if (!formValid.value) return;
  try {
    await resetPassword(password.value as string, reset_token as string);
    showSucessDialog.value = true;
  } catch (error) {
    // alert("error")
    setSnackbar({
      modal: true,
      text: "Something went wrong. Please try again later.",
      color: "error",
    });
  }
};

const goToLoginOptions = () => {
  navigateTo({ name: "country-login", params: { country } });
};

</script>

<style scoped>
.slightly-gray {
  color: #b0b0b0;
}
</style>