<template>
  <v-card :rounded="false" style="position: relative; height: 85dvh ; overflow-y: auto;"
    class="pa-0 ma-0 text-secondary" flat>
    <v-row no-gutters v-if="closeButton" class="" style="position: absolute; top: 1%; right: 1%; z-index: 2;"><v-btn
        icon="mdi-close" size="30px" flat @click="emit('close')"></v-btn></v-row>
    <v-row no-gutters class="pa-5 pa-md-7 w-100" style="height:max-content">
      <v-row no-gutters class="w-100">
        <v-carousel hide-delimiters height="210px" show-arrows="hover">
          <template v-for="x in space?.space_photo" :key="x">
            <v-carousel-item :src="x?.path" cover rounded="lg">
            </v-carousel-item>
            <v-row no-gutters class="pa-2" style="position: absolute;">
              <v-chip class="ma-2 font-weight-medium" color="white" label variant="flat" rounded="lg">
                {{ statusDetails(enquiry?.status).statusName }}
              </v-chip>

            </v-row>
          </template>
        </v-carousel>
        <!-- <v-img rounded="lg" :src="featuredImage(space)" height="210px" width="310px" cover>
          <v-row no-gutters class="pa-2">
            <v-chip class="ma-2 font-weight-medium" color="white" label variant="flat" rounded="lg">
              {{ statusDetails(enquiry?.status).statusName }}
            </v-chip>

          </v-row>
        </v-img> -->
      </v-row>
      <br />
      <v-row no-gutters class="mt-5 d-flex ga-2">
        <v-col cols="12" class="text-16px font-500">{{ infoMessage?.title }}</v-col>
        <v-col cols="12" class="text-14px font-400 text-charcoal">{{ infoMessage?.subtitle }}</v-col>
        <v-col cols=12>
          <slot name="buttons"></slot>
        </v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row v-if="isUser" no-gutters class="w-100 d-flex ga-2 ga-md-3 align-center">
        <span>
          <ProfileAvatar :first_name="enquiry?.venue?.user?.first_name" :last_name="enquiry?.venue?.user?.last_name"
            :img-src="enquiry?.venue?.user?.profile_picture" size="58px" />
        </span>
        <span>
          <div class="w-100 font-500 text-18px" style="line-height: 1.2;">Hosted by <span>{{ ownerFullName }}</span>
          </div>
          <!-- <div class="w-100 text-16px" style="line-height: 1.2;">Elite host - 1 year of hosting</div> -->
        </span>
      </v-row>
      <v-row v-else no-gutters class="w-100 d-flex ga-2 ga-md-3 align-center">
        <span>
          <ProfileAvatar :first_name="enquiry?.user?.first_name" :last_name="enquiry?.user?.last_name"
            :img-src="enquiry?.user?.profile_picture" size="58px" />
        </span>
        <span>
          <div class="w-100 font-500 text-18px" style="line-height: 1.2;"><span>{{ customerFullName }}</span>
          </div>
        </span>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="w-100">
        <EnquiryReviewOfferComputation :enquiry="enquiry" :space="space as TVenueSpace" without-borders
          show-computation-only :computed-data="computedOffer" />
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="3" style="line-height: 1.2;">Event Type</v-col>
        <v-col align="end" style="line-height: 1.2;">{{ enquiry?.type || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="5" xl="3" style="line-height: 1.2;">Space Name</v-col>
        <v-col align="end" class="hover-underlined" @click="emit('go-to-space')" style="line-height: 1.2;">{{
          enquiry?.space?.name || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="5" xl="3" style="line-height: 1.2;">Venue Name</v-col>
        <v-col align="end" style="line-height: 1.2;">{{ enquiry?.venue?.name || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="3">Date</v-col>
        <v-col align="end">{{ longDateFormat(enquiry?.date?.date) || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="3" style="line-height: 1.2;">Check-in</v-col>
        <v-col align="end" style="line-height: 1.2;">{{ convertTimeToAMPM(enquiry?.date?.from) || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row no-gutters class="text-16px w-100">
        <v-col cols="3" style="line-height: 1.2;">Check-out</v-col>
        <v-col align="end" style="line-height: 1.2;">{{ convertTimeToAMPM(enquiry?.date?.to) || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row v-if="enquiry?.flexible_time" no-gutters class="text-16px w-100">
        <v-col cols="7" style="line-height: 1.2;">Flexible on date/time</v-col>
        <v-col align="end" style="line-height: 1.2;">Yes</v-col>
        <v-divider class="my-5"></v-divider>
      </v-row>

      <v-row no-gutters class="text-16px w-100">
        <v-col cols="3" style="line-height: 1.2;">Guests</v-col>
        <v-col align="end" style="line-height: 1.2;">{{ enquiry?.guests || '' }}</v-col>
      </v-row>
      <v-divider class="my-5"></v-divider>
      <v-row v-if="enquiry?.require_catering" no-gutters class="text-16px w-100">
        <v-col cols="3" style="line-height: 1.2;">Catering</v-col>
        <v-col v-if="!cateringOptions" align="end" style="line-height: 1.2;">Required</v-col>
        <v-col v-else align="end" style="line-height: 1.2;">{{ cateringOptions }}</v-col>
        <v-divider class="my-5"></v-divider>
      </v-row>
      <v-row v-if="enquiry?.own_catering" no-gutters class="text-16px w-100">
        <v-col cols="6" style="line-height: 1.2;">Own Catering</v-col>
        <v-col align="end" style="line-height: 1.2;">Yes</v-col>
        <v-divider class="my-5"></v-divider>
      </v-row>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import MComputedOffer from "~/models/computed-offer.model";
const { smAndUp, lgAndUp, mdAndDown } = useDisplay();
const { currentUser } = useLocalAuth();
const { convertTimeToAMPM, longDateFormat, timeStampDate } = useUtils();
const { featuredImage } = useSpace();
const { statusDetails, computePayment } = useEnquiry();
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
  }
})>()

const emit = defineEmits(["close", "show-number", "go-to-space"]);

// const spaceImageArray = computed(() => {
//   if (props.space.space_photo) {
//     return props.space.space_photo.map((x: TVenueSpace) => x.path);
//   } else {
//     return [];
//   }
// });


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



const isAdmin = computed(() => {
  return currentUser.value?.role === "ADMIN";
});

const isUser = computed(() => {
  return currentUser.value?.role === "USER";
});

const cateringOptions = computed(() => {
  const arr = props.enquiry?.catering_options
  console.log(arr);

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
