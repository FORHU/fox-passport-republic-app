<template>
  <v-row class="pa-2 py-5 pa-sm-5 bg-primaryBG" justify="center" style="min-height: 100svh">
    <v-col style="position: relative; max-width: 1300px">
      <v-row no-gutters>
        <v-col cols="12" class="mb-2 mb-sm-3">
          <v-row no-gutters class="text-secondary" justify="space-between">
            <v-btn variant="text" density="comfortable" class="text-subtitle-1 text-sm-h6"
              prepend-icon="mdi-chevron-left" @click="handleBackButton">
              All Enquiries</v-btn>
            <v-btn v-if="!mdAndUp" variant="flat" color="primary" prepend-icon="mdi-information-outline"
              class="text-caption text-sm-subtitle-1" @click="showEnquiryDetails = true">
              Show Enquiry Details</v-btn>
          </v-row>
        </v-col>
        <v-col class="mr-0 mr-md-5">
          <v-card v-if="loading" elevation="5" rounded="lg" min-height="12svh">
            <LoadingChat :lines="1" />
          </v-card>

          <!-- ENQUIRY STATUS -->
          <v-card v-if="!loading" elevation="5" class="px-5 px-sm-7 py-3 py-sm-5 mb-2 mb-sm-5" rounded="lg">
            <v-row no-gutters align="center">
              <v-col cols="12">
                <v-row no-gutters class="font-weight-bold text-subtitle-1 text-sm-h6 mb-2" :class="[
                  bookingCancelled || offerDeclined
                    ? 'text-error'
                    : 'text-primary ',
                ]" style="line-height: 1">{{ infoMessage?.title }}</v-row>
                <v-row no-gutters class="text-caption text-sm-subtitle-1 mt-1" style="line-height: 1">{{
                  infoMessage?.subtitle }}</v-row>
              </v-col>
              <!-- INFO BUTTONS -->
              <v-row v-if="isVenueOwner" no-gutters class="mt-2 mt-sm-5">
                <v-col v-if="
                  newEnquiry ||
                  offerDeclined ||
                  bookingWithdrawn ||
                  bookingRequestDeclined
                ">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="goToCreateOffer">{{
                      offerDeclined ? "Create New Offer" : "Create Offer"
                    }}</v-btn>
                </v-col>
                <v-col v-if="customOfferSent || paymentFailed">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    :loading="updateOfferProcessing" @click="goToOffer('update')">Update offer</v-btn>
                </v-col>

                <v-col v-if="bookingRequested" class="d-flex flex-wrap ga-1 ga-md-2">
                  <v-btn variant="flat" color="primary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="handleApproveBookingRequest" :loading="approvingRequest">Approve Booking Request</v-btn>
                  <v-btn variant="flat" color="error" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    :loading="processingDeclineBookingRequest" @click="handleDeclineBookingRequest">Decline Booking
                    Request</v-btn>
                </v-col>
                <v-row v-if="bookingConfirmed" no-gutters class="w-100">
                  <v-col>
                    <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                      class="text-uppercase mr-5" @click="goToOffer('review-booking')">Review Booking</v-btn>
                    <v-btn v-if="bookingConfirmed && !isAdmin" variant="outlined" :size="smAndUp ? 'default' : 'small'"
                      color="error" class="text-uppercase" @click="goToOffer('cancel-booking')">Cancel Booking</v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="bookingHappened" no-gutters class="w-100">
                  <v-col>
                    <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                      class="text-uppercase mr-5" @click="goToOffer('review-booking')">Review Booking</v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="bookingCancelled" no-gutters class="w-100">
                  <v-col class="d-flex ga-1 ga-sm-2 flex-wrap">
                    <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                      @click="goToOffer('cancellation-details')">View Cancellation Details</v-btn>
                    <v-btn variant="flat" :size="smAndUp ? 'default' : 'small'" color="primary" class="text-uppercase"
                      disabled @click="goToSupport">Contact Venue4use Support</v-btn>
                  </v-col>
                </v-row>
              </v-row>

              <v-row v-else-if="isUser" no-gutters class="mt-5">
                <v-col v-if="
                  newEnquiry ||
                  offerDeclined ||
                  bookingWithdrawn ||
                  bookingRequestDeclined
                " class="d-flex ga-1 ga-sm-2 flex-wrap">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="handleFindSimilarVenues">Find similar Venues</v-btn>
                  <v-btn v-if="userCanBook" variant="flat" color="primary" :size="smAndUp ? 'default' : 'small'"
                    class="text-uppercase" @click="handleRequestToBook">Request to book</v-btn>
                </v-col>

                <v-col v-if="customOfferSent">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                    class="text-uppercase mr-5" @click="goToOffer('view')">View Offer</v-btn>
                  <v-btn v-if="!isAdmin" variant="outlined" color="error" :size="smAndUp ? 'default' : 'small'"
                    class="text-uppercase" @click="showDeclinePrompt = true">Decline Offer</v-btn>
                </v-col>

                <v-col v-if="bookingRequested">
                  <v-btn variant="flat" color="error" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    :loading="withdrawBookingProcessing" @click="handleWithdrawBookingRequest">Withdraw Booking</v-btn>
                </v-col>

                <v-col v-if="offerAccepted" class="d-flex ga-2 flex-wrap">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="goToOffer('payment')">Go to Payment</v-btn>

                  <v-btn variant="outlined" color="error" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="showDeclinePrompt = true">Decline Offer</v-btn>
                </v-col>

                <v-col v-if="paymentFailed || paymentInProgress">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                    class="text-uppercase mr-5" @click="goToOffer('payment')">Go to Payment</v-btn>
                </v-col>

                <v-col v-if="bookingConfirmed" class="d-flex ga-1 ga-md-2 flex-wrap">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="goToOffer('review-booking')">Review Booking</v-btn>
                  <v-btn v-if="bookingConfirmed" variant="outlined" :size="smAndUp ? 'default' : 'small'" color="error"
                    class="text-uppercase" @click="goToOffer('cancel-booking')">Cancel Booking</v-btn>
                  <v-btn variant="flat" color="primary" :size="smAndUp ? 'default' : 'small'" class="text-uppercase"
                    @click="goToOffer('receipt')">View Receipt</v-btn>
                </v-col>

                <v-row v-if="bookingHappened" no-gutters class="w-100">
                  <v-col>
                    <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                      class="text-uppercase mr-5" @click="goToOffer('review-booking')">Review Booking</v-btn>
                  </v-col>
                </v-row>

                <v-col v-if="bookingCancelled">
                  <v-btn variant="flat" color="secondary" :size="smAndUp ? 'default' : 'small'"
                    class="text-uppercase mr-5" @click="goToOffer('cancellation-details')">View Cancellation
                    Details</v-btn>
                </v-col>
              </v-row>
            </v-row>
          </v-card>
          <!-- ENQUIRY STATUS -->

          <!-- CHAT BOX -->
          <v-card v-if="loading" elevation="5" rounded="lg" min-height="15svh" class="mt-2 mt-lg-5">
            <LoadingChat :lines="10" />
          </v-card>
          <v-card v-else elevation="5" rounded="lg" :key="chatKey">
            <v-card color="white" width="100%" :height="mdAndUp ? '5svh' : '2svh'" elevation="0"></v-card>
            <!-- CHAT BOX -->
            <v-infinite-scroll :height="mdAndUp ? '70svh' : '50svh'" side="start"
              class="px-4 px-sm-7 py-16 d-flex ga-2 ga-sm-5" @load="loadMoreConversations">
              <template v-for="(item, index) in filteredConversation" :key="`${item.createdAt}-${index}`">
                <template v-if="item.admin_generated">
                  <EnquiryDetailsBox :admin-key="item.key" :content="item.generated_content"
                    :created-at="item.createdAt || ''" :sender="{
                      first_name: item.sender.first_name || '',
                      last_name: item.sender.last_name || '',
                      _id: item.sender._id || '',
                    }" />
                </template>

                <template v-if="item.admin_generated">
                  <EnquiryStatusMessage :admin-key="item.key" :sender="{
                    first_name: item.sender.first_name || '',
                    last_name: item.sender.last_name || '',
                    _id: item.sender._id || '',
                  }" :created-at="item.createdAt || ''" class="my-2" />
                </template>

                <template v-if="item.key == 'REQUEST_PHONE_NUMBER'">
                  <EnquiryPhoneNumber :content="item.generated_content" :admin-key="item.key" :sender="{
                    first_name: item.sender.first_name || '',
                    last_name: item.sender.last_name || '',
                    _id: item.sender._id || '',
                  }" :created-at="item.createdAt || ''" class="my-2" />
                </template>

                <template v-else-if="
                  !item.admin_generated && item.sender._id == currentUser._id
                ">
                  <EnquirySentMessageBubble :message="item.content" :sender="{
                    first_name: item.sender.first_name || '',
                    last_name: item.sender.last_name || '',
                    _id: item.sender._id || '',
                  }" :time-stamp="timeStampDate(item.createdAt as string)" :attachments="item.attachments || []"
                    class="my-2" @show-image="handleShowImage" />
                </template>

                <template v-else-if="
                  !item.admin_generated &&
                  item.sender._id !== currentUser._id &&
                  item.sender !== currentUser._id
                ">
                  <EnquiryReceivedMessageBubble :message="item.content" :sender="{
                    first_name: item.sender.first_name || '',
                    last_name: item.sender.last_name || '',
                    _id: item.sender._id || '',
                  }" :attachments="item.attachments || []" :time-stamp="timeStampDate(item.createdAt as string)"
                    class="my-2" @show-image="handleShowImage" />
                </template>
                <!-- <EnquiryContactNumberBox :customer-name="'Felicia'" :contact-name="'Harris John Manrique'"
            :time-stamp="'26/03/2024 11:36'" :contact-number="'+65 94236187'" />
          <EnquiryBookingBox :customer-requested-to-book="true" :customer-name="'Felicia'" :guests-count="60"
            event-type="Party" :space-name="'Entire Venue'" :venue-name="'Venue Name'" :date="'Saturday,  20 June 2024'"
            :time-from="'07:00'" :time-to="'18:00'" :own-catering="true" :time-stamp="'26/03/2024 11:36'"
            :total-cost="'S$300'" />

          <EnquiryBookingBox :owner-approved-request="true" :owner-name="'Harris John Manrique'"
            :customer-name="'Felicia'" :guests-count="60" event-type="Party" :space-name="'Entire Venue'"
            :venue-name="'Venue Name'" :date="'Saturday,  20 June 2024'" :time-from="'07:00'" :time-to="'18:00'"
            :own-catering="true" :time-stamp="'26/03/2024 11:36'" :total-cost="'S$300'" /> -->
              </template>

              <template v-slot:empty> </template>
            </v-infinite-scroll>

            <v-card color="white" class="bg-error pa-3 pa-sm-7">
              <v-row v-if="!isAdmin" no-gutters>
                <v-col cols="12">
                  <v-textarea no-resize v-model="inputMessage" :rows="mdAndUp ? 5 : 2" placeholder="Type a message"
                    variant="solo" hide-details>
                  </v-textarea>
                  <!-- UPLOAD FILES CONTAINER -->
                  <v-card v-if="inputFileArr.length > 0" elevation="3" class="w-100 mt-1 pa-2" min-height="50">
                    <template v-for="item in inputFileArr">
                      <AttachmentChip :file-data="item" @click=""
                        @remove-attachment="handleRemoveAttachment(item._id)" />
                    </template>
                  </v-card>
                  <!-- UPLOAD FILES CONTAINER -->
                </v-col>
                <v-row no-gutters class="mx-sm-2 mt-2 mt-sm-5" justify="space-between">
                  <v-col cols="8" md="8">
                    <v-btn v-if="!isUser" color="secondary" @click="showChatTemplateModal = true"
                      class="mr-1 mr-sm-3 text-caption text-md-subtitle-1">Use Template</v-btn>
                    <ButtonFileUploader v-model="inputFileArr" :label="mdAndUp ? 'Attach Files' : 'Upload'"
                      uploader-id="chat-upload-file" />
                  </v-col>
                  <v-col cols="4" md="3" align="end">
                    <v-btn color="primary" @click="sendMessage" :disabled="sendingMessage"
                      class="text-caption text-md-subtitle-1">Send Message</v-btn>
                  </v-col>
                </v-row>
              </v-row>
            </v-card>
          </v-card>
        </v-col>
        <v-col v-if="mdAndUp" cols="4">
          <v-card v-if="loading" elevation="5" rounded="lg" min-height="15svh">
            <LoadingChat :lines="6" />
          </v-card>

          <EnquiryDetailsCardCustomer v-if="!loading && isUser" :enquiry="enquiry" :owner-full-name="ownerFullName"
            :space="space" @show-number="requestShowPhoneNumber" @go-to-space="goToSpace" />
          <EnquiryDetailsCardOwner v-if="!loading && !isUser" :enquiry="enquiry" :customer-full-name="customerFullName"
            @go-to-space="goToSpace" />
        </v-col>
      </v-row>
    </v-col>
    <ModalDeclineOfferPrompt v-model="showDeclinePrompt" @disagree="showDeclinePrompt = false"
      @agree="handleDeclineOffer" />
    <ModalChatTemplateModal v-model:template="showChatTemplateModal" v-model:message="inputMessage"
      v-model:files="inputFileArr" :enquiry="enquiry" />
    <CarouselImageViewer v-model:images="imagesArray" v-model:show="showImageCarousel"
      :active-image-id="activeImageId || ''" />
    <EnquiryModal v-model:show="showEnquiryDetails">
      <EnquiryDetailsCardCustomer v-if="isUser" :enquiry="enquiry" :owner-full-name="ownerFullName" :space="space"
        @show-number="requestShowPhoneNumber" close-button @close="showEnquiryDetails = false"
        @go-to-space="goToSpace" />
      <EnquiryDetailsCardOwner v-else :enquiry="enquiry" :customer-full-name="customerFullName" close-button
        @close="showEnquiryDetails = false" @go-to-space="goToSpace" />
    </EnquiryModal>

    <EnquiryPhoneNumberWarning v-model="showPhoneNumberWarning" />
  </v-row>
