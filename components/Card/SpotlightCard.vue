<template>
  <article class="location-card cursor-pointer" @click="navigate">
    <v-carousel hide-delimiter-background :show-arrows="filteredPhotos.length > 1 ? 'hover' : false" height="auto"
      :aspect-ratio="1" @click.stop transition="fade-transition">
      <!-- Check if there are photos to display -->
      <template v-if="filteredPhotos.length > 0" v-for="photo, index in filteredPhotos" :key="photo?._id">
        <v-carousel-item v-if="photo?.contentType?.includes('image')" @click="navigate" class="cursor-pointer">
          <v-img :src="photo.path" :alt="`Space photo ${index + 1}`" class="location-image cursor-pointer" width="100%"
            height="auto" aspect-ratio="1" cover>
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-carousel-item>
      </template>

      <!-- Fallback when no photos are available -->
      <v-carousel-item v-else>
        <v-img
          src="https://images.unsplash.com/photo-1577969182166-d1a497458e6d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D3"
          alt="Default space photo" class="location-image" width="100%" height="auto" aspect-ratio="1" cover>
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-carousel-item>

      <!-- Custom delimiters -->
      <template v-slot:delimiter="{ isActive }">
        <span :class="['custom-delimiter', { 'custom-delimiter-active': isActive }]"></span>
      </template>
    </v-carousel>

    <!-- Badge and Favorite Icon -->
    <v-chip class="location-badge rounded-xl" color="white" text-color="black" label>
      Elite Venue
    </v-chip>
    <!-- <v-icon
      :color="space.marked_as_favorite.isFavorite ? 'red' : ''"
      @click.stop="
        // favoriteCount === 0
        //   ? (createFolderDialog = true)
        //   : space.marked_as_favorite.isFavorite
        //   ?deselectFavoriteFunction(space.marked_as_favorite)
  //   : (addToFolderDialog = true)
        favoriteProcess(space.marked_as_favorite)
      "
      class="location-heart"
    >
      {{
        space.marked_as_favorite.isFavorite ? "mdi-heart" : "mdi-heart-outline"
      }}
    </v-icon> -->
    <v-img v-if="isUser || !loggedIn" height="15%" width="15%"
      :src="space?.marked_as_favorite?.isFavorite ? '/images/navigation/redheartwhite.svg' : '/images/navigation/blackheartwhite.svg'"
      @click.stop="
        favoriteProcess(space?.marked_as_favorite)
        " class="location-heart">

    </v-img>

    <!-- Folder Dialogs -->
    <FavoritesCreateFolderDialog :space_id="space._id" v-model="createFolderDialog" @folderCreated="folderCreated" />
    <FavoritesAddToFavorites :space_id="space._id" :favoriteObj="favoriteObj" v-model="addToFolderDialog"
      @folderCreated="folderCreated" />

    <!-- Card Content -->
    <div class="location-card-content">
      <div class="d-flex justify-space-between align-center">
        <p class="location-card-title font-weight-bold mt-2 word-break">
          {{ sliceContent(space.name, 55) }}
        </p>
        <!-- <div class="d-flex align-center">
          <v-icon small class="star-icon">mdi-star</v-icon>
          <span class="ml-1">5.0</span>
        </div> -->
      </div>
      <p class="location-card-description word-break"> {{ sliceContent(space?.venue?.name, 75) }}</p>
      <v-row no-gutters class="my-1">
         <CardPricingChips :space="space as TVenueSpace" :date_calendar="date_calendar" :price-filter="priceFilter" />
      </v-row>
      <div class="location-card-icons d-flex align-center ga-2">
        <v-icon small v-if="isSeatingLayout(space)">mdi-seat</v-icon>
        <span v-if="isSeatingLayout(space)">{{
          getSeatingMaxCapacity(space)
          }}</span>
        <v-icon small v-if="isStandingLayout(space)">mdi-human-male</v-icon>
        <span v-if="isStandingLayout(space)">{{
          getStandingMaxCapacity(space)
          }}</span>
      </div>
    </div>
  </article>
  <FavoritesSignIn v-model="signInForFavoritesDialog" />
