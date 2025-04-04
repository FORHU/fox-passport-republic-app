<template>
  <v-row no-gutters class=""
    style="height: 92dvh; overflow-y: auto; position: relative; border-right: 2px solid #DEDFE3;" :key="currentPage">
    <v-row no-gutters style="position: sticky;  top: 0; left: 0; right: 0; z-index: 3;">

      <v-card no-gutters flat :rounded="false" color="white" class="w-100 pa-2 pa-md-3 py-3 py-md-5">
        <v-row v-if="!showSearchInput" no-gutters
          class="d-flex ga-2 px-2 px-xl-4 justify-space-between align-center w-100">
          <span class="text-22px font-600">Inquiries</span>
          <span> <v-btn icon="mdi-magnify" class="text-secondary" size="30" flat @click="showSearchInput = true">
            </v-btn>
            <v-btn icon="mdi-tune" class="text-secondary" size="30" flat @click="showFilterModal = true"></v-btn>
            <v-badge color="error" dot v-if="eventType || date || guests"></v-badge>
          </span>
        </v-row>
        <v-row v-else no-gutters class="w-100" align="center">
          <v-text-field v-model="searchText" rounded="lg" autofocus
            :placeholder="isUser ? 'Search space or venue name' : 'Search client name or space name'" hide-details
            @update:model-value="handleSearchInput"></v-text-field>
          <v-btn icon="mdi-close" size="30" class="ml-2" flat @click="handleCloseSearch"></v-btn>
        </v-row>
        <v-row v-if="isUser" no-gutters class="mt-5 d-flex ga-3 px-2 px-xl-4">
          <v-btn rounded="xl" :color="activeTab == 'CURRENT' ? 'secondary' : 'white'"
            @click="handleChangeTab('CURRENT')">Current</v-btn>
          <v-btn rounded="xl" :color="activeTab == 'PAST' ? 'secondary' : 'white'"
            @click="handleChangeTab('PAST')">Past</v-btn>
        </v-row>
        <v-row v-else no-gutters class="mt-5 d-flex ga-3 px-2 px-xl-4" style="max-width: max-content">
          <v-select v-model="statusFilter" bg-color="secondary" hide-details density="compact"
            @update:model-value="handleChangeStatus"
            :items="['All', 'New', 'In Progress', 'Booking Confirmed', 'Happened', 'Lost']" variant="solo" rounded="xl"
            base-color="white"></v-select>
        </v-row>
      </v-card>
    </v-row>


    <v-row v-if="loading" no-gutters class="w-100 px-3 px-md-5 pb-3 fill-height">
      <v-row no-gutters style="min-height: 60dvh" class="w-100">
        <LoadingChat :lines="10" />
      </v-row>
    </v-row>

    <v-row v-else-if="!loading && enquiries.length > 0" no-gutters class="w-100 px-3 px-md-5 pb-3 fill-height" style="">
      <v-row no-gutters style="min-height: 60dvh" class="w-100">
        <v-data-iterator :items="enquiries" :items-per-page="pageLimit" class="w-100">

          <template v-slot:default="{ items }">
            <v-row no-gutters class="w-100">
              <template v-for="(item, i) in items" :key="i">

                <v-card width="100%" height="auto" class="pa-2 pa-xl-3 cursor-pointer my-1 d-flex align-center"
                  @click="routeToEnquiryMessage(item.raw._id as string)" style="cursor: pointer;" elevation="0"
                  :color="item.raw?._id == id ? 'light_gray' : 'white'" rounded="lg">
                  <v-row no-gutters class="d-flex ga-3 ga-xl-5 align-center flex-nowrap">
                    <div style="position: relative;">
                      <v-card :image="featuredImage(item.raw?.space)" :width="xlAndUp ? '60px' : '50px'"
                        :height="xlAndUp ? '60px' : '50px'" rounded="lg" cover position="relative">
                      </v-card>
                      <ProfileAvatar v-if="isUser" size="26px" :first_name="item.raw?.venue?.user?.first_name"
                        :last_name="item.raw?.venue?.user?.last_name" :img-src="item.raw?.venue?.user?.profile_picture"
                        style="position: absolute; bottom: -3%; right: -3%; border: 2px solid white" />
                      <ProfileAvatar v-else size="26px" :first_name="item.raw?.user?.first_name"
                        :last_name="item.raw?.user?.last_name" :img-src="item.raw?.user?.profile_picture"
                        style="position: absolute; bottom: -3%; right: -3%; border: 2px solid white" />
                    </div>
                    <div class="text-charcoal w-100" :class="[xlAndUp ? 'text-16px' : 'text-14px', item?.raw?.read ? '' : 'font-weight-bold']">
                      <v-row no-gutters class="w-100 d-flex flex-wrap gx-2 justify-space-between">
                        <span>{{ (width > 1280 && width < 1457) ? sliceContent(`${item.raw?.space.name} at
                            ${item.raw?.venue.name}`, 15) : sliceContent(`${item.raw?.space.name} at
                            ${item.raw?.venue.name}`, 25) }}</span>
                            <span class="">{{ convertToTimeDistance(item.raw?.latest_message?.createdAt) || ''
                              }}</span>
                      </v-row>
                      <v-row no-gutters class="w-100">
                        <v-col cols="12">{{ statusDetails(item.raw.status).statusName }}</v-col>
                      </v-row>

                      <v-row no-gutters class="d-flex flex-wrap align-center ga-1">{{ (width > 1280 && width < 1600) ?
                        sliceContent(previewMessage(item.raw?.latest_message), 25) :
                        sliceContent(previewMessage(item.raw?.latest_message), 50) }}</v-row>

                    </div>
                  </v-row>
                </v-card>
              </template>
            </v-row>
          </template>
        </v-data-iterator>
        <v-row v-if="totalPages > 1" no-gutters justify="center" class="w-100">
          <v-col>
            <v-pagination v-model="currentPage" :length="totalPages" class="mb-5" :total-visible="1" rounded="circle" size="small"
              @update:model-value="handleChangePage"></v-pagination>
          </v-col>
        </v-row>
      </v-row>

    </v-row>
    <v-row v-else-if="!loading && enquiries.length == 0" no-gutters
      class="w-100 mt-10 text-16px text-charcoal d-flex h-100">
      <v-row no-gutters style="height: 100px;" justify="center">
        <!-- <v-row no-gutters justify="center"> <v-icon icon="mdi-message-reply-text-outline" size="30"></v-icon></v-row>
        <v-col cols="12" align="center" class="font-500">You don't have any inquiry yet</v-col>
        <v-col cols="12" align="center" class="text-14px">When you receive an inquiry, it will appear here</v-col> -->

        <v-empty-state v-if="(statusFilter !== 'All' || guests || date || searchText || eventType)" icon="mdi-magnify"
          size="50"
          text="Try adjusting your search terms or filters. Sometimes less specific terms or broader queries can help you find what you're looking for."
          title="We couldn't find a match."></v-empty-state>

        <v-empty-state v-else icon="mdi-message-reply-text-outline" size="30" title="You don't have any inquiry yet"
          text="When you receive an inquiry, it will appear here"></v-empty-state>

      </v-row>
    </v-row>
  </v-row>
  <DialogFilterEnquiry v-model:show="showFilterModal" v-model:event-type="eventType" v-model:date="date"
    v-model:guests="guests" @advance-filter="handleApplyFilter" />
