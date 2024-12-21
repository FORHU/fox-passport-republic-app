<template>
    <v-row no-gutters>
        <v-col cols="12" sm="12" md="6" lg="6"   v-if="
            (smAndDown && showingMethod == 'List' && showingMethod != 'Map') ||
            !smAndDown
          ">
            <v-row no-gutters class="px-6 pt-8 pb-5">
                <v-col cols="6">
                    <v-row>
                    <v-icon @click="backToFavorites()" size="small">mdi-arrow-left</v-icon>
                    </v-row>
                </v-col>
                <v-col cols="6">
                    <v-row justify="end">
                    <!-- <v-btn size="small" variant="outlined">
                        <v-icon>
                            mdi-dots-horizontal
                        </v-icon>
                    </v-btn> -->
                    <v-btn
                          size="small"
                          variant="outlined"
                     
                          
                        >
                       <v-icon>mdi-dots-horizontal</v-icon>
                      <v-menu activator="parent" location="start">
                        <v-list  class="narrow-list mt-10">
                        <v-list-item @click="renameFolder()">
                          <v-list-item-title ><v-icon class="mr-5">mdi-rename</v-icon>Rename</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteFolder()">
                          <v-list-item-title  ><v-icon class="mr-5">mdi-trash-can-outline</v-icon>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                      </v-menu>
                    </v-btn>
                    <FavoritesRenameFolder v-model="renameFolderDialog" 
                    :favoriteFolderId="route.query.favorite_folder"
                    :folderName="folderName"
                    @folderRenamed="folderRenamed"/>

                    <FavoritesDeleteFolder v-model="deleteFolderDialog" 
                        :favoriteFolderId="route.query.favorite_folder"
                        :favoriteLength="favoriteData.length"
                        :folderName="folderName"
                        @deletingFolder="deletingFolder"
                        />
                 </v-row>
                </v-col>
            </v-row>
            <v-row class="px-7 font-weight-bold">
                {{folderName}}
            </v-row>
            <v-row class="py-5 px-7">
                <v-col cols="6" sm="6" md="4" lg="4" class="pr-6">
                    <v-row>
                        <!-- <v-select append-inner-icon="mdi-calendar" label="Date"></v-select> -->
                          <!-- <v-menu
                            v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-bind="attrs"
                                v-on="on"
                                label="Date"
                                append-inner-icon="mdi-calendar"
                                v-model="selectedDate"
                                readonly
                              ></v-text-field>
                            </template>
                            <v-date-picker v-model="selectedDate"  @input="menu = false" no-title scrollable>
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                              <v-btn text color="primary" @click="saveDate">OK</v-btn>
                            </v-date-picker>
                          </v-menu> -->
                           <v-menu
                                v-model="dateInput"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="290px"
                              >
                                <template #activator="{ props }">
                                  <v-text-field
                                    v-model="formattedDate"
                                    readonly
                                    persistent-hint
                                    v-bind="props"
                                    density="compact"
                                    persistent-placeholder
                                    placeholder="Date"
                                   
                                    append-inner-icon="mdi-calendar"
                                  >
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="date_calendar"
                                  @input="dateInput = false"
                                  no-title
                                  show-adjacent-months
                                  scrollable
                                  :min="
                                    new Date().toISOString().substring(0, 10)
                                  "
                                >
                                  <template #title>
                                    <p>Select a Date</p>
                                  </template>

                                  <template #header>
                                    <p class="ml-5" style="font-size: 30px">
                                      Enter Date
                                    </p>
                                  </template>
                                  <template #actions>
                                    <v-btn
                                      color="primary"
                                      @click="dateInput = false"
                                      >OK</v-btn
                                    >
                                  </template>
                                </v-date-picker>
                              </v-menu>
                    </v-row>
                </v-col>
                <v-col cols="6" sm="6" md="4" lg="4">
                    <v-row>
                        <!-- <v-select append-inner-icon="mdi-account-multiple-outline" label="Guests"></v-select> -->
                         <v-text-field v-model="guestNumber" min="0" step="5" type="number" append-inner-icon="mdi-account-multiple-outline" label="Guests"></v-text-field>
                    </v-row>
                </v-col>

                
            </v-row>
            <v-row class="py-4 " no-gutters> 
                
                    <v-col cols="12" sm="12" md="4" lg="4"  v-for="space in filteredFavorites.slice(0, 4)" :key="space._id">
                            <CardVenueCard
                            :space="space.space"
                            :imageSrc="imageSrc"
                            :navigateTo="navigateTo"
                            :country="country"
                            :computedVenues="computedVenues"
                            @deselectChosenFavorite="deselectChosenFavorite"

                            />
                   </v-col>
                
                </v-row>
        </v-col>
        <v-col cols="6" width="100%" height="100%">
            <!-- <MapGoogleMap
            :country="venue.address.country.toUpperCase()"
            :coordinates="[
                {
                lat: venue.address.coordinates.latitude,
                lng: venue.address.coordinates.longitude,
                },
            ]"
            :show-details="false"
            /> -->
            <MapGoogleMap
            :country="country.toUpperCase()"
            :coordinates="coordinates"
            :showDetails="true"
            :mobile="true"
          />
        </v-col>


        <v-row justify="center">
      <v-snackbar
        style="min-width: 0px !important;z-index: 2"
        @click.stop="changeShowMethod()"
        rounded="lg"
        :timeout="-1"
        min-width="80px"
        v-model="snackbar"
        class="hidden-md-and-up"
      >
        <v-row justify="center">
          <span v-if="showingMethod == 'List'"
            ><v-icon>mdi-map</v-icon>Map</span
          >
          <span v-if="showingMethod == 'Map'"
            ><v-icon color="white">mdi-format-list-bulleted</v-icon>List</span
          >
        </v-row>
      </v-snackbar>
    </v-row>
    <v-dialog style="z-index:1;" v-model="mobileMap" width="100%" height="100%">
      <MapGoogleMap
        :country="country.toUpperCase()"
        :coordinates="coordinates"
        :showDetails="true"
        :mobile="true"
        @closeMap="mobileMap = false"
      />
    </v-dialog>
    </v-row>
     
