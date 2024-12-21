<template>
  <v-row justify="center" align="center" v-if="loading">
    <v-progress-circular
      indeterminate
      color="primary"
      style="min-height: 50vh"
    ></v-progress-circular>
  </v-row>

  <v-row
    no-gutters
    class="pa-5 pa-md-7 text-secondary text-16px d-flex flex-column justify-start"
    style="min-height: fit-content"
    v-else
  >
    <v-col cols="12" class="w-100 font-600 text-22px h-100 my-5">
      <span>Sales Transaction</span>
    </v-col>

    <!-- Sales Data Table -->
    <div style="max-width: 100%; overflow-x: auto">
      <v-data-table-server
        v-if="salesData && salesData.length > 0"
        :headers="headers"
        :items="salesData"
        :items-length="totalItems"
        item-key="_id"
        height="auto"
        fixed-footer
        :loading="loading"
        :page="currentPage"
        items-per-page-text="Rows per page"
        :items-per-page-options="[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
        ]"
        @update:page="onUpdatePageHandler"
        @update:items-per-page="onUpdateItemsPerPageHandler"
        style="border: 2px solid #dedfe3; border-radius: 8px"
        last-icon="mdi-chevron-double-right"
        first-icon="mdi-chevron-double-left"
      >
        <!-- Table Headers -->
        <template v-slot:headers="{ columns }">
          <tr class="bg-light_gray text-charcoal font-500 text-16px">
            <template v-for="column in columns">
              <td style="white-space: nowrap">
                <span>{{ column.title }}</span>
              </td>
            </template>
          </tr>
        </template>

        <!-- Table Item Rows -->
        <template v-slot:item="{ item }">
          <tr class="text-16px text-secondary">
            <td style="white-space: nowrap">
              {{
                item.user
                  ? item.user.first_name + " " + item.user.last_name
                  : "No Name"
              }}
            </td>
            <td style="white-space: nowrap">
              {{ new Date(item.createdAt).toLocaleString() }}
            </td>
            <td style="white-space: nowrap">
              <v-chip :color="getStatusColor(item.status)">
                {{ capitalizeStatus(item.status) }}
              </v-chip>
            </td>
            <td style="white-space: nowrap">
              {{ item.venue && item.venue.name ? item.venue.name : "—" }}
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </div>

    <!-- Empty Sales Data Fallback -->
    <v-row v-if="salesData.length === 0 && !loading" no-gutters>
      <v-col cols="12" class="mt-10">
        <v-empty-state
          title="No Sales Data Yet"
          height="300"
          text="No sales data available. When you complete transactions, they'll appear here."
        ></v-empty-state>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-col v-if="error" cols="12">
      <v-alert type="error" prominent>
        Error loading sales data: {{ error.message }}
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
const salesData = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const error = ref(null);
const itemsPerPage = ref(10);
const currentPage = ref(1);

const headers = [
  { title: "Name", value: "name" },
  { title: "Date", value: "createdAt" },
  { title: "Status", value: "status" },
  { title: "Venue", value: "venue" },
];

const statusColors = {
  pending: "orange",
  owner_approved: "blue",
  owner_declined: "red",
  owner_request_deletion: "purple",
  sent_request_transfer_ownership: "yellow",
  transferred_ownership: "green",
};

function capitalizeStatus(status) {
  return status
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusColor(status) {
  return statusColors[status] || "black";
}

const loadItems = (options) => {
  const { page, itemsPerPage } = options;
  loading.value = true;
  error.value = null;

  useAPI(`/api/v1/admin/sales`, {
    params: {
      page: page,
      size: itemsPerPage,
    },
    onResponse: (res) => {
      if (res?.response?._data?.data?.data) {
        salesData.value = res.response._data.data.data;
        totalItems.value = res.response._data.data.total_items || 0;
      } else {
        salesData.value = [];
        totalItems.value = 0;
      }
      loading.value = false;
    },
    onError: (err) => {
      console.error("Error fetching data", err);
      error.value = err;
      loading.value = false;
    },
  });
};

const onUpdatePageHandler = (page) => {
  currentPage.value = page;
  loadItems({ page, itemsPerPage: itemsPerPage.value });
};

const onUpdateItemsPerPageHandler = (itemsPerPage) => {
  loadItems({ page: 1, itemsPerPage });
};

loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
</script>