</template>

<script setup lang="ts">

import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp, lgAndUp, mdAndDown, xlAndUp, width } = useDisplay();

const { country } = useLocal();
const { currentUser } = useLocalAuth();
const { getEnquiryList, statusDetails, enquiries, getAdminEnquiryList, activeTab, eventType, date, guests, statusFilter, showSearchInput, searchText, currentPage } = useEnquiry();
const { convertToTimeDistance, sliceContent } = useUtils();
const { featuredImage } = useSpace();
const selectedType = ref("current");
const totalPages = ref(1);
const pageLimit = ref(10);
const loading = ref(true);

const showFilterModal = ref(false);

const { updateListKey, chatKey } = useChat();



const { id } = useRoute().params;

const loggedUserId = computed(() => currentUser.value._id);

const handleChangeTab = async (tab: string) => {
  activeTab.value = tab as 'CURRENT' | 'PAST';
  currentPage.value = 1;
  await loadItems();
};


function routeToEnquiryMessage(id: string) {
  navigateTo({
    name: "country-enquiries-message-id",
    params: { country, id },
  });
}


const previewMessage = (message: any) => {
  let content = ''
  if (loggedUserId.value == message?.sender) {
    if (message?.admin_generated) {
      const key = message?.key

      if (key == 'REQUEST_PHONE_NUMBER') content = 'You have requested a phone number'
      else if (key == 'BOOKING_REQUESTED') content = 'You have requested a booking'
      else if (key == 'BOOKING_REQUEST_WITHDRAWN') content = 'You have withdrawn this booking request'
      else if (key == 'BOOKING_REQUEST_DECLINED') content = 'You have declined this booking request'
      else if (key == 'CANCELLED') content = 'You have cancelled this booking'
      else if (key == 'DECLINED') content = 'You have declined the custom offer'
      else if (key == 'BOOKING_CONFIRMED') content = 'This booking is confirmed and paid'
      else if (key == 'CUSTOM_OFFER_SENT') content = 'You have sent a custom offer'
      else if (key == 'CUSTOM_OFFER_UPDATED') content = 'You updated the custom offer'

      return content;

    } else {
      if (message?.content == '' && message?.attachments?.length > 0) {
        content = 'Attachment has been sent'
      } else content = message?.content || ''

    }

    return `You: ${content}`

  } else {
    if (message?.admin_generated) {
      const key = message?.key
      if (key == 'REQUEST_PHONE_NUMBER') content = 'The client has requested your phone number'
      else if (key == 'BOOKING_REQUESTED') content = 'The client requested to book your venue'
      else if (key == 'BOOKING_REQUEST_WITHDRAWN') content = 'The client has withdrawn this booking request'
      else if (key == 'DECLINED') content = 'The client has declined the custom offer'
      else if (key == 'BOOKING_CONFIRMED') content = 'This booking is confirmed and paid'
      else if (key == 'BOOKING_REQUEST_DECLINED') content = 'Venue owner declined your booking request'
      else if (key == 'CANCELLED') content = 'This booking has been cancelled'
      else if (key == 'CUSTOM_OFFER_SENT') content = 'A custom offer has been sent'
      else if (key == 'CUSTOM_OFFER_UPDATED') content = 'An updated custom offer has been sent'
    } else {
      if (message?.content == '' && message?.attachments?.length > 0) {
        content = 'Attachment has been sent'
      } else content = message?.content || ''
    }
    return content;
  }
}

