<template>
  <div class="pa-5" style="background-color: #e0e8f5">
    <v-row no-gutters>
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <!-- <v-autocomplete v-model="selectedType" :items="typeHeader" item-text="title" item-value="value"
              class="mb-5 rounded" style="background-color: white" append-outer-icon="mdi-magnify" hide-details
              placeholder="Search enquiries by client, venue, or venue" @keyup.enter="search">
              <template #append>
                <v-btn color="grey-darken-4" @click="search">Search</v-btn>
              </template>
            </v-autocomplete> -->
            <v-card width="100%" height="60px" class="mb-2">
              <v-container>
                <v-row no-gutters>
                  <v-col cols="1">Client</v-col>
                  <v-col cols="2">Event Type</v-col>
                  <v-col cols="1">Guest</v-col>
                  <v-col cols="2">Event Date</v-col>
                  <v-col cols="1"></v-col>
                  <v-col cols="2">Space</v-col>
                  <v-col cols="1">Value</v-col>
                  <v-col cols="2">Status</v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="pa-2">
          <!-- <v-data-table :headers="header" :items="filteredItems" class="rounded" border>
            <template v-slot:item="{ item }">
              <tr @click="routeToEnquiryMessage(item._id)" style="cursor: pointer; border-bottom: 1px solid #e0e0e0;">
                <td>{{ item.user.first_name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.guests }}</td>
                <td>
                  <div class="d-flex flex-column">
                    <span>{{ getDateFormat(item.date.timestamp) }}</span>
                    <span>{{ item.date.from }} - {{ item.date.to }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column py-7">
                    <span>{{ item.space && item.venue ? `${item.space.name} at ${item.venue.name}` : '' }}</span>
                  </div>
                </td>
                <td>${{ item.value }}</td>
                <td>
                  <v-chip :color="statusColor(item.status)" variant="text">
                    {{ item.status.replace("_", " ") }}
                  </v-chip>
                </td>
                <td>
                  <v-btn color="#8091AF">
                    <p class="text-white">VIEW INVOICE</p>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table> -->
          <v-data-iterator :items="items" items-per-page="10">
            <!-- <template v-slot:default="{ item }"> -->
            <template v-for="(item, i) in items" :key="i">
              <v-card
                @click="routeToEnquiryMessage(item._id)"
                elevation="1"
                style="cursor: pointer"
                width="100%"
                height="80px"
                class="mb-1"
              >
                <v-container>
                  <v-row no-gutters class="pa-n4">
                    <v-col cols="1">
                      <span class="text-subtitle-2 ml-n2">{{
                        item.user.first_name
                      }}</span>
                    </v-col>
                    <v-col cols="2">
                      <span class="text-subtitle-2 ml-n1">{{ item.type }}</span>
                    </v-col>
                    <v-col cols="1">
                      <span class="text-subtitle-2">{{ item.guests }}</span>
                    </v-col>
                    <v-col cols="1">
                      <span class="text-subtitle-2">{{
                        standardizeDateFormat(item.date.date)
                      }}</span>
                      <!-- <span class="text-subtitle-2">{{item.date.date}}</span> -->
                    </v-col>
                    <v-col cols="2">
                      <span class="text-subtitle-2"
                        >{{ item.date.from }} - {{ item.date.to }}</span
                      >
                    </v-col>
                    <v-col cols="2">
                      <span class="text-subtitle-2">{{
                        item.space && item.venue
                          ? `${item.space.name} at ${item.venue.name}`
                          : ""
                      }}</span>
                    </v-col>
                    <v-col cols="1">
                      <span class="text-subtitle-2">${{ item.value }}</span>
                    </v-col>
                    <v-col cols="2">
                      <v-chip
                        size="x-small"
                        :color="statusColor(item.status)"
                        variant="text"
                      >
                        <span style="font-size: 12px">{{
                          item.status.replace("_", " ")
                        }}</span>
                      </v-chip>

                      <!-- <v-col cols="6">
                   <v-btn @click="routeToEnquiryMessage(item._id)" style="border-radius:0px;" size="x-small" color="#8091AF">
                    <p class="text-white" style="font-size:8px;">VIEW INVOICE</p>
                  </v-btn> -->
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </template>
            <!-- </template> -->
          </v-data-iterator>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const { country } = useLocal();
const { getEnquiryData } = useEnquiryAPI();
const { enquiryData, setEnquiryData } = useEnquiryData();
const route = useRoute();

const selectedType = ref("");
const typeHeader = ref([
  {
    title: "All Enquiries",
    value: "",
  },
  {
    title: "New",
    value: "NEW",
  },
  {
    title: "In Progress",
    value: "IN_PROGRESS",
  },
  {
    title: "Booking Confirmed",
    value: "BOOKING_CONFIRMED",
  },
  {
    title: "Custom Offer Sent",
    value: "CUSTOM_OFFER_SENT",
  },
  {
    title: "Happened",
    value: "HAPPENED",
  },
  {
    title: "Commision Due",
    value: "COMMISION_DUE",
  },
  {
    title: "Archive",
    value: "ARCHIEVE",
  },
]);

const selectedItem = ref("");
const header = ref([
  {
    title: "Client",
    align: "left",
    key: "user",
    sortable: false,
  },
  {
    title: "Event Type",
    sortable: false,
    key: "type",
  },
  {
    title: "Guests",
    sortable: false,
    key: "guests",
  },
  {
    title: "Event Date",
    sortable: false,
    key: "date",
  },
  {
    title: "Space",
    sortable: false,
    key: "venue",
  },
  {
    title: "Value",
    sortable: false,
    key: "value",
  },
  {
    title: "Status",
    sortable: false,
    key: "status",
  },
  {
    title: "",
    sortable: false,
    key: "action",
  },
]);

const items = ref([]);
const filteredItems = ref([]);

// COMPUTED
const getItemList = computed(() => filteredItems.value);

// METHODS
async function initData() {
  const result = await getEnquiryData("");
  items.value = result.data;
  filteredItems.value = result.data;
}
function getDateFormat(dateData) {
  if (!dateData) {
    return ` `;
  }
  let getDate = new Date(dateData);

  // return `${getDate.getUTCDate()}/${getDate.getUTCMonth() + 1}/${getDate.getUTCFullYear()}`
  return `${getDate.getDate()}/${getDate.getMonth() + 1}/${getDate.getFullYear()}`;
}
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
  // NEW, IN_PROGRESS, BOOKING_CONFIRMED, CUSTOM_OFFER_SENT, HAPPENED, COMMISION_DUE, ARCHIEVE
  if (status == "NEW") return "blue";
  if (status == "IN_PROGRESS") return "yellow";
  if (status == "BOOKING_CONFIRMED") return "error";
  if (status == "CUSTOM_OFFER_SENT") return "primary";
  if (status == "HAPPENED") return "grey";
  if (status == "COMMISION_DUE") return "purple";
  if (status == "ARCHIEVE") return "orange";
  return "grey";
}
async function getEnquiryList(status) {
  const result = await getEnquiryData(status);
  items.value = result.data;
  console.log(result.data);
}
function routeToEnquiryMessage(id) {
  navigateTo({
    name: "country-enquiries-message-id",
    params: { country, id },
  });
}

function search() {
  if (selectedType.value === "") {
    filteredItems.value = items.value;
  } else {
    filteredItems.value = items.value.filter(
      (item) => item.status === selectedType.value,
    );
  }
}

onMounted(() => {
  console.log("HELLO MOUNTED", route);
});

// CREATED
initData();
</script>
