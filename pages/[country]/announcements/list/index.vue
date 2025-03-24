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
    <v-col cols="12" class="w-100 font-600 text-22px h-100 mt-5 mt-2">
      <v-row no-gutters class="d-flex flex-row justify-between align-center">
        <v-col cols="6"
          ><span
            >Announcements (12)</span
          ></v-col
        >
        <v-col cols="6" class="d-flex justify-end">
          <v-btn color="primary">
            <NuxtLink class="text-decoration-none" :to="{
              path: `/${country}/announcements/add`,
            }">
              Create New
            </NuxtLink>
            </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" style="width: 100%">
      <v-row no-gutters>
        <v-col cols="12" class="my-5 w-100 d-flex ga-3 align-center text-16px">
          <span style="width: 40%">
            <v-text-field
              v-model="searchAnnouncement"
              variant="outlined"
              color="tertiary"
              placeholder="Search announcement"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              hide-details
              height="40"
              clearable
              @update:model-value="handleSearchAnnouncement"
            ></v-text-field>
          </span>
          <span style="width: 15%">
            <v-select
              v-model="selectedSort"
              rounded="lg"
              :items="itemsSort"
              item-value="value"
              item-title="label"
              placeholder="Sort"
              hide-details
              height="40"
              @update:model-value="handleChangeSort"
            ></v-select>
          </span>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <div style="max-width: 100%; overflow-x: auto">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="announcementData"
          :items-length="totalItems"
          item-key="_id"
          height="auto"
          fixed-footer
          :loading="loading"
          :page="currentPage"
          @update:page="(page: number) => onUpdatePageHandler(page)"
          @update:items-per-page="onUpdateItemsPerPageHandler"
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
          <template v-slot:item="{ item }: { item: any }">
            <tr class="text-16px text-secondary">
              <td
                class="cursor-pointer"
              >
                <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                  <span>
                    <v-icon color="primary">mdi-bullhorn-outline</v-icon>
                  </span>
                  <span class="text-primary text-decoration-underline">{{
                    item.title
                  }}</span>
                </div>
              </td>
              <td
                style="white-space: nowrap"

                class="cursor-pointer font-italic"
              >
                {{ item.description }}
              </td>
              <td
                class="cursor-pointer"
              >
                <span>{{ formatAnnouncementDate(item.date) }}</span>
              </td>
              <td style="white-space: nowrap">
                <v-row
                  no-gutters
                  class="d-flex ga-2 justify-start align-center"
                >
                  <v-col class="d-flex justify-center align-center" cols="auto">
                    <v-icon>mdi-pencil</v-icon>
                  </v-col>
                  <v-col class="d-flex justify-center align-center" cols="auto">
                    <v-icon color="primary">mdi-eye</v-icon>
                  </v-col>
                </v-row>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </div>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
type Announcement = {
  title: string;
  description: string;
  date: string;
};
const { country } = useLocal();
const loading = ref<boolean>(false);
const totalItems = ref<number>(12);
const itemsPerPage = ref<number>(10);
    const currentPage = ref<number>(1);
