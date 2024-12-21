<template>
  <v-form v-model="formValid" @submit.prevent :key="step" ref="form">
    <v-stepper v-model="step">
      <v-stepper-header mobile>
        <v-stepper-item value="1"
          ><span class="d-none d-md-inline"> Create Your Account</span>
        </v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item value="2"
          ><span class="d-none d-md-inline"
            >Contact Details</span
          ></v-stepper-item
        >
        <v-divider></v-divider>
        <v-stepper-item value="3">
          <span class="d-none d-md-inline"> Venue Details </span>
          <v-icon class="ml-3" icon="mdi-close" @click="handleClick"></v-icon>
        </v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item value="1">
          <v-row>
            <v-col cols="12">
              <span class="font-weight-bold">Create Your Account</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" xs="12" sm="12" md="12" lg="12">
              <v-text-field
                v-model="signupForm.email"
                @click="clearErrorValue"
                required
                :rules="emailRules"
                :error-messages="emailError"
                prepend-icon="mdi-email-outline"
                variant="underlined"
                placeholder="Work Email Address"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.password"
                required
                :rules="passwordRules"
                type="password"
                prepend-icon="mdi-lock-outline"
                variant="underlined"
                placeholder="Create Your Password"
              ></v-text-field>
            </v-col>

            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.rePassword"
                required
                :rules="rePasswordRules"
                type="password"
                prepend-icon="mdi-lock-alert-outline"
                variant="underlined"
                placeholder="Confirm Your Password"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              class="d-flex flex-row align-center"
              xs="12"
              sm="12"
              md="12"
              lg="12"
            >
              <v-checkbox
                class="pr-3 mr-3"
                v-model="signupForm.termsPrivacy"
                required
                :rules="[(v) => v || '']"
              >
                <template v-slot:label>
                  <v-row no-gutters
                    >I have read, accepted and agreed to the&nbsp;
                    <NuxtLink
                      class="text-decoration-underline"
                      target="_blank"
                      :to="{
                        path: `/${country}/termsandcondition`,
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
                        path: `/${country}/termsandcondition`,
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
        </v-stepper-window-item>

        <v-stepper-window-item value="2">
          <v-row>
            <v-col cols="12" xs="4" sm="4" md="8" lg="12">
              <span class="font-weight-bold">Your Contact Details</span>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.firstName"
                required
                :rules="textFieldValid"
                prepend-icon="mdi-account-outline"
                variant="underlined"
                placeholder="Enter Your First Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.lastName"
                required
                :rules="textFieldValid"
                prepend-icon="mdi-account-outline"
                variant="underlined"
                placeholder="Enter Your Last Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.companyName"
                required
                :rules="[(v) => v.length > 0 || 'Field is required']"
                prepend-icon="mdi-domain"
                variant="underlined"
                placeholder="Company Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <!-- <v-text-field
                v-model="phoneNumber"
                required
                :rules="phoneNumberRules"
                prepend-icon="mdi-cellphone"
                variant="underlined"
                placeholder="Enter Your Phone Number"
              ></v-text-field> -->
              <CustomPhoneNumberInput
                v-model:input="signupForm.phoneNumber"
                v-model:dialCode="signupForm.dialCode"
              />
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <v-stepper-window-item value="3">
          <v-row>
            <v-col cols="12">
              <span class="font-weight-bold">Your Venue Details</span>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.venueName"
                required
                :rules="[(v) => v.length > 0 || 'Field is required']"
                prepend-icon="mdi-office-building-outline"
                variant="underlined"
                placeholder="Venue Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <!-- <v-text-field
                v-model="countrySelected"
                required
                :rules="[(v) => v.length > 0 || 'Field is required']"
                prepend-icon="mdi-flag-outline"
                variant="underlined"
                placeholder="Country"
              ></v-text-field> -->
              <v-select
                v-model="signupForm.countrySelected"
                required
                :items="registeredCountries"
                item-title="country_name"
                item-value="cca2"
                :rules="[(v) => v.length > 0 || 'Field is required']"
                prepend-icon="mdi-flag-outline"
              
                placeholder="Country"
                variant="underlined"
              ></v-select>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.postalCode"
                required
                :rules="[(v) => v.length > 0 || 'Field is required']"
                prepend-icon="mdi-map-marker-outline"
                variant="underlined"
                placeholder="Postal"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6">
              <v-text-field
                v-model="signupForm.socialLink"
                required
                :rules="socialLinkRules"
                prepend-icon="mdi-web"
                variant="underlined"
                placeholder="Website"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions
        :class="step != 0 ? 'justify-space-between' : 'justify-end'"
      >
        <template v-slot:prev>
          <ButtonFlatLooseButton
            @click="back"
            v-if="step != 0"
            label="back"
            variant="outlined"
          />
        </template>
        <template v-slot:next>
          <ButtonFlatLooseButton
            @click="next"
            v-if="step != 2"
            color="secondary"
            label="continue"
            :disabled="!formValid"
          />
          <v-btn
            type="submit"
            @click="handleSubmit"
            v-else
            :disabled="!formValid || processing"
            color="secondary"
            label="sign up"
          />
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-form>
</template>
<script setup>
const { validEmail, minPasswordLength } = useUtils();
const { signup, cookieOptions } = useLocalAuth();
const { signupForm } = useSignup();
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
let rePasswordRules = [
  (v) => !!v || "Password field cannot be empty. Please enter your password",
  (v) => minPasswordLength(v),
  (v) =>
    v == signupForm.value.password ||
    "Passwords do not match. Please enter matching passwords in both fields.",
];
let textFieldValid = [
  (v) => v.length > 0 || "Field is required",
  (v) => isNaN(v) || "Input letters only",
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
    (v) =>!!v || "Social link field cannot be empty.",
    (v) =>
      /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})+(\/[^\s]*)?$/i.test(v) ||
      "Invalid Website address. Please enter a valid website e.g https://example.com",
  ];
})

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
      first_name: firstName,
      last_name: lastName,
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

    if(!countrySelected){
      return setSnackbar({modal: true, color: 'error', text: 'Country is required.'})
    }

    try {
      processing.value = true;
      const { data, error } = await signup(payload);
      if (!error.value) {
        const res = data.value;
        useCookie("accessToken", cookieOptions).value = res.accessToken;
        useCookie("refreshToken", cookieOptions).value = res.refreshToken;
        useCookie("user", cookieOptions).value = email;
        processing.value = false;

        if (res.venue_id) {
          navigateTo({
            name: "country-venues-management-venue-venueId",
            params: { country, venueId: res.venue_id },
          });
          mode.value = "create";
        } else {
          emits("registerSucess");
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

    processing.value = false;
  }
}
function back() {
  step.value--;
}


onMounted(async() => {
  // await loadCountries()
  if(country){
    const upperCasedCountry = country?.toUpperCase()
    const obj = registeredCountries.value.find(x => x.cca2 == upperCasedCountry)
    if(!obj) return;
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

<style scoped>
@media only screen and (max-width: 959px) {
  .v-stepper:not(.v-stepper--vertical) .v-stepper__label {
    display: flex !important;
  }
}

.v-stepper_header {
  overflow: auto;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: left;
}
</style>
