<template>
  <v-col cols="12">
    <article class="location-card cursor-pointer" @click="navigate">
      <v-carousel
        hide-delimiter-background
        show-arrows="hover"
        height="auto"
        :aspect-ratio="1"
        cycle
        @click.stop
        transition="fade-transition"
      >
        <!-- Check if there are photos to display -->
        <template v-if="space.space_photo && space.space_photo.length > 0">
          <v-carousel-item
            v-for="(photo, index) in space.space_photo"
            :key="index"
            @click="navigate"
            class="cursor-pointer"
          >
            <v-img
              :src="photo.path"
              :alt="`Space photo ${index + 1}`"
              class="location-image"
              width="100%"
              height="auto"
              aspect-ratio="1"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-carousel-item>
        </template>

        <v-carousel-item v-else>
          <v-img
            src="https://images.unsplash.com/photo-1577969182166-d1a497458e6d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D3"
            alt="Default space photo"
            class="location-image"
            width="100%"
            height="auto"
            aspect-ratio="1"
            cover
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="grey lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-carousel-item>

        <!-- Custom delimiters -->
        <template v-slot:delimiter="{ isActive }">
          <span
            :class="[
              'custom-delimiter',
              { 'custom-delimiter-active': isActive },
            ]"
          ></span>
        </template>
      </v-carousel>

      <v-chip
        class="location-badge rounded-xl"
        color="white"
        text-color="black"
        label
        v-if="!editRecently"
      >
        Elite Venue
      </v-chip>
      <v-img
        v-if="!editRecently"
        width="15%"
        height="11% "
        class="location-heart"
        :src="
          ifItsFavorite(space)
            ? '/images/navigation/redheartwhite.svg'
            : '/images/navigation/blackheartwhite.svg'
        "
        @click.stop="favoriteProcess(space)"
      ></v-img>
      <v-icon
        @click.stop="removeRecently(space)"
        v-else
        class="remove-icon"
        size="30"
        color="white"
        >mdi-close-circle</v-icon
      >
      <FavoritesCreateFolderDialog
        :space_id="space._id"
        v-model="createFolderDialog"
        @folderCreated="folderCreated"
      />
      <FavoritesAddToFavorites
        :space_id="space._id"
        :favoriteObj="props.favoriteObj"
        v-model="addToFolderDialog"
        @folderCreated="folderCreated"
      />
      <div class="location-card-content">
        <div class="d-flex justify-space-between align-center">
          <p class="location-card-title font-weight-bold text-truncate">
            {{ space.name }}
          </p>
          <div v-if="space.rating" class="d-flex align-center text-body-2">
            <v-icon small class="star-icon">mdi-star</v-icon>
            <span class="ml-1">
              {{ space.rating.averageRating || "N/A" }} ({{
                space.rating.totalRating || 0
              }})
            </span>
          </div>
          <div v-else>
            <span class="text-body-2 d-flex align-center">
              <v-icon small class="star-icon">mdi-star-outline</v-icon>
              No Ratings
            </span>
          </div>
        </div>

        <v-divider class="mt-1"></v-divider>
        <v-row no-gutters class="mb-1">
          <v-col
            cols="auto"
            class="d-flex align-center justify-center font-weight-medium py-2"
          >
            <v-icon color="grey" class="mr-1">mdi-cash-clock</v-icon>
            <v-chip variant="tonal" color="charcoal" class="mr-2">
              <span class="d-flex align-center text-16px font-600 ga-1">
                {{ currencySymbol(space.pricing.currency) }}
                {{ getRate(space, true) }}
                <span class="text-12px font-400">
                  {{ getRate(space, false) }}
                </span>
              </span>
            </v-chip>
          </v-col>
        </v-row>

        <p
          class="location-card-description font-400 mt-n1 mb-1 d-flex align-center ga-2"
        >
          <v-icon color="grey">mdi-map-marker</v-icon>
          {{ formatAddress(space?.venue.address) }}
        </p>

        <div class="location-card-description d-flex align-center ga-2 mb-1">
          <v-icon>mdi-dots-grid</v-icon>
          <span
            >{{
              space.guest_capacity.minimum ? space.guest_capacity.minimum : "0"
            }}
            seating</span
          >
          <div class="border-md"></div>
          <span
            >{{
              space.guest_capacity.maximum ? space.guest_capacity.maximum : "0"
            }}
            standing</span
          >
        </div>
      </div>
    </article>
  </v-col>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