</template>

<script setup lang="ts">
import { io, type Socket } from "socket.io-client";
import MSpace from "~/models/space.model";
import MEnquiry from "~/models/enquiry.model";
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp, mdAndDown } = useDisplay();
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { errorMessages } from "vue/compiler-sfc";
import MOffer from "~/models/offer.model";

definePageMeta({
  layout: "enquiry-chat",
});

type TEnquiryContent = {
  event_date: string;
  event_type: string;
  guests: string | number;
  message: string;
  space_name: string;
  timeFrom: string;
  timeTo: string;
  venue_name: string;
  own_catering: boolean;
};

type TMessageInbox = {
  admin_generated: boolean;
  attachments: any[];
  content: string;
  createdAt: string | null;
  inbox: string;
  generated_content: TEnquiryContent;
  _id: string;
  sender: {
    first_name: string;
    last_name: string;
    _id: string;
  };
};

const { country, currentCurrency, setSnackbar } = useLocal();
const { enquiry, getEnquiry, updateEnquiry } = useEnquiry();
const { convertTimeToAMPM, longDateFormat, timeStampDate, phoneRegex } =
  useUtils();
const {
  socket,
  getMessages,
  connect,
  emitChat,
  conversation,
  chatKey,
  removeListener,
  socketEmitKey,
} = useChat();
const { activeStatus, venue } = useVenue();
const { cookieOptions, currentUser } = useLocalAuth();
const { getSpace } = useSpace();
const { id } = useRoute().params;
const publicConfig = useRuntimeConfig().public;
const showDeclinePrompt = ref(false);

