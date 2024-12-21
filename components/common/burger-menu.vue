<template>
  <div class="d-flex justify-space-around">
    <v-menu transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn
          color="white"
          v-bind="props"
          class="rounded-xl mr-4"
          style="background-color: rgba(255, 255, 255, 0.24)"
        >
          <img
            src="/images/burger-icon.svg"
            alt="Burger button"
            height="30px"
            width="30px"
          />

          <h2 class="font-weight-thin pl-2 text-uppercase text-h6">
            {{ getAcronym }}
          </h2>
        </v-btn>
      </template>
      <v-list v-model="selectedItem">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :base-color="item.color"
          @click="selectedItem(item)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
const { country } = useLocal();
const { logout, user } = useLocalAuth();

let items = [
  { title: "Profile", value: 1 },
  { title: "Setting", value: 2 },
  { title: "Sign Out", value: 3, color: "red" },
];

let getAcronym = computed(() =>
  user ? user.givenName[0] + user.middleName[0] : "",
);

function selectedItem(data) {
  if (data.value == 3) {
    logOutUser();
  }
}

async function logOutUser() {
  try {
    await logout();
  } catch (error) {
    console.log(error.message);
  }
}
</script>
