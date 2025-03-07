<template>
  <v-row no-gutters>
    <v-card v-if="!isSubscriptionBased" width="100%" class="pa-5 rounded-lg d-flex align-center" color="blue" variant="outlined"
      position="relative">
      <v-row v-if="isAdmin" no-gutters align="center"
        class="text-subtitle-2 text-md-subtitle-1 text-info d-flex flex-wrap ga-2">
        <v-row no-gutters class="" align="center">

          <span class="">Note: The venue owner will give</span>
          <v-text-field v-model.number="commissionAmount" :disabled="false" :readonly="!editCommission" type="number"
            hide-details density="compact" suffix="%" class="mx-3" style="max-width: 95px; display: inline-block"
            persistent-placeholder :rules="commissionRules"></v-text-field>
          <span class="mr-1">commission </span>
          <span class="mr-1">from every </span>
          <span class="mr-1">successful booking </span>
          <span> of their
            venue/space.</span>

        </v-row>

        <v-col v-if="isAdmin" align="end">
          <v-btn v-if="!editCommission" color="secondary" rounded="lg" border="secondary sm" variant="outlined"
            @click="editCommission = true">Edit Commission Rate</v-btn>
          <v-btn v-else color="secondary" rounded="lg" @click="handleSaveCommission"
            :loading="updatingCommission">Save</v-btn>
        </v-col>

      </v-row>


      <v-row v-if="!isAdmin" no-gutters align="center" class="text-subtitle-2 text-md-subtitle-1 text-info">
        <!-- Icon Column -->
        <v-col cols="auto" class="d-flex align-center ml-5" :style="{
          position: `${smAndDown ? 'absolute' : 'relative'}`,
          top: '5%',
          right: '2%',
        }">
          <v-tooltip location="end" class="pa-0 ma-0" open-on-click>
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" icon="mdi-information-variant-circle"></v-icon>
            </template>

            <template v-slot:default="{ isActive }">
              <v-alert variant="solo" v-bind="isActive" density="compact" max-width="300px"
                text="We only make money when you do. We charge a commission of 10%, 12.5%, 15%, depending on the country and type of event. Please contact us if you have any concern with our commission rate."
                type="info" border-color="info" elevation="2"></v-alert>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Text Column -->
        <v-col cols="auto">
          <v-row align="center" no-gutters>
            <v-col cols="12">
              <span class="font-500">Note</span>
            </v-col>
            <v-col cols="auto">
              <span class="font-400">
                Venue4use will receive {{ commissionAmount }}% commission from
                every successful booking of your venue/space.
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <v-row no-gutters class="my-8">
      <v-col cols="12" class="text-20px font-500">{{ venue?.name }}</v-col>
      <v-col cols="12" class="text-20px">{{
        formatAddress(venue.address || {})
      }}</v-col>
    </v-row>
  </v-row>

  <v-data-table-server v-model:items-per-page="pageLimit" :headers="headers" :items="mappedSpacesList"
    hide-default-footer :items-length="totalSpacesCount" item-key="_id" height="auto" fixed-footer
    items-per-page-text="Rows per page" @update:options="loadItems" no-data-text="No completed space yet"
    @update:page="(page: number) => onUpdatePageHandler(page)" style="border: 2px solid #dedfe3; border-radius: 8px"
    last-icon="mdi-chevron-double-right" first-icon="mdi-chevron-double-left" :loading="loading">
    <template v-slot:headers="{ columns }">
      <tr class="bg-light_gray text-charcoal font-500 text-16px">
        <template v-for="column in columns">
          <td :style="{
            minWidth: column.key === 'space' ? '400px' : '200px',
            height: '40px',
          }">
            <span class="px-2">{{ column.title }}</span>
          </td>
        </template>
      </tr>
    </template>

    <template v-slot:item="{ item, index }">
      <tr class="text-16px py-2 cursor-pointer text-charcoal" style="min-height: 80px"
        @click="handlePreviewClick(item?._id as string)">
        <td>
          <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
            <span>
              <v-img :src="featuredImage(item as any) || '/svg/default-draft-image.svg'" height="54px" width="54px"
                cover rounded="lg" alt="Space Featured Image"></v-img>

            </span>
            <span>{{ sliceContent(item.space, 30) }}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-center ga-2 py-2 py-md-3">
            <v-badge :color="formatColor(item?.status as string)" content="6" inline dot></v-badge>
            <span class="text-16px">{{ formatStatus(item?.status as string) }}</span>
          </div>
        </td>
      </tr>
    </template>

    <!-- <template v-slot:loading>
      <LoadingChat :lines="5" />
    </template> -->

    <!-- <template v-slot:no-data>
      <v-row no-gutters>
        <v-col cols="12" class="mt-10 text-center">
          <v-empty-state
            title="No Venues Yet"
            height="300"
            text="You haven't finished any venues yet. When you do, they'll appear here."
          ></v-empty-state>
        </v-col>
      </v-row>
    </template> -->
  </v-data-table-server>

  <!-- <v-row v-if="filteredSpaces?.length !== 0" no-gutters>
    <template v-for="spaceItem in filteredSpaces" :key="spaceItem._id">
      <CardSpace
        :card-data="{ name: spaceItem.name, imageUrl: spaceItem.space_photo }"
        class="ma-1"
        :status="formatStatus(spaceItem.status as string)"
        :status-color="formatColor(spaceItem.status as string)"
        @click="handlePreviewClick(spaceItem)"
      />
    </template>
  </v-row> -->

  <!-- <CardEmptyState v-else :showButton="false" />
   -->

  <!-- <VenuePreviewSpace v-model:show="showPreviewSpace" v-model:space="activeSpace" :preview="showPreviewSpace" /> -->
  <DialogPromptNew v-model="approveInfo" @agree="emit('go-to-spaces')"
    prompt-title="You have a pending space for approval"
    prompt-text="Please note that you have to approve all pending space for approval to approve this venue."
    disagree-button-text="Got it!" agree-button-text="Go to spaces" agree-button-color="blue" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import MSpace from "~/models/space.model";
