<template>
  <v-row no-gutters justify="center">
    <v-form v-model="formValid" @submit.prevent ref="formRef" class="my-5 my-md-10 mx-3 mx-md-5 text-secondary w-100"
      style="max-width: 436px;">
      <v-row no-gutters class="w-100 mb-15" style="position: relative;">
        <ButtonBack label="Back" @click="goToLoginOptions" style="position: absolute; left: -5%" />
      </v-row>

      <v-row no-gutters class="w-100 my-7 my-md-10">
        <v-col cols="12" class="text-24px font-weight-black">Forgot Password?</v-col>
        <v-col cols="12" class="text-16px text-subtitle">Enter email address to reset your password</v-col>
      </v-row>


      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Email</span>
          <v-text-field v-model="email" variant="outlined" placeholder="venue4use@email.com" density="comfortable"
            rounded="lg" class="mt-1" :rules="emailRules" :error-messages="emailError" @click="emailError = ''"
            @update:model-value="emailError = ''"></v-text-field>
        </v-col>
      </v-row>


      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-7">
        <v-col cols="12">
          <v-btn variant="flat" color="primary" type="submit" size="large" rounded="lg"
            class="mt-1 w-100 font-weight-black" :disabled="!formValid" @click="onSubmit" :loading="processing">Reset
            Password</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-row>
  <DialogSuccessWithButton v-model="showSucessDialog" text="Email Reset Successfully. Please check your email."
    buttonText="Back to Login" @button-click="
      navigateTo({ name: 'country-login', params: { country } })
      " />
</template>



<script setup lang="ts">

definePageMeta({
  layout: "auth-layout",
});

const { country } = useLocal();
const { validEmail } = useUtils();
const { setSnackbar } = useLocal();
const { forgotPasswordMailSend } = useLocalAuth();

const formValid = ref(false);
const showSucessDialog = ref(false);
const emailError = ref("");

const email = ref("");
const processing = ref(false);

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => validEmail(v),
];

const onSubmit = async () => {
  if (!formValid.value) return;
  processing.value = true;
  try {
    const res = await forgotPasswordMailSend(email.value);

    if (res.error && res.error.value) {
      const resValue = res.error.value as any;
      const code = resValue?.data?.code
      if (code == "EMAIL_DOES_NOT_EXIST") {
        emailError.value = 'Email does not exist.'
        processing.value = false;
        return;
      } else if (code == "EMAIL_DOES_NOT_EXIST_OR_HAS_BEEN_DELETED") {
        emailError.value = 'Account does not exist or has been deleted.'
        processing.value = false;
        return;
      }
    }


    showSucessDialog.value = true;
  } catch (error) {
    // alert("error")
    processing.value = false;
    setSnackbar({
      modal: true,
      text: "Something went wrong. Please try again later.",
      color: "error",
    });
  }
  processing.value = false;
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