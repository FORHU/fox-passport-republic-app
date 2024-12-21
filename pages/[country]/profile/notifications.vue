<template>
  <v-container fluid style="background-color: #e0e8f5; min-height: 100vh">
    <h1>My Account</h1>

    <v-card class="ma-2">
      <div class="d-flex">
        <v-app-bar-nav-icon
          class="hidden-lg-and-up mt-3 ml-2"
          variant="text"
          size="40"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>
        <h2 class="pa-3">Notifications</h2>
      </div>
      <v-divider color="#6750A4" :thickness="2"></v-divider>

      <v-card class="pa-5">
        <div>
          <v-card-text cols="12">
            <h3>Booking Notifications</h3>

            <v-row
              v-for="(setting, index) in bookingSettings"
              :key="index"
              class="setting"
            >
              <v-col>
                <div class="settingType">
                  <p>{{ setting.title }}</p>
                  <p>{{ setting.description }}</p>
                </div>
                <v-divider></v-divider>
              </v-col>

              <v-col class="mr-3" cols="1">
                <div class="switch">
                  <v-switch v-model="setting.enabled"></v-switch>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text cols="12">
            <h3>Inspiration, services and promotions.</h3>

            <v-row
              v-for="(setting, index) in inspirationSettings"
              :key="index"
              class="setting"
            >
              <v-col>
                <div class="d-flex flex-column">
                  <p>{{ setting.title }}</p>
                  <p>{{ setting.description }}</p>
                </div>
                <v-divider></v-divider>
              </v-col>

              <v-col class="mr-3" cols="1">
                <div class="switch">
                  <v-switch v-model="setting.enabled"></v-switch>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </div>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

const { drawer } = useVenue();

const bookingSettings = [
  {
    title: "Enquiry Notifications",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Account Information",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Financials",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Notifications",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Enquiry Notifications",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
];

const inspirationSettings = [
  {
    title: "Inspirations",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Tips and Deals",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Research",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
  {
    title: "Bonuses",
    description: "Status changes, booking confirmations, and new messages",
    enabled: false,
  },
];
</script>

<style scoped>
.settingType {
  display: flex;
  flex-direction: column;
}
</style>
