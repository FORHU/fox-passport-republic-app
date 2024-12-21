<template>
  <v-app>
    <LayoutPrimaryHeader />

    <v-navigation-drawer v-model="drawer" class="pa-4 text-subtitle-2">
      <v-row no-gutters>
        <v-divider></v-divider>
        <v-row no-gutters class="d-flex justify-center py-5"
          >All Enquiries</v-row
        >
        <v-divider></v-divider>
      </v-row>
      <v-row no-gutters style="min-width: 400px">
        <v-list>
          <template v-for="itemType in types" :key="itemType.type">
            <v-list-item
              :to="{
                name: 'country-enquiries-status-status',
                params: { country, status: itemType.type },
              }"
              class="my-3 px-3"
            >
              <template v-slot:prepend>
                <v-row no-gutters>
                  <v-icon :color="itemType.color" class="mr-2" size="30"
                    >mdi-circle-medium</v-icon
                  >
                </v-row>
              </template>

              <v-list-item-title
                class="d-flex justify-space-between ga-5 align-center"
              >
                <span class="text-subtitle-2">
                  {{ itemType.title }}
                </span>
                <span>
                  <v-chip
                    variant="flat"
                    color="primary"
                    size="small"
                    label
                    rounded="lg"
                  >
                    {{ getDataStatusCount(itemType.type) || 0 }}
                  </v-chip>
                </span>
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-row>
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { lgAndUp } = useDisplay();
const { country } = useLocal();
const { drawer } = useEnquiry();
const { currentUser } = useLocalAuth();
const isAdmin = currentUser.value.role == "ADMIN";
const isVenueOwner = currentUser.value.role == "VENUE_OWNER";

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

const { data } = await useAPI("/v1/enquiries/count/status");

// function getDataStatusCount(status) {
//   if (status == "New") return data.value.data.NEW?.count;
//   if (status == "Booking Confirmed")
//     return data.value.data.BOOKING_CONFIRMED?.count;
//   if (status == "Custom Offer Sent")
//     return data.value.data.CUSTOM_OFFER_SENT?.count;
//   if (status == "Commission Due") return data.value.data.COMMISSION_DUE?.count;
//   if (status == "Archive") return data.value.data.ARCHIVE?.count;
//   if (status == "Cancelled Booking") return data.value.data.CANCELLED?.count;
//   if (status == "Happened") return data.value.data.HAPPENED?.count;
//   if (status == "In Progress") return data.value.data.IN_PROGRESS?.count;
//   if (status == "Offer Declined") return data.value.data.DECLINED?.count;
//   if (status == "Payment Failed") return data.value.data.PAYMENT_FAILED?.count;
//   if (status == "Payment In Progress") return data.value.data.PAYMENT_IN_PROGRESS?.count;
//   if (status == "Accepted Offer") return data.value.data.OFFER_ACCEPTED?.count;
//   if (status == "Booking Requested") return data.value.data.BOOKING_REQUESTED?.count;
//   return null;
// }

function getDataStatusCount(type: string) {
  const res = data.value as any;
  if (type == "new") return res?.data?.NEW?.count || 0;
  if (type == "in-progress") {
    const IN_PROGRESS_COUNT = res?.data?.IN_PROGRESS?.count || 0;
    const CUSTOM_OFFER_SENT_COUNT = res?.data?.CUSTOM_OFFER_SENT?.count || 0;
    const DECLINED_COUNT = res?.data?.DECLINED?.count || 0;
    const PAYMENT_FAILED_COUNT = res?.data?.PAYMENT_FAILED?.count || 0;
    const PAYMENT_IN_PROGRESS_COUNT =
      res?.data?.PAYMENT_IN_PROGRESS?.count || 0;
    const OFFER_ACCEPTED_COUNT = res?.data?.OFFER_ACCEPTED?.count || 0;
    const BOOKING_REQUESTED_COUNT = res?.data?.BOOKING_REQUESTED?.count || 0;
    const BOOKING_REQUEST_DECLINED =
      res?.data?.BOOKING_REQUEST_DECLINED?.count || 0;
    const BOOKING_REQUEST_WITHDRAWN =
      res?.data?.BOOKING_REQUEST_WITHDRAWN?.count || 0;

    const total =
      IN_PROGRESS_COUNT +
      CUSTOM_OFFER_SENT_COUNT +
      DECLINED_COUNT +
      PAYMENT_IN_PROGRESS_COUNT +
      PAYMENT_FAILED_COUNT +
      OFFER_ACCEPTED_COUNT +
      BOOKING_REQUESTED_COUNT +
      BOOKING_REQUEST_DECLINED +
      BOOKING_REQUEST_WITHDRAWN;
    return total;
  }
  if (type == "booking-confirmed")
    return res?.data?.BOOKING_CONFIRMED?.count || 0;
  if (type == "happened") return res?.data?.HAPPENED?.count || 0;
  if (type == "lost") {
    const CANCELLED_COUNT = res?.data?.CANCELLED?.count || 0;
    const ARCHIVED_COUNT = res?.data?.ARCHIVED?.count || 0;
    const total = CANCELLED_COUNT + ARCHIVED_COUNT;
    return total;
  }
}

const types = computed(() => {
  const items = [];

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "All Enquiries",
  //     color: "transparent",
  //     type: "all",
  //   });
  // }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "New",
      color: "green",
      type: "new",
    });
  }

  if (isAdmin || isVenueOwner) {
    items.push({
      title: "In Progress",
      color: "orange",
      type: "in-progress",
    });
  }

  if (isVenueOwner || isAdmin) {
    items.push({
      title: "Booking Confirmed",
      color: "blue",
      type: "booking-confirmed",
    });
  }

  if (isAdmin || isVenueOwner) {
    items.push({
      title: "Happened",
      color: "grey-lighten-1",
      type: "happened",
    });
  }

  if (isAdmin || isVenueOwner) {
    items.push({
      title: "Lost",
      color: "error",
      type: "lost",
    });
  }

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "Custom Offer Sent",
  //     color: "purple",
  //     type: "custom-offer-sent",
  //   });
  // }

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "Accepted Offer",
  //     color: "teal",
  //     type: "accepted-offer",
  //   });
  // }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Offer Declined",
  //     color: "red",
  //     type: "declined",
  //   });
  // }
  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Booking Requested",
  //     color: "#FF8F00",
  //     type: "booking-requested",
  //   });
  // }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Payment In Progress",
  //     color: "red-darken-3",
  //     type: "payment-in-progress",
  //   });
  // }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Payment Failed",
  //     color: "red-darken-4",
  //     type: "payment-failed",
  //   });
  // }

  // if (isAdmin || isVenueOwner) {
  //   items.push({
  //     title: "Cancelled Booking",
  //     color: "brown",
  //     type: "cancelled",
  //   });
  // }

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "Commission Due",
  //     color: "lime-darken-1",
  //     type: "commission-due",
  //   });
  // }

  // if (isVenueOwner || isAdmin) {
  //   items.push({
  //     title: "Archived",
  //     color: "black",
  //     type: "archived",
  //   });
  // }

  return items;
});
</script>
