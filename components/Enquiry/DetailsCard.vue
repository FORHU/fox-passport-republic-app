<template>
  <v-card :rounded="false" style="position: relative; height: 85dvh ; overflow-y: auto;"
    class="pa-0 ma-0 text-secondary" flat>
    <v-row no-gutters v-if="closeButton" class="" style="position: absolute; top: 1%; right: 1%; z-index: 2;"><v-btn
        icon="mdi-close" size="30px" flat @click="emit('close')"></v-btn></v-row>
    <v-row no-gutters class="pa-5 pa-md-7 w-100" style="height:max-content">
      <v-row no-gutters class="w-100" style="position: relative;">
        <v-carousel hide-delimiters height="210px" show-arrows="hover">
          <template v-for="x in space?.space_photo" :key="x">
            <v-carousel-item :src="x?.path" cover rounded="lg">
            </v-carousel-item>
          </template>
        </v-carousel>
        <v-row no-gutters class="pa-3 d-flex  justify-space-between w-100 ga-1" style="position: absolute;">
          <span>
            <v-chip class="font-weight-medium" color="white" label variant="flat" rounded="lg">
              {{ statusDetails(enquiry?.status).statusName }}
            </v-chip>
          </span>

          <span>
            <RatingCardView :rating="ratingDetails?.averageRating" :total-reviews="ratingDetails?.totalReviews"
            :enquiry="enquiry" class="bg-white" size="x-small" />
          </span>
        </v-row>
        <!-- <v-img rounded="lg" :src="featuredImage(space)" height="210px" width="310px" cover>
          <v-row no-gutters class="pa-2">
            <v-chip class="ma-2 font-weight-medium" color="white" label variant="flat" rounded="lg">
              {{ statusDetails(enquiry?.status).statusName }}
            </v-chip>

          </v-row>
        </v-img> -->
      </v-row>


      <v-row no-gutters class="w-100 flex flex-column ga-1 mb-15">
        <v-row no-gutters class="d-flex flex-column sm:flex-row pt-5">
          <v-row no-gutters class="w-100 h-full d-flex flex-column justify-center">
            <span no-gutters class="font-500 text-16px text-hover text-secondary mb-2" style="line-height: 1.2">{{
              infoMessage?.title }}</span>
            <span class="text-14px text-charcoal" style="line-height: 1.2">{{
              infoMessage?.subtitle
            }}</span>
          </v-row>
          <br />

          <v-row v-if="isVenueOwner || isVenueAdmin" no-gutters>
            <v-col cols="12" v-if="newEnquiry || offerDeclined || bookingWithdrawn || bookingRequestDeclined"
              class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" @click="emit('create-offer')"
                :text="offerDeclined ? 'Create New Offer' : 'Create Offer'"></v-btn>
            </v-col>

            <v-col cols="12" v-if="customOfferSent || paymentFailed" class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" :loading="updateOfferProcessing"
                @click="emit('update-offer')">Update Offer</v-btn>
            </v-col>

            <!-- <v-col cols="12" v-if="bookingRequested" class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" :loading="approvingRequest"
                @click="handleApproveBookingRequest">Approve Booking Request</v-btn>
              <v-btn variant="outlined" block size="large" :loading="processingDeclineBookingRequest"
                @click="handleDeclineBookingRequest">Decline Booking Request</v-btn>
            </v-col> -->

            <v-col cols="12" v-if="bookingConfirmed" class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" @click="emit('review-booking')">Review Booking</v-btn>
              <v-btn variant="outlined" block size="large" @click="emit('cancel-booking')">Cancel Booking</v-btn>
              <v-btn variant="outlined" block size="large" @click="emit('view-invoice')">View Invoice</v-btn>
            </v-col>

            <v-col cols="12" v-if="bookingHappened" class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" @click="emit('review-booking')">Review Booking</v-btn>
            </v-col>

            <v-col cols="12" v-if="bookingCancelled" class="d-flex flex-column ga-2">
              <v-btn variant="outlined" block size="large" @click="emit('view-cancellation-details')">View Cancellation
                Details</v-btn>
            </v-col>

            <v-col cols="12" v-if="!bookingConfirmed && !bookingHappened && !bookingCancelled && !bookingArchived"
              class="d-flex flex-column ga-2 pt-2">
              <v-row justify="end" class="w-100 pt-2" no-gutters>
                <v-btn text='Archive Inquiry' variant='text' density='compact' class="text-decoration-underline"
                  @click="emit('archive-inquiry')" />
              </v-row>
            </v-col>

          </v-row>
          <v-row v-else-if="isUser" no-gutters class="d-flex flex-column justify-center w-100 pt-2">
            <v-btn v-if="newEnquiry" variant="flat" color="primary" class="rounded-md" block
              @click="emit('request-to-book')">Request To Book</v-btn>

            <v-btn v-if="bookingCancelled" variant="outlined" block @click="emit('view-cancellation-details')">View
              Cancellation Details</v-btn>

            <!-- CUSTOM OFFER -->
            <v-row no-gutters v-if="customOfferSent" class="d-flex">
              <v-col cols="12" class="pb-2">
                <v-btn variant="outlined" size="large" class="w-100" @click="emit('go-to-offer')">View Offer</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn variant="outlined" size="large" class="w-100" @click="emit('decline-offer')">Decline
                  Offer</v-btn>
              </v-col>
            </v-row>
            <!-- CUSTOM OFFER -->

            <!-- PAYMENT FAILED/INPROGRESS -->
            <v-btn v-if="paymentFailed || paymentInProgress" variant="outlined" block size="large"
              @click="emit('payment-failed')">Go to Payment</v-btn>
            <!-- PAYMENT FAILED/INPROGRESS -->

            <!-- BOOKING CONFIRMED -->
            <v-row no-gutters v-if="bookingConfirmed" class="d-flex">
              <v-col cols="12" class="pb-2">
                <v-btn variant="outlined" size="large" class="w-100" @click="emit('review-booking')">View Booking
                  Details</v-btn>
              </v-col>
              <v-col cols="12" class="pb-2">
                <v-btn variant="outlined" size="large" class="w-100" @click="emit('cancel-booking')">Cancel
                  Booking</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn variant="outlined" size="large" class="w-100" @click="emit('view-receipt')">View Receipt</v-btn>
              </v-col>
            </v-row>
            <!-- BOOKING CONFIRMED -->

            <!-- BOOKING HAPPENED -->
            <v-row no-gutters v-if="bookingHappened" class="d-flex">
              <v-col cols="12" class="pb-2">
                <v-btn variant="outlined" class="w-100" @click="emit('review-booking')">View Booking Details</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn v-if="!bookingReviewed" variant="outlined" class="w-100" @click="emit('rate')"
                  prepend-icon="mdi-star">Rate your stay

                  <template v-slot:prepend>
                    <v-icon color="yellow-darken-2"></v-icon>
                  </template>
                </v-btn>
                <v-btn v-else variant="outlined" class="w-100" @click="emit('rate')"
                  prepend-icon="mdi-comment-edit-outline">Edit Your Review

                  <template v-slot:prepend>
                    <v-icon color="yellow-darken-2"></v-icon>
                  </template>
                </v-btn>
              </v-col>
            </v-row>
            <!-- BOOKING HAPPENED -->
          </v-row>
        </v-row>

        <v-divider class="my-5"></v-divider>

        <!-- COMPUTATION -->
        <v-row no-gutters class="w-100">
          <EnquiryReviewOfferComputation :enquiry="enquiry" :space="space as TVenueSpace" without-borders
            show-computation-only :computed-data="computedOffer" />
          <v-divider class="my-5"></v-divider>
        </v-row>
        <!-- REVIEW OFFER -->

        <!-- DETAILS -->
        <v-row no-gutters class="">
          <!-- Repeated rows -->
          <EnquiryChatInfoRow label="Event Type" :value="enquiry?.type || ''" with-bottom-divider />
          <EnquiryChatInfoRow label="Space Name" :value="enquiry?.space?.name || ''" link
            @link-click="emit('go-to-space')" with-bottom-divider />
          <EnquiryChatInfoRow label="Venue Name" :value="enquiry?.venue?.name || ''" with-bottom-divider />
          <EnquiryChatInfoRow label="Address" :value="formatAddress(enquiry?.venue?.address) || ''"
            with-bottom-divider />
          <EnquiryChatInfoRow label="Date" :value="longDateFormat(enquiry?.date?.date) || ''" with-bottom-divider />
          <EnquiryChatInfoRow label="Check-in" :value="convertTimeToAMPM(enquiry?.date?.from) || ''"
            with-bottom-divider />
          <EnquiryChatInfoRow label="Check-out" :value="convertTimeToAMPM(enquiry?.date?.to) || ''"
            with-bottom-divider />
          <EnquiryChatInfoRow label="Guests" :value="enquiry?.guests || ''" with-bottom-divider />

          <EnquiryChatInfoRow v-if="enquiry?.flexible_time" label="Flexible on date/time" :value="'Yes'"
            with-bottom-divider />
          <EnquiryChatInfoRow v-if="enquiry?.require_catering" label="Catering"
            :value="cateringOptions ? cateringOptions : 'Required'" with-bottom-divider />
          <EnquiryChatInfoRow v-if="enquiry?.own_catering" label="Own Catering" :value="'Yes'" with-bottom-divider />

          <!-- DETAILS -->
        </v-row>

        <v-row no-gutters class="w-100">
          <span class="text-subtitle-1 font-500 my-5">In this conversation</span>
          <v-row no-gutters class="w-100 d-flex ga-2 ga-md-3 align-center pb-5">
            <span>
              <ProfileAvatar :first_name="enquiry?.venue?.user?.first_name" :last_name="enquiry?.user?.last_name"
                :img-src="enquiry?.venue?.user?.profile_picture" size="40px" />
            </span>
            <span>
              <div class="w-100 font-400 text-16px" style="line-height: 1.2">
                <span>{{ ownerFullName }}</span>
              </div>
            </span>
            <span class="text-caption font-400">(Venue Owner)</span>
          </v-row>

          <v-row no-gutters class="w-100 d-flex ga-2 ga-md-3 align-center">
            <span>
              <ProfileAvatar :first_name="enquiry?.user?.first_name" :last_name="enquiry?.user?.last_name"
                :img-src="enquiry?.user?.profile_picture" size="40px" />
            </span>
            <span>
              <div class="w-100 font-400 text-16px" style="line-height: 1.2">
                <span>{{ isUser ? 'You' : customerFullName }}</span>
              </div>
            </span>
          </v-row>
        </v-row>
      </v-row>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import MComputedOffer from "~/models/computed-offer.model";
