<template>
  <v-row no-gutters>
    <v-col cols="12" class="font-600 text-22px mb-7 d-flex justify-space-between">
      <span><span v-if="totalSpacesCount !== 0">{{ totalSpacesCount }}
          {{ totalSpacesCount > 1 ? "Spaces" : "Space" }}</span></span>
      <span>
        <span v-if="isSubscriptionBased && (isVenueOwner || isVenueAdmin)" class="flex align-center border-custom mr-2">
          <span class="text-15px font-500 pl-3">{{ activeSpacesCount + "/" + spaceCredits || 0 }} space used</span>
          <span>
            <v-btn text="Manage Space" :disabled="!pricingData" height="40" rounded="lg" elevation="0" color="primary"
              variant="text" @click="handleManageSpace" class="text-decoration-underline"></v-btn>
          </span>
        </span>
        <v-btn v-if="canAdd" prepend-icon="mdi-plus" text="Add Space" height="40" rounded="lg" elevation="0"
          variant="outlined" border="secondary md" @click="handleAddNewSpace" :loading="addingNewLoading"
          :disabled="maxCreditsReached || loading"></v-btn>
      </span>
    </v-col>

    <AlertInsufficientFunds v-model="showInsufficientFundsAlert" :banner-status-message="{
      title: 'Insufficient Funds',
      color: 'error',
      message:
        'Your current balance is not enough to continue your subscription.',
    }" class="mb-5" />

    <v-data-table-server :loading="loading" v-model:items-per-page="pageLimit" :headers="headers"
      :items="mappedSpacesList" :items-length="totalSpacesCount" item-key="_id" height="auto" fixed-footer
      items-per-page-text="Rows per page" :items-per-page-options="[
        { title: '10', value: 10 },
        { title: '20', value: 20 },
      ]" @update:options="loadItems" @update:page="(page: number) => onUpdatePageHandler(page)"
      style="border: 2px solid #dedfe3; border-radius: 8px" last-icon="mdi-chevron-double-right"
      first-icon="mdi-chevron-double-left" >
      <template v-slot:headers="{ columns }">
        <tr class="bg-light_gray text-charcoal font-500 text-16px">
          <template v-for="column in columns">
            <td :style="{
              minWidth: column.key === 'space' ? '60px' : '150px',
              height: '40px',
            }">
              <span class="px-2">{{ column.title }}</span>
            </td>
          </template>
        </tr>
      </template>

      <template v-slot:item="{ item, index }">
        <tr :key="item?._id" class="text-16px py-2 cursor-pointer text-charcoal" style="min-height: 80px"
          @click="toDetails(item?._id as string)">
          <td>
            <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
              <span>
                <v-img :src="featuredImage(item as any) || '/svg/default-draft-image.svg'
                  " height="54px" width="54px" cover rounded="lg" alt="draft image icon"></v-img>
              </span>
              <span>{{ sliceContent(item?.space as string, 30) || '(New Draft)' }}</span>
            </div>
          </td>
          <td>
            <div class="d-flex align-center ga-2 py-2 py-md-3">
              <v-badge :color="formatColor(item?.status as string)" content="6" inline dot></v-badge>
              <span class="text-16px">{{
                formatStatus(item?.status as string)
                }}</span>
            </div>
          </td>
          <td>
            <v-row no-gutters class="d-flex ga-2 justify-end py-2 py-md-3">
              <v-btn v-if="
                item?.status !== 'DELETED' && (isVenueOwner || isVenueAdmin)
              " border="secondary sm" flat icon="mdi-square-edit-outline" size="small" rounded="lg"></v-btn>
              <v-btn border="secondary sm" v-if="
                (isVenueOwner &&
                item?.status !== 'DELETED' &&
                item?.status !== 'FOR_DELETION') || (isVenuePartOfVenueWithConsent(item?.status as string) && (isAdmin || isAdminMember))
              " flat icon="mdi-trash-can-outline" size="small" rounded="lg"
                @click.stop="showDeletePromptHandler(item as any)"></v-btn>
            </v-row>
          </td>
        </tr>
      </template>

      <template v-slot:loading>
        <LoadingChat :lines="5" />
      </template>

      <template v-slot:no-data>
        <v-row no-gutters>
          <v-col cols="12" class="mt-10 text-center">
            <v-empty-state title="No Spaces Yet" height="300"
              text="You haven't started any space yet. When you do, they'll appear here."></v-empty-state>
          </v-col>
        </v-row>
      </template>
    </v-data-table-server>

    <!-- Delete Confirmation Dialog -->
    <DialogPromptNew v-model="showPermanentlyDeletePrompt" @agree="handlePermanentlyDelete"
      :prompt-title="`Are you sure you want to delete ${sliceContent(selectedSpace?.space, 50)} permanently?`"
      prompt-text="Once you delete it, you can't get it back" agree-button-text="Delete it"
      disagree-button-text="Nevermind" :loading="processing" />
    <DialogPromptNew v-model="showDeletePrompt" @agree="handleDeleteWithValidation"
      :prompt-title="`Are you sure you want to delete ${sliceContent(selectedSpace?.space, 50)}?`"
      prompt-text="By proceeding, they system will check for ongoing transactions/bookings."
      agree-button-text="Delete it" disagree-button-text="Nevermind" :loading="processing" />

    <DialogStripeDialog v-model:dialog="dialog" :pricing="pricingData" :space-credits="spaceCredits"
      @refresh-subscription="fetchSubscription" />

    <DialogStripeDialogUpdate v-model:dialog="updateDialog" :pricing="pricingData" :subscription="subscriptionData"
      :space-credits="spaceCredits" @refresh-subscription="fetchSubscription"
      :active-spaces-count="activeSpacesCount" />
  </v-row>
