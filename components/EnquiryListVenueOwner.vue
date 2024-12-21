<template>
  <v-row no-gutters class="pa-5 pa-md-7">
    <v-row no-gutters class="font-600 text-22px pb-3">{{ totalInquiriesCount }} Inquiries</v-row>
    <v-data-table v-model:items-per-page="itemsPerPage" :headers="headers" :items="mappedInquiries" item-key="name"
      height="72dvh" fixed-footer :loading="loading" @update:options="loadItems" style="border: 2px solid #DEDFE3; border-radius: 8px; ">
      <template v-slot:headers="{ columns }">
        <tr class="bg-light_gray text-charcoal font-500 text-16px">
          <template v-for="column in columns">
            <td :style="{ minWidth: column.key !== 'action' ? '150px' : '0px' }">
              <span>{{ column.title }}</span>
            </td>
          </template>
        </tr>
      </template>
      <template v-slot:item="{ item }">
        <tr class="text-16px py-2 cursor-pointer" style="min-height: 80px;" @click="routeToEnquiryMessage(item._id)">
          <td class="py-2">{{ item.name }}</td>
          <td class="py-2">{{ item.type }}</td>
          <td class="py-2">{{ item.guests }}</td>
          <td class="py-2">
            <div class="w-100"><v-icon icon="mdi-calendar" size="20" class="pr-2"></v-icon>{{ item.dateTime?.date }}
            </div>
            <div class="w-100"><v-icon icon="mdi-clock-time-three-outline" size="20" class="pr-2"></v-icon>{{
              item.dateTime?.time }}</div>
          </td>
          <td class="py-2">
            <div class="w-100">{{ item.space }}
            </div>
            <div class="w-100">{{
              item.venue }}</div>
          </td>
          <td class="py-2"><v-chip :text="item?.status?.statusName" :color="item?.status?.color" variant="outlined" density="compact"></v-chip></td>
          <td class="py-2"><v-icon icon="mdi-dots-horizontal"></v-icon></td>
        </tr>
      </template>
    </v-data-table>
  </v-row>

</template>

<script setup lang="ts">
import MEnquiry from '~/models/enquiry.model';


const { country } = useLocal();
const { currentUser } = useLocalAuth();
const { enquiries, enquiry, getEnquiryList, getAdminEnquiryList, drawer } =
  useEnquiry();
  const { isAdmin } = useAccess();

const totalInquiriesCount = ref(0)
const itemsPerPage = ref(10)
const loading = ref(false)
const totalPages = ref(1)
const page = ref(1)

const headers = [
  { title: 'Client Name', align: 'start', sortable: false, key: 'name' },
  { title: 'Event Type', align: 'end', key: 'type' },
  { title: 'Guests', align: 'end', key: 'guests' },
  { title: 'Event Date & Time', align: 'end', key: 'dateTime' },
  { title: 'Space Name', align: 'end', key: 'space' },
  { title: 'Status', align: 'end', key: 'status' },
  { title: '', align: 'end', key: 'action' },
]


const mappedInquiries = computed(() => {
  return enquiries.value.map((x: TEnquiry) => ({
    name: (x?.user?.first_name || "") + ' ' + (x?.user?.last_name || ""),
    type: x?.type || "",
    guests: x?.guests || 0,
    dateTime: { date: x?.date?.date || '', time: `${x?.date?.from} - ${x?.date?.to}` },
    space: x?.space?.name || "",
    venue: x?.venue?.name || "",
    status: statusDetails(x?.status) || "",
    _id: x?._id
  }))
});

const statusFilter = ref(null)

const formattedStatus = computed(() => {
  const status = statusFilter.value
  if (status === "in-progress")
    return "IN_PROGRESS,CUSTOM_OFFER_SENT,DECLINED,PAYMENT_FAILED,PAYMENT_IN_PROGRESS,OFFER_ACCEPTED,BOOKING_REQUESTED,BOOKING_REQUEST_DECLINED,BOOKING_REQUEST_WITHDRAWN";
  if (status === "new") return "NEW";
  if (status === "booking-confirmed") return "BOOKING_CONFIRMED";
  if (status === "happened") return "HAPPENED";
  if (status === "lost") return "CANCELLED,ARCHIVED";
  return null;
});

const statusDetails = (status: string) => {
  let color = "";
  let statusName = ""
  if (status == 'NEW') {
    color = 'green';
    statusName = 'New';
  } else if (status == 'BOOKING_CONFIRMED') {
    color = 'blue'
    statusName = 'Booking Confirmed';
  } else if (status == 'HAPPENED') {
    color = 'black';
    statusName = 'Happened';
  } else if (status == 'CANCELLED' || status == 'ARCHIVED') {
    color = 'red';
    statusName = 'Lost';
  } else {
    color = 'orange';
    statusName = 'In Progress';
  }
  return {
    color, statusName
  }

}



// Function to fetch admin enquiry list
const fetchAdminEnquiryList = async (
  status: string,
  page: number,
  limit = itemsPerPage.value,
) => {
  loading.value = true;
  try {
    const { data } = await getAdminEnquiryList(status, page, limit);
    if (!data || !data.value) return;
    const res = data.value as any;
    enquiries.value = res?.data?.data || [];
    totalPages.value = res.data?.total_pages || 1;
    totalInquiriesCount.value = res?.data?.total_items || 0;
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
  limit = itemsPerPage.value,
) => {
  loading.value = true;
  try {
    const { data } = await getEnquiryList(status, page, limit);
    if (!data || !data.value) return;
    const res = data.value as any;
    enquiries.value = res?.data?.data || [];
    totalPages.value = res?.data?.total_pages || 1;
    totalInquiriesCount.value = res?.data?.total_items || 0;
  } catch (error) {
    console.error("Error fetching venue list:", error);
    enquiries.value = [];
  } finally {
    loading.value = false;
  }
};

const loadItems = async () => {
  isAdmin ? await fetchAdminEnquiryList(formattedStatus.value as string, page.value, itemsPerPage.value) :
    await fetchEnquiryList(formattedStatus.value as string, page.value, itemsPerPage.value,);
}


function routeToEnquiryMessage(id: string) {
  navigateTo(`/${country}/enquiries/message/${id}`);
}


onMounted(async () => {
  loading.value = true;
  await loadItems();
  enquiry.value = new MEnquiry();
  loading.value = false;
});

</script>

<style scoped></style>