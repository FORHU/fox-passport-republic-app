<template>
  <v-row no-gutters justify="center">
    <v-form
      v-model="formValid"
      @submit.prevent
      ref="formRef"
      class="my-5 my-md-10 mx-3 mx-md-5 text-secondary w-100"
      style="max-width: 436px"
    >
      <v-row no-gutters class="w-100 mb-15" style="position: relative">
        <ButtonBack
          label="Back"
          @click="goToLoginOptions"
          style="position: absolute; left: -5%"
        />
      </v-row>

      <v-row no-gutters class="w-100 my-7 my-md-10">
        <v-col cols="12" class="text-24px font-700">Login as lister</v-col>
        <v-col cols="12" class="text-16px text-subtitle"
          >Don't have an account?
          <NuxtLink
            :to="{ name: 'country-signup-venue', params: { country } }"
            class="text-secondary text-decoration-underline"
          >
            Create account as lister</NuxtLink
          ></v-col
        >
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Email</span>
          <v-text-field
            v-model="form.email"
            variant="outlined"
            placeholder="venue4use@email.com"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="emailRules"
            :error-messages="emailError"
            @input="emailError = ''"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 my-1">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Password</span>
          <v-text-field
            v-model="form.password"
            :hide-details="!passwordError"
            variant="outlined"
            :type="showPassword ? 'text' : 'password'"
            placeholder="+6 characters"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="passwordRules"
            :error-messages="passwordError"
            @input="passwordError = ''"
          >
            <template v-slot:append-inner>
              <v-icon
                :icon="!showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click="showPassword = !showPassword"
                class="cursor-pointer"
              ></v-icon>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters justify="end">
        <NuxtLink
          :to="{ name: 'forgot-password' }"
          class="text-16px text-secondary"
          >Forgot Password</NuxtLink
        >
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-7">
        <v-col cols="12">
          <v-btn
            variant="flat"
            color="primary"
            type="submit"
            size="large"
            rounded="lg"
            class="mt-1 w-100 font-500"
            @click="onSubmit"
            :loading="processing"
            >Login</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-row>

  <v-snackbar
    v-model="snackbar.show"
    color="white"
    rounded="lg"
    location="right"
  >
    <v-row no-gutters justify="center" align="center">
      <v-col cols="2">
        <v-img src="/public/svg/info.svg" height="30px" width="30px" alt="login venue info icon"></v-img>
      </v-col>

      <v-col>
        <p class="text-16px font-500">Unverified Email</p>
        <p class="text-16px font-400">{{ snackbar.message }}</p>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

import { useDisplay } from "vuetify";
const { country } = useLocal();
const { xs, xlAndUp } = useDisplay();
const { validEmail, minPasswordLength } = useUtils();
const { login, cookieOptions, getCurrentUser } = useLocalAuth();
const { setSnackbar } = useLocal();

const showPassword = ref(false);
const formValid = ref(false);
const form = reactive({
  email: "",
  password: "",
});

const emailError = ref("");
const passwordError = ref("");
const processing = ref(false);

const pageData = ref({
  description: "Handle inquiries, update listings.",
  image: "/svg/venue-lister-login.svg",
  addnalQuestion: "Don't have a Venue Account?",
  addnalLink: { name: "country-list-your-venue", params: { country } },
  addnalLinkText: "List your venue with us",
});

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => validEmail(v),
];

const passwordRules = [
  (v: string) => !!v || "Password is required"
];

const navigateToCountryEnquiries = (
  country: string,
  status: string = "all"
) => {
  navigateTo({
    name: "country-enquiries",
    params: { country, status },
  });
};

const snackbar = reactive({
  show: false,
  message: "",
});

const showSnackbar = (message: string, color: string = "success") => {
  snackbar.message = message;
  snackbar.show = true;
};

const onSubmit = async () => {
  emailError.value = "";
  passwordError.value = "";
  
  if (formValid.value) {
    processing.value = true;
    const { data, error } = await login({ ...form, role: "VENUE_OWNER" });

    // if data exists
    if (data.value) {
      const res = data.value as any;
      useCookie("accessToken", cookieOptions).value = res.accessToken;
      useCookie("refreshToken", cookieOptions).value = res.refreshToken;
      useCookie("user", cookieOptions).value = form.email;

      // check user status
      if (res.status === "ACTIVE") {
        navigateToCountryEnquiries(country);
      } else {
        // inactive user
        showSnackbar("Please check your email for verification.", "error");
        setTimeout(() => {
          processing.value = false;
          navigateToProfileSetting(country);
        }, 1000);
      }
    } 

    if (error.value) {
      const { code, message } = error.value.data;
      processing.value = false;

      if (message === 'User is suspended until further notice' || message === 'User is currently suspended') {
        emailError.value = message;
      } else if (code === "1001") {
        emailError.value = "Incorrect Email Address";
      } else if (code === "1002") {
        emailError.value = message;
      } else if (code === "1003") {
        passwordError.value = message;
        if (!emailError.value) {
          form.password = '';
        }
      } else if (code === "ERROR_LOGIN_VIA_EMAIL") {
        emailError.value = "Invalid email address";
        passwordError.value = "";
      } else if (code === "USER_NOT_FOUND" || message === 'User not found') {
        emailError.value =
          "Account not found or has been deleted. Please contact support if you think this is an error.";
        passwordError.value = "";
      } else {
        emailError.value = message || 
          "An unexpected error occurred. Please try again later.";
        passwordError.value = "";
      }
    }
  }
};

const goToLoginOptions = () => {
  navigateTo({ name: "country-login", params: { country } });
};
const navigateToProfileSetting = (
  country: string,
  status: string = "all"
) => {
  navigateTo({
    name: "country-profile-account-settings",
    params: { country, status },
  });
};
</script>

<style scoped>
.slightly-gray {
  color: #b0b0b0;
}
</style>
