<template>
    <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
        <v-row
        no-gutters
        class="py-8 px-15 pb-15 "
        justify="center"
        style="height: 100%"
        v-else
        >
        <v-col cols="12" xxl="11" xl="10" lg="10">
            <v-row no-gutters >
                 <v-col
                cols="12"
                class="font-weight-bold text-h5 text-capitalize"
                :class="mobile ? 'text-center' : ''"
                >
                Favorites
                </v-col>
                <v-col cols="12">
                    <v-row  v-if="favoriteObjFiltered.length == 0" class="text-center px-15 pt-15 mt-10" justify="center" style="min-height: 100vh;" >
                        <!-- <CardEmptyState  :showButton="false" /> -->
                         <v-col cols="12">
                          <span class="font-500">You don't have any favorites yet</span>
                          <br />
                          <span>Add your favorites venue when clicking the heart “♡” button in venue listings</span>
                        </v-col>
                    </v-row>
                    <v-row v-else class="pt-10 mb-n10">
                        <v-col cols="12" sm="12" md="3" lg="3" class="mb-n15">
                            <v-row  no-gutters :style="`min-height: ${smAndDown ? '326px' : '326px'};`">
                                <v-col v-if="recentlyViewed[0]._id.cover_photo.length" v-for="(item,index) in recentlyViewed[0]._id.cover_photo" :key="index" cols="6" class=" pr-1 mb-n10 ">
                                    <v-card @click="goToRecentlyviewed()" variant="flat" :class="getClassProp(i)" class="mb-n15 pb-n10">
                                        <v-img
                                         cover
                                         :height="smAndDown ? '100%' : '104'"
                                         :src="getImage(item)"
                                         alt="favorites featured image"
                                        />
                                    </v-card>
                                </v-col>
                                <!-- <v-row v-else > -->
                                  <div v-else align='center' :height="sm ? '100%' : '208'">
                                    There is no recently viewed yet
                                  </div>
                                <!-- </v-row> -->
                                <v-row class="w-100 pt-3 mb-n10  pl-3 font-weight-bold">
                                    Recently Viewed
                                </v-row>
                                
                            </v-row>
                            
                        </v-col>
                        <v-col class="mb-10 " v-for="(space,index) in spaceArray" :key="index" cols="12" sm="12" md="3" lg="3">
                            <NuxtLink
                                :to="{
                                    name: 'country-favorites-favoritesfolder',
                                    params: { country: country  },
                                    query:{ folder_name:space._id.folder_name,favorite_folder:space._id.favorite_folder}
                                }"
                                target="_blank"
                                >
                            <v-card variant="flat">
                            <v-img
                            cover
                            :height="sm ? '100%' : '212'"
                             class="rounded-lg"
                             :src="getImage(space.cover_photo)"></v-img>
                             <!-- <v-img
                            cover
                            :height="sm ? '100%' : '212'"
                             class="rounded-lg"
                             src="/background.jpeg"></v-img> -->
                             </v-card>
                             </NuxtLink>
                             <v-row class="w-100 pt-5 pl-3 font-weight-bold">
                                {{ space._id.folder_name ? space._id.folder_name:'' }}
                             </v-row>
                             <v-row class="w-100  pl-3 text-subtitle-2">
                               {{ `${space.favorites.length} saved` }}
                             </v-row>

                        </v-col>
                    </v-row>
                </v-col>
                
            </v-row>
        </v-col>
    </v-row>


</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { mobile, xs, sm,smAndDown } = useDisplay();
const { country } = useLocal();
const { fetchVenues } = useVenue();
const { formatAddress } = useUtils();
const { setSnackbar } = useLocal();
const {addNewFavoriteFolder,getListOfFolders,getGroupOfFavorites,updateFavoritesFolder} = useFavorites()
const loader = ref(false);
const spaceArray = ref<TVenueSpace[]>([]);
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(0);
const recentlyViewed = ref('')

