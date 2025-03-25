<template>
  <!-- Most Popular Venues Section -->
  <v-row no-gutters align="center">
    <v-col cols="12" sm="8">
      <v-row>
        <v-col cols="12" class="text-center text-sm-left">
          <h3 class="headline">EXPLORE</h3>
          <h2
            class="grey-darken-4 mb-5 mt-2 font-weight-bold text-sm-h5 text-lg-h4"
          >
            Most Popular Venues
          </h2>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row class="justify-start mb-10">
    <v-col
      cols="12"
      v-if="loadingPopular"
      class="d-flex align-center justify-center"
      style="height: 200px"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-col>
    <v-col
      cols="12"
      xs="6"
      sm="6"
      md="4"
      lg="3"
      v-for="space in slicedPopularArray"
      :key="space._id"
    >
      <SpotlightCard
        :space="space"
        :imageSrc="imageSrc"
        :navigateTo="navigateTo"
        :country="country"
        :favoriteCount="favoriteCount"
        @folderCreated="folderCreated"
        :favoriteObj="favoriteObj"
        @deselectFavorite="deselectFavorite"
      />
    </v-col>
    <v-col
      cols="12"
      v-if="!loadingPopular && spaceArrayPopular.length === 0"
      class="text-center"
    >
      <p>No popular venues available at the moment.</p>
    </v-col>
    <v-row no-gutters class="w-100">
      <v-btn
        variant="text"
        :loading="loadingMorePopular"
        v-if=" ((currentPagePopular < totalPopularPages)) || loadingMorePopular || (totalPopularItems <= 10 && !morePopularShown)"
        class="text-decoration-underline"
        @click="showMorePopular"
        >Show more popular venues</v-btn
      >
    </v-row>
  </v-row>

  <!-- Recently Listed Venues Section -->
  <v-row class="align-center">
    <v-col cols="12" sm="8">
      <v-row>
        <v-col cols="12" class="text-center text-sm-left">
          <h3 class="headline">Find more</h3>
          <h2
            class="grey-darken-4 mb-5 mt-2 font-weight-bold text-sm-h5 text-lg-h4"
          >
            Recently Listed Venues
          </h2>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row class="justify-start">
    <v-col
      cols="12"
      v-if="loadingRecent"
      class="d-flex align-center justify-center"
      style="height: 200px"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-col>
    <v-col
      cols="12"
      xs="6"
      sm="6"
      md="4"
      lg="3"
      v-for="space in slicedRecentArray"
      :key="space._id"
    >
      <SpotlightCard
        :space="space"
        :imageSrc="imageSrc"
        :navigateTo="navigateTo"
        :country="country"
        :favoriteCount="favoriteCount"
        @folderCreated="folderCreated"
        :favoriteObj="favoriteObj"
        @deselectFavorite="deselectFavorite"
      />
    </v-col>
    <v-col
      cols="12"
      v-if="!loadingRecent && spaceArrayRecent.length === 0"
      class="text-center"
    >
      <p>No recently listed venues available at the moment.</p>
    </v-col>
    <v-row no-gutters class="w-100"> </v-row>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import SpotlightCard from "../Card/SpotlightCard.vue";

const router = useRouter();
const { country, setSnackbar } = useLocal();
const { smAndUp, lgAndUp, mdAndUp } = useDisplay();
const { loggedIn } = useLocalAuth();
const { getGroupOfFavorites, deselectFavorites } = useFavorites();
const { getMostPopular } = useMostPopular();

const spaceArrayPopular = ref<Partial<TVenueSpace>[]>([]);
const spaceArrayRecent = ref<Partial<TVenueSpace>[]>([]);
const slicedPopularArray = ref<Partial<TVenueSpace>[]>([]);
const slicedRecentArray = ref<Partial<TVenueSpace>[]>([]);
const favoriteCount = ref(0);
const favoriteObj = ref();
const loadingPopular = ref(true);
const loadingRecent = ref(true);
const currentPagePopular = ref(1);
const totalPopularPages = ref(1);
const totalPopularItems = ref(0);
const loadingMorePopular = ref(false);
const morePopularShown = ref(false);

