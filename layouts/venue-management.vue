<template>
  <v-app>
    <LayoutPrimaryHeader />
    <v-navigation-drawer v-model="drawer" class="pa-4 text-subtitle-2">
      <v-divider></v-divider>
      <v-row no-gutters class="d-flex justify-center py-5">All Venues</v-row>
      <v-divider></v-divider>

      <v-list>
        <template v-for="itemType in types" :key="itemType.type">
          <v-list-item
            :to="{
              name: 'country-venues-management',
              params: { country, status: itemType.type },
            }"
            class="my-3 px-3 w-100 d-flex align-center justify-space-between"
          >
            <template v-slot:prepend>
              <v-row no-gutters>
                <v-icon :color="itemType.color" class="mr-2" size="30"
                  >mdi-circle-medium</v-icon
                >
              </v-row>
              <span class="text-subtitle-2">
                {{ itemType.title }}
              </span>
            </template>

            <template v-slot:append>
              <v-chip
                variant="flat"
                color="primary"
                size="small"
                label
                rounded="lg"
              >
                {{ count(itemType.title) }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { useDisplay } from "vuetify";
const { lgAndUp } = useDisplay();

const { country } = useLocal();
const { venues, venueCount, drawer } = useVenue();

const drawerState = ref(false);

watch(
  lgAndUp,
  (newVal) => {
    if (newVal == true) {
      drawer.value = true;
    } else {
      drawer.value = false;
    }
  },
  { immediate: true },
);

const count = (title) => {
  if (title === "Published") {
    return venueCount.value?.PUBLISHED?.count || 0;
  } else if (title === "For Approval") {
    return venueCount.value?.FOR_APPROVAL?.count || 0;
  } else if (title === "In progress") {
    return venueCount.value?.INPROGRESS?.count || 0;
  } else if (title === "Draft") {
    return venueCount.value?.DRAFT?.count || 0;
  } else if (title === "Suspended") {
    return venueCount.value?.SUSPENDED?.count || 0;
  } else if (title === "Rejected") {
    return venueCount.value?.REJECTED?.count || 0;
  } else if (title === "For Deletion") {
    return venueCount.value?.FOR_DELETION?.count || 0;
  } else if (title === "Archived") {
    return venueCount.value?.DELETED?.count || 0;
  } else if (title === "All") {
    return venueCount.value?.TOTAL?.count || 0;
  }
};

const { currentUser } = useLocalAuth();
const isAdmin = currentUser.value.role == "ADMIN";
const isVenueOwner = currentUser.value.role == "VENUE_OWNER";

const types = computed(() => {
  const items = [];

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "All",
  //     color: "transparent",
  //     type: "all",
  //   });
  // }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Published",
      color: "published",
      type: "published",
    });
  }

  if (isAdmin || isVenueOwner) {
    items.push({
      title: "For Approval",
      color: "for_approval",
      type: "for-approval",
    });
  }

  if (isVenueOwner) {
    items.push({
      title: "In progress",
      color: "inprogress",
      type: "in-progress",
    });
  }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Draft",
      color: "draft",
      type: "draft",
    });
  }
  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Rejected",
      color: "rejected",
      type: "rejected",
    });
  }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Suspended",
      color: "suspended",
      type: "suspended",
    });
  }
  if (isVenueOwner || isAdmin) {
    items.push({
      title: "For Deletion",
      color: "#42B3F4",
      type: "for-deletion",
    });
  }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Archived",
      color: "archived",
      type: "archived",
    });
  }

  return items;
});
</script>
