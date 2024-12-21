<template>
  <div>
    <SignupPagesTemplate>
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
          class="fill-height text-secondary w-100"
        >
          <v-col cols="12" class="text-h5 text-lg-h4 text-center"
            >Set New Password</v-col
          >
          <v-form
            v-model="formValid"
            @submit.prevent
            class="mt-5"
            :class="xlAndUp ? 'w-75' : 'w-100'"
          >
            <v-row no-gutters class="mt-3" justify="center">
              <v-col cols="8" class="px-5">
                <v-text-field
                  v-model="password"
                  prepend-icon="mdi-lock-outline"
                  type="password"
                  label=""
                  variant="underlined"
                  placeholder="Enter your password"
                  color="secondary"
                  class="bg-transparent"
                  :rules="[requiredInput, minPasswordLength]"
                ></v-text-field>

                <v-text-field
                  v-model="confirmPassword"
                  prepend-icon="mdi-cellphone"
                  type="password"
                  label=""
                  variant="underlined"
                  placeholder="Confirm your password"
                  color="secondary"
                  class="bg-transparent"
                  :rules="[(v) => v === password || 'Password does not match']"
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
                >Set New Password</v-btn
              >
            </v-row>
          </v-form>
        </v-row>
        <DialogSuccessWithButton
          v-model="showSucessDialog"
          text="Password Reset Successfully."
          buttonText="Back to Login"
          @button-click="
            navigateTo({ name: 'country-login', params: { country } })
          "
        />
      </template>
    </SignupPagesTemplate>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, xlAndUp } = useDisplay();
const { country } = useLocal();
const { requiredInput, minPasswordLength, validEmail } = useUtils();
const { setSnackbar } = useLocal();
const { resetPassword } = useLocalAuth();

const formValid = ref(false);
const showSucessDialog = ref(false);
const { reset_token } = useRoute().params;

const password = ref("");
const confirmPassword = ref("");
const email = ref("");

const onSubmit = async () => {
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
</script>

<style scoped></style>
