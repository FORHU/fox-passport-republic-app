<template>
  <v-row no-gutters justify="center">
    <v-form
      v-model="formValid"
      @submit.prevent
      ref="form"
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
          >Create an account as lister</v-col
        >
        <v-col cols="12" class="text-16px text-subtitle"
          >Already have an account?
          <NuxtLink
            :to="{ name: 'country-login-venue', params: { country } }"
            class="text-secondary text-decoration-underline"
          >
            Log in as lister</NuxtLink
          ></v-col
        >
      </v-row>
      <v-row no-gutters class="md-flex ga-5 flex-wrap w-100">
        <v-col>
          <span class="w-100 text-16px text-secondary">First Name</span>
          <v-text-field
            v-model="signupForm.firstName"
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
            v-model="signupForm.lastName"
            variant="outlined"
            placeholder="Doe"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="[(v: string) => requiredInputForName(v)]"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-1">
        <v-col>
          <span class="w-100 text-16px text-secondary">Contact No.</span>
          <CustomPhoneNumberInputNew
            v-model:input="signupForm.phoneNumber"
            v-model:dialCode="signupForm.dialCode"
          />
        </v-col>
        <v-col>
          <span class="w-100 text-16px text-secondary">Country</span>
          <v-select
            v-model="signupForm.countrySelected"
            required
            :items="registeredCountries"
            item-title="country_name"
            item-value="cca2"
            :rules="[(v) => v.length > 0 || 'Field is required']"
            placeholder="Country"
            variant="outlined"
            density="comfortable"
            rounded="lg"
          ></v-select>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-2">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Email</span>
          <v-text-field
            v-model="signupForm.email"
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

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-1">
        <v-col>
          <span class="w-100 text-16px text-secondary">Company Name</span>
          <v-text-field
            v-model="signupForm.companyName"
            variant="outlined"
            placeholder=""
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="[(v: string) => requiredInput(v)]"
            required
          ></v-text-field>
        </v-col>
        <v-col>
          <span class="w-100 text-16px text-secondary">Website Link</span>
          <v-text-field
            v-model="signupForm.socialLink"
            variant="outlined"
            placeholder=""
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="socialLinkRules"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-1">
        <v-col>
          <span class="w-100 text-16px text-secondary">Venue Name</span>
          <v-text-field
            required
            v-model="signupForm.venueName"
            variant="outlined"
            placeholder=""
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="[(v: string) => requiredInput(v)]"
          ></v-text-field>
        </v-col>
        <v-col>
          <span class="w-100 text-16px text-secondary">Postal Code</span>
          <v-text-field
            v-model="signupForm.postalCode"
            required
            variant="outlined"
            placeholder=""
            density="comfortable"
            rounded="lg"
            class="mt-1"
           :rules="[(v: string) => requiredInput(v)]"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-1">
        <v-col cols="12">
          <span class="w-100 text-16px text-secondary">Password</span>
          <v-text-field
            v-model="signupForm.password"
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
            v-model="signupForm.rePassword"
            variant="outlined"
            type="password"
            placeholder="+6 characters"
            density="comfortable"
            rounded="lg"
            class="mt-1"
            :rules="rePasswordRules"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="d-flex flex-row align-center">
          <v-checkbox
            class="pr-3 mr-3 text-16px"
            v-model="signupForm.termsPrivacy"
            required
            :rules="[(v) => v || '']"
            size="x-small"
            hide-details
          >
            <template v-slot:label>
              <v-row no-gutters class="text-subtitle-2"
                >I accept the&nbsp;
                <NuxtLink
                  class="text-decoration-underline"
                  target="_blank"
                  :to="{
                    path: `/${country}/about-us/terms-and-condition`,
                    query: { key: '2' },
                  }"
                >
                  Terms and Conditions
                </NuxtLink>

                &nbsp;and
                <NuxtLink
                  class="text-decoration-underline"
                  target="_blank"
                  :to="{
                    path: `/${country}/about-us/privacy-policy`,
                    query: { key: '1' },
                  }"
                >
                  &nbsp;Privacy Policy.
                </NuxtLink>
              </v-row>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-7">
        <v-col cols="12">
          <v-btn
            type="submit"
            variant="flat"
            color="primary"
            size="large"
            rounded="lg"
            class="mt-1 w-100 font-500"
            @click="handleSubmit"
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

const { validEmail, minPasswordLength, requiredInputForName, capitalizeNames, requiredInput } =
  useUtils();
const { signup, cookieOptions } = useLocalAuth();
const { signupForm, resetSignupForm } = useSignup();
const { countries } = useVenueData();
const { mode } = useVenue();
const { country, loadCountries, registeredCountries } = useLocal();
const step = ref(0);
const formValid = ref(false);

const emailError = ref("");
const processing = ref(false);
const form = ref();