const loadInitialData = async () => {
  // const params = {
  //   mark_as_favorite: true,
  //   status: "PUBLISHED",
  //   limit: 10,
  // };

  // const { data }: { data: any } = await fetchVenues(params);
  // if (data) {
  //   console.log(data.value.data.data)
  //   spaceArray.value = data.value.data.data;
  //   currentPage.value = data.value.data.current_page;
  //   totalItems.value = data.value.data.total_items;
  //   totalPages.value = data.value.data.total_pages;
  // }
  // await insertFavorite()
  // await getListOfFolders()
  await getGroupOfFavoritesFunction()
  // await insertNewFavorite()
};
const favoriteObjFiltered = computed(() => { 
  return spaceArray.value.filter(item => item._id.folder_name !== "Recently Viewed");
})

const insertFavorite = async () => {
  let spaceId = '6697995f8630454b12729a2e';
  let folder_name = 'SampleFolderAugust8';
  await addNewFavoriteFolder(spaceId as string, folder_name as string);
}

const insertNewFavorite = async () => {
  let spaceId = '669a179d51ea1a4c0a8d4a2c';
  let favorite_folder_id = '66b1b54a4f853645eae7f5ac';
  await addNewFavoriteFolder(spaceId as string, favorite_folder_id as string);
  
}

const updateFavoritesFolderFunction = async () => {
  let spaceId = '669a179d51ea1a4c0a8d4a2c'
  let favorite_folder_id = '66b1c737807a23c5ed9273d2';
  let favoriteId = '66b1bce14f853645eae7f5cf'

  await updateFavoritesFolder(spaceId as string,favorite_folder_id as string,favoriteId as string)
  
 }


const getGroupOfFavoritesFunction = async () => {
 const { data }: { data: any }   = await getGroupOfFavorites()
  // console.log(data.value.results)
  spaceArray.value = data.value.results;
  spaceArray.value = data.value.results.filter(item => item._id.folder_name !== "Recently Viewed");
  recentlyViewed.value = data.value.results.filter(item => item._id.folder_name == "Recently Viewed");
  // console.log(recentlyViewed.value)
}

const getImage = (spaces: any) => {
  // console.log(spaces,'spaces')
  // const images = [spaces]
  //   .filter((file: any) => {
  //       console.log(file)
  //   file.contentType.startsWith("image/")
  // }

  // );
  // console.log(images)
  // return images.length ? images[0].path : "/images/venue/sample_venue.jpg";
  if (spaces) {
    return spaces.path
  }
  else return "/images/venue/sample_venue.jpg"
  
};

const getRate = (venue: any, option: boolean) => {
  const pricing = venue.pricing;
  const selectedPricing = venue.pricing.selected_pricing;
  let hourly = false;
  let duration = "";
  let lowestRate = Infinity;
  if (selectedPricing === "HIRE_FEE") {
    pricing.hire_fee.days.forEach((day) => {
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
    pricing.custom_price.prices.forEach((price) => {
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

const handleFavorite = async (space: any) => {
  await useAPI(`/v1/favorite/${space.marked_as_favorite._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      marked_as_favorite: false,
    }),
  });
  setSnackbar({
    color: "success",
    text: "Removed from your favorites list",
    modal: true,
  });

  await loadInitialData();
};

onMounted(async () => {
  loader.value = true;
  await loadInitialData();
  loader.value = false;
});

function getClassProp(val) {
     switch (val) {
        case 1:
          return 'rounded-top-left';
        case 2:
          return 'rounded-top-right';
        case 3:
          return 'rounded-bottom-left';
        case 4:
          return 'rounded-bottom-right';
        default:
          return '';
      }
}
const goToRecentlyviewed = () => {
   const router = useRouter();
  const url = router.resolve({
    name: "country-favorites-recentlyviewed", params: { country }
  }).href;

  window.open(url, "_blank");
};
</script>
<style scoped>
.close-icon-container {
  position: absolute;
  right: 8px;
  top: 4px;
  z-index: 10;
}
.rounded-top-left {
  border-top-left-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.rounded-top-right {
  border-top-left-radius: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.rounded-bottom-left {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 8px;
}

.rounded-bottom-right {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 0;
}
</style>