const { smAndDown } = useDisplay();
const venue = defineModel<TVenue>({ required: true });
const { formatAddress } = useUtils();
const { updateVenue, isSubscriptionBased } = useVenue();
const { isAdmin } = useAccess();
const { getCountrySetting } = useSettingAPI();
const editCommission = ref(false);
const commissionAmount = ref<number | null | string>(
  (Number(venue.value.commission) * 100).toFixed(2)
);
const updatingCommission = ref(false);
const { venueId } = useRoute().params;
const { spaces, getListSpaceManagement, featuredImage,   } = useSpace();
const { setSnackbar, country } = useLocal();
const { currentUser } = useLocalAuth();
const { formatStatus, formatColor, sliceContent } = useUtils();
// const activeSpace = ref<TVenueSpace | null>(null);
const loading = ref(true);
const totalSpacesCount = ref(0);
const page = ref(1);
const totalPages = ref(1);
const pageLimit = ref(100);
const spacePhoto = ref([]);
const activeSpace = ref()
const showPreviewSpace = ref(false)
const approveInfo = ref(false);

const somethingWentWrongMessage = {
  color: "error",
  text: "Something went wrong. Please try again.",
  modal: true,
}

const headers = [
  { title: "Space Name", align: "start", sortable: false, key: "space" },
  { title: "Status", align: "end", key: "status" },
];


const emit = defineEmits(['save-draft', 'refresh-venue', 'go-to-spaces'])

const mappedSpacesList = computed(() => {
  return spaces.value.sort((a: any, b: any) => b.updatedAt - a.updatedAt)
    .map((x: TVenueSpace) => ({
      space: x.name,
      status: x.status,
      _id: x?._id,
      space_photo: x?.space_photo
    })
    );
}); 

