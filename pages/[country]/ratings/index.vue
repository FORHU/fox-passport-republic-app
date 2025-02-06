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
      <span>{{ totalItems }} {{ totalItems > 1 ? "reviews" : "review" }}</span>
    </v-col>

    <!-- mobile -->
    <v-col cols="12" v-if="xs" class="mt-2">
      <v-row no-gutters class="justify-space-between">
        <v-col cols="6" class="pr-2 pb-2">
          <span style="width: 45%">
            <v-text-field
              v-model="searchSpaceText"
              variant="outlined"
              color="tertiary"
              placeholder="Search space"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              hide-details
              height="40"
              clearable
              @update:model-value="handleSearchSpace"
            ></v-text-field>
          </span>
        </v-col>
        <v-col cols="6">
          <span style="width: 20%">
            <v-select
              v-model="selectedFilterStatus"
              rounded="lg"
              :items="itemsStatus"
              item-value="value"
              item-title="label"
              placeholder="Filter by status"
              hide-details
              height="40"
              @update:model-value="handleChangeStatusFilter"
            ></v-select>
          </span>
        </v-col>
        <v-col cols="6" class="pr-2 pb-2">
          <span style="width: 20%">
            <v-select
              v-model="selectedRating"
              rounded="lg"
              :items="itemsRating"
              item-value="value"
              placeholder="Filter by rating"
              hide-details
              height="40"
              return-object
              @update:model-value="handleChangeRatingFilter"
            >
              <template v-slot:selection="{ item }">
                <v-rating
                  v-if="item?.value !== undefined"
                  readonly
                  :length="item.value"
                  :size="16"
                  :model-value="item.value"
                  color="amber"
                  active-color="amber"
                />
              </template>

              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" density="compact">
                  <template v-slot:default>
                    <v-rating
                      v-if="item?.value !== undefined"
                      readonly
                      :length="item.value"
                      :size="16"
                      :model-value="item.value"
                      color="amber"
                      active-color="amber"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </span>
        </v-col>
        <v-col cols="6">
          <span style="width: 15%">
            <v-select
              v-model="selectedSort"
              rounded="lg"
              :items="itemsSort"
              item-value="value"
              item-title="title"
              placeholder="Sort by date"
              hide-details
              height="40"
              @update:model-value="handleChangeSortFilter"
            ></v-select>
          </span>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="pb-2 d-flex justify-center">
          <span
            v-if="
              searchSpaceText !== null ||
              selectedFilterStatus !== null ||
              selectedRating !== null ||
              selectedSort !== null
            "
          >
            <v-btn
              color="secondary"
              rounded="pill"
              size="large"
              @click="handleClearFilter"
              >Clear</v-btn
            >
          </span>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" style="width: 75%" v-else>
      <v-row no-gutters>
        <v-col cols="12" class="my-5 w-100 d-flex ga-3 align-center text-16px">
          <span style="width: 45%">
            <v-text-field
              v-model="searchSpaceText"
              variant="outlined"
              color="tertiary"
              placeholder="Search space"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              hide-details
              height="40"
              clearable
              @update:model-value="handleSearchSpace"
            ></v-text-field>
          </span>
          <span style="width: 20%">
            <v-select
              v-model="selectedFilterStatus"
              rounded="lg"
              :items="itemsStatus"
              item-value="value"
              item-title="label"
              placeholder="Filter by status"
              hide-details
              height="40"
              @update:model-value="handleChangeStatusFilter"
            ></v-select>
          </span>
          <span style="width: 20%">
            <v-select
              v-model="selectedRating"
              rounded="lg"
              :items="itemsRating"
              item-value="value"
              placeholder="Filter by rating"
              hide-details
              height="40"
              return-object
              @update:model-value="handleChangeRatingFilter"
            >
              <template v-slot:selection="{ item }">
                <v-rating
                  v-if="item?.value !== undefined"
                  readonly
                  :length="item.value"
                  :size="16"
                  :model-value="item.value"
                  color="amber"
                  active-color="amber"
                />
              </template>

              <template v-slot:item="{ item, props }" class="">
                <v-list-item v-bind="props" density="compact">
                  <template v-slot:default>
                    <v-rating
                      v-if="item?.value !== undefined"
                      readonly
                      :length="item.value"
                      :size="16"
                      :model-value="item.value"
                      color="amber"
                      active-color="amber"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </span>
          <span style="width: 15%">
            <v-select
              v-model="selectedSort"
              rounded="lg"
              :items="itemsSort"
              item-value="value"
              item-title="title"
              placeholder="Sort by date"
              hide-details
              height="40"
              @update:model-value="handleChangeSortFilter"
            ></v-select>
          </span>
          <span
            style="width: 5%"
            v-if="
              searchSpaceText !== null ||
              selectedFilterStatus !== null ||
              selectedRating !== null ||
              selectedSort !== null
            "
          >
            <v-btn
              color="secondary"
              rounded="pill"
              size="small"
              @click="handleClearFilter"
              >Clear</v-btn
            >
          </span>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <div style="max-width: 100%; overflow-x: auto">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="ratingsData"
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
                @click="
                  (showReviewRatingDialog = true), (specificRating = item)
                "
                class="cursor-pointer"
              >
                <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                  <span>
                    <ProfileAvatar
                      :first_name="item.user.first_name"
                      :img-src="item?.profile_picture"
                      :last_name="item.user.last_name"
                    />
                  </span>
                  <span>{{
                    item.user.first_name + " " + item.user.last_name
                  }}</span>
                </div>
              </td>
              <td
                style="white-space: nowrap"
                @click="
                  (showReviewRatingDialog = true), (specificRating = item)
                "
                class="cursor-pointer"
              >
                {{ new Date(item.createdAt).toLocaleString() }}
              </td>
              <td
                @click="navigate(), (specificRating = item)"
                class="cursor-pointer"
              >
                <span>{{ item.space.name }}</span>
              </td>
              <td
                @click="
                  (showReviewRatingDialog = true), (specificRating = item)
                "
                class="cursor-pointer"
              >
                <span class="font-italic">{{  smAndUp ? sliceContent(item.publicNote, 150) : sliceContent(item.publicNote, 50) }}</span>
              </td>
              <td
                @click="
                  (showReviewRatingDialog = true), (specificRating = item)
                "
                class="cursor-pointer"
              >
                <v-rating
                  readonly
                  :length="item.rating"
                  :size="16"
                  :model-value="item.rating"
                  :color="item.rating >= 2 ? 'amber' : 'warning'"
                  :active-color="item.rating > 2 ? 'amber' : 'warning'"
                />
              </td>
              <td
                style="white-space: nowrap"
                @click="
                  (showReviewRatingDialog = true), (specificRating = item)
                "
                class="cursor-pointer"
              >
                <v-chip :color="getStatusColor(item.status)" variant="text">
                  {{ capitalizeFirstLetter(item.status) }}
                </v-chip>
              </td>
              <td style="white-space: nowrap">
                <v-row
                  no-gutters
                  class="d-flex ga-2 justify-center py-2 py-md-3 flex-row align-center"
                >
                  <v-col cols="12" v-if="item.status === 'PENDING'">
                    <v-btn
                      class="mr-1"
                      icon="mdi-check-circle-outline"
                      density="compact"
                      color="green"
                      variant="text"
                      @click="
                        (showApproveRatingDialog = true),
                          (specificRating = item)
                      "
                    ></v-btn>
                    <v-btn
                      variant="text"
                      icon="mdi-cancel"
                      density="compact"
                      color="red"
                      @click="
                        (showDenyRatingDialog = true), (specificRating = item)
                      "
                    ></v-btn>
                  </v-col>
                  <v-col cols="12" v-else>
                    <v-chip
                      variant="text"
                      color="grey"
                      class="cursor-pointer"
                      @click="
                        (showReviewRatingDialog = true), (specificRating = item)
                      "
                      >Change</v-chip
                    >
                  </v-col>
                </v-row>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </div>
    </v-col>
  </v-row>
  <DialogPromptNew
    v-model="showDenyRatingDialog"
    @agree="handleRatingAction('REJECTED', false)"
    :loading="loadingApproveDeny"
    :prompt-title="`Are you sure to reject this review?`"
    disagree-button-text="CANCEL"
    agree-button-text="REJECT"
  />
  <DialogPromptNew
    v-model="showApproveRatingDialog"
    @agree="handleRatingAction('APPROVED', false)"
    :loading="loadingApproveDeny"
    :prompt-title="`Approve this review?`"
    disagree-button-text="CANCEL"
    agree-button-text="APPROVE"
  />
  <DialogReviewRatingDialog
    v-model="showReviewRatingDialog"
    @agree="handleRatingAction('APPROVED', true)"
    @disagree="handleRatingAction('REJECTED', true)"
    :loading="loadingApproveDeny"
    :prompt-title="`Review`"
    :disagree-button-text="
      specificRating?.status === 'REJECTED' ? 'REJECTED' : 'REJECT'
    "
    :specificRating="specificRating"
    :agree-button-text="
      specificRating?.status === 'APPROVED' ? 'APPROVED' : 'APPROVE'
    "
  />
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "admin-only"],
});
import { useDisplay } from "vuetify";
const { xs, smAndUp } = useDisplay();
const { getAdminRatingsList, updateRatingStatus } = useRatings();
const { sliceContent } = useUtils();
const { country } = useLocal();
const selectedRating = ref<any | null>(null);
const loading = ref<boolean>(true);
const specificRating = ref<TRatingDetails>();
const loadingApproveDeny = ref<boolean>(false);
const showDenyRatingDialog = ref<boolean>(false);
const showApproveRatingDialog = ref<boolean>(false);
const showReviewRatingDialog = ref<boolean>(false);
const itemsStatus = ref<object[]>([
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Pending", value: "PENDING" },
]);
const itemsSort = ref<object[]>([
  { title: "Ascending", value: "asc" },
  { title: "Descending", value: "desc" },
]);
const ratingsData = ref<TRatingDetails[]>();
const totalItems = ref<number>(0);
const itemsPerPage = ref<number>(10);
const currentPage = ref<number>(1);
const searchSpaceText = ref<string | null>(null);
const selectedSort = ref<string | null>(null);
const selectedFilterStatus = ref<string | null>(null);
const headers = ref<object[]>([
  { title: "Name", value: "name" },
  { title: "Date", value: "createdAt" },
  { title: "Space Name", value: "space" },
  { title: "Review", value: "review" },
  { title: "Rating", value: "rating" },
  { title: "Status", value: "status" },
  { title: "Actions", value: "actions" },
]);

