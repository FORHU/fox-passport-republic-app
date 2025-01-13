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
      <template v-if="getRate(space) && getRate(space).length > 0">
        <template v-for="item, index in getRate(space)" :key="item?.type">
          <span v-if="getRate(space)" class="text-14px font-500">{{ index !== 0 ? ' /' : '' }}
            {{ currencySymbol(space?.pricing?.currency) }} {{ item?.rate }}
            <span class="font-weight-regular">{{ item.type }}</span>
          </span>
        </template>
      </template>
      <template v-else>
        <span class="text-secondary text-14px">Not available</span>
      </template>
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
    type: Array,
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

// make currency dynamic from the registered currency on venue/space creation
const currencySymbol = (currency: string) => {
  if (!currency) return ''
  return getCurrencySymbol(currency.toUpperCase());
}

const getRate = (space: any) => {
  const pricing = space?.pricing;
  const selectedPricing = space?.pricing?.selected_pricing;
  const date_calendar = props?.date_calendar
  const [minPrice, maxPrice]: [string | null, string | null] = props?.priceFilter as [string | null, string | null] || [null, null];

  // Check for min/max price is in default;
  const isDefaultPriceFilter = minPrice == null && !maxPrice || parseInt(maxPrice as string) === 0;
  let priceArray = [];

  if (selectedPricing == 'HIRE_FEE') {

    let lowestRate = Infinity;
    let lowestHourlyRate: null | number = null;
    let lowestPerDayRate: null | number = null;

    const getLowestRate = (array: any = []) => {
      array.forEach((x: any) => {
        // Check if the current rates are valid
        const currentHourlyRate = x?.slots?.rate;
        const currentFullDayRate = x?.full_day_rate;

        if (currentHourlyRate != null && x?.hourlyCheckBox) {
          if (currentHourlyRate < lowestRate) {
            lowestHourlyRate = currentHourlyRate;
            lowestRate = currentHourlyRate;
            lowestPerDayRate = (currentFullDayRate && x?.fullRateCheckkBox) ? currentFullDayRate : null;
          }
        }

        if (currentFullDayRate != null && x?.fullRateCheckkBox) {
          if (currentFullDayRate < lowestRate) {
            lowestPerDayRate = currentFullDayRate
            lowestRate = currentFullDayRate;
            lowestHourlyRate = (currentHourlyRate && x?.hourlyCheckBox) ? currentHourlyRate : null;
          }
        }
      })

      if (lowestHourlyRate) {
        priceArray.push({ rate: lowestHourlyRate, type: 'per hour' })
      }
      if (lowestPerDayRate) {
        priceArray.push({ rate: lowestPerDayRate, type: 'per day' })
      }
    }

    if (date_calendar) {
      const date = new Date(date_calendar);
      const day = date?.toLocaleString("en-US", { weekday: 'long' })?.toUpperCase();

      const obj = pricing?.hire_fee?.days?.find((x: any) => x?.name.toUpperCase() == day)
      const perDay = obj?.fullRateCheckkBox;
      const hourly = obj?.hourlyCheckBox;

      if (hourly) {
        priceArray.push({ rate: obj?.slots?.rate, type: 'per hour' })
      }
      if (perDay) {
        priceArray.push({ rate: obj?.full_day_rate, type: 'per day' })
      }
      if (!hourly && !perDay) {
        return null;
      }

    } else if (!date_calendar && !isDefaultPriceFilter) {


      // get prices that matches the price filter
      const allPricesArray = pricing?.hire_fee?.days?.filter((x: any) => (parseInt(minPrice as string) <= x?.slots?.rate && parseInt(maxPrice as string) >= x.full_day_rate) || (parseInt(minPrice as string) <= x.full_day_rate && parseInt(maxPrice as string) >= x.full_day_rate))

      if (allPricesArray.length > 0) {
        getLowestRate(allPricesArray)
      }


    } else {
      // get prices that matches the price filter
      const allPricesArray = pricing?.hire_fee?.days
      if (allPricesArray.length > 0) {
        getLowestRate(allPricesArray)
      }
    }



    // FOR CUSTOM PRICES
  } else {

    let lowestRate = Infinity;
    let duration = '';

    // get lowest rate with comparison on price range
    const getLowestRateWithPricesFilter = (array: any = []) => {
      array.forEach((x: any) => {
        if (x?.price < lowestRate && parseInt(minPrice as string) <= x.price && parseInt(maxPrice as string) >= x.price) {
          lowestRate = x?.price
          duration = x?.duration
        }
      })
      priceArray.push({ rate: lowestRate, duration, type: duration })
    }

    // get lowest rate without comparison on price range
    const getLowestRateWithoutPricesFilter = (array: any = []) => {
      array.forEach((x: any) => {
        if (x?.price < lowestRate) {
          lowestRate = x?.price
          duration = x?.duration
        }
      })
      priceArray.push({ rate: lowestRate, duration, type: duration })
    }

    // if calendar is defined
    if (date_calendar) {
      const date = new Date(date_calendar);
      const day = date?.toLocaleString("en-US", { weekday: 'long' })?.toUpperCase();

      // filter prices with similar weekday
      const filterPricesArray = pricing?.custom_price?.prices.filter((x: any) => x.weekdays.includes(day))

      if (isDefaultPriceFilter) {
        getLowestRateWithoutPricesFilter(filterPricesArray)

      } else {
        // if both calendar and prices filter are defined
        getLowestRateWithPricesFilter(filterPricesArray);
      }
    }

    // if calendar is null and filter are with values
    else if (!date_calendar && !isDefaultPriceFilter) {
      const pricesArray = pricing?.custom_price?.prices
      // const minSpendPrice = pricing?.custom_price?.prices.find((x => x?.minimum_spend ))
      getLowestRateWithPricesFilter(pricesArray);

    } else {
      // if both calendar is null and filter are with values
      const pricesArray = pricing?.custom_price?.prices
      getLowestRateWithoutPricesFilter(pricesArray)
    }

  }

  return priceArray;

}

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
