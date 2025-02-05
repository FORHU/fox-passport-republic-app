<template>
  <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
  <v-row
    no-gutters
    class="py-8 px-14 ml-n3 pb-15"
    justify="center"
    style="height: 100%"
    v-else
  >
    <v-col cols="12" xxl="11" xl="10" lg="10">
      <v-row no-gutters>
        <v-col
          cols="12"
          class="font-weight-bold text-h5 text-capitalize"
          :class="mobile ? 'text-center' : ''"
        >
          <v-row class="pb-5">
            <v-col cols="6">
              <v-row no-gutters>
                <v-icon @click="backToFavorites()" size="small"
                  >mdi-arrow-left</v-icon
                >
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row no-gutters justify="end">
                <v-btn
                  @click="editRecentlyFunction()"
                  variant="outlined"
                  size="small"
                  >{{ editRecently ? "Done" : "Edit" }}</v-btn
                >
                <!-- <FavoritesCreateFolderDialog v-model="createFolderDialog"/> -->
                <!-- <v-btn @click="addToFolderDialog=true" variant="outlined" size="small">Edit</v-btn> -->
                <!-- <FavoritesAddToFavorites v-model="addToFolderDialog"/> -->
              </v-row>
            </v-col>
          </v-row>
          Recently viewed
        </v-col>
        <!-- <v-row class="pt-10 pl-10 ">
                  <v-row v-for="(item,index) in recentlyViewedData" :key="index" class="w-100">
                    <v-row class="pt-10 pb-5 font-600 font-weight-600 w-100">
                      {{ formatDate(item.date) }}

                      <v-row no-gutters class="w-100 pt-2  pl-n6 ml-n3">
                      <v-col v-for="(space,i) in item.spaces" :key="i" cols="3">
                         <CardVenueCard
                            :space="space"
                            :imageSrc="imageSrc"
                            :navigateTo="navigateTo"
                            :country="country"
                            />

                      </v-col>
                    </v-row>
                    </v-row>
                    

                  </v-row>
                </v-row> -->
        <v-container fluid>
          <v-row class="pt-10 pl-10">
            <v-row
              v-for="(item, index) in recentlyViewedData"
              :key="index"
              class="w-100 pt-10"
            >
              <!-- Date Row -->
              <v-row class="pb-5 font-600 font-weight-600 w-100">
                <v-col cols="12">
                  <span>{{ formatDate(item.date) }}</span>
                </v-col>
              </v-row>

              <!-- Responsive Display -->
              <v-row no-gutters class="pt-2 pl-n6 ml-n3">
                <!-- Small Screens: Use Carousel -->
                <v-col v-if="xs" cols="12">
                  <v-carousel
                    hide-delimiter-background
                    cycle
                    hide-delimiters
                    show-arrows
                    class="pt-2 mb-1"
                  >
                    <v-carousel-item
                      v-for="(space, i) in item.spaces"
                      :key="i"
                      class="pa-0"
                    >
                      <CardVenueCard
                        :space="space"
                        :imageSrc="imageSrc"
                        :navigateTo="navigateTo"
                        :country="country"
                        :editRecently="editRecently"
                        @removeRecentlyId="removeRecentlyId"
                        :computedVenues="computedVenues"
                        :favoriteObj="favoriteObj"
                        @deselectChosenFavorite="deselectChosenFavorite"
                      />
                    </v-carousel-item>
                  </v-carousel>
                </v-col>

                <!-- Large Screens: Grid Layout -->
                <v-col v-else cols="12">
                  <v-row>
                    <v-col
                      v-for="(space, i) in item.spaces"
                      :key="i"
                      cols="12"
                      sm="6"
                      md="4"
                      lg="3"
                    >
                      <CardVenueCard
                        :space="space"
                        :imageSrc="imageSrc"
                        :navigateTo="navigateTo"
                        :country="country"
                        :editRecently="editRecently"
                        @removeRecentlyId="removeRecentlyId"
                        :computedVenues="computedVenues"
                        :favoriteObj="favoriteObj"
                        @folderCreated="folderCreated"
                        @deselectChosenFavorite="deselectChosenFavorite"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-row>
          </v-row>
        </v-container>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { country, setSnackbar } = useLocal();
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
const { mobile, xs, sm, smAndDown, mdAndDown } = useDisplay();
const router = useRouter();
const {
  getRecentlyViewed,
  removeRecentlyViewed,
  getGroupOfFavorites,
  deselectFavorites,
} = useFavorites();
const { fetchVenues } = useVenue();
const loader = ref(false);
const createFolderDialog = ref(false);
const addToFolderDialog = ref(false);
const recentlyViewedData = ref("");
const spacesData = ref("");
const editRecently = ref("");
const venues = ref<TVenueSpace[]>([]);
const favoriteObj = ref();

const backToFavorites = () => {
  navigateTo({ name: "country-favorites", params: { country } });
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() == today.getTime()) {
    return "Today";
  } else if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
}

const navigateTo = (route) => {
  router.push(route);
};

const imageSrc = (spaceId: string): string => {
  const space = spacesData.value.find((obj) => {
    return obj._id == spaceId;
  });
  if (!space) return "";

  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
  ];
  const imageObj = space.space_photo.find((image) => {
    const extension = image.path
      .substring(image.path.lastIndexOf("."))
      .toLowerCase();
    return imageExtensions.includes(extension);
  });

  return imageObj?.path || "";
};

async function getVenues() {
  loader.value = true;
  try {
    const params = {
      mark_as_favorite: true,
      status: "PUBLISHED",
      limit: 12,
    };
    const { data }: { data: any } = await fetchVenues(params);
    if (data) {
      venues.value = data.value.data.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loader.value = false;
  }
}

const computedVenues = computed(() => {
  return venues.value
    .filter((el) => el.marked_as_favorite?.isFavorite == true)
    .map((el) => {
      return {
        _id: el._id,
        marked_as_favorite: el.marked_as_favorite,
      };
    });
});

async function getFavoriteObj() {
  const { data }: { data: any } = await getGroupOfFavorites();
  favoriteObj.value = data.value.results;
}

async function loadInitialData() {
  loader.value = true;
  try {
    const page = 0;
    const limit = 10;
    const { data }: { data: any } = await getRecentlyViewed(
      page as number,
      limit as number
    );
    recentlyViewedData.value = data.value.results;
    spacesData.value = recentlyViewedData.value.flatMap((el) => el.spaces);
    await getVenues();
    await getFavoriteObj();
  } catch (error) {
    console.error(error);
  } finally {
    loader.value = false;
  }
}
loadInitialData();

function editRecentlyFunction() {
  if (editRecently.value == "Remove") {
    return (editRecently.value = "");
  } else editRecently.value = "Remove";
}

async function removeRecentlyId(item) {
  let user_log_id = item;

  await removeRecentlyViewed(user_log_id as string);
  await loadInitialData();
}

async function folderCreated() {
  await loadInitialData();
}

async function deselectChosenFavorite(val) {
  const favoriteId = val;

  await deselectFavorites(favoriteId as string).then(() => {
    setSnackbar({
      color: "success",
      text: "Removed from your favorites list",
      modal: true,
    });
  });
  await loadInitialData();
}
</script>