const accesToken = useCookie("accessToken", cookieOptions).value;
const runtime = useRuntimeConfig();

const inputMessage = ref("");
const inputFileArr = ref<File[]>([]);
const loading = ref(true);
const limit = ref(10);
const page = ref(1);
const totalPages = ref(0);
// const filteredConversation = ref<TMessageInbox[]>([]);
const space = ref();
const offer = ref();
const showPhoneNumberWarning = ref(false);
const phoneNumberWarningShownAlready = ref(false);
const sendingMessage = ref(false);
const removeNumberCensor = ref(false);
const filteredConversation = ref<TMessageInbox[]>([]);
const showImageCarousel = ref(false);
const activeImageId = ref<string | null>(null);
const showEnquiryDetails = ref(false);
const activeCustomOfferData = ref<TOffer | null>(new MOffer());

const showChatTemplateModal = ref(false);

const somethingWentWrongMessage = {
  modal: true,
  text: "Something went wrong. Please contact the administrator.",
  color: "error",
};

const customerFullName = computed(() => {
  const user = enquiry.value?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const ownerFullName = computed(() => {
  const user = enquiry.value?.venue?.user;
  const parts = [user?.first_name, user?.last_name].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
});

const cateringOptionsList = computed(() => {
  if (enquiry.value.catering_options) {
    const arr = enquiry.value.catering_options
      .filter((x) => x.value)
      .map((x) => x.name);
    if (arr && arr.length > 0) {
      return arr.join(", ");
    }
  } else return "";
});

const reverseData = () => {
  conversation.value = conversation.value.reverse();
};

watchEffect(() => {
  const uniqueArray = conversation.value.filter((value, index, self) => {
    return (
      self.findIndex(
        (item) =>
          item.createdAt == value.createdAt && item.content == value.content,
      ) == index
    );
  });

  filteredConversation.value = uniqueArray;
});

// watch input message for phone number
watch(
  inputMessage,
  (newVal) => {
    const valReplaced = newVal.replace(/\s/g, ""); // Remove all spaces from newVal

    if (phoneRegex.test(valReplaced) && !phoneNumberWarningShownAlready.value) {
      setTimeout(() => {
        showPhoneNumberWarning.value = true;
        phoneNumberWarningShownAlready.value = true;
      }, 500);
    }
  },
  { immediate: false },
);

watch(socketEmitKey, () => {
  fetchEnquiryData();
  fetchCustomOffer();
});

const fetchEnquiryData = async () => {
  let query: any = {};
  if (removeNumberCensor.value && enquiry.value._id) {
    query.toggle_censor = true;
  }
  if (!id) return;
  const { data: enquiryData } = await getEnquiry(id as string, query);
  if (enquiryData && enquiryData.value) {
    const res = enquiryData.value as any;
    if (!res.data || !res.data.data) return;
    enquiry.value = new MEnquiry(res.data.data);
  } else {
    enquiry.value = new MEnquiry();
  }
};

const joinRoom = async () => {
  await assignConversation();
  await connect(publicConfig, accesToken as string);
  await emitChat(SOCKET_EVENTS.JOIN_ROOM, {
    room_id: enquiry.value.inbox?.room_id,
  });
};

const assignConversation = async () => {
  page.value = 1;
  try {
    const { data } = await getMessages({
      page: page.value,
      limit: limit.value,
      room_id: enquiry.value.inbox?.room_id,
    });
    if (data && data.value) {
      const res = data.value as any;
      if (!res.data || !res.data.data) return;
      conversation.value = res.data.data;
      totalPages.value = res.data.total_pages;
      reverseData();
    }
  } catch (e) {
    console.log(e);
  }
};

const sendMessage = async () => {
  if (inputMessage.value.length == 0 && inputFileArr.value.length == 0) return;
  sendingMessage.value = true;
  await emitChat(SOCKET_EVENTS.SEND_MESSAGE_ROOM, {
    message: inputMessage.value,
    attachments: inputFileArr.value.map((x) => x._id),
    room_id: enquiry.value.inbox?.room_id,
  });
  sendingMessage.value = false;
  inputMessage.value = "";
  inputFileArr.value = [];
  chatKey.value++;

  // console.log(conversation.value);

  // await assignConversation();
};

const isVenueOwner = computed(() => {
  return currentUser.value?.role === "VENUE_OWNER";
});

const isUser = computed(() => {
  return currentUser.value?.role === "USER";
});

const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

const userCanBook = computed(() => {
  return space.value?.pricing?.selected_pricing == "HIRE_FEE";
});

const newEnquiry = computed(() => {
  return enquiry.value.status == "NEW" || enquiry.value.status == "IN_PROGRESS";
});

const bookingRequested = computed(() => {
  return enquiry.value.status == "BOOKING_REQUESTED";
});

const offerDeclined = computed(() => {
  return enquiry.value.status == "DECLINED";
});

const customOfferSent = computed(() => {
  return enquiry.value.status == "CUSTOM_OFFER_SENT";
});

const offerAccepted = computed(() => {
  return enquiry.value.status == "OFFER_ACCEPTED";
});

const paymentFailed = computed(() => {
  return enquiry.value.status == "PAYMENT_FAILED";
});
const paymentInProgress = computed(() => {
  return enquiry.value.status == "PAYMENT_IN_PROGRESS";
});

const bookingWithdrawn = computed(() => {
  return enquiry.value.status == "BOOKING_REQUEST_WITHDRAWN";
});

const bookingRequestDeclined = computed(() => {
  return enquiry.value.status == "BOOKING_REQUEST_DECLINED";
});

const bookingConfirmed = computed(() => {
  return (
    enquiry.value.status == "BOOKING_CONFIRMED"
  );
});

const bookingHappened = computed(() => {
  return (
    enquiry.value.status == "HAPPENED"
  );
});

const bookingCancelled = computed(() => {
  return enquiry.value.status == "CANCELLED";
});

const cancelledTitleDescription = computed(() => {
  const cancelledByCustomer = enquiry.value.cancelledBy.role == "USER";
  // return `${(isVenueOwner.value && !cancelledByCustomer.value) ? 'You' : ownerFullName.value} cancelled this booking`

  if (isVenueOwner.value) {
    if (cancelledByCustomer) {
      return `${customerFullName.value} cancelled this booking`;
    } else {
      return `You cancelled this booking`;
    }
  } else if (isUser.value) {
    if (cancelledByCustomer) {
      return `You cancelled this booking`;
    } else {
      return `The venue owner cancelled this booking`;
    }
  } else {
    if (cancelledByCustomer) {
      return `${customerFullName.value} cancelled this booking`;
    } else {
      return `${ownerFullName.value} cancelled this booking`;
    }
  }
});

const infoMessage = computed(() => {
  const customer = customerFullName.value;
  if (!isUser.value) {
    if (newEnquiry.value) {
      return {
        title: `${customer} enquired about your space`,
        subtitle:
          "Send your guest a custom offer to let them book and pay online.",
      };
    } else if (customOfferSent.value) {
      return {
        title: `${isVenueOwner.value ? "You" : ownerFullName.value} have created an offer for ${customer}`,
        subtitle: "Awaiting for customer's review.",
      };
    } else if (bookingRequested.value) {
      return {
        title: `${customer} has requested to book your venue`,
        subtitle:
          "Please review and accept this booking request if it is available.",
      };
    } else if (offerAccepted.value) {
      return {
        title: `${customer} has accepted your offer`,
        subtitle: "Please advise customer to proceed with payment.",
      };
    } else if (offerDeclined.value) {
      return {
        title: `${customer} has declined your offer`,
        subtitle: "You can create a new offer.",
      };
    } else if (paymentFailed.value) {
      return {
        title: `Payment transaction of ${customer} did not push through`,
        subtitle: "Please advise customer to update card details.",
      };
    } else if (paymentInProgress.value) {
      return {
        title: `Payment transaction of ${customer} is in progress`,
        subtitle: "Please wait for the customer to finish the transaction.",
      };
    } else if (bookingWithdrawn.value) {
      return {
        title: `${customer} have withdrawn booking request`,
        subtitle:
          "Please contact the client for further assistance or you can use the Create offer button to create a new offer.",
      };
    } else if (bookingRequestDeclined.value) {
      return {
        title: `You have declined ${customer}'s booking request`,
        subtitle:
          "Please contact the client for further assistance or you can use the Create offer button to create a new offer.",
      };
    } else if (bookingConfirmed.value) {
      return {
        title: "This booking is confirmed and paid",
        subtitle:
          "Your ratings have significantly improved and you will receive more high quality enquiries from us.",
      };
    } else if (bookingHappened.value) {
      return {
        title: "This booking has been successfully fulfilled.",
        subtitle:
          "Your ratings have significantly improved and you will receive more high quality enquiries from us.",
      };
    } else if (bookingCancelled.value) {
      return {
        title: cancelledTitleDescription.value,
        subtitle:
          "The client will be refunded based on venue's cancellation policy. The refund will be paid to the original payment method within 10 business days",
      };
    }

    // CUSTOMER INFO
  } else {
    if (newEnquiry.value) {
      return {
        title: "Enquiry Sent",
        subtitle: userCanBook.value
          ? "Let the Venue Manager know about your specific space needs. This space is not confirmed yet and may be booked by other guests. Use the Request to book button to send a booking request and reserve your date."
          : "Let the Venue Manager know about your specific space needs. This space is not confirmed yet and may be booked by other guests. Request an offer from the venue owner using the chat feature.",
      };
    } else if (customOfferSent.value) {
      return {
        title: `Book now to secure this date`,
        subtitle:
          "If you book later, there’s a chance the price will go up or the venue will be booked out.",
      };
    } else if (bookingRequested.value) {
      return {
        title: `Your booking request is sent`,
        subtitle:
          "This isn’t a confirmed booking - yet. You’ll get a response from a host within 2 business days. Your card won’t be charged until your booking is confirmed.",
      };
    } else if (offerAccepted.value) {
      return {
        title: `You have accepted the offer`,
        subtitle: "Proceed to payment now to secure this booking.",
      };
    } else if (offerDeclined.value) {
      return {
        title: `You have declined the offer`,
        subtitle: "Please request an updated offer to the venue owner.",
      };
    } else if (paymentFailed.value) {
      return {
        title: `Your payment transaction did not push through`,
        subtitle: "Please update your card details.",
      };
    } else if (paymentInProgress.value) {
      return {
        title: `Your payment transaction is in progress`,
        subtitle: "Click the button to continue.",
      };
    } else if (bookingWithdrawn.value) {
      return {
        title: "You have withdrawn your booking request",
        subtitle:
          "You can use the request to book button to send a new booking request.",
      };
    } else if (bookingRequestDeclined.value) {
      return {
        title: "The venue owner has declined your booking request",
        subtitle:
          "You can use the request to book button to send a new booking request.",
      };
    } else if (bookingConfirmed.value) {
      return {
        title: "This booking is confirmed and paid",
        subtitle:
          "Thank you for booking with Venue4use! You can continue the conversation with the host if you need to discuss/update the details of the booking.",
      };
    } else if (bookingHappened.value) {
      return {
        title: "This booking has been successfully fulfilled.",
        subtitle:
          "Thank you for booking with Venue4use! You can continue the conversation with the host if you need to settle anything from the happened booking.",
      };
    }
    else if (bookingCancelled.value) {
      return {
        title: cancelledTitleDescription.value,
        subtitle:
          "You will be refunded based on the venue's cancellation policy. The refund will be paid to your original payment method within 10 business days",
      };
    }
  }
});

// chat back button conditions
const handleBackButton = () => {
  if (currentUser.value?.role === "USER") {
    navigateTo({ name: "country-enquiries", params: { country } });
  } else {
    navigateTo({
      name: "country-enquiries-status-status",
      params: { country, status: "all" },
    });
  }
};

const requestShowPhoneNumber = async () => {
  await emitChat(SOCKET_EVENTS.REQUEST_PHONE_NUMBER, {
    room_id: enquiry.value.inbox?.room_id,
    key: "REQUEST_PHONE_NUMBER",
    enquiry_id: enquiry.value._id,
  });
  removeNumberCensor.value = true;
  await fetchEnquiryData();
};

// const scrollToBottom = () => {
//   const container = document.getElementById("conversation-container");
//   if (container) {
//     console.log("Container found:", container);
//     console.log("Scroll Height:", container.scrollHeight);
//     container.scrollTop = container.scrollHeight;
//   } else {
//     console.log("Container not found!");
//   }
// };

const handleRequestToBook = () => {
  navigateTo(`/${country}/enquiries/message/${id}/request-to-book`);
};

const loadMoreConversations = async ({ done }: any) => {
  if (page.value == totalPages.value || totalPages.value <= 1) {
    done("empty");
    return;
  }
  page.value++;

  if (totalPages.value == 0) return;
  const { data } = await getMessages({
    page: page.value,
    limit: limit.value,
    room_id: enquiry.value.inbox?.room_id,
  });

  if (data && data.value) {
    const res = data.value as any;
    if (!res.data || !res.data.data) return;
    conversation.value = [
      ...res.data.data.reverse(),
      ...conversation.value,
    ] as any;
    totalPages.value = res.data.total_pages;
    done("ok");
  }
};

// get space data
const fetchSpaceData = async () => {
  if (!enquiry.value.space._id) return;
  const { data: spaceData, error } = await getSpace(
    enquiry.value.space._id as string,
  );
  if (spaceData) {
    const res = spaceData.value as any;
    space.value = new MSpace(res?.data?.data[0]);
  }
};

const goToSpace = () => {
  const spaceId = enquiry.value.space._id as string;
  if (spaceId) {
    navigateTo({
      name: "country-venues-venue",
      params: { country, venue: spaceId },
    });
  }
};

const updateOffer = () => {
  // const offer_mode = useCookie('offer_mode')
  // offer_mode.value = 'update'
  navigateTo({
    name: "country-enquiries-message-id-custom-offer",
    params: { country, id },
  });
};

// fetch offer
const fetchCustomOffer = async () => {
  const { data } = await useAPI("/v1/custom-offer", {
    query: {
      inbox_id: enquiry.value.inbox?._id,
      //  status: 'PENDING,BOOKING_CONFIRMED'
    },
  });

  if (data && data.value) {
    const res = data.value as any;
    if (res.data && res.data[0] && res.data[0]._id) {
      activeCustomOfferData.value = new MOffer(res.data[0]);
    }
  }
};

const updateOfferProcessing = ref(false);

const goToOffer = async (
  mode:
    | "update"
    | "view"
    | "payment"
    | "review-booking"
    | "cancel-booking"
    | "receipt"
    | "cancellation-details",
) => {
  updateOfferProcessing.value = true;
  await fetchCustomOffer();

  const custom_offer_id = activeCustomOfferData.value?._id || null;

  if (!custom_offer_id) return;

  if (mode == "update") {
    navigateTo({
      name: "country-enquiries-message-id-update-offer-custom_offer_id",
      params: { country, custom_offer_id },
    });
  } else if (mode == "view") {
    navigateTo({
      name: "country-enquiries-message-id-view-offer-custom_offer_id",
      params: { country, custom_offer_id },
    });
  } else if (mode == "payment") {
    if (custom_offer_id) {
      navigateTo(
        `/${country}/enquiries/message/${id}/view-offer/${custom_offer_id}`,
      );
    } else {
      navigateTo(`/${country}/enquiries/message/${id}/request-to-book`);
    }
  } else if (mode == "review-booking") {
    navigateTo({
      name: "country-enquiries-message-id-review-booking-custom_offer_id",
      params: { country, custom_offer_id },
    });
  } else if (
    mode == "cancel-booking" &&
    activeCustomOfferData.value?.booking?._id
  ) {
    console.log(custom_offer_id);
    navigateTo({
      name: "country-enquiries-message-id-cancellation-custom_offer_id-booking-booking_id",
      params: {
        country,
        custom_offer_id,
        booking_id: activeCustomOfferData.value?.booking?._id,
      },
    });
  } else if (mode == "receipt") {
    navigateTo({
      name: "country-enquiries-message-id-receipt",
      params: { country },
    });
  } else if (mode == "cancellation-details") {
    navigateTo({
      name: "country-enquiries-message-id-cancellation-custom_offer_id-booking-booking_id-details",
      params: {
        country,
        custom_offer_id,
        booking_id: activeCustomOfferData.value?.booking?._id,
      },
    });
  }
};

const approvingRequest = ref(false);
let stripe: Stripe | null;

const handleApproveBookingRequest = async () => {
  if (!activeCustomOfferData.value?._id) return;
  approvingRequest.value = true;
  let clientSecret;
  let payment_method_id;
  let payment_details_id;
  let booking_id;

  try {
    const { data } = await useAPI("v1/payment/get-payment-details", {
      query: {
        custom_offer_id: activeCustomOfferData.value?._id,
      },
    });

    if (data && data.value) {
      const res = data.value as any;
      clientSecret = res.data?.client_secret;
      payment_method_id = res.data?.payment_method_id;
      booking_id = res.data?.booking;
      payment_details_id = res.data?._id;
    }
    // PROCEED WITH CONFIRM PAYMENT

    if (
      !clientSecret ||
      !payment_method_id ||
      !payment_details_id ||
      !booking_id
    ) {
      setSnackbar(somethingWentWrongMessage);
      approvingRequest.value = false;
      return;
    }

    // debugger
    try {
      stripe = await loadStripe(runtime.public.STRIPE_PUBLISHABLE_KEY);

      const { error, paymentIntent } = await stripe!.confirmCardPayment(
        clientSecret,
        {
          payment_method: payment_method_id,
        },
      );

      if (error) {
        setSnackbar({ modal: true, text: error.message, color: "error" });
        approvingRequest.value = false;
        return;
      }

      if (paymentIntent.status == "succeeded") {
        // console.log(payment_id, booking_id);

        try {
          const res = await useAPI("/v1/payment/process-payment/status", {
            method: "POST",
            body: JSON.stringify({
              payment_id: payment_details_id,
              booking_id,
              status: paymentIntent.status,
            }),
          });

          await fetchCustomOffer();
          await fetchEnquiryData();

          if (!activeCustomOfferData.value._id && enquiry.value.status !== 'BOOKING_CONFIRMED') {
            setSnackbar(somethingWentWrongMessage)
            approvingRequest.value = false;
            return;
          }
          await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
            room_id: enquiry.value.inbox?.room_id,
            custom_offer_id: activeCustomOfferData.value._id,
            message: "null",
            key: "BOOKING_CONFIRMED",
          });

          setSnackbar({
            modal: true,
            text: "Booking confirmed successfully!",
            color: "success",
          });


        } catch (error) {
          console.log(error);
          setSnackbar(somethingWentWrongMessage);
          approvingRequest.value = false;
        }
      } else {
        setSnackbar({
          modal: true,
          text: "Failed to confirm booking!",
          color: "error",
        });
        approvingRequest.value = false;
      }
    } catch (error) {
      setSnackbar(somethingWentWrongMessage);
    }
  } catch (e) {
    console.log(e);
    setSnackbar(somethingWentWrongMessage);
  }

  approvingRequest.value = false;
};

