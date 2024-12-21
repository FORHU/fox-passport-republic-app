<template>
  <v-app-bar
    elevation="0"
    style="border-width: thin; background-color: #0d403a"
  >
    <v-spacer></v-spacer>

    <div class="mx-4 text-white">My Events</div>
    <v-avatar class="mx-4">
      <img :src="profilePictureSource" alt="User profile" />
    </v-avatar>
    <CommonBurgerMenu />
  </v-app-bar>
  <LayoutNavigationBar></LayoutNavigationBar>
</template>

<script setup>
const { country } = useLocal();
const { user } = useLocalAuth();

let profilePictureSource = computed(() => {
  if (user && user.profile_picture) {
    return user.profile_picture;
  } else {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user ? user.givenName[0] + user.middleName[0] : "AU",
    )}`;
  }
});
</script>

<style></style>
