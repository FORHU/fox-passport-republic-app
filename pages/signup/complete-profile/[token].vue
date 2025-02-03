<template>
  <v-row no-gutters justify="center">
    <v-form v-model="formValid" @submit.prevent ref="formRef" class="my-5 my-md-10 mx-3 mx-md-5 text-secondary w-100"
      style="max-width: 436px">
      <v-row no-gutters class="w-100 mb-15" style="position: relative">
        <ButtonBack label="Back" @click="goToSignupOptions" style="position: absolute; left: -5%" />
      </v-row>

      <v-row no-gutters class="w-100 my-7 my-md-10">
        <v-col cols="12" class="text-24px font-700">Complete your profile</v-col>
        <v-col cols="12" class="text-16px text-subtitle">Please enter contact details for your Venue4use
          account.</v-col>
        <v-col cols="12" class="text-16px font-500">{{ email }}</v-col>
      </v-row>

      <v-row no-gutters>
        <v-col><span class="text-16px text-secondary">First Name</span>
          <v-text-field v-model="form.first_name" variant="outlined" placeholder="John" density="comfortable"
            rounded="lg" class="mt-1" :rules="[(v: string) => requiredInputForName(v)]"></v-text-field></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <span class="text-16px text-secondary">Last Name</span>
          <v-text-field v-model="form.last_name" variant="outlined" placeholder="Doe" density="comfortable" rounded="lg"
            class="mt-1" :rules="[(v: string) => requiredInputForName(v)]"></v-text-field></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <span class="text-16px text-secondary">Contact No.</span>
          <CustomPhoneNumberInputNew v-model:formattedNumber="form.phone_number" class="mt-1" />
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <span class="w-100 text-16px text-secondary">New Password</span>
          <v-text-field v-model="form.password" variant="outlined" type="password" placeholder="+6 characters"
            density="comfortable" rounded="lg" class="mt-1" :rules="passwordRules"></v-text-field></v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <span class="w-100 text-16px text-secondary">Confirm New Password</span>
          <v-text-field v-model="confirmPassword" variant="outlined" type="password" placeholder="+6 characters"
            density="comfortable" rounded="lg" class="mt-1" :error-messages="confirmPasswordRules"></v-text-field>
        </v-col>
      </v-row>

      <v-row no-gutters class="d-flex ga-5 flex-wrap w-100 mt-7">
        <v-col cols="12">
          <v-btn variant="flat" color="primary" type="submit" size="large" rounded="lg" class="mt-1 w-100 font-500"
            :disabled="!formValid || !token || confirmPassword == ''" @click="onSubmit" :loading="processing">Create
            Account</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <DialogSuccessWithButton v-model="showSucessDialog" text="Registration Successful" button-text="Got It!"
      @button-click="goToHome" />
    <v-snackbar color="success" v-model="successSnackBar" timeout="2000">
      <span>Profile successfully completed!</span>
    </v-snackbar>
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth-layout",
});

const { country, setSnackbar } = useLocal();
const { validEmail, minPasswordLength, requiredInput, requiredInputForName, capitalizeNames } = useUtils();
const { saveTeamMembers, saveAdminTeamMembers } = useTeamMembers()
const { saveOwnerTransfer } = useVenue();

const { cookieOptions } = useLocalAuth();
const confirmPassword = ref("");
const formValid = ref(false);
const showSucessDialog = ref(false);
const processing = ref(false);
const formRef = ref();
const successSnackBar = ref(false)
const { email, admin_invite, transfer_request } = useRoute().query as { email: string, admin_invite: string, transfer_request: string }
const { token } = useRoute().params as { token: string }

const form = reactive({
  first_name: "",
  last_name: "",
  phone_number: "",
  password: "",
  role: "",
});


const somethingWentWrongMessage = {
  modal: true,
  color: 'error',
  text: 'Something went wrong. Please try again later.'
}


const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => minPasswordLength(v),
];

const confirmPasswordRule = [
  (v: string) => requiredInput(v),
];

const confirmPasswordRules = computed(() => {
  if (!confirmPassword.value) {
    return '';
  }
  return confirmPassword.value !== form.password ? 'Passwords do not match.' : '';
});


const onSubmit = async () => {
  const first_name = capitalizeNames(form.first_name);
  const last_name = capitalizeNames(form.last_name);
  const password = form.password;
  const phone_number = form.phone_number;
  processing.value = true;

  if (!token) return;

  try {
    let payload: TSaveMember = {
      first_name,
      last_name,
      password,
      phone_number
    }

    let res;

    // handle transfer ownership request
    if (transfer_request) {
      res = await saveOwnerTransfer(payload, token)
    } else {
      res = admin_invite ? await saveAdminTeamMembers(payload, token) : await saveTeamMembers(payload, token)
    }


    if (res) {
      successSnackBar.value = true;
      setTimeout(() => {
        navigateTo({
          name: admin_invite ? "country-login-admin" : "country-login-venue",
          params: { country }
        });
      }, 1000);
    }

  } catch (error: any) {
    if (error.code == 'INVALID_TOKEN') {
      setSnackbar({
        modal: true,
        color: 'error',
        text: 'Invalid token. Please try again.'
      })
    } else if (error.code == 'INVALID_INVITATION') {
      setSnackbar({
        modal: true,
        color: 'error',
        text: 'Invalid invitation. Please try again.'
      })
    } else {
      setSnackbar(somethingWentWrongMessage)
    }
  } finally {
    processing.value = false;
  }
};

const goToHome = () => {
  navigateTo({ name: "country", params: { country: country || 'sg' } });
};

const goToSignupOptions = () => {
  navigateTo({ name: "country-signup", params: { country: country || 'sg' } });
};

</script>

<style scoped></style>
