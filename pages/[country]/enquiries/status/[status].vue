<template>
  <div class="wrapper" style="background-color: #e0e8f5; min-height: 100vh">
    <v-row no-gutters>
      <v-col cols="12">
        <v-row class="mx-1 mb-2 mb-sm-2" align="center">
          <div cols="1" class="">
            <v-app-bar-nav-icon class="mt-3" variant="text" size="40"
              @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          </div>
          <div>
            <v-row no-gutters class="text-h5 text-md-h6 mt-3 mx-2 font-weight-black">
              Manage your Enquiries
            </v-row>
          </div>
        </v-row>

        <v-card style="margin: 0 11px" class="hidden-sm-and-down">
          <v-card width="100%" height="60px">
            <v-container fluid>
              <v-row no-gutters>
                <v-col v-for="(header, index) in headers" :key="index" class="font-weight-bold">{{ header }}</v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-card>

        <v-col style="min-height: 752px" v-if="enquiries.length > 0">
          <v-data-iterator :items="enquiries" :items-per-page="pageLimit">
            <template v-slot:default="{ items }">
              <div class="table-container">
                <template v-for="item in items" :key="i">
                  <v-card @click="routeToEnquiryMessage(item.raw._id)" elevation="1" style="cursor: pointer"
                    class="mb-3 pa-2 pa-md-3">
                    <v-container fluid>
                      <v-row no-gutters class="pa-n5" align="center">
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Client:
                          </span>
                          <span class="text-sm-caption">{{
                            item.raw.user.first_name || ""
                          }}</span>
                        </v-col>
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Event Type:
                          </span>
                          <span class="text-sm-caption">{{
                            item.raw.type
                          }}</span>
                        </v-col>
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Guests:
                          </span>
                          <span class="text-sm-caption">{{
                            item.raw.guests
                          }}</span>
                        </v-col>
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Event Date:
                          </span>
                          <span class="text-sm-caption">{{
                            standardizeDateFormat(item.raw.date.date)
                          }}</span>
                        </v-col>
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Event Time:
                          </span>
                          <span class="text-sm-caption">{{ item.raw.date.from }} -
                            {{ item.raw.date.to }}</span>
                        </v-col>
                        <v-col cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Space:
                          </span>
                          <span class="text-sm-caption truncate-text">{{
                            item.raw.space && item.raw.venue
                              ? `${item.raw.space.name} at ${item.raw.venue.name}`
                              : ""
                          }}</span>
                        </v-col>
                        <v-col class="hidden-lg-and-up">
                          <v-row>
                            <v-col>
                              <span class="hidden-md-and-up text-sm-caption font-weight-bold">Status:
                              </span>
                              <v-chip size="x-small" :color="statusColor(item.raw.status).color">
                                <span class="text-sm-caption" style="font-size: 12px">
                                  {{ statusColor(item.raw.status).cleanStatus }}
                                </span>
                              </v-chip>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col class="hidden-md-and-down">
                          <v-row>
                            <v-col>
                              <v-chip size="x-small" :color="statusColor(item.raw.status).color" variant="text">
                                <span class="text-sm-caption" style="font-size: 12px">
                                  {{ statusColor(item.raw.status).cleanStatus }}
                                </span>
                              </v-chip>
                            </v-col>
                          </v-row>
                        </v-col>

                        <v-col v-if="showInvoice" cols="12" sm="">
                          <span class="hidden-md-and-up text-sm-caption font-weight-bold">Action
                          </span>
                          <v-btn variant="flat" color="primary" class="text-uppercase"
                            @click.stop="goToInvoice(item.raw._id)">View Invoice</v-btn>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card>
                </template>
              </div>
            </template>
          </v-data-iterator>
        </v-col>

        <v-col v-else>
          <v-container fluid style="min-height: 80dvh" class="bg-white d-flex align-center">
            <LoadingVenueLister v-if="loading" />
            <v-row v-else no-gutters justify="center">
              <v-col cols="12" class="text-center text-subtitle-1 text-md-h5 font-weight-black">No enquiries
                yet.</v-col>
              <v-col cols="12" class="text-center text-subtitle-2 text-md-h6">When clients send you enquiries, you’ll
                see their
                messages
                here.
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <!-- </v-card> -->
      </v-col>
    </v-row>

    <v-pagination v-if="enquiries.length > 0" v-model="page" :length="totalPages"></v-pagination>
    <LoadingTransparent v-if="processing" />
  </div>
  <DialogCompleteAccountDetails v-model="showCreateStipeDialog" />
</template>

<script setup lang="ts">
import MEnquiry from "~/models/enquiry.model";
definePageMeta({
  layout: "enquiry-management",
});

// Reactive Variables
const { country } = useLocal();
const { enquiries, enquiry, getEnquiryList, getAdminEnquiryList, drawer } =
  useEnquiry();

const loading = ref(true);
const totalPages = ref(1);
const processing = ref(false);
const page = ref(1);
const pageLimit = ref(10);
const showCreateStipeDialog = ref(false);

const showInvoice = computed(() => {
  return status == "booking-confirmed" || status == "happened"
})

const headers = computed(() => {
  if (showInvoice.value) {
    return [
      "Client",
      "Event Type",
      "Guest",
      "Event Date",
      "Event Time",
      "Space",
      "Status",
      ""
    ];
  } else {
    return [
      "Client",
      "Event Type",
      "Guest",
      "Event Date",
      "Event Time",
      "Space",
      "Status",
    ];
  }

})

const { currentUser } = useLocalAuth();
const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