</template>

<script setup lang="ts">
const { venueId } = useRoute().params;
const { countries } = useVenueData();
const { type } = useRoute().query;
const { mode, venue, isSubscriptionBased, isVenuePartOfVenueWithConsent } = useVenue();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser, isAdminMember,isAdminSales } =
  useAccess();
const {
  spaces,
  addNewSpace,
  updateSpace,
  featuredImage,
  deleteMultipleSpaces,
  getListSpaceManagement,
  deleteSpaceWithValidation,
} = useSpace();
const { country, setSnackbar, currentCurrency } = useLocal();
const { currentUser } = useLocalAuth();
const { formatStatus, formatColor, sliceContent } = useUtils();
const { getPricing, getSubscription } = useSubscription();
const activeSpace = ref<TVenueSpace | null>(null);
const showMenu = ref<boolean>(false);
const processing = ref(false);
const dialog = ref(false);
const updateDialog = ref(false);
const showPermanentlyDeletePrompt = ref(false);
const showDeletePrompt = ref(false);
const loading = ref(true);
const totalSpacesCount = ref(0); // all space including archived
const page = ref(1);
const totalPages = ref(1);
const pageLimit = ref(10);
const addingNewLoading = ref(false);
const selectedSpace = ref();
const spaceCredits = ref(0);
const activeSpacesCount = ref(0);
const subscriptionData = ref<TSubscription>();
const showInsufficientFundsAlert = ref(false);
const spacePageName =
  "country-venues-management-venue-venueId-spaces-spaceId-spaceFormId";
const currentRouteName = "country-venues-management-venue-venueId";
const somethingWentWrongMessage = {
  color: "error",
  text: "Something went wrong. Please try again.",
  modal: true,
};

const headers = [
  { title: "Space Name", align: "start", sortable: false, key: "space" },
  { title: "Status", align: "end", key: "status" },
  { title: "", align: "end", key: "action" },
];

const emit = defineEmits<{
  (e: "save-draft"): void;
  (e: "refresh-space"): void;
}>();

const mappedSpacesList = computed(() => {
  return spaces.value
    .sort((a: any, b: any) => b.updatedAt - a.updatedAt)
    .map((x: TVenueSpace) => ({
      space: x.name,
      status: x.status,
      _id: x?._id,
      space_photo: x?.space_photo,
    }));
});

const fetchingSpaceList = ref(false);

const fetchSpaceList = async (venueId: string) => {

  if(fetchingSpaceList.value) return; // avoid double fetching

  fetchingSpaceList.value = true;
  loading.value = true;
  const statusFilter = computed(() => {
    // if (isAdmin) {
    //   return "FOR_APPROVAL,PUBLISHED,FOR_DELETION,SUSPENDED,REJECTED,FOR_TRANSACTION_CLOSING";
    // } else {
    //   return null;
    // }
    return null;
  });

  const query: ISpaceManagementListQuery = {
    // venueId as string, statusFilter.value, page.value, pageLimit.value
    venueId,
    page: page.value,
    limit: pageLimit.value,
  };

  if (statusFilter.value) {
    query.status = statusFilter.value;
  }

  try {
    // const { data } = await getFilteredSpaceList(venueId as string, statusFilter.value, page.value, pageLimit.value);
    const response = await getListSpaceManagement(query);
    if (response.value) {
      const res = response.value as any;
      const spaceData = res.data.data;
      spaces.value = spaceData;
      totalPages.value = res.data.total_pages;
      totalSpacesCount.value = res.data.total_items;
      activeSpacesCount.value = res?.data?.current_active;
    }
  } catch (error) {
    console.error("Error fetching space list:", error);
    setSnackbar(somethingWentWrongMessage);
    spaces.value = [];
  } finally {
    loading.value = false;
    fetchingSpaceList.value = false;
  }
};

const onUpdatePageHandler = async (pageNum: number) => {
  page.value = pageNum;
  await loadItems();
};

const loadItems = async () => {
  // return;
  await fetchSpaceList(venueId as any);
};

const handleAddNewSpace = async () => {
  addingNewLoading.value = true;
  let name = '';
  let status: 'DRAFT' | 'PENDING' = (isAdminMember || isAdminSales) ? 'PENDING' : 'DRAFT';
  const { data: spaceData, error } = await addNewSpace(venueId as string, name, status);
  if (spaceData) {
    const res = spaceData.value as any;
    navigateTo({
      name: spacePageName,
      params: {
        country,
        venueId,
        spaceId: res.data._id,
        spaceFormId: "details",
      },
    });
  }
  addingNewLoading.value = false;
};

