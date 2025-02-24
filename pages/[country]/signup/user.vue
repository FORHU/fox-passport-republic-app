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
          @click="goToSignupOptions"
          style="position: absolute; left: -5%"
        />
      </v-row>

      <v-row no-gutters class="w-100 my-7 my-md-10">
        <v-col cols="12" class="text-24px font-700"
          >Create an account as user</v-col
        >
        <v-col cols="12" class="text-16px text-subtitle"
          >Already have an account?
          <NuxtLink
            :to="{ name: 'country-login-user', params: { country } }"
            class="text-secondary text-decoration-underline"
          >
            Log in as user</NuxtLink
          ></v-col
        >
      </v-row>
      <v-row no-gutters class="md-flex ga-5 flex-wrap w-100">
        <v-col>
          <span class="w-100 text-16px text-secondary">First Name</span>
          <v-text-field
            v-model="form.first_name"
            variant="outlined"
            placeholder="John"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="[(v: string) => requiredInputForName(v)]"
          ></v-text-field>
        </v-col>
        <v-col>
          <span class="w-100 text-16px text-secondary">Last Name</span>
          <v-text-field
            v-model="form.last_name"
            variant="outlined"
            placeholder="Doe"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="[(v: string) => requiredInputForName(v)]"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col>
          <span class="w-100 text-16px text-secondary">Contact No.</span>
          <CustomPhoneNumberInputNew
            v-model:formattedNumber="form.phone_number"
            class="mt-1"
          />
        </v-col>
        <v-col>
          <span class="w-100 text-16px text-secondary"
            >Date of birth (optional)</span
          >
          <!-- <v-text-field variant="outlined" placeholder="Pick a date" density="comfortable" rounded="lg" class="mt-1"></v-text-field> -->
          <v-menu
            v-model="showPicker"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ props }">
              <v-text-field
                dense
                v-model="formattedDate"
                readonly
                persistent-hint
                rounded="lg"
                v-bind="props"
                placeholder="Select Date"
                prepend-inner-icon="mdi-calendar-badge"
                variant="outlined"
                density="comfortable"
                class="mt-1"
              >
              </v-text-field>
            </template>
            <v-date-picker
              v-model="dateOfBirth"
              @input="dateInput = false"
              show-adjacent-months
              elevation="24"
              no-time
              @update:model-value="handleDateChange"
              :max="new Date().toISOString().substring(0, 10)"
              placeholder="Pick a date"
            ></v-date-picker>
          </v-menu>
        </v-col>
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
            @click="emailError = ''"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Password</span>
          <v-text-field
            v-model="form.password"
            variant="outlined"
            type="password"
            placeholder="+6 characters"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="passwordRules"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Confirm Password</span>
          <v-text-field
            v-model="confirmPassword"
            variant="outlined"
            type="password"
            placeholder="+6 characters"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="confirmPasswordRules"
          ></v-text-field>
        </v-col>
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
            >Create Account</v-btn
          >
        </v-col>
      </v-row>
    </v-form>

    <DialogSuccessWithButton
      v-model="showSucessDialog"
      text="Registration Successful"
      button-text="Got It!"
      @button-click="goToHome"
    />
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});
const { country } = useLocal();
const {
  validEmail,
  minPasswordLength,
  requiredInput,
  requiredInputForName,
  capitalizeNames,
} = useUtils();
const { signup, cookieOptions } = useLocalAuth();

const dateOfBirth = ref(null);
const showPicker = ref(false);
const confirmPassword = ref("");
const formValid = ref(false);
const emailError = ref("");
const showSucessDialog = ref(false);
const router = useRouter();
const route = useRoute();
const processing = ref(false);
const formRef = ref();

const formattedDate = computed(() => {
  if (dateOfBirth.value) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return dateOfBirth.value.toLocaleDateString("en-GB", options);
  } else {
    return null;
  }
});

const handleDateChange = () => {
  showPicker.value = false;
  form.date_of_birth = formattedDate.value;
};

const form = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  date_of_birth: "",
  password: "",
  role: "USER",
});

const pageData = ref({
  description: "Discover ideal event venues.",
  image: "/svg/user-login.svg",
  addnalQuestion: "Don't have a User Account?",
  addnalLink: { name: "country-sign-up", params: { country } },
  addnalLinkText: "Sign Up here",
});

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => validEmail(v),
];

let phoneRules = [
  (v: string) => requiredInput(v),
  (v) => !isNaN(v) || "Input numbers only",
];

const dateRules = [(v: string) => !!v || "Date of birth is required"];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => minPasswordLength(v),
];

const confirmPasswordRule = [(v: string) => requiredInput(v)];

const confirmPasswordRules = computed(() => [
  (v: string) => !!v || "Confirm password is required.",
  (v: string) => v === form.password || "Passwords do not match.",
]);

// REDIRECT HANDLING
const redirectUrl = route.query.redirectUrl as string; //

const handleRedirect = () => {
  if (redirectUrl) {
    const redirectBooking = useCookie<Boolean>("redirect_booking");
    redirectBooking.value = true;
    router.push(decodeURIComponent(redirectUrl));
  } else {
    showSucessDialog.value = true;
  }
};

const onSubmit = async () => {
  await formRef.value.validate();
  emailError.value = "";
  form.date_of_birth = formattedDate.value;
  form.first_name = capitalizeNames(form.first_name);
  form.last_name = capitalizeNames(form.last_name);

  if (!formValid.value) return (processing.value = false);
  processing.value = true;

  const { data, error } = await signup(form);
  if (error.value) {
    const { code, description } = error.value.data;
    if (code == 11000 || code == "ERROR_REGISTRATION_VIA_EMAIL") {
      emailError.value = "Email address already exist";
      processing.value = false;
    } else if (description == '"email" must be a valid email') {
      emailError.value =
        "Invalid Email address, Please enter a valid email address e.g johndoe@mail.com";
      processing.value = false;
    }
  } else if (data.value) {
    const res = data.value as any;
    if (!res.accessToken || !res.refreshToken) return;
    useCookie("accessToken", cookieOptions).value = res.accessToken;
    useCookie("refreshToken", cookieOptions).value = res.refreshToken;
    useCookie("user", cookieOptions).value = form.email;
    await nextTick();
    processing.value = false;
    handleRedirect();
  }
};

const goToHome = () => {
  navigateTo({ name: "country", params: { country } });
};

const goToSignupOptions = () => {
  navigateTo({ name: "country-signup", params: { country } });
};
</script>

<style scoped></style>
