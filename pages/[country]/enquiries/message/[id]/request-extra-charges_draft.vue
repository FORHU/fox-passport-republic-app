<template>
  <v-row
    no-gutters
    class="bg-primaryBG py-10 px-5"
    justify="center"
    style="min-height: 100%"
  >
    <v-col cols="12" lg="10" xl="8">
      <v-stepper
        v-model="step"
        :items="items"
        class="bg-transparent"
        editable
        elevation="0"
        hide-actions
      >
        <template v-slot:item.1>
          <v-row no-gutters class="mt-5">
            <v-col class="mr-5">
              <v-row no-gutters>
                <v-form
                  @submit.prevent
                  v-model="formValid"
                  :key="step"
                  class="w-100"
                >
                  <v-card class="w-100 pa-7" elevation="5" rounded="lg">
                    <v-row class="pa-5">Request extra Charges</v-row>
                    <v-row class="pa-5">
                      <span>
                        The client has 2 business days to review the request
                        after which they’ll be charged automatically. You'll
                        receive the payout within 3 business days from
                        successful payment.
                        <!-- <span class="font-weight-bold">Learn more</span> -->
                      </span>
                    </v-row>
                    <v-row class="pa-5 font-weight-bold">
                      What extra charges do you want to request?
                    </v-row>
                    <v-row class="pl-10 pt-2">
                      <v-checkbox
                        class="mt-n10"
                        label="Additional hours (overtime)"
                      ></v-checkbox>
                    </v-row>
                    <v-row class="pl-10 pt-2">
                      <v-checkbox
                        class="mt-n11"
                        label="Additional services"
                      ></v-checkbox>
                    </v-row>
                    <v-row class="pl-10 pt-2">
                      <v-checkbox
                        class="mt-n11"
                        label="Damaged or missing items"
                      ></v-checkbox>
                    </v-row>

                    <v-divider class="my-7"></v-divider>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-btn
                          variant="outlined"
                          color="primary"
                          @click="handleBack"
                          >Back</v-btn
                        >
                      </v-col>
                      <v-col cols="6" align="end">
                        <v-btn
                          type="submit"
                          variant="flat"
                          color="secondary"
                          @click="handleContinue"
                          >Continue</v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-card>
                </v-form>
              </v-row>
            </v-col>
            <v-col cols="4">
              <v-card elevation="5" class="pa-7 py-10" rounded="lg">
                <v-row no-gutters class="text-h6 mt-n4 mb-5"
                  >Event Details</v-row
                >
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
        </template>

        <template v-slot:item.2>
          <v-row no-gutters class="w-100">
            <v-col class="mr-5">
              <v-form @submit.prevent v-model="form2Valid" class="w-100">
                <v-card rounded="lg" elevation="5" class="w-100 pa-7">
                  <v-row class="pa-5 text-h5 font-weight-bold"
                    >Add Details</v-row
                  >
                  <v-row class="pa-5">
                    <span>
                      The client has 2 business days to review the request after
                      which they'll be charged automatically. You'll receive the
                      payout within 3 business days from successful payment.
                      <!-- <span class="font-weight-bold">Learn more</span> -->
                    </span>
                  </v-row>
                  <v-row class="pa-5">
                    <v-card
                      variant="outlined"
                      rounded="lg"
                      width="100%"
                      height="100%"
                    >
                      <v-row class="pa-10 text-h5 font-weight-bold"
                        >Additional Services</v-row
                      >
                      <v-row class="pl-10 pr-10 pb-5 font-weight-bold"
                        >Request Charge</v-row
                      >
                      <v-row class="pl-10 pr-10">
                        <v-text-field variant="solo" :suffix="withGST ? 'inc. GST' : ''">
                        </v-text-field>
                      </v-row>
                      <v-row class="pl-10 pr-10 font-weight-bold"
                        >Add a note for (Client's name)</v-row
                      >
                      <v-row class="pl-10 pr-10 pb-5">
                        <v-textarea
                          variant="solo"
                          label="Let them know what extra charges you're requesting money for."
                        ></v-textarea>
                      </v-row>
                    </v-card>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="6">
                      <v-btn
                        variant="outlined"
                        color="primary"
                        @click="handleBack"
                        >Back</v-btn
                      >
                    </v-col>
                    <v-col cols="6" align="end">
                      <v-btn
                        type="submit"
                        variant="flat"
                        color="secondary"
                        @click="handleContinue2"
                        >Continue</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card>
              </v-form>
            </v-col>
            <v-col cols="4">
              <v-card elevation="5" class="pa-7 py-10" rounded="lg">
                <v-row no-gutters class="text-h6 mt-n4 mb-5"
                  >Event Details</v-row
                >
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
        </template>

        <template v-slot:item.3>
          <v-row no-gutters class="w-100">
            <v-col class="mr-5">
              <v-form @submit.prevent v-model="form3Valid" class="w-100">
                <v-card rounded="lg" elevation="5" class="w-100 pa-7">
                  <v-row class="pa-5 text-h5 font-weight-bold"
                    >Review the request</v-row
                  >
                  <v-row class="pa-5">
                    <span>
                      The client has 2 business days to review the request after
                      which they'll be charged automatically. You'll receive the
                      payout within 3 business days from successful payment.
                      <!-- <span class="font-weight-bold">Learn more</span> -->
                    </span>
                  </v-row>
                  <v-row class="pa-5">
                    <v-card
                      variant="outlined"
                      rounded="lg"
                      width="100%"
                      height="100%"
                    >
                      <v-row class="pa-10 text-h5 font-weight-bold"
                        >Estimated payout for extra charges</v-row
                      >
                      <v-row class="pl-10 pr-10">
                        <v-col cols="6">
                          <v-row>Additional services</v-row>
                        </v-col>
                        <v-col cols="6">
                          <v-row justify="end">S$330</v-row>
                        </v-col>
                      </v-row>
                      <v-row class="pl-10 pr-10">
                        <v-col cols="6">
                          <v-row>Total Guest Will Pay</v-row>
                        </v-col>
                        <v-col cols="6">
                          <v-row justify="end">S$330</v-row>
                        </v-col>
                      </v-row>
                      <v-row
                        class="pl-10 pr-10"
                        justify="end"
                        style="color: #8091af"
                        >{{ withGST ? '(GST included)' : ''}}</v-row
                      >
                      <v-row class="pl-10 pr-10 pb-5">
                        <v-col cols="6">
                          <v-row>Commission</v-row>
                        </v-col>
                        <v-col cols="6">
                          <v-row justify="end">-S$53.96</v-row>
                        </v-col>
                      </v-row>

                      <v-row class="pl-10 pr-10 pb-5 font-weight-bold">
                        <v-col cols="6">
                          <v-row>Estimated Payout</v-row>
                        </v-col>
                        <v-col cols="6">
                          <v-row justify="end">S$276.04 </v-row>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-row>

                  <v-divider class="mt-4 mb-4" />

                  <v-row class="pt-5 pl-5 pr-5">
                    <v-col cols="1">
                      <v-row class="pt-5">
                        <v-icon color="red">mdi-calendar-clock</v-icon>
                      </v-row>
                    </v-col>

                    <v-col cols="11">
                      <v-row class="font-weight-bold">
                        The client has 2 business days to review the request
                        after which they'll be charged automatically.
                      </v-row>
                    </v-col>
                  </v-row>

                  <v-row class="pl-5 pr-5">
                    <v-col cols="1"> </v-col>
                    <v-col cols="11">
                      <v-row class="font-weight-bold">
                        You'll receive the payout within business days from
                        successful payment.
                      </v-row>
                    </v-col>
                  </v-row>

                  <v-divider class="mt-4 mb-4" />
                  <v-row no-gutters>
                    <v-col cols="6">
                      <v-btn
                        variant="outlined"
                        color="primary"
                        @click="handleBack"
                        >Back</v-btn
                      >
                    </v-col>
                    <v-col cols="6" align="end">
                      <v-btn
                        type="submit"
                        variant="flat"
                        color="error"
                        @click="handleSendOffer"
                        >Send Request</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card>
              </v-form>
            </v-col>
            <v-col cols="4">
              <v-card elevation="5" class="pa-7 py-10" rounded="lg">
                <v-row no-gutters class="text-h6 mt-n4 mb-5"
                  >Event Details</v-row
                >
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
        </template>
      </v-stepper>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import MEnquiry from "~/models/enquiry.model";
const { withGST } = useTax();
const { country, currentCurrency } = useLocal();
const { enquiry, getEnquiry } = useEnquiry();
const { requiredInput, longDateFormat } = useUtils();
const { id } = useRoute().params;
const step = ref(1);
const formValid = ref(false);
const form2Valid = ref(false);
const form3Valid = ref(false);

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
    title: "Select a Reason",
    subtitle: "Update Booking Details",
    disabled: false,
  },
  { title: "Add Details", disabled: false },
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
const handleContinue2 = () => {
  if (!form2Valid.value) return;
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
  if (!form3Valid.value) return;

  navigateTo({ name: chatRoute, params: { country, id } });
};

onMounted(async () => {
  await fetchEnquiryData();
});
</script>

<style scoped></style>
