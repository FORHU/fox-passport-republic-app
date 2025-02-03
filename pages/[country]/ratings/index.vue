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
      <span>23 reviews</span>
    </v-col>
    <v-col cols="12" style="width: 70%">
      <v-row no-gutters>
        <v-col cols="12" class="my-5 w-100 d-flex ga-3 align-center text-16px">
          <span style="width: 45%">
            <v-text-field
              variant="outlined"
              color="tertiary"
              placeholder="Search for reviews"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              hide-details
              height="40"
              clearable
            ></v-text-field>
          </span>
          <span style="width: 20%">
            <v-select
              rounded="lg"
              :items="itemsStatus"
              item-value="value"
              item-title="label"
              placeholder="Filter by status"
              hide-details
              height="40"
            ></v-select>
          </span>
          <span style="width: 20%">
            <v-select
              rounded="lg"
              :items="itemsStatus"
              item-value="value"
              item-title="label"
              placeholder="Filter by rating"
              hide-details
              height="40"
            ></v-select>
          </span>
          <span style="width: 10%">
            <v-select
              rounded="lg"
              :items="itemsStatus"
              item-value="value"
              item-title="label"
              placeholder="Sort"
              hide-details
              height="40"
            ></v-select>
          </span>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <div style="max-width: 100%; overflow-x: auto">
        <v-data-table-server
          :headers="headers"
          :items="salesData"
          :items-length="totalItems"
          item-key="_id"
          height="auto"
          fixed-footer
          :loading="loading"
          items-per-page-text="Rows per page"
          :items-per-page-options="[
            { title: '10', value: 10 },
            { title: '20', value: 20 },
          ]"
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
                <!-- <v-chip :color="getStatusColor(item.status)">
                {{ capitalizeStatus(item.status) }}
              </v-chip> -->
              </td>
              <td style="white-space: nowrap">
                {{ item.venue && item.venue.name ? item.venue.name : "—" }}
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </div>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
const loading = ref<boolean>(false);
const itemsStatus = ref<string[]>(["Approved", "Denied", "Pending"]);
const headers = ref<object[]>([
  { title: "Name", value: "name" },
  { title: "Date", value: "createdAt" },
  { title: "Space", value: "space" },
  { title: "Review", value: "review" },
  { title: "Rating", value: "rating" },
  { title: "Status", value: "status" },
  { title: "Actions", value: "actions" },
]);
const statusColors = ref<any>({
  pending: "orange",
  owner_approved: "blue",
  owner_declined: "red",
  owner_request_deletion: "purple",
  sent_request_transfer_ownership: "yellow",
  transferred_ownership: "green",
});

function getStatusColor(status: any) {
  return statusColors[status] || "black";
}
</script>
