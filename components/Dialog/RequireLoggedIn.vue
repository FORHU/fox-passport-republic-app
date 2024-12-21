<template>
  <v-dialog max-width="500" :class="mobile ? 'customMobile' : 'customDesktop'">
    <v-card class="pa-5 w-100">
      <v-row align="center" class="w-100 px-5" no-gutters>
        <v-col cols="12" class="d-flex justify-center">
          <span class="text-h5" :class="mobile ? 'text-center' : ''">
            Please
            <!-- <NuxtLink
              :to="{ name: 'country-login-user', params: { country },query: { redirectUrl: $route.fullPath } }"
              class="font-weight-bold text-primary text-decoration-none"
            >
              sign in
            </NuxtLink> -->
            <span role="button" @click="handleLoginRedirect" class="font-weight-bold text-primary text-decoration-none"
              variant="flat">
              sign in
            </span>
            {{
              !props.enquire
                ? "to make an enquiry."
                : "to mark this as favorite."
            }}
          </span>
        </v-col>
        <v-divider class="my-3"></v-divider>
        <v-col cols="12" class="d-flex justify-center flex-column align-center">
          <span>Don't have a user account?</span>
          <NuxtLink @click="handleSignupRedirect" class="cursor-pointer font-weight-bold text-primary text-decoration-none">
            Sign up here
          </NuxtLink>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const { mobile } = useDisplay();
const { country } = useLocal();
const props = defineProps<{
  enquire: boolean;
  formData: Object
}>();
import { useRouter, useRoute, } from 'vue-router';
const formDataCookie = useCookie<Object>("formData");
const router = useRouter();
const route = useRoute();
function handleLoginRedirect() {
  formDataCookie.value = JSON.stringify(props.formData);
  //  localStorage.setItem('formData', JSON.stringify(props.formData));

  // Capture the current page URL
  const currentPageUrl = encodeURIComponent(route.fullPath);

  // Redirect to the login page with the current page URL as a query parameter
  router.push({
    name: 'country-login-user',
    params: { country: route.params.country },
    query: { redirectUrl: currentPageUrl }
  });
}

const handleSignupRedirect = () => {
  // :to="{ name: 'country-sign-up', params: { country } }"

  formDataCookie.value = JSON.stringify(props.formData);
  // redirectBooking.value = true
  //  localStorage.setItem('formData', JSON.stringify(props.formData));

  // Capture the current page URL
  const currentPageUrl = encodeURIComponent(route.fullPath);

  // Redirect to the login page with the current page URL as a query parameter
  router.push({
    name: 'country-signup-user',
    params: { country: route.params.country },
    query: { redirectUrl: currentPageUrl }
  });
}

</script>
<style scoped>
.customDesktop {
  position: absolute;
  top: 1%;
}

.customMobile {
  position: fixed;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1000;
}
</style>