const withdrawBookingProcessing = ref(false);

const handleWithdrawBookingRequest = async () => {
  withdrawBookingProcessing.value = true;

  try {
    const custom_offer_id = activeCustomOfferData.value?._id;
    if (!custom_offer_id) {
      setSnackbar(somethingWentWrongMessage);
      withdrawBookingProcessing.value = false;
      return;
    }

    const { data, error } = await useAPI(
      `/v1/custom-offer/status/${custom_offer_id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "ARCHIVE",
        }),
      },
    );

    // if there is error return
    if (error?.value) {
      setSnackbar(somethingWentWrongMessage);
      withdrawBookingProcessing.value = false;
      return;
    }

    try {
      const { error } = await updateEnquiry(id as string, {
        status: "BOOKING_REQUEST_WITHDRAWN",
      });
      if (error?.value) {
        setSnackbar(somethingWentWrongMessage);
        withdrawBookingProcessing.value = false;
        return;
      }

      await fetchEnquiryData();

      if (enquiry.value.status !== 'BOOKING_REQUEST_WITHDRAWN') {
        setSnackbar(somethingWentWrongMessage);
        withdrawBookingProcessing.value = false;
        return;
      }

      setSnackbar({
        modal: true,
        text: "Booking withdrawn successfully!",
        color: "success",
      });
      await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
        room_id: enquiry.value.inbox?.room_id,
        custom_offer_id: custom_offer_id,
        message: "null",
        key: "BOOKING_WITHDRAWN",
      });
    } catch (error) {
      console.log(error);
      setSnackbar(somethingWentWrongMessage);
      withdrawBookingProcessing.value = false;
    }
  } catch (error) {
    console.log(error);
    setSnackbar(somethingWentWrongMessage);
    withdrawBookingProcessing.value = false;
  }
};

const processingDeclineBookingRequest = ref(false);

const handleDeclineBookingRequest = async () => {
  processingDeclineBookingRequest.value = true;

  try {
    const custom_offer_id = activeCustomOfferData.value?._id;
    if (!custom_offer_id) {
      setSnackbar(somethingWentWrongMessage);
      processingDeclineBookingRequest.value = false;
      return;
    }

    const { data, error } = await useAPI(
      `/v1/custom-offer/status/${custom_offer_id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "ARCHIVE",
        }),
      },
    );

    // if there is error return
    if (error?.value) {
      setSnackbar(somethingWentWrongMessage);
      processingDeclineBookingRequest.value = false;
      return;
    }

    try {
      const { error } = await updateEnquiry(id as string, {
        status: "BOOKING_REQUEST_DECLINED",
      });
      if (error?.value) {
        setSnackbar(somethingWentWrongMessage);
        processingDeclineBookingRequest.value = false;
        return;
      }

      await fetchEnquiryData();

      if (enquiry.value.status !== 'BOOKING_REQUEST_DECLINED') {
        processingDeclineBookingRequest.value = false;
        setSnackbar(somethingWentWrongMessage);
        return;
      }
      setSnackbar({
        modal: true,
        text: "Booking declined successfully!",
        color: "success",
      });

      await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
        room_id: enquiry.value.inbox?.room_id,
        custom_offer_id: custom_offer_id,
        message: "null",
        key: "BOOKING_REQUEST_DECLINED",
      });
    } catch (error) {
      console.log(error);
      setSnackbar(somethingWentWrongMessage);
      processingDeclineBookingRequest.value = false;
    }
  } catch (error) {
    console.log(error);
    setSnackbar(somethingWentWrongMessage);
    processingDeclineBookingRequest.value = false;
  }
};