const fetchSpaceList = async (venueId: string) => {
  loading.value = true;
  const statusFilter = computed(() => {
    return 'PUBLISHED,FOR_APPROVAL,REJECTED,SUSPENDED,FOR_DELETION,DELETED'
    // return null;
  })
  try {
    // const { data } = await getListSpaceManagement(venueId as string, statusFilter.value, page.value, pageLimit.value);
    const response = await getListSpaceManagement({venueId, page: page.value, limit: pageLimit.value, status: statusFilter.value});
    const res = response.value as any;
    const spaceData = res.data.data;
    spaces.value = spaceData;
    console.log(spaces.value);
    totalPages.value = res.data.total_pages;
    totalSpacesCount.value = res.data.total_items;

  } catch (error) {
    console.error("Error fetching space list:", error);
    setSnackbar(somethingWentWrongMessage);
    spaces.value = [];
  } finally {
    loading.value = false;
  }
};

const onUpdatePageHandler = async (pageNum: number) => {
  page.value = pageNum;
  await loadItems();
};

const loadItems = async () => {
  await fetchSpaceList(venueId as any);
  triggerApproveInforPrompt();
};

const errorMessage = {
  color: "error",
  text: "Something went wrong. Please try again later.",
  modal: true,
};

const handlePreviewClick = async (spaceId: string) => {
  if (!spaceId) return;
  // const obj = spaces.value.find(x => x?._id == spaceId);
  // if (!obj) return;
  // activeSpace.value = new MSpace(obj);
  // showPreviewSpace.value = true;
  const url = `/${country}/venues/${spaceId}`
  await navigateTo(url, {
    open: {
      target: "_blank",
    },
  });
};

const commissionRules = [(v: number) => Number(v) >= 0 || ""];

const handleSaveCommission = async () => {
  // set commission to 0 if null
  if (!commissionAmount.value) {
    commissionAmount.value = 0;
  }

  if (commissionAmount.value < 0) {
    setSnackbar({
      color: "error",
      text: "Commission must be a positive number.",
      modal: true,
    });
    return;
  }

  let maxCommission;
  try {
    const res = (await getCountrySetting()) as any;
    const venueCountry = venue.value.address.country;
    if (!res || !res[0]?.cca2 || !venueCountry) return;
    const countryObj = res.find(
      (x: any) => x.cca2 == venueCountry.toUpperCase()
    );
    maxCommission = countryObj?.commission || null;
    if (maxCommission) {
      console.log(commissionAmount.value, maxCommission);

      if (Number(commissionAmount.value) > Number(maxCommission) * 100) {
        setSnackbar({
          color: "error",
          text: `Commission for venues in ${countryObj?.country_name} is capped at ${maxCommission * 100}%.`,
          modal: true,
        });
        return;
      }
    } else {
      setSnackbar(errorMessage);
    }
  } catch (error) {
    console.log(error);
    setSnackbar(errorMessage);
    editCommission.value = false;
    updatingCommission.value = false;
  }

  try {
    updatingCommission.value = true;

    await updateVenue(venueId as string, {
      commission: Number((Number(commissionAmount.value) / 100).toFixed(4)),
    });
    emit('refresh-venue');
    setSnackbar({
      color: "success",
      text: "Commission rate updated successfully.",
      modal: true,
    });
  } catch (er) {
    console.log(er);
    setSnackbar(errorMessage);
    editCommission.value = false;
    updatingCommission.value = false;
  }

  editCommission.value = false;
  updatingCommission.value = false;
};


// show prompt for approval info
const triggerApproveInforPrompt = () => {
  setTimeout(() => {
    if (
      isAdmin &&
      venue.value.status === "FOR_APPROVAL" && spaces.value.some((x) => x.status == "FOR_APPROVAL")
    ) {
      approveInfo.value = true;
    } else return false;
  }, 300);
};
</script>

<style scoped>
.v-input :deep()::-webkit-inner-spin-button,
::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

/* .tooltip-class {
  background-color: rgba(var(--v-theme-primary))
} */
</style>

