<template>
  <v-row justify="center" align="center" v-if="pageLoader">
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
            >Announcements {{ totalItems > 0 ? `(${totalItems})` : "" }}</span
          ></v-col
        >
        <v-col cols="6" class="d-flex justify-end" v-if="teamAdmin">
          <v-btn color="primary">
            <NuxtLink
              class="text-decoration-none"
              :to="{
                path: `/${country}/announcements/add`,
              }"
            >
              Create New
            </NuxtLink>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" style="width: 100%">
      <v-row no-gutters>
        <v-col cols="12" class="my-5 w-100 d-flex ga-3 align-center text-16px">
          <span :style="xs ? 'width: 50%' : 'width: 40%'">
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
          <span :style="xs ? 'width: 30%' : 'width: 15%'">
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
                @click="handleShowAnnouncementDialog(item)"
                style="min-width: 350px"
              >
                <div class="d-flex align-center ga-3 pr-3 py-2 py-md-3">
                  <span>
                    <v-icon color="primary">mdi-bullhorn-outline</v-icon>
                  </span>
                  <span class="text-primary text-decoration-underline">{{
                    sliceContent(item.title, 30)
                  }}</span>
                </div>
              </td>
              <td
                style="white-space: nowrap; min-width: 150px"
                class="cursor-pointer font-italic"
              >
                {{ item.description ? sliceContent(item.description, 60) : "" }}
              </td>
              <td
                style="white-space: nowrap; min-width: 200px"
                class="cursor-pointer"
              >
                {{ getRecipientLabel(item.target) }}
              </td>
              <td
                style="white-space: nowrap; min-width: 200px"
                class="cursor-pointer"
              >
                {{ getTagetDeviceLabel(item.target_device) }}
              </td>
              <td class="cursor-pointer" style="min-width: 200px">
                <span :class="item.active ? 'text-green' : 'text-red'">{{
                  item.active ? "ACTIVE" : "INACTIVE"
                }}</span>
              </td>
              <td style="white-space: nowrap; min-width: 200px" v-if="teamAdmin">
                <v-row
                  no-gutters
                  class="d-flex ga-2 justify-start align-center"
                  :class="mdAndDown ? 'py-1' : ''"
                >
                  <v-col
                    @click="handleShowAnnouncementDialog(item)"
                    class="d-flex justify-center align-center"
                    cols="auto"
                  >
                    <v-btn
                      border="secondary sm"
                      flat
                      icon="mdi-eye"
                      size="small"
                      rounded="lg"
                    ></v-btn>
                  </v-col>
                  <v-col class="d-flex justify-center align-center" cols="auto">
                    <v-btn
                      @click="handleEditAnnouncement(item)"
                      border="secondary sm"
                      flat
                      icon="mdi-pencil"
                      size="small"
                      rounded="lg"
                    ></v-btn>
                  </v-col>
                  <v-col class="d-flex justify-center align-center" cols="auto">
                    <v-btn
                      @click="handleDeleteAnnouncement(item._id)"
                      border="secondary sm"
                      flat
                      icon="mdi-trash-can-outline"
                      size="small"
                      rounded="lg"
                    ></v-btn>
                  </v-col>
                </v-row>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </div>
    </v-col>
  </v-row>
  <ModalAnnouncement
    v-model="showAnnouncementDialog"
    @closeAnnouncementDialog="closeAnnouncementDialog"
    :announcement="selectedAnnouncement"
  />
  <DialogPromptNew
    v-model="showDeleteAnnouncementDialog"
    :promptTitle="promptTitle"
    :promptText="`Once you delete it, you can't get it back`"
    :disagreeButtonText="'Cancel'"
    :agreeButtonText="'Delete'"
    @disagree="disagreeButton"
    @agree="agreeButton"
  />
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
definePageMeta({
  middleware: ["auth"],
});
const { xs, mdAndDown } = useDisplay();
const { fetchAnnouncementList, deleteAnnouncement, computedTargetRecipients } = useAnnouncementAPI();
const { teamAdmin, teamLister, isUser } = useAccess();
const { country } = useLocal();
const { sliceContent } = useUtils();
const pageLoader = ref<boolean>(false);
const loading = ref<boolean>(false);
const showAnnouncementDialog = ref<boolean>(false);
const showDeleteAnnouncementDialog = ref<boolean>(false);
const totalItems = ref<number>(0);
const itemsPerPage = ref<number>(10);
const currentPage = ref<number>(1);
const searchAnnouncement = ref<string | null>(null);
const selectedSort = ref<number | null>(null);
const announcementData = ref<TAnnouncement[]>([]);
const promptTitle = ref("");
const selectedAnnouncementId = ref<string>("");
const selectedAnnouncement = ref<TAnnouncement>();