const toDetails = (spaceId: string) => {
  processing.value = true;
  navigateTo({
    name: spacePageName,
    params: { country, venueId, spaceId, spaceFormId: "details" },
  });
};

const handleManageSpace = async () => {
  if (spaceCredits.value > 0 && hasActiveSubscription.value) {
    updateDialog.value = true;
  } else dialog.value = true;
};

const canAdd = computed(() => {
  return mode.value !== "view" && (isVenueOwner || isAdminMember || isAdminSales || isVenueAdmin);
});

const hasActiveSubscription = computed(() => {
  return subscriptionData.value?.status == "active";
});

const maxCreditsReached = computed(() => {
  if (!isSubscriptionBased.value) {
    return false;
  }

  // check if no active subscription
  if (!hasActiveSubscription.value) {
    return true;
  }

  if (spaceCredits.value > 0) {
    return activeSpacesCount.value >= spaceCredits.value;
  }
  return true;
});

const handleDeleteWithValidation = async () => {
  showPermanentlyDeletePrompt.value = false;
  processing.value = true;
  try {
    const response = await deleteSpaceWithValidation(
      selectedSpace.value?._id as string
    );
    if (response.value) {
      setSnackbar({
        modal: true,
        color: "success",
        text: "Space successfully archived!",
      });
    }
  } catch (error: any) {
    if (error?.message == "SPACE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES") {
      setSnackbar({
        modal: true,
        color: "info",
        text: "Space cannot be deleted with ongoing inquiries",
      });
    } else if (error?.message == "SPACE_CANNOT_BE_DELETED_WITH_PENDING_BOOKING") {
      setSnackbar({
        modal: true,
        color: "info",
        text: "Space cannot be deleted with ongoing bookings",
      });
    } else if (error?.message == "SPACE_CAN_NOT_BE_DELETED_WITH_PENDING_ENQUIRIES_AND_BOOKINGS") {
      setSnackbar({
        modal: true,
        color: "info",
        text: "Space cannot be deleted with ongoing bookings or inquiries",
      });
    } else {
      setSnackbar(somethingWentWrongMessage);
    }
  } finally {
    loadItems();
    processing.value = false;
    showDeletePrompt.value = false;
  }
};

const handlePermanentlyDelete = async () => {
  processing.value = true;
  try {
    const { error } = await deleteMultipleSpaces([selectedSpace.value?._id]);
    if (error.value) {
      setSnackbar(somethingWentWrongMessage);
    }
  } catch (error) {
    setSnackbar(somethingWentWrongMessage);
  } finally {
    loadItems();
    processing.value = false;
    showPermanentlyDeletePrompt.value = false;
  }
};

const showDeletePromptHandler = (space: TVenueSpace) => {
  selectedSpace.value = space;
  if (space && (space?.status == "DRAFT" || space?.status == "INPROGRESS" || isVenuePartOfVenueWithConsent(space?.status as string))) {
    showPermanentlyDeletePrompt.value = true;
  } else {
    showDeletePrompt.value = true;
  }
};

const pricingData = ref<TSubscriptionPricing>();

const fetchPricing = async () => {
  try {
    const response = await getPricing({ country: "SG" });
    if (response.value) {
      const res = response.value as any;
      const pricesArray = res?.data?.[0]?.prices;
      if (pricesArray.length > 0) {
        const registeredCountry = venue.value?.address?.country;
        const currency = currentCurrency(registeredCountry)?.code;
        if (!currency) return;
        const obj = pricesArray.find((x: any) => currency == x?.currency);
        if (obj) {
          pricingData.value = obj;
        }
      }
      // pricingData.value
    }
  } catch (e) {
    console.log(e);
    setSnackbar(somethingWentWrongMessage);
  } finally {
    loading.value = false;
  }
};

const fetchSubscription = async () => {
  try {
    const id = venue.value._id;
    const response = await getSubscription(id as string);
    if (response) {
      const res = response.value as any;
      spaceCredits.value = res.data?.space_number || 0;
      subscriptionData.value = res.data;

      // check if subscription payment failed due to insufficient fund
      if (subscriptionData.value?.status == "payment_failed") {
        showInsufficientFundsAlert.value = true;
      } else showInsufficientFundsAlert.value = false;
    }
  } catch (error) {
    console.log(error);
    setSnackbar(somethingWentWrongMessage);
  }
};

onMounted(async () => {
  await loadItems();
  if (isSubscriptionBased.value) {
    await fetchSubscription();
    await fetchPricing();
    return;
  }
});
</script>

<style scoped>
.card-item {
  transition: all ease-in-out 1000ms;
}

.border-custom {
  border: 2px solid #dedfe3;
  border-radius: 7px;
  padding: 5px;
  height: 40px;
}
</style>
