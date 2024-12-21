<template>
  <v-form class="bg-primaryBG py-5">
    <v-row no-gutters class="pa-5">
      <v-col cols="2"></v-col>
      <v-col cols="8">
        <v-row>
          <v-col cols="7">
            <v-card class="pa-3" rounded="lg" width="100%" height="100%">
              <v-row class="pa-5 text-h5 font-weight-bold">
                Cancel Booking
              </v-row>
              <v-row class="pa-5">
                <v-alert
                  color="#FB8C00"
                  icon="mdi-alert-outline"
                  border="start"
                  elevation="2"
                  variant="tonal"
                >
                  <span style="color: black">
                    Cancellations by hosts are very difficult for clients and
                    may result in
                    <span class="font-weight-bold"
                      >penalties to your account.</span
                    >
                    The client will be
                    <span class="font-weight-bold">fully refunded</span> if you
                    cancel the booking.
                    <br />
                    <br />

                    Do not cancel bookings on a client's behalf. Instead, ask
                    them to cancel the booking themselves. Cancellations by
                    hosts are always fully refunded. Only cancellations by
                    clients are eligible for partial refunds and will follow
                    your
                    <span class="font-weight-bold">cancellation policy.</span>
                    <br />
                    <br />

                    If you have any questions about the cancellations process,
                    <span class="font-weight-bold">get in touch.</span>
                  </span>
                </v-alert>
              </v-row>
              <v-row class="pa-5">
                <v-card
                  variant="outlined"
                  rounded="lg"
                  width="100%"
                  height="100%"
                >
                  <v-row class="pl-10 pr-10 pt-10 font-weight-bold">
                    Tell Venue4use why you are cancelling
                  </v-row>
                  <v-row class="pl-10 pr-10 pt-4">
                    <v-select
                      label="Select a reason"
                      :items="admins"
                    ></v-select>
                  </v-row>
                  <v-row class="pl-10 pr-10 pt-4 font-weight-bold">
                    Write a message to (Client's name)
                  </v-row>
                  <v-row class="pl-10 pr-10 pt-4 pb-4">
                    <v-textarea
                      variant="solo"
                      label="Type a message"
                    ></v-textarea>
                  </v-row>
                </v-card>
              </v-row>
              <v-row class="pa-5">
                <v-card
                  variant="outlined"
                  rounded="lg"
                  width="100%"
                  height="100%"
                >
                  <v-row class="pa-10 text-h6 font-weight-bold">
                    Booking Summary
                  </v-row>
                  <v-row class="pl-10 pr-10 pt-4 pb-4">
                    <v-row class="pa-2">
                      <v-col cols="4">
                        <v-row style="color: #757575"> Price </v-row>
                      </v-col>
                      <v-col justify="end" cols="4">
                        <v-row justify="end" style="color: #757575">
                          Client Paid
                        </v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-row justify="end" style="color: #757575">
                          Refund Account
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row class="pa-2">
                      <v-col cols="4">
                        <v-row class="font-weight-bold"> Space Rental </v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-row justify="end">S$264</v-row>
                        <v-row justify="end">(GST included)</v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-row justify="end">S$264</v-row>
                        <v-row justify="end">(100% refund)</v-row>
                      </v-col>
                    </v-row>
                    <v-divider class="pa-2" />
                    <v-row class="pa-2">
                      <v-col cols="4">
                        <v-row class="font-weight-bold"> Total </v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-row justify="end">S$264</v-row>
                        <v-row justify="end">(GST included)</v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-row justify="end">S$264</v-row>
                      </v-col>
                    </v-row>
                    <v-divider class="pa-2" />
                    <v-row class="pa-2 pb-2">
                      <v-card width="100%" height="100%">
                        <v-row class="pa-5">
                          <v-col col="6">
                            <v-row class="font-weight-bold"
                              >Refund Account</v-row
                            >
                          </v-col>
                          <v-col col="6">
                            <v-row justify="end" style="color: #8091af"
                              >S$264</v-row
                            >
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-row>

                    <v-row class="pa-2 pb-6">
                      Once you submit the cancellation, the client will be fully
                      refunded. The refund will be paid to the client's original
                      payment method within 10 business days.
                    </v-row>
                  </v-row>
                </v-card>
                <v-divider class="mt-5 mb-5" />
                <v-row class="pa-2">
                  <v-col col="6">
                    <v-row>
                      <v-btn variant="outlined">Back</v-btn>
                    </v-row>
                  </v-col>
                  <v-col col="6">
                    <v-row justify="end">
                      <v-btn @click="openCancelBookingDialog()" color="error"
                        >Cancel Booking</v-btn
                      >
                      <ModalCancelBookingPrompt
                        @agree="sendCancelBooking"
                        @disagree="closeCancelBooking"
                        v-model="showCancelBookingDialog"
                        :showCancelBookingDialog="showCancelBookingDialog"
                      />
                    </v-row>
                  </v-col>
                </v-row>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="5">
            <v-card elevation="5" class="pa-7 py-10" rounded="lg">
              <v-row no-gutters class="text-h6 mt-n4 mb-5">Event Details</v-row>
              <v-row no-gutters align="center">
                <v-col cols="2">
                  <v-avatar size="50px">
                    <v-icon icon="mdi-account-circle" size="50px"></v-icon>
                  </v-avatar>
                </v-col>
                <v-col>
                  <v-row
                    no-gutters
                    class="text-h5 font-weight-bold"
                    style="line-height: 1.2"
                    >{{ customerFullName }}</v-row
                  >
                  <v-row
                    no-gutters
                    class="text-medium-disabled text-subtitle-2"
                    style="line-height: 1.2; opacity: 60%"
                    >{{ enquiry.user.email }}</v-row
                  >
                </v-col>
              </v-row>
              <v-row no-gutters class="my-7">
                <v-row no-gutters>
                  <v-col cols="12" class="text-h6 font-weight-black"
                    >Space</v-col
                  >
                  <v-col cols="12" class="text-h6 font-weight-regular"
                    >{{ enquiry.space.name || "" }} at
                    <span
                      class="font-weight-bold cursor-pointer text-decoration-underline"
                      @click="goToVenue"
                      >{{ enquiry.venue?.name }}</span
                    ></v-col
                  >
                </v-row>

                <v-col cols="12" class="text-h6 font-weight-black mt-5"
                  >Party for {{ enquiry.guests }} guests</v-col
                >
                <v-col cols="12" class="text-subtitle-1 font-weight-normal"
                  ><v-icon
                    icon="mdi-account-multiple-outline"
                    class="mr-3"
                    size="20"
                  ></v-icon
                  >{{ enquiry.type || "" }}
                  for
                  {{ enquiry.guests || 0 }} guests</v-col
                >

                <v-col
                  cols="12"
                  class="font-weight-regular text-subtitle-1"
                  justify="center"
                  ><v-icon
                    icon="mdi-calendar-blank-outline"
                    class="mr-3"
                    size="20"
                  ></v-icon>
                  {{ longDateFormat(enquiry.date.date) }} at
                  {{ enquiry.date.from }} - {{ enquiry.date.to }}</v-col
                >
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
// const { enquiry, getEnquiry } = useEnquiry();
let open = ["Select a reason"];
let admins = ref([
  "The guest booked the incorrect event type",
  "The booking violates the rules of my space",
  "The guest is unresponsive",
  "My space is no longer available",
  "Other",
]);
import MEnquiry from "~/models/enquiry.model";

const { country, currentCurrency } = useLocal();
const { enquiry, getEnquiry } = useEnquiry();
const { requiredInput, longDateFormat } = useUtils();
const { id } = useRoute().params;
const step = ref(1);
const formValid = ref(false);
const form2Valid = ref(false);
let showCancelBookingDialog = ref(false);

const offer = reactive({
  date: {
    date: "",
    from: "",
    to: "",
  },
  guests: null as number | null,
  total: null,
  description: "",
});

const chatRoute = "country-enquiries-message-id";

const items = [
  {
    title: "Booking Details",
    subtitle: "Update Booking Details",
    disabled: false,
  },
  { title: "Review", disabled: false },
];

const customerFullName = computed(() => {
  return `${enquiry.value.user.first_name} ${enquiry.value.user.last_name}`;
});

const fetchEnquiryData = async () => {
  const { data: enquiryData } = await getEnquiry(id as string);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
    offer.date.date = enquiry.value.date.date;
    offer.date.from = enquiry.value.date.from;
    offer.date.to = enquiry.value.date.to;
    offer.guests = enquiry.value.guests;
  }
};

const handleBack = () => {
  if (step.value == 1) {
    navigateTo({ name: chatRoute, params: { country, id } });
  } else {
    step.value--;
  }
};

const handleContinue = () => {
  if (!formValid.value) return;
  step.value++;
};

const goToVenue = () => {
  if (enquiry.value.venue._id) {
    navigateTo({
      name: "country-venues-management-venue-venueId",
      params: { country, venueId: enquiry.value.venue._id },
    });
  }
};

const handleSendOffer = async () => {
  if (!form2Valid.value) return;

  navigateTo({ name: chatRoute, params: { country, id } });
};

const openCancelBookingDialog = () => {
  showCancelBookingDialog.value = true;
};
function closeCancelBooking() {
  showCancelBookingDialog.value = false;
}
function sendCancelBooking() {
  showCancelBookingDialog.value = false;
  console.log("Will Cancel Booking");
}
onMounted(async () => {
  await fetchEnquiryData();
});
</script>

<style scoped>
.selected-item {
  background-color: black;
  color: white;
}
</style>
