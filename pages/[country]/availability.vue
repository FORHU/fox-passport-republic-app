<template>
  <v-skeleton-loader :class="smAndDown ? 'mx-7' : 'mx-12 pa-16'" type="subtitle, actions, ossein" height="80vh"
    v-if="loader"></v-skeleton-loader>
  <v-row no-gutters class="d-flex justify-center py-10" v-else>
    <v-col cols="10">
      <v-row no-gutters>
        <v-col cols="12" class="d-flex justify-space-between">
          <span class="font-weight-bold text-22px">Availability Calendar for</span>
          <!-- <v-icon @click="isLightMode = !isLightMode" class="mr-2"
            >mdi-theme-light-dark</v-icon
          > -->
        </v-col>
        <v-col cols="12" class="mt-5">
          <v-row no-gutters>
            <v-col :cols="xs ? '12' : '3'">
              <v-autocomplete density="compact" :items="venueList" item-title="name" item-value="_id"
                v-model="selectedVenue" placeholder="Select Venue" rounded="lg">
                <template #item="{ item, props }">
                  <v-list-item-title class="pa-3" v-bind="props">
                    {{ sliceContent(item.raw.name, 30) }}
                  </v-list-item-title>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col :cols="xs ? '12' : '3'" :class="xs ? '' : 'ml-4'">
              <v-select placeholder="Select Space" :items="spaceList" :disabled="selectedVenue === null"
                item-title="name" item-value="_id" v-model="selectedSpace" rounded="lg"></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="4" md="4" lg="2">
              <v-btn variant="flat" @click="showCreateEventDialog = true" color="secondary" block
                prepend-icon="mdi-plus" v-if="canEdit">Create Event</v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="mt-5">
          <v-sheet :class="isLightMode ? 'is-light-mode' : ''" height="700px">
            <Qalendar :events="events" :config="config" @delete-event="handleDelete" @edit-event="handleEdit">
              <template #monthEvent="monthEventProps">
                <span :style="{ fontWeight: 'bold', cursor: 'pointer' }">
                  <v-icon :color="monthEventProps.eventData.color" icon="mdi-circle-medium"></v-icon>{{
                    monthEventProps.eventData.title }}</span>
              </template>
              <template #weekDayEvent="eventProps">
                <div :style="{
                  backgroundColor: `${eventProps.eventData.color}`,
                  color: 'black',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }">
                  <span>{{ eventProps.eventData.with }}</span>
                </div>
              </template>
            </Qalendar>
          </v-sheet>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <!-- <v-form class="bg-primaryBG py-5 w-100" v-else>
    <v-container>
      <v-row>
        <v-row class="pa-3">
          <v-col
            cols="12"
            xs="12"
            sm="6"
            md="5"
            lg="3"
            xl="3"
            xxl="3"
            :class="xs ? 'text-h6' : 'text-h5'"
          >
            <span class="font-weight-bold">Availability Calendar for</span>
          </v-col>
          <v-col cols="12" xs="12" sm="6" md="3" lg="3" xl="3" xxl="3">
            <v-select
              density="compact"
              :items="venueList"
              item-title="name"
              item-value="_id"
              v-model="selectedVenue"
              placeholder="Select Venue"
            ></v-select>
          </v-col>
          <v-col cols="8" sm="10" md="3" lg="3" xl="3" xxl="3">
          </v-col>
          <v-col
            cols="4"
            sm="2"
            md="1"
            lg="3"
            xl="3"
            xxl="3"
            class="d-flex justify-end"
            :class="xs ? 'd-flex flex-row' : ''"
          >
            <v-icon @click="isLightMode = !isLightMode" class="mr-2"
              >mdi-theme-light-dark</v-icon
            >
          </v-col>
          <CalendarSettingCalendarDialog
            @exitCalendarSettingDialog="exitCalendarSettingDialog"
            v-model="showCalendarSettingsDialog"
          />
        </v-row>
        <v-divider />
        <v-card width="100%" height="100%" variant="text">
          <v-container>
            <v-row>
              <v-col cols="12" xs="12" sm="4" md="3" lg="3" xl="3" xxl="3">
                <v-card
                  color="white"
                  :height="xs ? '200px' : '455px'"
                  width="100%"
                >
                  <v-container>
                    <span style="font-size: 22px; font-weight: bold"
                      >Individual Spaces</span
                    >
                    <br />
                    <v-select
                      placeholder="Select Space"
                      :items="spaceList"
                      :disabled="selectedVenue === null"
                      item-title="name"
                      item-value="_id"
                      v-model="selectedSpace"
                    ></v-select>
                    <br />
                    <v-btn
                      variant="flat"
                      @click="showCreateEventDialog = true"
                      class="mt-n7"
                      color="#8091AF"
                      block
                      prepend-icon="mdi-plus"
                      >Create Event</v-btn
                    >
                    <CalendarCreateEventDialog
                      @exitNewEventDialog="exitNewEventDialog"
                      v-model="showCreateEventDialog"
                      :venueList="venueList"
                      :spaceList="spaceList"
                      v-model:selectedVenue="selectedVenue"
                      v-model:selectedSpace="selectedSpace"
                      @addedSuccess="handleAddedEvent"
                    />
                  </v-container>
                </v-card>
              </v-col>
              <v-col cols="12" xs="12" sm="8" md="9" lg="9" xl="9" xxl="9">
                <v-sheet
                  :class="isLightMode ? 'is-light-mode' : ''"
                  height="100%"
                >
                  <Qalendar
                    :events="events"
                    :config="config"
                    @delete-event="handleDelete"
                    @edit-event="handleEdit"
                  >
                  </Qalendar>
                </v-sheet>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-row>
    </v-container>
  </v-form> -->
  <CalendarCreateEventDialog @exitNewEventDialog="exitNewEventDialog" v-model="showCreateEventDialog"
    :venueList="venueList" :spaceList="spaceList" v-model:selectedVenue="selectedVenue"
    v-model:selectedSpace="selectedSpace" @addedSuccess="handleAddedEvent" v-if="canEdit" />
  <DialogDeletePrompt v-model:delete="showPermanentlyDeletePrompt"
    prompt-title="Are you sure you want to PERMANENTLY delete this event?"
    prompt-text="Please note that this action can't be undone." agree-button-text="Delete" disagree-button-text="No"
    @disagree="showPermanentlyDeletePrompt = false" @agree="handlePermanentlyDelete" show-header-message
    v-if="canEdit" />
  <DialogEditEvent v-model:edit="showEditEventPrompt" agree-button-text="Update" disagree-button-text="Cancel"
    @disagree="showEditEventPrompt = false" @updatedSuccess="handleUpdateEvent" :venueList="venueList"
    :spaceList="spaceList" v-model:selectedVenue="selectedVenue" v-model:selectedSpace="selectedSpace"
    v-model:bookingData="bookingData" v-model:space="space" v-model:event="eventToEdit"
    v-if="canEdit" />
  <DialogSuccessWithButton v-model="showSucessDialog"
    :text="isUpdate ? 'Event updated successfully' : 'Event added successfully'" button-text="Got it!"
    @click="updateCalendar" v-if="canEdit" />
    <DialogCompleteAccountDetails />
