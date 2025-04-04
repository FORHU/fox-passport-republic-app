<template>
  <v-row no-gutters>

    <v-col cols="5" lg="3" xl="3" class="d-none d-md-block">
      <EnquiryChatList />
    </v-col>


    <v-col style="max-height:93dvh; overflow: hidden;">
      <v-row no-gutters>
        <v-row no-gutters style="max-height: 93dvh;border-right: 2px solid #DEDFE3; position: relative;">
          <v-col cols="12">
            <v-card color="white" width="100%" :height="70" :rounded="false" flat
              style="border-bottom: solid 1px #DEDFE3;">

              <v-row no-gutters class="px-5 py-1 py-xl-3 d-flex justify-space-between  align-center ga-3 h-100">
                <span class="d-md-none"><v-icon icon="mdi-arrow-left" class="cursor-pointer"
                    @click="navigateTo(`/${country}/enquiries`)"></v-icon></span>
                <div class="d-flex  align-center ga-3">
                  <span>
                    <ProfileAvatar v-if="isUser" :first_name="enquiry?.venue?.user?.first_name"
                      :last_name="enquiry?.venue?.user?.last_name" :img-src="enquiry?.venue?.user?.profile_picture"
                      size="38px" />

                    <ProfileAvatar v-else :first_name="enquiry?.user?.first_name" :last_name="enquiry?.user?.last_name"
                      :img-src="enquiry?.user?.profile_picture" size="38px" />
                  </span>
                  <span class="text-18px font-500">{{ isUser ? ownerFullName : customerFullName }}</span>
                </div>
                <span class="d-flex">
                  <v-btn class="d-lg-none" @click="showEventDetailsSmallScreen = true">Details</v-btn>
                  <v-btn v-if="!showEventDetails" class="d-none d-lg-block" @click="showEventDetails = true">Show
                    Details</v-btn>
                </span>
              </v-row>

            </v-card>
          </v-col>
          <!-- CHAT BOX -->

          <v-row no-gutters class="w-100" cols="12" flat :rounded="false" align-content="end" :style="{minHeight: InfiniteScrollHeight + 'px' }">
            <v-card v-if="loading" elevation="0" rounded="lg" width="100%" flat>
              <LoadingChat :lines="15" />
            </v-card>
            <!-- CHAT BOX -->
            <v-card flat no-gutters v-else :key="chatKey + 'key'" class="w-100 bg-transparent">
              <v-infinite-scroll :max-height="InfiniteScrollHeight" width="100%" side="start"
                class="px-4 px-sm-7 py-5 d-flex ga-2 scroller" @load="loadMoreConversations"
                transition="fade-transition" @scroll.passive="handleScroll" ref="infiniteScrollDiv">
                <template v-for="(item, index) in filteredConversation" :key="`${item.createdAt}-${index}`">
                  <template v-if="item.admin_generated">
                    <EnquiryDetailsBox :admin-key="item?.key" :content="item?.generated_content"
                      :showSentMessage="showSentMessage(item?.sender?._id)" :created-at="item.createdAt || ''" :sender="{
                        first_name: item.sender.first_name || '',
                        last_name: item.sender.last_name || '',
                        _id: item.sender._id || '',
                      }" @go-to-space="goToSpace" />
                  </template>

                  <template v-if="item.admin_generated">
                    <EnquiryStatusMessage :admin-key="item.key" :showSentMessage="showSentMessage(item?.sender?._id)"
                      :sender="{
                        first_name: item.sender.first_name || '',
                        last_name: item.sender.last_name || '',
                        _id: item.sender._id || '',
                      }" :created-at="item.createdAt || ''" class="my-1" />
                  </template>

                  <template v-if="item.key == 'REQUEST_PHONE_NUMBER'">
                    <EnquiryPhoneNumber :content="item.generated_content" :admin-key="item.key" :sender="{
                      first_name: item.sender.first_name || '',
                      last_name: item.sender.last_name || '',
                      _id: item.sender._id || '',
                    }" :created-at="item.createdAt || ''" class="my-1" />
                  </template>

                  <template v-else-if="
                    !item.admin_generated && showSentMessage(item?.sender?._id)
                  ">
                    <EnquirySentMessageBubble :message="item.content" :sender="{
                      first_name: item.sender.first_name || '',
                      last_name: item.sender.last_name || '',
                      _id: item.sender._id || '',
                    }" :time-stamp="timeStampDate(item.createdAt as string)" :attachments="item.attachments || []"
                      class="my-1" @show-image="handleShowImage" />
                  </template>

                  <template v-else-if="
                    !item.admin_generated && !showSentMessage(item?.sender?._id)
                  ">
                    <EnquiryReceivedMessageBubble :message="item.content" :sender="{
                      first_name: item.sender.first_name || '',
                      last_name: item.sender.last_name || '',
                      _id: item.sender._id || '',
                    }" :attachments="item.attachments || []" :time-stamp="timeStampDate(item.createdAt as string)"
                      class="my-1" @show-image="handleShowImage" />
                  </template>
                </template>

                <template v-slot:empty> </template>
              </v-infinite-scroll>
            </v-card>




          </v-row>



          <!-- INPUT SECTION -->
          <v-col v-if="isVenueOwner || isVenueAdmin || isUser" cols="12" :style="{ position: 'sticky', bottom: 0, right: 0, left: 0, }">
            <v-card color="white" class="pa-2 pb-5 w-100" :rounded="false" flat :min-height="textAreaHeight">
              <v-row v-if="!isAdmin" no-gutters class="w-100 fill-height" align="center">
                <v-col cols="12" class="d-flex ga-2 align-end">
                  <span class="mb-2" v-if="isUser">
                    <ButtonFileUploaderIcon v-model="inputFileArr" uploader-id="chat-upload-file" />
                  </span>
                  <v-row v-else-if="isVenueOwner || isVenueAdmin" no-gutters class="mb-3">
                    <v-btn icon="mdi-plus-box-multiple" size="40" id="menu-activator" class="text-secondary"
                      flat></v-btn>
                    <v-menu activator="#menu-activator" location="top" close-on-content-click>
                      <v-list class="text-16px text-secondary" selectable>
                        <v-list-item class="cursor-pointer d-flex ga-2 align-center">
                          <ButtonFileUploader v-model="inputFileArr" label="Attach File"
                            uploader-id="chat-upload-file" />
                        </v-list-item>
                        <v-list-item class="cursor-pointer d-flex ga-2 align-center"
                          @click="showChatTemplateModal = true">
                          <!-- <span class="mr-2"><v-icon icon="mdi-format-float-none"></v-icon></span>
                          <span>Template</span> -->
                          <v-btn prepend-icon="mdi-format-float-none">Template</v-btn>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-row>
                  <v-card class="w-100" elevation="0" border="secondary sm">
                    <!-- UPLOAD FILES CONTAINER -->
                    <v-row no-gutters v-if="inputFileArr.length > 0" class="w-100 mb-1 pa-1">
                      <template v-for="item in inputFileArr">
                        <AttachmentChip :file-data="item" @click=""
                          @remove-attachment="handleRemoveAttachment(item._id)" />
                      </template>

                    </v-row>
                    <!-- UPLOAD FILES CONTAINER -->
                    <v-row no-gutters class="d-flex align-center w-100">
                      <v-textarea v-model="inputMessage" :rows="1" auto-grow flat placeholder="Type a message"
                        variant="solo" hide-details center-affix style="max-height: 200px; overflow-y: auto;">
                      </v-textarea>
                    </v-row>
                  </v-card>

                  <span><v-btn color="secondary" @click="sendMessage" :disabled="sendingMessage"
                      class="text-caption text-md-subtitle-1 mb-2" size="x-large"
                      style="max-height: 44px">Send</v-btn></span>
                </v-col>
              </v-row>
            </v-card>
            <v-btn v-if="showJumpToPresent" @click="scrollToPresent" class="position-absolute"
              style="bottom: 100%; right: 16px; transform: translateY(-16px); z-index: 999;" color="primary" size="small"
              append-icon="mdi-arrow-down" text="Jump to newer messages">
            </v-btn>
          </v-col>
          <!-- INPUT SECTION -->


        </v-row>

      </v-row>

    </v-col>



    <v-col v-if="lgAndUp && showEventDetails" cols="3">
      <v-card class="w-100" flat :rounded="false" :height="70" color="white" style="border-bottom: solid 1px #DEDFE3;">
        <v-row no-gutters class="w-100 px-5 pa-2 pa-xl-5 d-flex align-center justify-space-between h-100">
          <span class="text-16px font-400">Event Details</span>
          <span><v-btn icon="mdi-close" size="30px" flat @click="showEventDetails = false"></v-btn></span>
        </v-row>
      </v-card>
      <LoadingChat v-if="loading" :lines="15" />
      <EnquiryDetailsCard v-if="!loading" :enquiry="enquiry" :owner-full-name="ownerFullName"
        :customer-full-name="customerFullName" :info-message="infoMessage" :space="space"
        @show-number="requestShowPhoneNumber" @go-to-space="goToSpace"
        @close="showEventDetailsSmallScreen = false" 
        :booking-reviewed="bookingReviewed"
        :rating-details="ratingDetails"
        :update-offer-processing="updateOfferProcessing"
        @request-to-book="handleRequestToBook"
        @go-to-offer="goToOffer('view')"
        @decline-offer="showDeclinePrompt = true"
        @create-offer="goToCreateOffer"
        @update-offer="goToOffer('update')"
        @view-cancellation-details="goToOffer('cancellation-details')"
        @payment-failed="goToOffer('payment')"
        @review-booking="goToOffer('review-booking')"
        @view-receipt="goToOffer('receipt')"
        @rate="handleRate"
        @cancel-booking="goToOffer('cancel-booking')"
        @archive-inquiry="showArchiveInquiryPrompt = true"
        @view-invoice="goToOffer('invoice')"
        >
        <template #buttons>
          <!-- VENUE OWNER BUTTONS -->
        </template>
      </EnquiryDetailsCard>
      <!-- <EnquiryDetailsCardOwner v-if="!loading && !isUser" :enquiry="enquiry" :customer-full-name="customerFullName"
        @go-to-space="goToSpace" /> -->
    </v-col>




    <ModalDeclineOfferPrompt v-model="showDeclinePrompt" @disagree="showDeclinePrompt = false"
      @agree="handleDeclineOffer" />
    <ModalChatTemplateModal v-model:template="showChatTemplateModal" v-model:message="inputMessage"
      v-model:files="inputFileArr" :enquiry="enquiry" />
    <CarouselImageViewer v-model:images="imagesArray" v-model:show="showImageCarousel"
      :active-image-id="activeImageId || ''" />
    <EnquiryModal v-model:show="showEventDetailsSmallScreen" v-if="!lgAndUp">
      <EnquiryDetailsCard v-if="!loading" :enquiry="enquiry" :owner-full-name="ownerFullName"
        :customer-full-name="customerFullName" :info-message="infoMessage" :space="space"
        @show-number="requestShowPhoneNumber" @go-to-space="goToSpace" close-button
        @close="showEventDetailsSmallScreen = false" 
        :booking-reviewed="bookingReviewed"
        :rating-details="ratingDetails"
        :update-offer-processing="updateOfferProcessing"
        @request-to-book="handleRequestToBook"
        @go-to-offer="goToOffer('view')"
        @decline-offer="showDeclinePrompt = true"
        @create-offer="goToCreateOffer"
        @update-offer="goToOffer('update')"
        @view-cancellation-details="goToOffer('cancellation-details')"
        @payment-failed="goToOffer('payment')"
        @review-booking="goToOffer('review-booking')"
        @view-receipt="goToOffer('receipt')"
        @rate="handleRate"
        @cancel-booking="goToOffer('cancel-booking')"
        @archive-inquiry="showArchiveInquiryPrompt = true"
        @view-invoice="goToOffer('invoice')"
        >
        <template #buttons>
          <!-- VENUE OWNER BUTTONS -->
        </template>
      </EnquiryDetailsCard>
    </EnquiryModal>

    <EnquiryPhoneNumberWarning v-model="showPhoneNumberWarning" />
    <DialogPromptNew v-model="showArchiveInquiryPrompt" @agree="handleArchiveInquiry" :loading="processingArchive"
      :prompt-title="`Are you sure you want to archive this inquiry?`" disagree-button-text="Nevermind"
      agree-button-text="Archive" />
  </v-row>
  <RatingReviewStay
    v-model="reviewStayDialog"
    :ratingDetails="ratingDetails as TRatingDetails"
    :bookingReviewed="bookingReviewed"
    :venueName="space?.name || ''"
    :owner-full-name="ownerFullName"
    :space-id="space?._id"
    @refetch-rating="fetchRatings"
  />