const { smAndUp, lgAndUp, mdAndDown } = useDisplay();
const { currentUser } = useLocalAuth();
const { convertTimeToAMPM, longDateFormat, timeStampDate, sliceContent, formatAddress } = useUtils();
const { featuredImage } = useSpace();
const { statusDetails, computePayment } = useEnquiry();
const { isVenueMember, isVenueOwner, isVenueAdmin, isAdmin, isUser } = useAccess();
const computedOffer = ref<TComputedOffer>()
const computing = ref(false);


const props = defineProps<({
  enquiry: TEnquiry,
  ownerFullName: string,
  customerFullName: string,
  closeButton?: boolean,
  space: TVenueSpace | undefined,
  infoMessage?: {
    title: string,
    subtitle: string,
  },
  bookingReviewed?: boolean,
  ratingDetails?: any,
  updateOfferProcessing?: boolean
})>()

const emit = defineEmits([
  "request-to-book",
  "view-cancellation-details",
  "review-booking",
  "go-to-offer",
  "decline-offer",
  "view-receipt",
  "rate",
  "go-to-space",
  "cancel-booking",
  "payment-failed",
  "close", "show-number", "go-to-space",
  "archive-inquiry",
  "view-invoice",
  "update-offer",
  "create-offer",
]);

// const spaceImageArray = computed(() => {
//   if (props.space.space_photo) {
//     return props.space.space_photo.map((x: TVenueSpace) => x.path);
//   } else {
//     return [];
//   }
// });