</template>

<script setup lang="ts">
import {useDisplay} from "vuetify"
const spaceArray = ref<TVenueSpace[]>([]);
const { country,setSnackbar } = useLocal();
const {mobile,smAndDown} = useDisplay()
import { useRouter } from "vue-router";
const {addNewFavoriteFolder,getListOfFolders,getSpacesOnFolderFavorite,deselectFavorites} = useFavorites()
const { fetchVenues } = useVenue();
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(0);
const router = useRouter()
const route = useRoute();
const mobileMap = ref(false)
const folderName = route.query.folder_name
const favoriteData = ref('')
const selectedDate = ref('')
const snackbar = ref(true);
const menu = ref(false)
const dateInput = ref(false);
const date_calendar = ref(null);
const guestNumber = ref(null)
const coordinates = ref<object[]>([]);
const venues = ref<TVenueSpace[]>([]);
const showingMethod = ref("List")
const renameFolderDialog = ref(false)
const deleteFolderDialog = ref(false)

const loadInitialData = async () => {
  // const params = {
  //   mark_as_favorite: true,
  //   status: "PUBLISHED",
  //   limit: 10,
  // };

  // const { data }: { data: any } = await fetchVenues(params);
  // if (data) {
  //   spaceArray.value = data.value.data.data;
  //   currentPage.value = data.value.data.current_page;
  //   totalItems.value = data.value.data.total_items;
  //   totalPages.value = data.value.data.total_pages;
  // }

  // console.log(route,'route')

  //  await getSpacesFunction()
   const folder_id = route.query.favorite_folder
  const page = 0
  const limit = 10
  const { data }: { data: any } = await getSpacesOnFolderFavorite(page as number, limit as number, folder_id as string)
  favoriteData.value = data.value.data
  // console.log("FavoriteData",favoriteData.value)

  await getVenue()
 
};
loadInitialData()

async function getVenue() {
  const params = {
     mark_as_favorite: true,
    status: "PUBLISHED",
    limit: 12,
  }

  const { data } : { data: any } = await fetchVenues(params)

  if (data) {
    venues.value = data.value.data.data;
    // console.log("Venues value",venues.value)
  }
  await getCoordinates()
}