const itemsRating = ref([
  { title: "", value: 1 },
  { title: "", value: 2 },
  { title: "", value: 3 },
  { title: "", value: 4 },
  { title: "", value: 5 },
]);

const capitalizeFirstLetter = (status: any) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getStatusColor = (status: string) => {
  let color = "";
  if (status === "APPROVED") {
    color = "green";
  } else if (status === "REJECTED") {
    color = "red";
  } else {
    color = "black";
  }
  return color;
};

const handleRatingAction = async (status: string, update: boolean) => {
  try {
    const { data } = await updateRatingStatus(
      specificRating?.value?._id as string,
      status
    );
    if (data) {
      loadRatingsDate({
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        searchSpaceText: searchSpaceText.value,
        status: selectedFilterStatus.value,
        rating: selectedRating.value?.value,
        sort: selectedSort.value,
      });

      if (status === "REJECTED") {
        showDenyRatingDialog.value = false;
      } else if (status === "APPROVED") {
        showApproveRatingDialog.value = false;
      }

      if (update) {
        showReviewRatingDialog.value = false;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const navigate = () => {
  const router = useRouter();
  const url = router.resolve({
    name: "country-venues-venue",
    params: { country: country, venue: specificRating.value?.space?._id },
  }).href;

  window.open(url, "_blank");
};

let timeoutId: ReturnType<typeof setTimeout>;
const handleSearchSpace = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    currentPage.value = 1;
    loadRatingsDate({
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      searchSpaceText: searchSpaceText.value,
      status: selectedFilterStatus.value,
      rating: selectedRating.value?.value,
      sort: selectedSort.value,
    });
  }, 300);
};

const handleClearFilter = async () => {
  currentPage.value = 1;
  searchSpaceText.value = null;
  selectedFilterStatus.value = null;
  selectedRating.value = null;
  selectedSort.value = null;
  await loadRatingsDate({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
};

const handleChangeStatusFilter = async () => {
  currentPage.value = 1;
  await loadRatingsDate({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
};

const handleChangeSortFilter = async () => {
  currentPage.value = 1;
  await loadRatingsDate({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
};

const handleChangeRatingFilter = async () => {
  currentPage.value = 1;
  await loadRatingsDate({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
};

const loadRatingsDate = async (options: {
  page: number;
  itemsPerPage: number;
  searchSpaceText: string | null;
  status: string | null;
  rating: number | null;
  sort: string | null;
}) => {
  const { page, itemsPerPage, searchSpaceText, status, rating, sort } = options;

  try {
    const responseData = (await getAdminRatingsList(
      page,
      itemsPerPage,
      searchSpaceText,
      status,
      rating,
      sort
    )) as any;
    if (responseData.data) {
      ratingsData.value = responseData.data.data;
      totalItems.value = responseData.data.total_items || 0;
    } else {
      ratingsData.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error(error);
  }
};

const onUpdatePageHandler = (page: number) => {
  currentPage.value = page;
  loading.value = true;
  loadRatingsDate({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
  loading.value = false;
};

const onUpdateItemsPerPageHandler = (itemsPerPage: number) => {
  loading.value = true;
  loadRatingsDate({
    page: 1,
    itemsPerPage,
    searchSpaceText: searchSpaceText.value,
    status: selectedFilterStatus.value,
    rating: selectedRating.value?.value,
    sort: selectedSort.value,
  });
  loading.value = false;
};

loading.value = true;
loadRatingsDate({
  page: 1,
  itemsPerPage: itemsPerPage.value,
  searchSpaceText: searchSpaceText.value,
  status: selectedFilterStatus.value,
  rating: selectedRating.value?.value,
  sort: selectedSort.value,
});
loading.value = false;
</script>
