<template>
  <v-dialog v-model="reviewStayDialog" location="bottom" temporary max-width="800px">
    <v-form @submit.prevent="handleNext" v-model="isFormValid" ref="form">
      <v-card class="rounded-top-12px" min-height="400px">
        <v-row no-gutters class="pa-5 px-7">
          <template v-if="step == 'rating'">
            <v-col cols="12" class="px-8 text-center py-6">
              <span class="font-weight-medium text-18px">
                How was your stay at <br />
                <span class="text-blue-theme">{{ venueName }}</span> ?
              </span>
            </v-col>
            <v-col cols="12" class="d-flex align-center flex-column ga-1 pt-4 pb-10">
              <span class="font-weight-medium text-18px">Excellent</span>
              <div>
                <v-rating hover :length="5" :size="40" v-model="rates" color="warning" active-color="warning" required/>
              </div>
            </v-col>
          </template>

          <template v-if="step == 'private-note'">
            <v-col cols="12" class="pb-5">
              <span class="font-weight-medium">Write a private note</span>
            </v-col>
            <v-col cols="12" class="px-5 pb-6">
              <span class="text-15px">This feedback just for {{ ownerFullName }} - share what you really
                appreciated, plus anything they can do to make the next stay even
                better.</span>
            </v-col>
            <v-col cols="12" class="">
              <div>
                <v-textarea label="Note" variant="outlined" v-model="privateNote" :rules="privateNoteRules" ></v-textarea>
              </div>
            </v-col>
          </template>

          <template v-if="step == 'public-note'">
            <v-col cols="12" class="pb-2">
              <span class="font-weight-medium">Write a public note</span>
            </v-col>
            <v-col cols="12" class="pb-5">
              <span class="text-15px">After the review period ends, we’ll publish this on
                {{ ownerFullName }}’s listing.</span>
            </v-col>
            <v-col cols="12" class="">
              <div>
                <v-textarea label="Note" variant="outlined" v-model="publicNote" :rules="publicNoteRules"></v-textarea>
              </div>
            </v-col>
          </template>
        </v-row>
        <v-row v-if="ratingStatus?.desc" no-gutters class="w-100 d-flex justify-center text-12px">
            <v-alert :color="ratingStatus?.color" variant="tonal" class="rounded-none d-flex justify-center" density="compact">
              {{ ratingStatus?.desc }}
            </v-alert>
          </v-row>
        <v-card-actions>
          <v-col cols="12" class="d-flex justify-space-between align-center">
            <span>
              <v-btn v-if="step !== 'rating'" variant="flat" class="rounded-lg text-12px px-4" color="secondary"
                size="large" @click="handleBack">
                Back
              </v-btn>
            </span>
            <span>
              <v-btn class="rounded-lg text-12px px-4" :loading="publishingReview" variant="flat" color="secondary"
              size="large" :text="step !== 'public-note' ? 'Next' : 'Publish'" :type="'submit'">
            </v-btn>
            </span>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<({
  venueName: string
  ratingDetails: TRatingDetails
  bookingReviewed?: boolean
  ownerFullName: string
  spaceId: string
})>();
const reviewStayDialog = defineModel({ type: Boolean, required: true });
const emit = defineEmits(["next-private", 'refetch-rating']);
const step = ref<'rating' | 'private-note' | 'public-note'>('rating')
const publishingReview = ref(false);
const isFormValid = ref(false);
const form = ref(null)

const { submitRating } = useRatings();
const { setSnackbar } = useLocal();

const rates = ref(4);
const privateNote = ref("");
const publicNote = ref("");

const privateNoteRules = [(v: string) => !!v || "This field is required"];
const publicNoteRules = [(v: string) => !!v || "This field is required"];

const handleNext = async () => {
  if(step.value !== 'rating' && !isFormValid.value) return;
  if (step.value == 'rating' && rates.value) {
    step.value = 'private-note';
  } else if (step.value == 'private-note') {
    step.value = 'public-note'
  } else if (step.value == 'public-note') {
    await handleUpdateReview();
  }
};

const handleBack = () => {
  if (step.value == 'private-note') {
    step.value = 'rating';
  } else if (step.value == 'public-note') {
    step.value = 'private-note';
  }
}

const handleUpdateReview = async () => {
  publishingReview.value = true;
  try {
    const res = await submitRating({spaceId: props.spaceId, rating: rates.value, privateNote: privateNote.value, publicNote: publicNote.value});
    if(!res) return;
    setSnackbar({text:'Success! Your review is forwarded for approval!', color: 'success', modal: true})
    reviewStayDialog.value = false;
    rates.value = 4;
    privateNote.value = "";
    publicNote.value = "";
    step.value = 'rating'
    emit('refetch-rating')
  } catch (error) {
    console.log(error);
  } finally {
    publishingReview.value = false;
  }
}

const ratingStatus = computed(() => {
  const status = props?.ratingDetails?.status;
  if(!status) return;
  let desc = '';
  let color = '';
  if(status == 'APPROVED'){
    desc = 'Your review has been approved';
    color ='success';
  } else if (status == 'PENDING'){
    desc = 'Your review is pending approval';
    color = 'info';
  } else if (status == 'REJECTED'){
    desc = 'Your review has been rejected';
    color = 'error';
  }

  return {
    desc,
    color,
  }
  
})


watch(reviewStayDialog, () => {
  if (props.bookingReviewed) {
    rates.value = props.ratingDetails?.rating || 0;
    privateNote.value = props.ratingDetails?.privateNote || "";
    publicNote.value = props.ratingDetails?.publicNote || "";
  }
})
</script>