const computedVenues = computed(() => {
  return venues.value.filter((el) => el.marked_as_favorite?.isFavorite == true).map((el) => {
    return {
      _id: el._id,
      marked_as_favorite: el.marked_as_favorite
    }
  })
})

const imageSrc = (spaceId: string): string => {
  const space = favoriteData.value.find((obj) => {
      return obj.space._id === spaceId
  } );
  // console.log(spaceId)
  // console.log(space)
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
  const imageObj = space.space.space_photo.find((image) => {
    const extension = image.path
      .substring(image.path.lastIndexOf("."))
      .toLowerCase();
    return imageExtensions.includes(extension);
  });

  return imageObj?.path || "";
};
const navigateTo = (route) => {
  router.push(route);
};
const backToFavorites = () => {
  navigateTo({ name: "country-favorites", params: { country } });
};


async function getSpacesFunction() {
  const folder_id = route.query.favorite_folder
  const page = 0
  const limit = 10
  const { data }: { data: any } = await getSpacesOnFolderFavorite(page as number, limit as number, folder_id as string)
  spaceArray.value = data.value.data
  // console.log(spaceArray.value)
}

function saveDate() {
 menu.value = false
}

const formattedDate = computed(() => {
  if (!date_calendar.value) return "";
  const date = new Date(date_calendar.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});


const filteredFavorites = computed(() => {

  if (guestNumber.value) {
    return favoriteData.value.filter((el) => {
      return el.space.guest_capacity.maximum >= guestNumber.value
    })
  }
  if (formattedDate.value && Array.isArray(venues)) {
    return favoriteData.value.filter((el) => {
      return venues.some(venue => venue._id === el.space._id);
    });
  }
  return favoriteData.value
})

const getCoordinates = () => {
  coordinates.value = venues.value.reduce((acc: object[], item: any) => {
    // console.log(item.venue.address.coordinates)
    if (item.venue?.address && item.venue.address.coordinates) {
      acc.push({
        lat: parseFloat(item.venue.address.coordinates.latitude),
        lng: parseFloat(item.venue.address.coordinates.longitude),
        title: item.venue.name,
        photo: getImage(item.space_photo),
      });
    }
    return acc;
  }, []);
};
const getImage = (spaces: any) => {
  const images = spaces.filter((file: any) =>
    file.contentType.startsWith("image/")
  );
  return images.length ? images[0].path : "/images/venue/sample_venue.jpg";
};


function changeShowMethod() {
  console.log("changingList")
  if (showingMethod.value == "List") {
    showingMethod.value = "Map";
    mobileMap.value = true;
    return;
  } else {
    showingMethod.value = "List";
    mobileMap.value = false;
    return;
  }
}

watch(mobileMap, (newValue, oldValue) => {
  if (newValue == false && showingMethod.value != "List") {
 changeShowMethod()
    
  }
  
})

function renameFolder() {
  renameFolderDialog.value = true
  
}
function deleteFolder() { 
deleteFolderDialog.value = true
}

function folderRenamed(val) {

  navigateTo({ name: "country-favorites", params: { country } });
}
function deletingFolder() {
  
  navigateTo({ name: "country-favorites", params: { country } });

}
async function deselectChosenFavorite(val) {
  const favoriteId = val
 
  await deselectFavorites(favoriteId as string).then(() => {
    setSnackbar({
      color: "success",
      text: "Removed from your favorites list",
      modal: true,
    });
  })
  await loadInitialData()
   
}
watch(date_calendar, async (newValue, oldValue) => {
  if (newValue) {
    const params = {
     mark_as_favorite: true,
     status: "PUBLISHED",
     limit: 12,
     start_date:formattedDate.value,
  }

  const { data } : { data: any } = await fetchVenues(params)

  if (data) {
    venues.value = data.value.data.data;
    // console.log(venues.value)
  }
  await getCoordinates()
  }
})


</script>


<style scoped>
.hidden-md-and-up {
  @media (min-width: 960px) {
    display: none !important;
  }
}

.narrow-list {
  max-width: 200px; /* Set this to your desired width */
}

.narrow-list-item {
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>