let emailRules = [
  (v) => !!v || "The email field must not be empty",
  (v) =>
    /.+@.+\..+/.test(v) ||
    "Invalid Email address, Please enter a valid email address e.g johndoe@mail.com",
  (v) => validEmail(v),
];
let passwordRules = [
  (v) => !!v || "Password field cannot be empty. Please enter your password",
  (v) => minPasswordLength(v),
];
// let rePasswordRules = [
//   (v) => !!v || "Password field cannot be empty. Please enter your password",
//   (v) => minPasswordLength(v),
//   (v) =>
//     v == signupForm.value.password ||
//     "Passwords do not match. Please enter matching passwords in both fields.",
// ];

const rePasswordRule = [(v) => requiredInput(v)];

const rePasswordRules = computed(() => [
  (v: string) => !!v || "Confirm password is required.",
  (v: string) => v === signupForm.value.password || "Passwords do not match.",
]);

let textFieldValid = [
  (v) => v.length > 0 || "This field is required.",
  (v) => /^[A-Za-z\s]+$/.test(v) || "Only letters are allowed.",
];
let phoneNumberRules = [
  (v) => !!v || "Field is required",
  (v) => !isNaN(v) || "Input numbers only",
];

const emits = defineEmits(["icon-click", "registerSucess"]);

const handleClick = () => {
  emits("icon-click");
};

function clearErrorValue() {
  emailError.value = "";
}
function next() {
  if (formValid.value) {
    step.value++;
  }
}

const socialLinkRules = computed(() => {
  return [
    (v) =>
      !v ||
      /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})+(\/[^\s]*)?$/i.test(v) ||
      "Please enter a valid website e.g https://example.com",
  ];
});

async function handleSubmit() {
  await form.value.validate();

  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dialCode,
    companyName,
    venueName,
    postalCode,
    countrySelected,
    socialLink,
  } = signupForm.value;

  if (formValid.value) {
    const payload = {
      first_name: capitalizeNames(firstName),
      last_name: capitalizeNames(lastName),
      email: email,
      password: password,
      phone_number: dialCode + phoneNumber,
      company_name: companyName,
      venue_name: venueName,
      postal: postalCode,
      country: countrySelected,
      social_link: socialLink,
      role: "VENUE_OWNER",
    };
    if (!countrySelected) {
      return setSnackbar({
        modal: true,
        color: "error",
        text: "Country is required.",
      });
    }

    try {
      processing.value = true;
      const { data, error } = await signup(payload);
      if (!error.value) {
        const res = data.value;
        useCookie("accessToken", cookieOptions).value = res.accessToken;
        useCookie("refreshToken", cookieOptions).value = res.refreshToken;
        useCookie("user", cookieOptions).value = email;
        // processing.value = false;

        if (res.venue_id) {
          const signedUpCountry =
            signupForm.value?.countrySelected?.toLowerCase();
          navigateTo({
            name: "country-venues-management-venue-venueId-formId",
            params: {
              country: signedUpCountry || country,
              venueId: res.venue_id,
              formId: "overview",
            },
          });
          mode.value = "create";
          await nextTick();
          setTimeout(() => {
            // Object.keys(signupForm.value).forEach(key => {
            //     signupForm.value[key] = '';
            //     });
            resetSignupForm()
          }, 1500);
          processing.value = false;
        } else {
          emits("registerSucess");
          await nextTick();
          setTimeout(() => {
            // Object.keys(signupForm.value).forEach(key => {
            //     signupForm.value[key] = '';
            //     });
            resetSignupForm()
          }, 1500);
          processing.value = false;
        }
      }

      if (error.value) {
        const { code, description } = error.value.data;

        if (code == 11000 || code == "ERROR_REGISTRATION_VIA_EMAIL") {
          emailError.value = "Email address already exist";
          step.value = 0;
          processing.value = false;
          return;
        }

        if (code === "ERROR_REGISTRATION_MISSING_FIELDS") {
          emailError.value =
            "Invalid Email address, Please enter a valid email address e.g johndoe@mail.com";
          step.value = 0;
          processing.value = false;
          return;
        }
      }
    } catch (error) {
      log.error(error);
      processing.value = false;
    }

    // processing.value = false;
    // setTimeout(() => {
    //   Object.keys(signupForm.value).forEach(key => {
    //       signupForm.value[key] = '';
    //       });
    // },1500)
  }
}
function back() {
  step.value--;
}

const goToSignupOptions = () => {
  navigateTo({ name: "country-signup", params: { country } });
};

onMounted(async () => {
  // await loadCountries();
  if (country) {
    const upperCasedCountry = country?.toUpperCase();
    const obj = registeredCountries.value.find(
      (x) => x.cca2 == upperCasedCountry
    );
    if (!obj) return;
    signupForm.value.countrySelected = obj.cca2;
  }
});

const goToListVenue = () => {
  navigateTo({
    name: "country-termsandcondition-index",
    params: { country: country },
  });
};
</script>