</template>

<script setup lang="ts">

import { io, type Socket } from "socket.io-client";
import MSpace from "~/models/space.model";
import MEnquiry from "~/models/enquiry.model";
import { useDisplay } from "vuetify";
const { smAndUp, mdAndUp, lgAndUp, mdAndDown, xlAndUp, width, height } = useDisplay();
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { errorMessages } from "vue/compiler-sfc";
import MOffer from "~/models/offer.model";
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser } = useAccess();
const { computeBadgeCount } = useNotification();
const { emitGlobalSocket } = useGlobalSocket();
const showRemoveMemberPrompt = ref(false)
const showJumpToPresent = ref(false);
const infiniteScrollDiv = ref();

definePageMeta({
  layout: "enquiry-chat-new",
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

const emit = defineEmits(['reload-enquiry-list'])

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
const { getUserSpaceRating } = useRatings();
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
const showEventDetails = ref(true);
const showEventDetailsSmallScreen = ref(false);
const showArchiveInquiryPrompt = ref(false);
const processingArchive = ref(false);
const bookingReviewed = ref(false);
const ratingDetails = ref<TRatingDetails>()
const reviewStayDialog = ref(false);

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
  setTimeout(() => {
    sendingMessage.value = false;
  }, 500)
  inputMessage.value = "";
  inputFileArr.value = [];

  // console.log(conversation.value);

  // await assignConversation();
};




const textAreaHeight = computed(() => {
  const screenHeight = height.value;
  if (screenHeight < 500) return '120';
  else if (screenHeight < 700) return '110';
  else if (screenHeight < 850) return '100';
  else return '90';
});

// compute height of scroll
const InfiniteScrollHeight = computed(() => {
  const screenHeight = height.value;
  if (screenHeight < 700) return (screenHeight - 70 - parseInt(textAreaHeight.value) - 50);
  return (screenHeight - 70 - parseInt(textAreaHeight.value) - 70);

});



const userCanBook = computed(() => {
  // return space.value?.pricing?.selected_pricing == "HIRE_FEE";
  return true;
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

const bookingArchived = computed(() => {
  return enquiry.value.status == "ARCHIVED";
})

const cancelledTitleDescription = computed(() => {
  const cancelledByCustomer = enquiry.value.cancelledBy.role == "USER";
  // return `${(isVenueOwner.value && !cancelledByCustomer.value) ? 'You' : ownerFullName.value} cancelled this booking`

  if (isVenueOwner) {
    if (cancelledByCustomer) {
      return `${customerFullName.value} cancelled this booking`;
    } else {
      return `You cancelled this booking`;
    }
  } else if (isUser) {
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
  if (!isUser) {
    if (newEnquiry.value) {
      return {
        title: `${customer} inquired about your space`,
        subtitle:
          "Send your guest a custom offer to let them book and pay online.",
      };
    } else if (customOfferSent.value) {
      return {
        title: `${isVenueOwner? "You" : ownerFullName.value} have created an offer for ${customer}`,
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
    } else if (bookingArchived.value) {
      return {
        title: 'This inquiry was unsuccessful and is now archived.',
        subtitle:
          "You can no longer use this inquiry to book. Please create another one.",
      };
    }

    // CUSTOMER INFO
  } else {
    if (newEnquiry.value) {
      return {
        title: "Ready to book?",
        subtitle: userCanBook.value
          ? "This space is not yet confirmed and may be booked by others. Use the 'Request to Book' button to reserve your date."
          : "This space is not yet confirmed and may be booked by others. Request an offer from the venue owner using the chat feature.",
      };
    } else if (customOfferSent.value) {
      return {
        title: `${ownerFullName.value} have created an offer for you`,
        subtitle: "If you book later, there’s a chance the price will go up or the venue will be booked out.",
      };
    } else if (bookingRequested.value) {
      return {
        title: `Your booking request is sent`,
        subtitle:
          "Booking request is still pending. Your card won’t be charged until your booking is confirmed.",
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
        title: "Your booking is confirmed and paid",
        subtitle:
          "Thank you for booking with us! You may now review your booking or view your receipt.",
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
    } else if (bookingArchived.value) {
      return {
        title: 'This inquiry was unsuccessful and is now archived.',
        subtitle:
          "You can no longer use this inquiry to book. Please create another one.",
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


// checker if message should show as received or sent
const showSentMessage = (senderId: string) => {
  if (isUser) {
    return enquiry.value?.user?._id == senderId
  } else {
    return enquiry.value?.user?._id !== senderId
  }
}

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
    | "invoice"
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
  } else if (mode == "invoice") {
    navigateTo({
      name: "country-enquiries-message-id-invoice",
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
        key: "BOOKING_REQUEST_WITHDRAWN",
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

      await emitGlobalSocket(SOCKET_EVENTS.NOTIFICATION_COUNT, {custom_offer_id})
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

const handleAttachmentClick = () => {
  document.getElementById("chat-upload-file")?.click();
}


const fetchRatings = async () => {
  if(!bookingHappened.value || !isUser) return;
  try {
    const res = await getUserSpaceRating(space.value._id)
    if(!res || !res?.[0]) return; 
    const obj = res?.[0].details?.find( (x: any) => x.user._id == currentUser.value._id )
    if(obj){
      bookingReviewed.value = true
      ratingDetails.value = obj
    }
  } catch (error) {
    
  }
} 

const handleRate = () => {
  showEventDetailsSmallScreen.value = false;
  reviewStayDialog.value = true;
}

onMounted(async () => {
  await fetchEnquiryData();
  await fetchSpaceData();
  await fetchCustomOffer();
  await joinRoom();
  await fetchRatings();
  useCookie("offer_mode").value = null;
  loading.value = false;
  computeBadgeCount();
});


const handleArchiveInquiry = async () => {
  processingArchive.value = true;
  try {
    const { data, error } = await updateEnquiry(id as string, {
        status: "ARCHIVED",
      });

    if(data.value){
      await emitChat(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, {
        room_id: enquiry.value.inbox?.room_id,
        message: "null",
        key: "ARCHIVED",
      });
    }

    if(error.value){
      setSnackbar(somethingWentWrongMessage);
      showArchiveInquiryPrompt.value = false;
      return;
    }
    
  } catch (error) {
    setSnackbar(somethingWentWrongMessage);
    console.log(error);
    
    
  } finally {
    showArchiveInquiryPrompt.value = false;
  }
}
const checkScrollPosition = () => {
  const scroll = infiniteScrollDiv.value.$el.scrollHeight
  const height = infiniteScrollDiv.value.$el.clientHeight;
  const scrollTop = infiniteScrollDiv.value.$el.scrollTop
  if (scroll > (height + scrollTop + 50)) {
    showJumpToPresent.value = true;
  }
}

watch(conversation, () => {
  setTimeout(() => {
    checkScrollPosition()
  }, 1000)
}, { deep: true })

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.scrollTop < target.scrollHeight - target.clientHeight - 50) {
    showJumpToPresent.value = true;
  } else {
    showJumpToPresent.value = false;
  }
};
const scrollToPresent = () => {
  const container = document.querySelector('.scroller');
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
  showJumpToPresent.value = false;
};
</script>

<style>
.sent-by-current-user {
  background-color: #c9e6c9;
}

.sent-by-other-user {
  background-color: #f0f0f0;
}

.scroller {
  overflow-y: auto;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
.scroller::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
</style>