// Fetch popular venues
const assignSpaceDataPopular = async () => {
  loadingPopular.value = true;
  // const { data } = await useAPI("/v1/space/most-popular", {
  //   query: {
  //     status: "PUBLISHED",
  //     location: useCookie("country").value?.toUpperCase() || "SG",
  //   },
  // });
  const res: any = await getMostPopular({
    status: "PUBLISHED",
    location: useCookie("country").value?.toUpperCase() || "SG",
  });
  spaceArrayPopular.value = res?.data || [];
  totalPopularPages.value = res?.total_pages;
  totalPopularItems.value = res?.total_items
  loadingPopular.value = false;
};

const showMorePopular = async () => {
  morePopularShown.value = true;
  if (currentPagePopular.value == totalPopularPages.value) {
    return;
  }
  loadingMorePopular.value = true;
  currentPagePopular.value++;
  try {
    const res: any = await getMostPopular({
      status: "PUBLISHED",
      location: useCookie("country").value?.toUpperCase() || "SG",
      page: currentPagePopular.value,
      limit: 10,
    });
    if (res?.data.length > 0) {
      spaceArrayPopular.value = [...spaceArrayPopular.value, ...res?.data];
      slicedPopularArray.value = spaceArrayPopular.value;
    }

    totalPopularPages.value = res?.total_pages;
  } catch (e) {
    console.error(e);
  } finally {
    loadingMorePopular.value = false;
  }
};

// Fetch recently listed venues
const assignSpaceDataRecent = async () => {
  loadingRecent.value = true;
  const { data: recentData } = await useAPI(
    `/v1/space/recently-listed/?location=${useCookie("country").value?.toUpperCase() || "SG"}&status=PUBLISHED&fully_verified=true`,
    {
      query: {
        status: "PUBLISHED",
        location: useCookie("country").value?.toUpperCase() || "SG",
      },
    }
  );

  spaceArrayRecent.value = recentData.value ? recentData.value.data.data : [];
  loadingRecent.value = false;
};

assignSpaceDataPopular();
assignSpaceDataRecent();

const imageSrc = (spaceId: string): string => {
  const space = spaceArrayPopular.value.find((obj) => obj._id === spaceId);
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

const getFavoriteCount = async () => {
  if (!loggedIn.value) return;

  const { data }: { data: any } = await getGroupOfFavorites();

  if (data.value.results.length === 0) {
    favoriteCount.value = 0;
  } else {
    favoriteObj.value = data.value.results;
    favoriteCount.value = data.value.results.filter(
      (item) => item._id.folder_name !== "Recently Viewed"
    ).length;
  }
};

getFavoriteCount();

const navigateTo = (route) => {
  router.push(route);
};

async function folderCreated() {
  await getFavoriteCount();
  await assignSpaceDataPopular();
}

async function deselectFavorite(val) {
  const favoriteId = val;
  await deselectFavorites(favoriteId as string).then(async () => {
    await assignSpaceDataPopular();
    setSnackbar({
      color: "success",
      text: "Removed from your favorites list",
      modal: true,
    });
  });
}

// Watch for responsive slicing
watchEffect(() => {
  const popular = spaceArrayPopular.value;
  const recent = spaceArrayRecent.value;

  if (lgAndUp.value) {
    slicedPopularArray.value = !morePopularShown.value
      ? popular.slice(0, 4)
      : spaceArrayPopular.value;
    slicedRecentArray.value = recent.slice(0, 4);
  } else if (mdAndUp.value) {
    slicedPopularArray.value = !morePopularShown.value
      ? popular.slice(0, 4)
      : spaceArrayPopular.value;
    slicedRecentArray.value = recent.slice(0, 4);
  } else if (smAndUp.value) {
    slicedPopularArray.value = !morePopularShown.value
      ? popular.slice(0, 6)
      : spaceArrayPopular.value;
    slicedRecentArray.value = recent.slice(0, 6);
  } else {
    slicedPopularArray.value = !morePopularShown.value
      ? popular.slice(0, 4)
      : spaceArrayPopular.value;
    slicedRecentArray.value = recent.slice(0, 4);
  }
});
</script>

<style scoped>
.headline {
  color: rgba(var(--v-theme-primary));
  font-family: "DM Sans", sans-serif;
  text-transform: uppercase;
  font-size: 25px;
}

.title {
  font-size: 39px;
  font-weight: 700;
  color: var(--custom-secondary, #424242);
  font-family: "DM Sans", sans-serif;
}

.custom-outlined-btn {
  border-width: 1px !important;
  box-shadow: none !important;
}
</style>
