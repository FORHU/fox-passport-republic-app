<template>
  <v-app>
    <LayoutPrimaryHeader />
    <v-navigation-drawer v-model="drawer" prominent class="pa-4">
      <v-list class="pa-0">
        <template v-for="item in navItems" :key="item.type">
          <div>
            <v-list-item :href="`${item.value}`" :active="path?.includes(item.value)">
              <template class="d-flex">
                <span class="mr-3">
                  <v-list-item-icon>
                    <v-icon :icon="item.icon"></v-icon>
                  </v-list-item-icon>
                </span>
                <span>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.title }}
                    </v-list-item-title>
                  </v-list-item-content>
                </span>
              </template>
            </v-list-item>
          </div>
        </template>
      </v-list>
      <div style="position: fixed; bottom: 0" class="ml-4 mb-4">
        <p
          v-if="versionNumber"
          class="text-secondary text-14px text-sm-18px text-grey"
          style="font-size: 18px"
        >
          v{{ versionNumber }}
        </p>
      </div>
      <!-- Positioned at the bottom -->
    </v-navigation-drawer>
    <v-main>
      <v-col cols="12" class="d-flex d-sm-none mb-3">
        <v-select
          v-model="activeSection"
          :items="navItems"
          item-title="title"
          item-value="value"
          dense
          outlined
          class="w-100 mx-3"
          rounded="lg"
          @update:model-value="handleChangeTab"
        />
      </v-col>

      <v-row no-gutters class="w-100" justify="center">
        <v-col
          cols="12"
          lg="8"
          class="w-100 account-information d-flex align-start py-5 justify-start w-100"
        >
          <div class="d-flex align-start px-2 px-sm-4">
            <div class="d-none d-sm-block d-lg-none">
              <v-app-bar-nav-icon
                variant="text"
                size="40"
                @click.stop="drawer = !drawer"
              ></v-app-bar-nav-icon>
            </div>
            <!-- Account Details -->
            <div class="account-details ml-3">
              <div class="user d-flex align-center">
                <h3 class="user-info font-weight-bold">
                  {{ name }} <span style="color: #dedfe3">/</span>
                  {{ activeTabDetails?.title }}
                </h3>
              </div>

              <p>
                {{ activeTabDetails?.desc }}
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row no-gutters class="w-100 d-flex justify-lg-center">
        <v-col cols="12" lg="8" class="px-3 px-sm-7">
          <slot />
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
import { useDisplay } from "vuetify";
const { lgAndUp, smAndUp } = useDisplay();
const { country } = useLocal();
const { currentUser } = useLocalAuth();
const { isDarkMode } = useLocal();
const theme = useTheme()
const { data, error } = await useFetch("/version");
const path = useRoute().path

const { showSettingDrawer: drawer } = useSettingAPI();
const { isOWNER, isVenueAdmin, isVenueMember, isUser, teamAdmin } = useAccess();

const activeSection = ref("");

watch(
  lgAndUp,
  (newVal) => {
    if (newVal == true) {
      drawer.value = true;
    } else {
      drawer.value = false;
    }
  },
  { immediate: true }
);

const navItems = computed(() => {
  const items = [
    {
      title: "General Information",
      value: "general-information",
      desc: "Update your general account information",
      icon: "mdi-account-cog",
    },
    {
      title: "Password",
      value: "password",
      desc: "Manage your password",
      icon: "mdi-lock",
    },
  ];

    items.push({
      title: "Account Settings",
      value: "account-settings",
      desc: "Manage your account settings",
      icon: "mdi-cog-transfer-outline",
    });
  
  if (!teamAdmin) {
    items.push({
      title: "Delete Account",
      value: "delete-account",
      desc: "Delete your Venue4use account",
      icon: "mdi-delete",
    });
  }
  return items;
});

const handleChangeTab = (val: string) => {
  if (!val) return;
  navigateTo({ name: `country-profile-${val}`, params: { country } });
};

// get the current tab
watchEffect(() => {
  theme.global.name.value = isDarkMode.value ? "dark" : "light";
  const urlPath = useRoute().path;
  const lastValue = urlPath?.split("/").pop();
  if (lastValue) {
    activeSection.value = lastValue;
  }
});

const name = computed(() => {
  if (currentUser.value) {
    console.log(currentUser.value);
    
    return (
      `${currentUser.value.first_name || ""} ${currentUser.value.last_name || ""}`.trim() ||
      "Unknown"
    );
  }
  return "Unknown";
});

const activeTabDetails = ref();

// get activeTab Details Object
watch(
  activeSection,
  () => {
    const obj = navItems.value?.find((x) => x.value == activeSection.value);
    activeTabDetails.value = obj;
  },
  { immediate: true }
);

const versionNumber = computed(() => {
  return `${data?.value?.version}-${data?.value?.commitHash}`;
});
</script>
