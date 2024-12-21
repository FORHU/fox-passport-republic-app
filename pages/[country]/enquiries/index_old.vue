<template>
  <v-container fluid class="pa-0 bg-primaryBG">
    <v-card-title class="font-weight-bold pt-5 text-sm-h5"
      >Manage your enquiries</v-card-title
    >
    <v-row no-gutters class="mt-2 mt-md-5">
      <v-col class="d-flex ga-2 flex-wrap px-3 px-md-5">
        <v-btn
          variant="flat"
          :color="activeTab == 'CURRENT' ? 'primary' : 'white'"
          size="large"
          style="min-width: 100px"
          @click="handleChangeTab('CURRENT')"
          >Current {{
        }}</v-btn>
        <v-btn
          variant="flat"
          size="large"
          :color="activeTab == 'PAST' ? 'primary' : 'white'"
          style="min-width: 100px"
          @click="handleChangeTab('PAST')"
          >Past{{}}</v-btn
      ></v-col>
    </v-row>

    <v-container fluid v-if="enquiries.length > 0" style="min-height: 70dvh">
      <v-data-iterator
        :items="enquiries"
        :items-per-page="pageLimit"
        style="max-height: 70vh; overflow-y: auto"
      >
        <template v-slot:default="{ items }">
          <v-row no-gutters>
            <v-col
              v-for="(item, i) in items"
              :key="i"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="px-2 py-2"
              @click="routeToEnquiryMessage(item.raw._id)"
              style="cursor: pointer"
            >
              <v-card position="relative" height="100%">
                <span
                  style="position: absolute; top: 2%; right: 2%; z-index: 10"
                  ><v-chip
                    variant="flat"
                    size="small"
                    color="white"
                    :text="statusColor(item.raw.status).cleanStatus"
                    :class="`text-${statusColor(item.raw.status).color}`"
                  ></v-chip
                ></span>
                <v-img
                  class="bg-white"
                  :src="item.raw.space.space_photo[0].path"
                  width="100%"
                  height="200"
                  cover
                ></v-img>
                <v-card-text>
                  <p class="font-weight-bold">
                    {{ item.raw.type }} for {{ item.raw.guests }} people
                  </p>
                  <p>
                    {{
                      item.raw.space && item.raw.venue
                        ? `${item.raw.space.name} at ${item.raw.venue.name}`
                        : ""
                    }}
                  </p>
                  <p>
                    <v-icon icon="mdi-calendar-blank" size="small"></v-icon>
                    {{ standardizeDateFormat(item.raw.date.date) }} at
                    {{ item.raw.date.from }} to {{ item.raw.date.to }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
    </v-container>

    <v-container fluid v-else>
      <LoadingEnquiriesLoad v-if="loading" />
      <CardEmptyState v-if="!loading && enquiries.length === 0" />
    </v-container>

    <v-pagination
      class="pb-5"
      v-model="currentPage"
      :length="totalPages"
      style="align-self: end"
    ></v-pagination>
  </v-container>
</template>

<script setup lang="ts">
const { country } = useLocal();
const { getEnquiryList } = useEnquiry();
const selectedType = ref("current");
const enquiries = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageLimit = ref(10);
const loading = ref(true);
const activeTab = ref<"CURRENT" | "PAST">("CURRENT");

const handleChangeTab = async (tab: string) => {
  activeTab.value = tab;
  await fetchData();
};

async function fetchData() {
  let status = null;
  if (activeTab.value == "PAST") {
    status = "HAPPENED";
  }
  try {
    loading.value = true;
    const { data } = await getEnquiryList(status, currentPage.value, 10);
    // const { data } = await useAPI("/v1/enquiries", {
    //   query: { page: currentPage.value },
    // });
    if (data) {
      const res = data.value as any;
      enquiries.value = res.data.data;
      totalPages.value = res.data.total_pages;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
}

function selected(value) {
  selectedType.value = value;
}

function routeToEnquiryMessage(id) {
  navigateTo({
    name: "country-enquiries-message-id",
    params: { country, id },
  });
}

const filteredEnquiryList = computed(() => {
  const dateNow = new Date();
});

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
      color = "brown";
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
    case "OFFER_ACCEPTED":
      color = "teal";
      break;
    default:
      color = "black";
      break;
  }

  return { color, cleanStatus };
}

onMounted(() => {
  fetchData();
});

watch(currentPage, () => {
  fetchData();
});
</script>