const isVenueOwner = computed(() => {
  return currentUser.value?.role === "VENUE_OWNER";
});

const isUser = computed(() => {
  return currentUser.value?.role === "USER";
});

const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

// Function to fetch admin enquiry list
const fetchAdminEnquiryList = async (params: TEnquiryFilterParams) => {
  try {
    const { data } = await getAdminEnquiryList(params);
    if (!data || !data.value) return;
    const res = data.value as any;
    enquiries.value = res?.data?.data || [];
    totalPages.value = res.data?.total_pages || 1;
  } catch (error) {
    console.error("Error fetching enquiry list:", error);
    enquiries.value = [];
  } finally {
  }
};

// Function to fetch enquiry list
const fetchEnquiryList = async (query: TEnquiryFilterParams
) => {
  try {
    const { data } = await getEnquiryList(query);
    if (!data || !data.value) return;
    const res = data.value as any;
    enquiries.value = res?.data?.data || [];
    totalPages.value = res?.data?.total_pages || 1;
  } catch (error) {
    console.error("Error fetching venue list:", error);
    enquiries.value = [];
  } finally {
  }
};

const formattedStatus = computed(() => {
  const status = statusFilter.value
  if (status === "In Progress")
    return "IN_PROGRESS,CUSTOM_OFFER_SENT,DECLINED,PAYMENT_FAILED,PAYMENT_IN_PROGRESS,OFFER_ACCEPTED,BOOKING_REQUESTED,BOOKING_REQUEST_DECLINED,BOOKING_REQUEST_WITHDRAWN";
  if (status === "New") return "NEW";
  if (status === "Booking Confirmed") return "BOOKING_CONFIRMED";
  if (status === "Happened") return "HAPPENED";
  if (status === "Lost") return "CANCELLED,ARCHIVED";
  return null;
});

const loadItems = async (type?: 'remove-loader') => {
  let toggle_current = isUser.value ? isUser.value && activeTab.value == "CURRENT" : null
  let params: TEnquiryFilterParams = { page: currentPage.value || 1, limit: pageLimit.value }
  if (toggle_current !== null) {
    params.toggle_current = toggle_current
  }
  if (formattedStatus.value) params.status = formattedStatus.value
  if (searchText.value) params.search_name = searchText.value
  if (eventType.value) params.event_type = eventType.value
  if (date.value) params.event_date = date.value
  if (guests.value) params.guests = parseInt(guests.value)


  loading.value = type == 'remove-loader' ? false : true
  isAdmin.value ? await fetchAdminEnquiryList(params) :
    await fetchEnquiryList(params);

  loading.value = false;
}

let timeoutId: ReturnType<typeof setTimeout>;
const handleSearchInput = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    currentPage.value = 1
    loadItems();
  }, 500); // Adjust the delay as needed (1000ms = 1s)

}

const handleCloseSearch = () => {
  searchText.value = '';
  showSearchInput.value = false;
  currentPage.value = 1
  loadItems();
}

const handleChangeStatus = () => {
  currentPage.value = 1;
  loadItems();
}


watch(updateListKey, () => {
  loadItems('remove-loader');
}, { immediate: false })

watch(chatKey, () => {
  currentPage.value = 1;
})


onMounted(async () => {
  loading.value = true;
  // set loader only when no enquiries displayed yet
  enquiries.value.length !== 0 ? await loadItems('remove-loader') : await loadItems()
  loading.value = false;
});

const handleChangePage = async () => {
  await loadItems();
}

const handleApplyFilter = async () => {
  currentPage.value = 1;
  loadItems();
}
</script>
<style scoped>
html {
  overflow: scroll;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 0;
  /* Remove scrollbar space */
  background: transparent;
  /* Optional: just make scrollbar invisible */
}
</style>