const userCanBook = computed(() => {
  // return space.value?.pricing?.selected_pricing == "HIRE_FEE";
  return true;
});

const enquiryStatus = computed(() => {
  return props.enquiry?.status;
});

const newEnquiry = computed(() => {
  return enquiryStatus.value == "NEW" || enquiryStatus.value == "IN_PROGRESS";
});

const bookingRequested = computed(() => {
  return enquiryStatus.value == "BOOKING_REQUESTED";
}); // deprecated

const offerDeclined = computed(() => {
  return enquiryStatus.value == "DECLINED";
});

const customOfferSent = computed(() => {
  return enquiryStatus.value == "CUSTOM_OFFER_SENT";
});

const offerAccepted = computed(() => {
  return enquiryStatus.value == "OFFER_ACCEPTED";
}); // deprecated

const paymentFailed = computed(() => {
  return enquiryStatus.value == "PAYMENT_FAILED";
});
const paymentInProgress = computed(() => {
  return enquiryStatus.value == "PAYMENT_IN_PROGRESS";
});

const bookingWithdrawn = computed(() => {
  return enquiryStatus.value == "BOOKING_REQUEST_WITHDRAWN";
}); // deprecated

const bookingRequestDeclined = computed(() => {
  return enquiryStatus.value == "BOOKING_REQUEST_DECLINED";
}); // deprecated

const bookingConfirmed = computed(() => {
  return enquiryStatus.value == "BOOKING_CONFIRMED";
});

const bookingHappened = computed(() => {
  return enquiryStatus.value == "HAPPENED";
});

const bookingCancelled = computed(() => {
  return enquiryStatus.value == "CANCELLED";
});

const bookingArchived = computed(() => {
  return enquiryStatus.value == "ARCHIVED";
});


const computePricing = async () => {
  const { date, guests, space } = props.enquiry
  if (
    !date.from ||
    !date.to ||
    !guests ||
    !date.date || !space?._id
  )
    return;

  computing.value = true;
  try {
    const payload = {
      space_id: space._id,
      date: date.date,
      time_start: date.from,
      time_end: date.to,
      guests,
    };
    const res = await computePayment(payload);
    if (res) {
      computedOffer.value = new MComputedOffer(res);
    }
    computing.value = false;
  } catch (err) {
    console.log(err);
    computing.value = false;
  }
};



const cateringOptions = computed(() => {
  const arr = props.enquiry?.catering_options
  if (arr && arr.length > 0) {
    if (arr.some(x => x.value == true)) {
      const arrTrue = arr.filter(x => x.value).map(x => x.name)
      return arrTrue.join(", ")

    } else return null
  } else {
    return null
  }
})
onMounted(() => {
  computePricing();
})
</script>

<style scoped></style>