const searchAnnouncement = ref<string | null>(null);
const selectedSort = ref<string | null>(null);
const announcementData = ref<Announcement[]>([
  {
    title: "System Maintenance",
    description: "Scheduled maintenance on servers will occur.",
    date: "2025-03-22 10:00 AM",
  },
  {
    title: "New Feature Release",
    description: "We are rolling out new features this week.",
    date: "2025-03-23 02:30 PM",
  },
  {
    title: "Holiday Schedule",
    description: "Office will be closed on upcoming public holidays.",
    date: "2025-03-24 09:00 AM",
  },
  {
    title: "Team Meeting",
    description: "Monthly team meeting in Conference Room A.",
    date: "2025-03-25 03:00 PM",
  },
  {
    title: "Product Demo",
    description: "Live product demo for potential clients.",
    date: "2025-03-26 11:00 AM",
  },
  {
    title: "Policy Update",
    description: "Please review the updated company policies.",
    date: "2025-03-27 01:00 PM",
  },
  {
    title: "Onboarding Session",
    description: "Orientation for new employees.",
    date: "2025-03-28 09:30 AM",
  },
  {
    title: "Quarterly Report",
    description: "Q1 financial report is now available.",
    date: "2025-03-29 04:00 PM",
  },
  {
    title: "Server Upgrade",
    description: "Upgrading backend servers to improve performance.",
    date: "2025-03-30 12:00 PM",
  },
  {
    title: "Client Visit",
    description: "VIP client visiting the office today.",
    date: "2025-03-31 10:15 AM",
  },
  {
    title: "Security Training",
    description: "Mandatory security training for all staff.",
    date: "2025-04-01 02:00 PM",
  },
  {
    title: "New Hire Introduction",
    description: "Meet our new team members!",
    date: "2025-04-02 11:45 AM",
  },
  {
    title: "Office Cleaning",
    description: "Deep cleaning scheduled this weekend.",
    date: "2025-04-03 08:00 AM",
  },
  {
    title: "Sales Update",
    description: "Latest updates from the sales team.",
    date: "2025-04-04 03:45 PM",
  },
  {
    title: "System Outage Notice",
    description: "Brief downtime expected for system updates.",
    date: "2025-04-05 07:00 PM",
  },
  {
    title: "Marketing Campaign Launch",
    description: "Launching our new digital campaign.",
    date: "2025-04-06 01:30 PM",
  },
  {
    title: "Health & Wellness Workshop",
    description: "Join us for a wellness workshop.",
    date: "2025-04-07 10:00 AM",
  },
  {
    title: "CSR Activity",
    description: "Corporate social responsibility activity this Friday.",
    date: "2025-04-08 09:00 AM",
  },
  {
    title: "Internship Program",
    description: "New internship program starts next month.",
    date: "2025-04-09 10:30 AM",
  },
  {
    title: "Annual Townhall",
    description: "Company-wide annual townhall event.",
    date: "2025-04-10 04:30 PM",
  },
]);

const headers = ref<object[]>([
  { title: "Title", value: "title" },
  { title: "Description", value: "description" },
  { title: "Date", value: "date" },
  { title: "Actions", value: "actions" },
]);

const itemsSort = ref<object[]>([
  { label: "Latest", value: "Latest" },
  { label: "Oldest", value: "Oldest" },
]);

const formatAnnouncementDate = (input: string): string => {
  const isoString = input.replace(
    /(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}) ([AP]M)/i,
    (_, date, hour, minute, meridian) => {
      let h = parseInt(hour)
      const m = minute
      if (meridian.toLowerCase() === 'pm' && h < 12) h += 12
      if (meridian.toLowerCase() === 'am' && h === 12) h = 0
      return `${date}T${h.toString().padStart(2, '0')}:${m}:00`
    }
  )

  const date = new Date(isoString)

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '')
}

let timeoutId: ReturnType<typeof setTimeout>;
const handleSearchAnnouncement = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // currentPage.value = 1;
    // loadRatingsDate({
    //   page: currentPage.value,
    //   itemsPerPage: itemsPerPage.value,
    //   searchSpaceText: searchSpaceText.value,
    //   status: selectedSort.value,
    //   rating: selectedRating.value?.value,
    //   sort: selectedSort.value,
    // });
  }, 300);
};

const handleChangeSort = async () => {
  //   currentPage.value = 1;
  //   await loadRatingsDate({
  //     page: currentPage.value,
  //     itemsPerPage: itemsPerPage.value,
  //     searchSpaceText: searchSpaceText.value,
  //     status: selectedFilterStatus.value,
  //     rating: selectedRating.value?.value,
  //     sort: selectedSort.value,
  //   });
};

const onUpdatePageHandler = (page: number) => {
  currentPage.value = page;
  loading.value = true;
//   loadRatingsDate({
//     page: currentPage.value,
//     itemsPerPage: itemsPerPage.value,
//     searchSpaceText: searchSpaceText.value,
//     status: selectedFilterStatus.value,
//     rating: selectedRating.value?.value,
//     sort: selectedSort.value,
//   });
  loading.value = false;
};

const onUpdateItemsPerPageHandler = (itemsPerPage: number) => {
  loading.value = true;
//   loadRatingsDate({
//     page: 1,
//     itemsPerPage,
//     searchSpaceText: searchSpaceText.value,
//     status: selectedFilterStatus.value,
//     rating: selectedRating.value?.value,
//     sort: selectedSort.value,
//   });
  loading.value = false;
};
</script>
<style scoped></style>
