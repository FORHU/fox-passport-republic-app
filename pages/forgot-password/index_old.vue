<template>
  <SignupPagesTemplate @click="showPicker = false">
    <template #image>
      <v-row
        no-gutters
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col cols="10" align="center" justify="center">
          <v-img
            src="/svg/forgot-password.svg"
            cover
            width="auto"
            height="310"
          ></v-img>
          <v-col cols="8" no-gutters>
            <v-row
              no-gutters
              class="w-100 text-subtitle-2 text-start text-white mt-2 font-weight-bold"
              >Important Information:</v-row
            >
            <v-row
              no-gutters
              class="w-100 text-caption text-start text-white mt-2"
              >Please read the information below and then kindly share the
              requested information.
            </v-row>
            <v-row
              no-gutters
              class="mt-7 w-100 text-caption text-start text-white mt-2"
              >Do not reveal your password to anybody</v-row
            >
            <v-row
              no-gutters
              class="w-100 text-caption text-start text-white mt-2"
              >Do not reuse passwords</v-row
            >
            <v-row
              no-gutters
              class="w-100 text-caption text-start text-white mt-2"
              >Use Alphanumeric passwords</v-row
            >
          </v-col>
        </v-col>
      </v-row>
    </template>
    <template #form>
      <v-row
        no-gutters
        align-content="center"
        justify="center"
        class="fill-height text-secondary"
      >
        <v-col cols="12" class="text-h5 text-lg-h4 text-center"
          >Forgot Password?</v-col
        >
        <v-col
          cols="12"
          class="w-100 text-subtitle-2 text-center mt-2 font-weight-bold mb-10"
          >Enter your email to reset your password.</v-col
        >
        <v-form v-model="formValid" @submit.prevent class="w-100">
          <v-row no-gutters class="mt-3" justify="center">
            <v-col cols="8" class="px-5">
              <v-text-field
                v-model="email"
                prepend-icon="mdi-email-outline"
                variant="underlined"
                label="Enter your email address"
                color="secondary"
                class="bg-transparent"
                :rules="emailRules"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row align="center" justify="center" class="mt-10">
            <v-btn
              type="submit"
              class="text-uppercase"
              color="secondary"
              density="comfortable"
              :disabled="!formValid"
              @click.once="onSubmit"
              >Reset Your Password</v-btn
            >
          </v-row>
        </v-form>
      </v-row>
      <DialogSuccessWithButton
        v-model="showSucessDialog"
        text="Email Sent Successfully. Please check your email."
        buttonText="Back to Login"
        @button-click="
          navigateTo({ name: 'country-login-user', params: { country } })
        "
      />
    </template>
  </SignupPagesTemplate>
</template>

<script setup lang="ts">
const { country } = useLocal();
const { validEmail } = useUtils();
const { setSnackbar } = useLocal();
const { forgotPasswordMailSend } = useLocalAuth();

const formValid = ref(false);
const showSucessDialog = ref(false);

const email = ref("");

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => validEmail(v),
];

const onSubmit = async () => {
  if (!formValid.value) return;

  try {
    await forgotPasswordMailSend(email.value);
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
</script>

<style scoped></style>
