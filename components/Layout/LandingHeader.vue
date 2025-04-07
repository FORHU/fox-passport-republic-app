<template>
  <v-app-bar
    app
    flat
    height="80"
    class=""
    :elevation="displayHeader ? 1 : 0"
    :class="{ scrolled: displayHeader }"
  >
    <v-row no-gutters align="center" justify="center" class="w-100">
      <v-col
        sm="12"
        md="11"
        lg="11"
        class="w-100 d-flex align-center justify-space-between px-2 px-lg-11 px-xl-15"
      >
        <span class="d-flex ga-sm-2 align-center">
          <nuxt-link
            v-slot="{ navigate }"
            :to="{ name: 'country', params: { country } }"
          >
            <img
              src="./../../public/images/navigation/dp3-removebg.webp"
              alt="Venue4use brand logo"
              role="link"
              @click="navigate"
              style="max-width: 120px"
            />
          </nuxt-link>
          <span :class="smAndDown ? 'ml-n2' : ''">
            <ChangeCountryDropdown v-model:display="displayHeader" />
          </span>
        </span>

        <span class="d-flex justify-end align-center">
          <template v-if="loggedIn">
            <template
              v-for="navigationItem in navigation"
              :key="navigationItem.title"
              v-if="!mdAndDown"
            >
              <nuxt-link
                :to="{
                  name: navigationItem.to,
                  params: { country: getCountry() },
                }"
                class="d-flex align-center mx-5"
                style="text-decoration: unset; color: unset"
              >
              <template v-if="navigationItem?.key == 'inquiries' && inquiryBadgeCount">
              <v-badge color="error" :content="inquiryBadgeCount" offset-x="-10">
              <v-icon
                size="small"
                class="custom-padding"
              >
                {{ navigationItem.icon }}
              </v-icon>
              {{ navigationItem.title }}
              </v-badge>
            </template>
            <template v-else>
              <v-icon
                size="small"
                class="custom-padding"
              >
                {{ navigationItem.icon }}
              </v-icon>
              {{ navigationItem.title }}
            </template>
              </nuxt-link>
            </template>

            <v-menu transition="slide-y-transition" v-model="menuOpen">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="!mdAndDown"
                  v-bind="props"
                  size="large"
                  class="ml-4 font-600 text-uppercase d-flex align-center"
                >
                  <template #prepend>
                    <ProfileAvatar
                      :first_name="currentUser?.first_name"
                      :last_name="currentUser?.last_name"
                      :img-src="currentUser?.profile_picture"
                      :withBorder="true"
                    />
                  </template>
                  <v-icon
                    class="ml-1 mt-1"
                    :class="displayHeader ? 'text-secondary' : 'text-white'"
                  >
                    {{ menuOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}
                  </v-icon>
                </v-btn>
                <div v-else>
                  <ProfileAvatar
                    :first_name="currentUser?.first_name"
                    :last_name="currentUser?.last_name"
                    :img-src="currentUser?.profile_picture"
                    @click="menuOpen = true"
                    :withBorder="true"
                  />
                  <v-icon
                    class="ml-1 mt-1"
                    :class="displayHeader ? 'text-secondary' : 'text-white'"
                    v-bind="props"
                  >
                    {{ menuOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}
                  </v-icon>
                </div>
              </template>
              <v-list class="pa-0 mb-10">
                <v-list-item
                  v-for="navigationItem in navigation"
                  :key="navigationItem.title"
                  :to="{
                    name: navigationItem.to,
                    params: { country: getCountry() },
                  }"
                  class="text-decoration-none"
                >
                  <v-list-item-title>{{
                    navigationItem.title
                  }}</v-list-item-title>
                  <template v-if="navigationItem?.key == 'inquiries' && inquiryBadgeCount" v-slot:append>
                  <v-badge
                    color="error"
                    :content="inquiryBadgeCount"
                    inline
                  ></v-badge>
                </template>
                </v-list-item>
                <v-list-item
                  :to="`/${country}/announcements/list`"
                  class="text-decoration-none"
                >
                  <v-list-item-title>Announcements</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :to="`/settings/country`"
                  class="text-decoration-none"
                  v-if="isAdmin"
                >
                  <v-list-item-title>Countries</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :to="`/${country}/ratings`"
                  class="text-decoration-none"
                  v-if="isAdmin"
                >
                  <v-list-item-title>Manage Review</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :to="`/${country}/sales`"
                  class="text-decoration-none"
                  v-if="isAdmin || isAdminMember || isAdminSales"
                >
                  <v-list-item-title>{{
                    isAdminSales ? "My Sales Transaction" : "Sales Transaction"
                  }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :to="`/${country}/team-members`"
                  class="text-decoration-none"
                  v-if="isVenueOwner || isVenueLister || isAdmin"
                >
                  <v-list-item-title>Team Members</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :to="`/${country}/profile/general-information`"
                  class="text-decoration-none"
                >
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout" class="text-decoration-none">
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template v-else>
            <v-row
              no-gutters
              class="w-100 px-md-5 px-xl-10 d-flex align-center ga-5"
              justify="end"
            >
              <template v-for="item in loginItems">
                <nuxt-link
                  class="d-none d-sm-block link-style text-decoration-none"
                  :to="item.to"
                >
                  {{ item.title }}
                </nuxt-link>
              </template>

              <span class="d-sm-none">
                <v-menu transition="slide-y-transition" v-model="menuOpen">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-menu" flat v-bind="props"></v-btn>
                  </template>
                  <v-list class="w-100 d-flex flex-column text-16px">
                    <template v-for="item in loginItems">
                      <v-list-item :to="item.to">{{ item.title }}</v-list-item>
                    </template>
                  </v-list>
                </v-menu>
              </span>
            </v-row>
          </template>
        </span>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useDisplay } from "vuetify";

const { displayHeader } = useUtils();
const { isAdminMember, isAdminSales } = useAccess();
const { inquiryBadgeCount } = useNotification();
const { smAndDown, mdAndDown } = useDisplay();
const { loggedIn, currentUser, logout } = useLocalAuth();
const { country } = useLocal();
const baseUrl = "country";

const menuOpen = ref(false);

const isScrolled = ref(false);

const onIntersect = (entries) => {
  entries.forEach((entry) => {
    displayHeader.value = !entry.isIntersecting;
  });
};

const handleResize = () => {
  const entries = document.querySelectorAll("#scroll-target");
  entries.forEach((entry) => {
    const rect = entry.getBoundingClientRect();
    displayHeader.value = rect.top <= 0;
  });
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const isAdmin = currentUser.value.role == "ADMIN";
const isUser = currentUser.value.role == "USER";
const isVenueOwner = currentUser.value.role == "VENUE_OWNER";
const isVenueLister = currentUser.value.role == "VENUE_LISTER";

const navigation = computed(() => {
  const items = [];

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: isAdmin ? "Inquiries" : "My Inquiries",
      icon: "mdi-message-text-outline",
      to: `${baseUrl}-enquiries`,
      params: { country, status: "all" },
      key: "inquiries"
    });
  }

  if (isUser) {
    items.push({
      title: "My Inquiries",
      icon: "mdi-message-text-outline",
      to: `${baseUrl}-enquiries`,
      params: { country },
      key: "inquiries"
    });
  }

  if (isUser) {
    items.push({
      title: "Favorites",
      icon: "mdi-heart-outline",
      to: `${baseUrl}-favorites`,
      params: { country },
    });
  }

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: "Availability",
      icon: "mdi-calendar-today-outline",
      to: `${baseUrl}-availability`,
      params: { country },
    });
  }

  // if (isVenueOwner || isVenueLister || isAdmin) {
  //   items.push({
  //     title: "Team Members",
  //     icon: "mdi-account-group-outline",
  //     to: `${baseUrl}-team-members`,
  //     params: { country },
  //   });
  // }

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: "My Venues",
      icon: "mdi-home-outline",
      to: `${baseUrl}-venues-management`,
      params: { country, status: "all" },
    });
  }

  // if (isAdmin || isAdminMember || isAdminSales) {
  //   items.push({
  //     title: isAdminSales ? "My Sales Transaction" : "Sales Transaction",
  //     icon: "mdi-file-document-edit-outline",
  //     to: `${baseUrl}-sales`,
  //     params: { country },
  //   });
  // }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Insights",
  //     icon: "mdi-poll",
  //     to: `${baseUrl}-insights`,
  //     params: { country },
  //   });
  // }

  // if (isAdmin) {
  //   items.push({
  //     title: "Countries",
  //     icon: "mdi-earth-plus",
  //     to: "settings-country",
  //   });
  // }

  return items;
});

const loginItems = [
  {
    title: "List your venue",
    to: `/${country}/signup/venue`,
  },
  {
    title: "Signup",
    to: `/${country}/signup`,
  },
  {
    title: "Login",
    to: `/${country}/login`,
  },
];

const getCountry = () => {
  return useCookie("country").value;
};
</script>

<style scoped>
.v-app-bar {
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
  background-color: transparent !important;
}

.v-app-bar.scrolled {
  background-color: white !important;
}

.v-app-bar :deep(.v-btn),
.v-app-bar :deep(.v-list-item-title),
.v-app-bar :deep(a),
.v-app-bar :deep(.nav-link) {
  transition: color 0.3s ease;
  color: white !important;
}

.v-app-bar.scrolled :deep(.v-btn),
.v-app-bar.scrolled :deep(.v-list-item-title),
.v-app-bar.scrolled :deep(a),
.v-app-bar.scrolled :deep(.nav-link) {
  color: #212121 !important;
}

.v-app-bar img {
  transition: filter 0.3s ease;
}

.v-app-bar.scrolled img {
  filter: invert(1);
}

.custom-padding {
  padding-right: 5px;
}
</style>