const handleFindSimilarVenues = () => {
  navigateTo({
    name: "country-venues-search",
    query: {
      location: country?.toLocaleUpperCase(),
      total_guest: Number(enquiry.value.guests),
      categories: enquiry.value.type,
      date: enquiry.value.date.date,
    },
  });
};

const goToCreateOffer = () => {
  navigateTo({
    name: "country-enquiries-message-id-custom-offer",
    params: { country, id },
  });
};

const handleDeclineOffer = async () => {
  const { data } = await useAPI("/v1/custom-offer", {
    query: {
      inbox_id: enquiry.value.inbox?._id,
      //  status: 'PENDING,BOOKING_CONFIRMED'
    },
  });

  if (data && data.value) {
    const res = data.value as any;
    if (res.data && res.data[0]._id) {
      const custom_offer_id = res.data[0]._id;
      const { data } = await useAPI(
        `/v1/custom-offer/status/${custom_offer_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "DECLINED",
          }),
        },
      );

      await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
        room_id: enquiry.value.inbox?.room_id,
        custom_offer_id: custom_offer_id,
        message: "null",
        key: "DECLINED",
      });
    }

    try {
      await updateEnquiry(id as string, { status: "DECLINED" });
    } catch (er) {
      console.log(er);
      setSnackbar(somethingWentWrongMessage);
      showDeclinePrompt.value = false;
    }

    showDeclinePrompt.value = false;
    await fetchEnquiryData();
    await fetchSpaceData();
  }
  showDeclinePrompt.value = false;
};

onBeforeRouteLeave(() => {
  removeListener(SOCKET_EVENTS.SEND_MESSAGE_ROOM);
});

const handleRemoveAttachment = (file_id: string) => {
  inputFileArr.value = inputFileArr.value.filter((x) => x._id !== file_id);
};

const imagesArray = computed(() => {
  if (conversation.value.length == 0) return [];
  return conversation.value.flatMap((x: TMessageInbox) => {
    return x.attachments?.filter((item) => item.contentType.includes("image"));
  });
});

const handleShowImage = (imageId: string) => {
  if (!imageId) return;
  console.log(imagesArray.value);

  showImageCarousel.value = true;
  activeImageId.value = imageId;
};

onMounted(async () => {
  await fetchEnquiryData();
  await fetchSpaceData();
  await fetchCustomOffer();
  await joinRoom();
  useCookie("offer_mode").value = null;
  loading.value = false;
});
</script>

<style>
.sent-by-current-user {
  background-color: #c9e6c9;
}

.sent-by-other-user {
  background-color: #f0f0f0;
}
</style>