</template>

<script setup>
import { Qalendar } from "qalendar";
import "qalendar/dist/style.css";
import { useDisplay } from "vuetify";
const { xs, smAndDown } = useDisplay();
const { getBooking, deleteBooking, getSpecificBooking } = useBookingAPI();
const { getSpaceList, getSpace, getAllSpacesWithoutPagination } = useSpace();
const { getAllVenueList } = useVenue();
const { sliceContent } = useUtils();
const spaceList = ref([]);
const venueList = ref([]);
let showCreateEventDialog = ref(false);
let showCalendarSettingsDialog = ref(false);
const isLightMode = ref(true);
const showPermanentlyDeletePrompt = ref(false);
const showEditEventPrompt = ref(false);
const showSucessDialog = ref(false);
const isUpdate = ref(false);
const loader = ref(false);
const selectedVenue = ref(null);
const selectedSpace = ref(null);
const bookingData = ref([]);
const confirmedEvents = ref([]);
const idToDelete = ref(null);
const eventToEdit = ref(null);
const space = ref(null);
const { isVenueMember, isVenueAdmin, isVenueOwner } = useAccess();

definePageMeta({
  middleware: ['auth', 'owner-admin-access']
});


const canEdit = computed(() => {
  return isVenueAdmin || isVenueOwner;
})

const handleDelete = (event) => {
  showPermanentlyDeletePrompt.value = true;
  idToDelete.value = event;
};

const handleEdit = async (id) => {
  eventToEdit.value = await getSpecificBooking(id);
  const { data: spaceData, error } = await getSpace(selectedSpace.value);
  const res = spaceData.value;
  space.value = res.data.data[0];

  showEditEventPrompt.value = true;
};

const handlePermanentlyDelete = async () => {
  loader.value = true;
  await deleteBooking(idToDelete.value);
  showPermanentlyDeletePrompt.value = false;
  updateCalendar();
  loader.value = false;
};

const handleAddedEvent = () => {
  showCreateEventDialog.value = false;
  isUpdate.value = false;
  showSucessDialog.value = true;
};

const handleUpdateEvent = () => {
  showEditEventPrompt.value = false;
  isUpdate.value = true;
  showSucessDialog.value = true;
};

const updateCalendar = async () => {
  loader.value = true;
  bookingData.value = await getBookingData(selectedSpace.value);
  getEvents(bookingData.value);
  loader.value = false;
};