const headers = computed(() => {
  const arr = [
    { title: "Title", value: "title" },
    { title: "Description", value: "description" },
    { title: "Recipients", value: "recipients" },
    { title: "Device", value: "device" },
    { title: "Status", value: "active" },
    // teamAdmin ? { title: "Actions", value: "actions" } : {},
  ];

  if (teamAdmin) {
    arr.push({ title: "Actions", value: "actions" });
  }

  return arr;
});

const itemsSort = ref<object[]>([
  { label: "Latest", value: -1 },
  { label: "Oldest", value: 1 },
]);

const agreeButton = async () => {
  loading.value = true;
  try {
    await deleteAnnouncement(selectedAnnouncementId.value);
    await fetchAnnouncement();
  } catch (error) {
    console.error(error);
  }
  showDeleteAnnouncementDialog.value = false;
  loading.value = false;
};

const handleEditAnnouncement = (announcement: any) => {
  navigateTo({
    name: "country-announcements-announcement-announcementId",
    params: {
      country: country,
      announcementId: announcement._id,
    },
  });
};

const handleShowAnnouncementDialog = (announcement: TAnnouncement) => {
  selectedAnnouncement.value = announcement;
  showAnnouncementDialog.value = true;
};

const handleDeleteAnnouncement = (id: string) => {
  selectedAnnouncementId.value = id;
  showDeleteAnnouncementDialog.value = true;
};

let timeoutId: ReturnType<typeof setTimeout>;

const handleSearchAnnouncement = () => {
  loading.value = true;
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    currentPage.value = 1;
    await fetchAnnouncement();
    loading.value = false;
  }, 500);
};

const handleChangeSort = async () => {
  currentPage.value = 1;
  loading.value = true;
  await fetchAnnouncement();
  loading.value = false;
};

const onUpdatePageHandler = async (page: number) => {
  currentPage.value = page;
  loading.value = true;
  await fetchAnnouncement();
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

const closeAnnouncementDialog = () => {
  showAnnouncementDialog.value = false;
};

const disagreeButton = () => {
  showDeleteAnnouncementDialog.value = false;
};

const getRecipientLabel = (
  value: "ALL" | "VENUE_OWNERS_ONLY" | "USERS_ONLY"
): string => {
  const mapping: Record<string, string> = {
    ALL: "All",
    VENUE_OWNERS_ONLY: "Venue Owners",
    USERS_ONLY: "Users",
  };

  return mapping[value] || "Unknown";
};

const getTagetDeviceLabel = (
  value: "ALL" | "MOBILE_ONLY" | "WEB_ONLY"
): string => {
  const mapping: Record<string, string> = {
    ALL: "All",
    MOBILE_ONLY: "Mobile",
    WEB_ONLY: "Web",
  };

  return mapping[value] || "Unknown";
};

const fetchAnnouncement = async (): Promise<void> => {
  try {
    const res = await fetchAnnouncementList({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchAnnouncement.value,
      sort: selectedSort.value || -1,
      active_only: teamAdmin ? false : true,
      target: computedTargetRecipients(),
      target_device: !teamAdmin ? "ALL,WEB_ONLY" : null
    });

    if (res.data) {
      announcementData.value = res.data;
      totalItems.value = res.total_documents;
    }
  } catch (error) {}
};
onMounted(async () => {
  pageLoader.value = true;
  await fetchAnnouncement();
  pageLoader.value = false;
});
</script>
<style scoped></style>
