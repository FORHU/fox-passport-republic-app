<template>
  <v-row
    no-gutters
    v-for="review in userReviews"
    :key="review._id"
    class="mb-10"
  >
    <v-col cols="12">
      <div class="d-flex align-center ga-3">
        <ProfileAvatar
          size="50px"
          imgSrc=""
          :first_name="review?.user?.first_name"
          :last_name="review?.user?.last_name"
        />
        <div class="d-flex align-start flex-column">
          <span class="font-weight-medium">{{
            formattedName(review?.user?.first_name, review?.user?.last_name)
          }}</span>
          <span class="text-body-2"
            >{{ timeAgo(review.user?.createdAt, false) }} on Venue4use</span
          >
        </div>
      </div>
    </v-col>
    <v-col cols="12" class="my-2">
      <div class="d-flex align-center text-body-2">
        <v-rating
          hover
          readonly
          :length="5"
          :size="24"
          :model-value="review.rating"
          color="warning"
          active-color="warning"
        />
        <p class="mb-0 ml-2 text-body-2">{{ timeAgo(review.updatedAt) }}</p>
      </div>
    </v-col>
    <ExpandableDescription charLimit="50" :description="review.publicNote" />
  </v-row>
</template>

<script setup lang="ts">
interface UserReview {
  _id: string;
  userId: string;
  spaceId: string;
  name: string;
  createdAt: string;
  privateNote: string;
  publicNote: string;
  rating: number;
  updatedAt: string;
  user: TUser;
}

defineProps({
  userReviews: {
    type: Array as () => UserReview[],
    required: true,
    default: () => [],
  },
});

const formattedName = (first: string, last: string) => {
  const slicedLastName = last.slice(0, 1) + ".";
  const parts = [first, slicedLastName].filter(Boolean); // Filter out null or undefined parts
  return parts.join(" "); // Join non-empty parts with a space
};

const { timeAgo } = useUtils();
</script>
