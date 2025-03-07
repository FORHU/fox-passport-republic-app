<template>
  <v-col cols="12" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12" class="background-container">
        <v-row class="pa-10"></v-row>
        <v-row class="pb-15"></v-row>

        <v-row justify="center" class="pl-10 pt-10 pr-10 text-center font-weight-bold text-h3 text-white">
          {{ headerText }}
        </v-row>
      </v-col>

      <v-col cols="12" class="d-flex justify-center mt-8">
        <v-tabs v-model="tab" fixed-tabs>
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :to="`/${country}/venue4use/${tab.name}`"
            :text="tab.text"></v-tab>
        </v-tabs>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <Venue4useWhyVenue4use v-if="tab === 1" />
            <Venue4useWhyListWithUs v-if="tab === 2" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- CTA Section -->
    <v-row class="py-10" align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="10" xl="10">
        <v-card class="venue-card rounded-lg overflow-hidden">
          <v-img src="/images/landingpage/background-cta.png" height="500" width="100%"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" cover alt="why venue4use page header">
            <v-container class="fill-height pa-0">
              <v-row align="center" justify="center" class="fill-height">
                <v-col cols="12" sm="10" md="10" lg="10"
                  class="text-center d-flex flex-column justify-center align-center">
                  <h2 class="text-h4 text-sm-h3 font-weight-bold text-white mb-4">
                    Join Venue4use today
                  </h2>
                  <NuxtLink :to="`/${country}/signup/venue`">
                    <v-btn class="mt-4 text-black rounded-lg" width="195" height="50" tile color="white"
                      style="padding: 17px 34px">
                      List Your Venue
                    </v-btn>
                  </NuxtLink>
                </v-col>
              </v-row>
            </v-container>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>
<script setup>
const route = useRoute();
const router = useRouter();
const { country } = useLocal();
const tab = ref(1);
const tabs = ref([]);
const headerText = computed(() => {
  return tab.value === 1 ? "Why Venue4use" : "Why List With Us";
});

onMounted(() => {
  tabs.value = [
    { value: 1, text: "Why Venue4use", name: "why-venue-4-use" },
    { value: 2, text: "Why List With Us", name: "why-list-with-us" },
  ];
});
</script>

<style scoped>
.background-container {
  background-image: url("/images/landingpage/background-cta.png");
  background-size: cover;
  background-position: center;
  height: 380px;
}
</style>
