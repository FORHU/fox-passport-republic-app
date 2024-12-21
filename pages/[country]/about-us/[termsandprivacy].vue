<template>
  <v-col cols="12" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12" class="background-container">
        <v-row class="pa-10"></v-row>
        <v-row class="pb-15"></v-row>

        <v-row
          justify="center"
          class="pl-10 pt-10 pr-10 text-center font-weight-bold text-h3 text-white"
        >
          {{ headerText }}
        </v-row>
      </v-col>

      <v-col cols="12" class="d-flex justify-center mt-8">
        <v-tabs v-model="tab">
          <v-tab
            :value="1"
            @click="navigateTo('privacy-policy')"
            :class="{ 'v-tab--active': tab === 1 }"
          >
            Privacy Policy
          </v-tab>
          <v-tab
            :value="2"
            @click="navigateTo('terms-and-conditions')"
            :class="{ 'v-tab--active': tab === 2 }"
          >
            Terms and Conditions
          </v-tab>
        </v-tabs>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <TermsAndPolicyPrivacyPolicy v-if="tab === 1" :key="1" />
            <TermsAndPolicyTermsAndConditions v-if="tab === 2" :key="2" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const { country } = useLocal();

const tab = ref(1);

const headerText = computed(() => {
  return tab.value === 1
    ? "Privacy Policy for Venues"
    : "Terms and Conditions for Venues";
});

function navigateTo(section) {
  const newTab = section === "privacy-policy" ? 1 : 2;
  tab.value = newTab;
  router.push(`/${country}/about-us/${section}?key=${newTab}`).catch((err) => {
    console.error("Error during route change:", err);
  });
}

function updateTabFromQuery() {
  const { key } = route.query;
  console.log("Query param key:", key);
  if (key) {
    tab.value = parseInt(key, 10);
  }
}

watch(
  () => route.query.key,
  (newKey) => {
    updateTabFromQuery();
    console.log("Tab value after query change:", tab.value);
  }
);

onMounted(() => {
  updateTabFromQuery();
  console.log("Initial tab value on mount:", tab.value);
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
