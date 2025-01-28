<template>
  <v-row
    v-if="rating"
    no-gutters
    class="text-16px text-charcoal d-flex items-center align-center border pr-3 pl-1 rounded-xl"
  >
    <v-icon icon="mdi-star" color="#FBBC05" class="mr-1" size="small"></v-icon>
    <span>{{ rating }}</span>
    <span v-if="totalReviews" class="pl-2"
      >({{ totalReviews }} {{ totalReviews > 1 ? "reviews" : "review" }})</span
    >
  </v-row>
  <v-row
    v-else
    no-gutters
    class="text-16px text-charcoal d-flex items-center align-center border pr-3 pl-1 rounded-xl"
  >
    <v-icon
      icon="mdi-star-outline"
      color="#FBBC05"
      class="mr-1"
      size="small"
    ></v-icon>
    <span class="text-12px">No ratings yet</span>
  </v-row>
  <ReviewOverallReviews
        v-model="isShowAllReviewsDialog"
        :userReviews="ratingDetails?.details"
        :ratingAverage="ratingDetails?.averageRating"
        :totalRatings="ratingDetails?.totalReviews"
      />
</template>

<script setup lang="ts">
const props = defineProps<{
  rating: number;
  totalReviews: number;
  enquiry: TEnquiry;
}>();

const bookingReviewed = ref(false);
const showChatTemplateModal = ref(false);
const ratingDetails = ref<any>(null);
const privateNote = ref<string | null>(null);
const publicNote = ref<string | null>(null);
const isShowAllReviewsDialog = ref(false);



const fetchOverallSpaceRating = async () => {
  const spaceId = props.enquiry.space._id;
  if (!spaceId) return;
  try {
    const { data } = await getUserSpaceRating(spaceId as string);
    const res = data.value as any;
    if (!res) return;
    ratingDetails.value = res?.data?.[0];
    if (res && res.status && res.data) {
      for (const spaceData of res.data) {
        if (spaceData.details) {
          const match = spaceData.details.some(
            (detail) => detail.user === props.enquiry.user._id
          );
          if (match) {
            bookingReviewed.value = true;
            break;
          }
        }
      }
    }
    if (res.data[0]?.notes) {
      privateNote.value = res.data[0].notes.private || null;
      publicNote.value = res.data[0].notes.public || null;
    }
  } catch (error) {
    console.error("Error fetching rating and reviews:", error);
  }
};

// watch(
//   () => enquiry.value.space._id,
//   (newSpaceId) => {
//     if (newSpaceId) {
//       fetchOverallSpaceRating();
//     }
//   }
// );
</script>