const config = ref({
  locale: "en-US",
  week: {
    startsOn: "sunday",
    nDays: 7,
    scrollToHour: 5,
  },
  month: {
    showTrailingAndLeadingDates: false,
  },
  defaultMode: "month",
  isSilent: true,
  showCurrentTime: true,
});
let events = ref([]);

onMounted(async () => {
  try {
    loader.value = true;
    const statusFilter = `PUBLISHED,FOR_APPROVAL,SUSPENDED`; // filter for all venue api
    const { data: venueData } = await getAllVenueList(statusFilter);
    await getVenues(venueData.value?.data);
    selectedVenue.value = venueList.value[0]?._id || null;

    if (selectedVenue.value) {
      await getListSpace(selectedVenue.value);
      selectedSpace.value = spaceList.value[0]?._id || null;
    }
    loader.value = false;
  } catch (error) {
    console.error("Error loading venue or space data:", error);
  }
});

function exitNewEventDialog() {
  return (showCreateEventDialog.value = false);
}
function exitCalendarSettingDialog() {
  return (showCalendarSettingsDialog.value = false);
}
function getVenues(val) {
  let data = val;
  let venuesArr = data
    // .filter((space) => space.status !== 'DRAFT' && space.status !== 'INPROGRESS' && space.status !== 'DELETED' && space.status !== 'REJECTED')
    .sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    );
  venueList.value = venuesArr;
}

function getEvents(eventData) {
  const eventsContainer = [];
  const flatEventData = eventData;
  confirmedEvents.value = flatEventData.filter(
    (event) => event.status === "CONFIRMED"
  );

  const getRandomColor = () => {
    const colors = [
      "Red",
      "Green",
      "Blue",
      "Yellow",
      "Purple",
      "Pink",
      "Brown",
      "turquoise",
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex].toLowerCase();
  };

  confirmedEvents.value.forEach((event) => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    const formatDateTime = (dateString) => {
      const date = new Date(dateString);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    };

    const startTimeToShow = start.toLocaleString("en-GB", options);
    const endTimeToShow = end.toLocaleString("en-GB", options);

    const startTime = formatDateTime(start);
    const endTime = formatDateTime(end);
    const bookerName = `${event.optional_input !== null && event.optional_input?.first_name && event.optional_input?.first_name !== "" ? event.optional_input?.first_name : event.booker_user_first_name}
     ${event.optional_input !== null && event.optional_input?.last_name && event.optional_input?.last_name !== "" ? event.optional_input?.last_name : event.booker_user_last_name}`;

    eventsContainer.push({
      title: `${startTimeToShow} ${bookerName}`,
      with: `${bookerName}`,
      time: { start: startTime, end: endTime },
      color: getRandomColor(),
      isEditable: canEdit,
      location: event.space_name,
      topic:
        event.optional_input !== null &&
          event.optional_input?.email &&
          event.optional_input?.email !== ""
          ? event.optional_input?.email
          : event.booker_user_email,
      description: `${startTimeToShow}-${endTimeToShow} : ${bookerName} - ${event.total_guest !== null ? event.total_guest : ""} ${event.total_guest !== null ? "guests" : ""} @ ${event.space_name}`,
      id: event._id,
      isCustom: true,
    });
  });
  events.value = eventsContainer;
}

const getListSpace = async (id) => {
  try {
    const { data: spaceListResponse } = await getAllSpacesWithoutPagination(id);
    const spaces = spaceListResponse.value.data;
    let spacesArr = spaces
      .filter(
        (space) =>
          space.status !== "DRAFT" &&
          space.status !== "INPROGRESS" &&
          space.status !== "DELETED" &&
          space.status !== "REJECTED"
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      );
    spaceList.value = spacesArr;
  } catch (error) {
    console.error("Error:", error);
  }
};

const getBookingData = async (id) => {
  const bookingDataToReturn = ref([]);
  try {
    bookingDataToReturn.value = await getBooking(id);
  } catch (error) {
    console.error("Error:", error);
  }
  return bookingDataToReturn.value;
};

// watch(selectedVenue, async (venue) => {
//   if (venue) {
//     selectedSpace.value = null;
//     bookingData.value = [];
//     getEvents(bookingData.value);
//     await getListSpace(venue);
//   }
// });
watch(selectedVenue, async (newValue, oldValue) => {
  if (newValue) {
    selectedSpace.value = null;
    bookingData.value = [];
    getEvents(bookingData.value);
    await getListSpace(newValue);
  }
});

watch(selectedSpace, async (oldValue, newwVal) => {
  if (oldValue) {
    bookingData.value = await getBookingData(oldValue);
    getEvents(bookingData.value);
  }
});
</script>

<style scoped>
@import "qalendar/dist/style.css";
</style>
