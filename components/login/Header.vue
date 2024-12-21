<template>
  <v-app-bar v-if="headerShow" color="white" :elevation="1">
    <v-app-bar-title class="text-green font-weight-bold text-h5">
      Venue4use
    </v-app-bar-title>
    <NuxtLink
      :to="{ name: 'country-login', params: { country } }"
      class="btn-text text-black d-flex mr-8"
      style="text-decoration: none"
    >
      <img
        class="pr-3"
        src="/images/login/person-topbar-icon.svg"
        alt="person icon"
      />
      <p>Log in</p>
    </NuxtLink>
    <NuxtLink
      :to="{ name: 'country-list-your-venue', params: { country } }"
      class="btn-text text-black d-flex mr-5"
      style="text-decoration: none"
    >
      <img
        class="pr-3"
        src="/images/login/home-topbar-icon.svg"
        alt="home icon"
      />
      <p>List your venue</p>
    </NuxtLink>
  </v-app-bar>
</template>

<script>
export default {
  computed: {
    headerShow() {
      let currentRoute = this.$route.name;
      if (currentRoute == "country-list-your-venue") return false;
      if (currentRoute == "country-sign-up") return false;
      if (currentRoute == "country-forgot-user") return false;
      if (currentRoute == "country-forgot-password-reset") return false;
      return true;
    },
  },
};
</script>

<script setup>
const { country } = useLocal();
</script>

<style></style>