</template>

<script setup lang="ts">
const { setSnackbar, getCurrencySymbol, country } = useLocal();
const { sliceContent } = useUtils();
const { isUser } = useAccess();
const { loggedIn } = useLocalAuth();
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
  numGuest: {
    type: Number,
    required: false,
  },
  date_calendar: {
    type: String,
    required: false,
  },
  event_type: {
    type: String,
    required: false,
  },
  favoriteCount: {
    type: Number,
    required: true,
  },
  favoriteObj: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  priceFilter: {
    type: Array as any,
    required: false,
  }
});

const createFolderDialog = ref(false);
const addToFolderDialog = ref(false);
const signInForFavoritesDialog = ref(false)

const filteredPhotos = computed(() => {
  const arr = props.space.space_photo
  if (arr && arr.length > 0) {
    return arr.filter((x: TFile) => x.contentType.includes('image'))
  } else {
    return [];
  }

})

const navigate = () => {
  useCookie("event_type").value = props.event_type as string;
  useCookie("eventDate").value = props.date_calendar as string;
  useCookie("guestNumber").value = props.numGuest === 0 ? null : props.numGuest;
  const router = useRouter();
  const url = router.resolve({
    name: "country-venues-venue",
    params: { country: props.country, venue: props.space._id },
  }).href;

  router.push(url);
};

const isStandingLayout = (venue: any) => {
  return venue.capacity_layout?.some(
    (layout: any) => layout.question === "Standing" && layout.answer === true
  );
};

const getStandingMaxCapacity = (venue: any) => {
  const standingLayout = venue.capacity_layout?.find(
    (layout: any) => layout.question === "Standing" && layout.answer === true
  );
  return standingLayout ? standingLayout.max_capacity : null;
};

const isSeatingLayout = (venue: any) => {
  return venue?.capacity_layout?.some(
    (layout: any) => layout.question !== "Standing" && layout.answer === true
  );
};

const getSeatingMaxCapacity = (venue: any) => {
  const seatingLayout = venue.capacity_layout
    ?.filter(
      (layout: any) => layout.answer === true && layout.question !== "Standing"
    )
    ?.reduce((maxLayout: any, currentLayout: any) => {
      return currentLayout.max_capacity > (maxLayout?.max_capacity || 0)
        ? currentLayout
        : maxLayout;
    }, null);

  return seatingLayout ? seatingLayout.max_capacity : null;
};


const emit = defineEmits(["folderCreated", 'deselectFavorite', 'signinFirst']);
function folderCreated() {
  emit("folderCreated");
}

async function deselectFavoriteFunction(item) {
  const favoriteId = item._id
  // console.log("galing Spotlight Card",item)
  emit('deselectFavorite', favoriteId)

}

async function favoriteProcess(val) {
  if (!loggedIn.value) {
    return signInForFavoritesDialog.value = true
  }
  if (props.favoriteCount === 0) {
    return createFolderDialog.value = true
  }
  if (val.isFavorite) {
    return deselectFavoriteFunction(val)
  }
  else {
    return addToFolderDialog.value = true
  }
}

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
  /* top: 12px; */
  top: 1px;
  right: 8px;
}

.location-card-content {
  padding: 6px;
}

.location-card-title {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.star-icon {
  margin-left: 8px;
  color: #ffd700;
}

.location-card-description {
  font-size: 0.9rem;
  color: #888;
}

.location-card-icons {
  margin: 4px 0;
}

.location-card-icons v-icon {
  margin-right: 4px;
}

.custom-delimiter {
  height: 8px;
  width: 8px;
  margin: 4px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
}

.custom-delimiter-active {
  background-color: #ffd700;
}

.fade-transition-enter-active,
.fade-transition-leave-active {
  transition: opacity 0.5s ease;
}

.fade-transition-enter,
.fade-transition-leave-to

/* .fade-leave-active in <2.1.8 */
  {
  opacity: 0;
}

.location-image {
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
}

.word-break {
  word-break: break-word
}
</style>
