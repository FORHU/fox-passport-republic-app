<template>
  <v-row no-gutters style="height: 80">
    <v-row align="center" justify="space-between" class="py-5 py-md-10 px-5">
      <v-col cols="6" sm="2">
        <nuxt-link
          v-slot="{ navigate }"
          :to="{ name: 'country', params: { country } }"
        >
          <img
            src="./../../public/venuelogo.svg"
            role="link"
            @click="navigate"
            style="max-width: 120px"
          />
        </nuxt-link>
      </v-col>

      <v-col cols="6" sm="10" class="d-flex justify-end align-center">
        <template v-if="loggedIn">
          <template
            v-for="navigationItem in navigation"
            :key="navigationItem.title"
            v-if="!mdAndDown"
          >
            <nuxt-link
              :to="{ name: navigationItem.to, params: navigationItem.params }"
              class="d-flex align-center font-400 mx-5"
              style="text-decoration: unset"
              :class="
                isActiveRoute(navigationItem)
                  ? 'text-primary font-weight-bold'
                  : ''
              "
            >
            <template v-if="navigationItem?.key == 'inquiries' && inquiryBadgeCount">
              <v-badge color="error" :content="inquiryBadgeCount" offset-x="-10">
              <v-icon
                size="small"
                class="custom-padding"
                :color="isActiveRoute(navigationItem) ? 'primary' : ''"
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
                :color="isActiveRoute(navigationItem) ? 'primary' : ''"
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
                v-if="!smAndDown"
                v-bind="props"
                size="large"
                class="ml-4 font-400 text-uppercase d-flex align-center"
              >
                <template #prepend>
                  <ProfileAvatar
                    :first_name="currentUser?.first_name"
                    :last_name="currentUser?.last_name"
                    :img-src="currentUser?.profile_picture"
                  />
                </template>
                <v-icon class="ml-1 mt-1">
                  {{ menuOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
              </v-btn>
              <div v-else>
                <ProfileAvatar
                  :first_name="currentUser?.first_name"
                  :last_name="currentUser?.last_name"
                  :img-src="currentUser?.profile_picture"
                  @click="menuOpen = true"
                />
                <v-icon class="ml-1 mt-1" v-bind="props">
                  {{ menuOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
              </div>
            </template>
            <v-list class="pa-0 mb-10">
              <v-list-item
                v-for="navigationItem in navigation"
                :key="navigationItem.title"
                :to="{ name: navigationItem.to, params: navigationItem.params }"
                class="text-decoration-none"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold':
                      isActiveRoute(navigationItem),
                  }"
                  >{{ navigationItem.title }}</v-list-item-title
                >
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
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'country-announcements-list',
                      params: { country },
                    }),
                  }"
                  >Announcements</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                :to="`/settings/country`"
                class="text-decoration-none"
                v-if="isAdmin"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'settings-country',
                      params: { country },
                    }),
                  }"
                >
                  Countries
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                :to="`/${country}/ratings`"
                class="text-decoration-none"
                v-if="isAdmin"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'country-ratings',
                      params: { country },
                    }),
                  }"
                  >Manage Review</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                :to="`/${country}/sales`"
                class="text-decoration-none"
                v-if="isAdmin || isAdminMember || isAdminSales"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'country-sales',
                      params: { country },
                    }),
                  }"
                  >{{
                    isAdminSales ? "My Sales Transaction" : "Sales Transaction"
                  }}</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                :to="`/${country}/team-members`"
                class="text-decoration-none"
                v-if="isVenueOwner || isVenueLister || isAdmin"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'country-team-members',
                      params: { country },
                    }),
                  }"
                  >Team Members</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                :to="`/${country}/profile/general-information`"
                class="text-decoration-none"
              >
                <v-list-item-title
                  :class="{
                    'text-primary font-weight-bold': isActiveRoute({
                      name: 'country-profile-general-information',
                      params: { country },
                    }),
                  }"
                  >Settings</v-list-item-title
                >
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
            class="w-100 px-md-5 d-flex align-center ga-5"
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
      </v-col>
    </v-row>
  </v-row>
</template>

<script setup>
import { useDisplay } from "vuetify";

const { smAndDown, mdAndDown } = useDisplay();
const { loggedIn, currentUser, logout } = useLocalAuth();
const { isAdminMember, isAdminSales } = useAccess();
const { inquiryBadgeCount } = useNotification();
const { country } = useLocal();
const router = useRouter();
const route = useRoute();
const baseUrl = "country";

// State to track if the menu is open or closed
const menuOpen = ref(false);

const isAdmin = currentUser.value.role == "ADMIN";
const isUser = currentUser.value.role == "USER";
const isVenueOwner = currentUser.value.role == "VENUE_OWNER";
const isVenueLister = currentUser.value.role == "VENUE_LISTER";

const isActiveRoute = (navItem) => {
  const resolved = router.resolve({
    name: navItem.to ?? navItem.name,
    params: navItem.params,
  });
  return route.path.startsWith(resolved.path);
};

const navigation = computed(() => {
  const items = [];

  if (isAdmin || isVenueOwner || isVenueLister) {
    items.push({
      title: isAdmin ? "Inquiries" : "My Inquiries",
      icon: "mdi-message-text-outline",
      to: `${baseUrl}-enquiries`,
      params: { country },
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
      params: { country },
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

// const name = computed(() => {
//   return currentUser.value.first_name && currentUser.value.last_name
//     ? `${currentUser.value.first_name} ${currentUser.value.last_name}`
//     : "Unknown";
// });

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
</script>

<style scoped>
.custom-padding {
  padding-top: 1px;
  padding-right: 5px;
}

.link-black {
  color: black !important;
}
</style>