const { status } = useRoute().params;
const formattedStatus = computed(() => {
  if (status === "in-progress")
    return "IN_PROGRESS,CUSTOM_OFFER_SENT,DECLINED,PAYMENT_FAILED,PAYMENT_IN_PROGRESS,OFFER_ACCEPTED,BOOKING_REQUESTED,BOOKING_REQUEST_DECLINED,BOOKING_REQUEST_WITHDRAWN";
  if (status === "new") return "NEW";
  if (status === "booking-confirmed") return "BOOKING_CONFIRMED";
  if (status === "happened") return "HAPPENED";
  if (status === "lost") return "CANCELLED,ARCHIVED";
  // if (status === "custom-offer-sent") return "CUSTOM_OFFER_SENT";
  // if (status === "commision-due") return "COMMISION_DUE";
  // if (status === "archived") return "ARCHIVED";
  // if (status === "cancelled") return "CANCELLED";
  // if (status === "declined") return "DECLINED";
  // if (status === "payment-failed") return "PAYMENT_FAILED";
  // if (status === "payment-in-progress") return "PAYMENT_IN_PROGRESS";
  // if (status === "accepted-offer") return "OFFER_ACCEPTED";
  // if (status === "booking-requested") return "BOOKING_REQUESTED";
  // else
  //   return isAdmin.value
  //     ? "IN_PROGRESS,NEW,BOOKING_CONFIRMED,CUSTOM_OFFER_SENT,SUSPENDED,COMMISION_DUE,ARCHIVED,CANCELLED,HAPPENED,DECLINED,PAYMENT_FAILED,PAYMENT_IN_PROGRESS,OFFER_ACCEPTED,BOOKING_REQUESTED"
  //     : "";
  return null;
});

watch(page, async () => {
  isAdmin.value
    ? await fetchAdminEnquiryList(
      formattedStatus.value,
      page.value,
      pageLimit.value,
    )
    : await fetchEnquiryList(
      formattedStatus.value,
      page.value,
      pageLimit.value,
    );
});

// Function to fetch admin enquiry list
const fetchAdminEnquiryList = async (
  status: string,
  page: number,
  limit = pageLimit.value,
) => {
  loading.value = true;
  try {
    const { data } = await getAdminEnquiryList(status, page, limit);
    if (!data) return;
    const res = data.value as any;
    enquiries.value = res.data.data;
    totalPages.value = res.data.total_pages;
  } catch (error) {
    console.error("Error fetching enquiry list:", error);
    enquiries.value = [];
  } finally {
    loading.value = false;
  }
};

// Function to fetch enquiry list
const fetchEnquiryList = async (
  status: string,
  page: number,
  limit = pageLimit.value,
) => {
  loading.value = true;
  try {
    const { data } = await getEnquiryList(status, page, limit);
    if (!data) return;
    const res = data.value as any;
    enquiries.value = res.data.data;
    totalPages.value = res.data.total_pages;
  } catch (error) {
    console.error("Error fetching venue list:", error);
    enquiries.value = [];
  } finally {
    loading.value = false;
  }
};

function standardizeDateFormat(dateString) {
  // Check if the date string is in "YYYY-MM-DD" format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  // Check if the date string is in "DD/MM/YYYY" format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Return null if the date string is in an unrecognized format
  return null;
}

function statusColor(status) {
  let cleanStatus = status.replace(/_/g, " ");
  let color = "";

  switch (status) {
    case "NEW":
      color = "green";
      break;
    case "BOOKING_CONFIRMED":
      color = "blue";
      break;
    case "CUSTOM_OFFER_SENT":
      color = "purple";
      break;
    case "COMMISION_DUE":
      color = "lime-darken-1";
      break;
    case "ARCHIVED":
      color = "black";
      break;
    case "CANCELLED":
      color = "error";
      break;
    case "IN_PROGRESS":
      color = "orange";
      break;
    case "HAPPENED":
      color = "green-darken-4";
      break;
    case "DECLINED":
      color = "red";
      break;
    case "PAYMENT_FAILED":
      color = "red-darken-4";
      break;
    case "PAYMENT_IN_PROGRESS":
      color = "red-darken-3";
      break;
    case "BOOKING_REQUESTED":
      color = "teal";
      break;
    case "BOOKING_REQUEST_WITHDRAWN":
      color = "red-lighten-3";
      break;
    case "BOOKING_REQUEST_DECLINED":
      color = "red-accent-1";
      break;
    default:
      color = "black";
      break;
  }

  return { color, cleanStatus };
}

function routeToEnquiryMessage(id) {
  navigateTo({
    name: "country-enquiries-message-id",
    params: { country, id },
  });
}

function goToInvoice(id: string) {
  navigateTo(`/${country}/enquiries/message/${id}/invoice`)
}


//WATCHER FOR STRIPE ACCOUNT PROMPT
watchEffect(() => {
  if (currentUser.value?.stripe_account !== "COMPLETED" && !isAdmin.value) {
    showCreateStipeDialog.value = true;
  } else {
    showCreateStipeDialog.value = false;
  }
});

// Fetch data on mount
onMounted(async () => {
  loading.value = true;
  isAdmin.value
    ? await fetchAdminEnquiryList(
      formattedStatus.value,
      page.value,
      pageLimit.value,
    )
    : await fetchEnquiryList(
      formattedStatus.value,
      page.value,
      pageLimit.value,
    );
  enquiry.value = new MEnquiry();
  loading.value = false;
});
</script>

<style scoped>
.wrapper {
  padding: 15px;
}

.wrapper-table {
  padding: 15px;
  max-height: calc(100vh - 170px);
}

.truncate-text {
  display: inline-block;
  width: 150px;
  /* Adjust width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