const { formatAddress } = useUtils();
const { getCurrencySymbol } = useLocal();
const props = defineProps({
  space: {
    type: Object,
    required: true,
  },
  imageSrc: {
    type: Function,
    required: true,
  },
  navigateTo: {
    type: Function,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  editRecently: {
    type: String,
    required: false,
  },
  // favoriteCount: {
  //   type: Number,
  //   required: true,
  // },
  favoriteObj: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  computedVenues: {
    type: [Array, Object],
    required: true,
  },
});

const navigate = () => {
  const router = useRouter();
  const url = router.resolve({
    name: "country-venues-venue",
    params: { country: props.country, venue: props.space._id },
  }).href;

  window.open(url, "_blank");
  // props.navigateTo({
  //   name: "country-venues-venue",
  //   params: { country: props.country, venue: props.space._id },
  // });
};
const favoritesDialog = ref(false);
const favoriteObj = props.favoriteObj;
const createFolderDialog = ref(false);
const addToFolderDialog = ref(false);
const getRate = (venue: any, option: boolean) => {
  const pricing = venue.pricing;
  const selectedPricing = venue.pricing?.selected_pricing;
  let hourly = false;
  let duration = "";
  let lowestRate = Infinity;
  if (selectedPricing === "HIRE_FEE") {
    pricing.hire_fee.days.forEach((day: any) => {
      if (day.slots.rate < lowestRate) {
        hourly = day.hourlyCheckBox;
        lowestRate = hourly ? day.slots.rate : day.full_day_rate;
      }
    });
    if (option) {
      return lowestRate === Infinity ? null : lowestRate;
    } else {
      return hourly ? "per hour" : "per day";
    }
  } else {
    pricing?.custom_price?.prices.forEach((price: any) => {
      if (price.price < lowestRate) {
        lowestRate = price.price;
        duration = price.duration;
      }
    });
    if (option) {
      return lowestRate === Infinity ? null : lowestRate;
    } else {
      return duration.toLowerCase();
    }
  }
};
const emit = defineEmits([
  "folderCreated",
  "removeRecentlyId",
  "deselectChosenFavorite",
]);

function folderCreated() {
  emit("folderCreated", { message: '"sample"' });
}

const currencySymbol = (currency: any) => {
  return getCurrencySymbol(currency);
};

function removeRecently(item) {
  emit("removeRecentlyId", item.user_log_id);
}

function favoriteProcess(val) {
  if (props.computedVenues.length == 0) {
    return (createFolderDialog.value = true);
  }
  const ifFavoriteIsPresent = props.computedVenues.filter(
    (el) => el._id == val._id
  );
  if (ifFavoriteIsPresent.length) {
    return emit(
      "deselectChosenFavorite",
      ifFavoriteIsPresent[0].marked_as_favorite._id
    );
  }
  if (!ifFavoriteIsPresent.length) {
    return (addToFolderDialog.value = true);
  }
}
const ifItsFavorite = (val) => {
  const ifFavoriteIsPresent = props.computedVenues.filter(
    (el) => el._id == val._id
  );
  if (ifFavoriteIsPresent.length) {
    return true;
  } else false;
};
</script>

<style scoped>
.location-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.location-image {
  border-radius: 12px;
}

.location-badge {
  position: absolute;
  top: 12px;
  left: 8px;
  background-color: white !important;
  color: black !important;
}

.location-heart {
  position: absolute;
  top: 1px;
  right: 8px;
}

.remove-icon {
  position: absolute;
  top: 12px;
  left: 8px;
}

.location-card-content {
  padding: 6px;
}

.location-card-title {
  font-size: 1.2rem;
  margin: 8px 0;
  max-width: 100%; /* Ensure the element doesn't grow beyond its container */
  display: block; /* Change from flex to block to avoid flexbox issues */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.star-icon {
  margin-left: 8px;
  color: #ffd700;
}

.location-card-type {
  font-size: 1rem;
  color: grey;
  margin-top: 4px;
}

.location-card-description {
  font-size: 0.9rem;
  color: #888;
  margin-top: 4px;
}

.location-card-icons {
  margin: 8px 0;
}

.location-card-icons v-icon {
  margin-right: 4px;
}

.location-card-price {
  font-size: 1rem;
  font-weight: bold;
  color: #373941;
  margin-top: 8px;
}
</style>
