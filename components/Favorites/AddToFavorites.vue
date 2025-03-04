<template>
    <v-dialog v-model="addToFolderDialog"  max-width="500">
         <v-card class="fill-height fill-width" style="overflow:hidden;">
            <v-row class="py-6">
                <v-col cols="11">
                    <v-row  justify="center" class="ml-4 font-weight-bold">
                        Add to favorites folder
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row >
                        <v-icon class="ml-n4" @click="addToFolderDialog=false" size="small">mdi-close</v-icon>
                    </v-row>
                </v-col>
            </v-row>
            <div class="scrollable-container">
            <v-row class="pa-5" v-if="changingFolder==false">
            <v-col cols="6" v-for="(item,index) in favoriteObjFiltered" :key="index" >
                <!-- <v-card @click.stop="addToFavoritesFunction(item._id.favorite_folder)" max-width='230px' rounded="lg" variant="flat"> -->
                    <!-- addToFavoritesFunction(item._id.favorite_folder) -->
                    <v-card 
                    @click.stop="checkifPresent==true?showSnackbarFunction(item._id):addToFavoritesFunction(item._id.favorite_folder)" 
                    max-width='230px' 
                    rounded="lg" 
                    variant="flat">
                    <v-img
                    cover
                    :height="sm ? '100%' : '212'"
                    class="rounded-lg"
                    :src="getImage(item.cover_photo)" alt="Favorite Icon"></v-img>
                </v-card>
                <v-row class="pl-3 pt-4 font-weight-bold">
                    {{ item._id.folder_name?item._id.folder_name:'' }}
                </v-row>
                <v-row class="pl-3 text-subtitle-2">
                   {{ (item?.favorites?.length || 0) + ' saved' }}
                </v-row>
               </v-col>
            </v-row>
            <v-row class="pa-5" v-else>
            <v-col cols="6" v-for="(item,index) in favoriteObjFiltered" :key="index" >
                <!-- <v-card @click.stop="addToFavoritesFunction(item._id.favorite_folder)" max-width='230px' rounded="lg" variant="flat"> -->
                    <!-- addToFavoritesFunction(item._id.favorite_folder) -->
                    <v-card 
                    @click.stop="changeFolderOfFavorites(item)" 
                    max-width='230px' 
                    rounded="lg" 
                    variant="flat">
                    <v-img
                    cover
                    :height="sm ? '100%' : '212'"
                    class="rounded-lg"
                    :src="getImage(item.cover_photo)" alt="Favorite Icon"></v-img>
                </v-card>
                <v-row class="pl-3 pt-4 font-weight-bold">
                    {{ item._id.folder_name?item._id.folder_name:'' }}
                </v-row>
                <v-row class="pl-3 text-subtitle-2">
                    {{ `${item.favorites.length} saved` }}
                </v-row>
               </v-col>
            </v-row>
            </div>
            <v-divider/>
            <v-divider class="py-5"/>
            <v-row class="px-10 pb-5">
                <v-col cols="12">
                    <v-btn block color="secondary" @click="createFolderDialog=true">Create new favorites folder</v-btn>
                    <FavoritesCreateFolderDialog 
                     :space_id="props.space_id" 
                    @folderCreatedNew="folderCreatedNew"
                     v-model="createFolderDialog"
                     :checkIfPresent="checkIfPresent"
                     :changingFolder="changingFolder"
                     :favoriteIdValue="favoriteIdValue" />
                </v-col>
            </v-row>
         </v-card>
         
    </v-dialog>
    <v-snackbar rounded="lg" min-width="330px" min-height="20px" location="bottom left" v-model="snackbarFavorite" :timeout="5000" color="white" >
            <v-row class="pa-1" justify="center" align="center">
                <v-col cols="3">
                    <v-img min-height="40px" min-width="40px" rounded="lg" class=" pa-n5 rounded-lg"  :src="getImage(folderPhoto)" alt="folder image"/>
                </v-col>
                <v-col cols="6">
                    <span>
                        {{ `Added to` }}
                        <span class="font-weight-bold">{{folderInfo.folder_name?folderInfo.folder_name:'' }}</span>
                    </span>
                </v-col>
                <v-col cols="3">
                    <span class="text-decoration-underline"@click="changeTheFolder()">Change</span>
                </v-col>
            </v-row>
    </v-snackbar>

    
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify"
const snackbarFavorite = ref(false)
const {updateFavoritesFolder,addNewFavoriteAToExistingFolder} = useFavorites()
const selectedFavoriteItem = ref('')
const changingFolder = ref(false)
const favoriteIdValue = ref('')
const props = defineProps({
  favoriteObj: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  space_id:{
    type: String,
    required: true,
  }
})
const changingFavorite = ref(false)
const { mobile, xs, sm } = useDisplay();
const favoriteObj = props.favoriteObj

const addToFolderDialog = defineModel({ required: true });

const createFolderDialog = ref(false)

const emit = defineEmits(["addToFolder","folderCreated"]);

function getImage(spaces) {
    // console.log(favoriteObj)
     if (spaces) {
    return spaces.path
  }
  else return "/images/venue/emptyFavoriteFolder.png"
}


function folderCreated() {
    emit('folderCreated',"will refresh data")
}

function folderCreatedNew() {
  emit('folderCreated', "will refresh data")
    addToFolderDialog.value = false
}


async function addToFavoritesFunction(folderId) {
    const favorite_folder_id = folderId
    const space_id = props.space_id
    

  await addNewFavoriteAToExistingFolder(space_id as string, favorite_folder_id as string)
  emit('folderCreated', "will refresh data")
     addToFolderDialog.value = false

    
}

// const ifSpaceIsPresent = computed(() => {
//   return props.favoriteObj.map((el) => {
//     return el.space? el.space._id : null;
//   });
// });

const favoriteObjFiltered = computed(() => { 
  return props.favoriteObj.filter(item => item._id.folder_name !== "Recently Viewed");
})

// const ifSpaceIsPresent = computed(() => {
//   return favoriteObjFiltered.value.some((el) => {
//    el?.favorites.some(favorite => favorite.space._id === props.space_id)
//   });
// });
// console.log(favoriteObjFiltered.value[0])
// const folderInfo = computed(() => {
//     for (const x in favoriteObjFiltered) {
//       for (const favorite of favoriteObjFiltered[x].favorites) {
//       if (favorite.space._id === props.space_id) {
//         return favoriteObjFiltered[x]._id;
//       }
//     }
//   }
//   return "Not Found";
// });
const folderInfo = computed(() => {
  for (const x in favoriteObjFiltered.value) {
    const favorites = favoriteObjFiltered.value[x].favorites;
    favoriteIdValue.value = ''
    // Ensure 'favorites' is an array before iterating
    if (Array.isArray(favorites)) {
      // for (const favorite of favorites) {
      //   console.log(favorite)
      //   if (favorite.space._id === props.space_id) {
      //     return favoriteObjFiltered[x]._id;
      //   }
      // }
      for (const y in favorites) {
        if (favorites[y].space._id === props.space_id) {
          favoriteIdValue.value = favorites[y]._id;
          return favoriteObjFiltered.value[x]._id;
        }
      }
    }
  }
  // return "Not Found";
});

const folderPhoto = computed(() => {
  for (const x in favoriteObjFiltered.value) {
    const favorites = favoriteObjFiltered.value[x].favorites;
    
    // Ensure 'favorites' is an array before iterating
    if (Array.isArray(favorites)) {
      // for (const favorite of favorites) {
      //   console.log(favorite)
      //   if (favorite.space._id === props.space_id) {
      //     return favoriteObjFiltered[x]._id;
      //   }
      // }
      for (const y in favorites) {
        if (favorites[y].space._id === props.space_id) {
          return favoriteObjFiltered.value[x].cover_photo;
        }
      }
    }
  }
  // return "Not Found";
});

// const checkifPresent = computed(() => { 
//     return ifSpaceIsPresent.value.flat().includes(props.space_id)
// })

const checkIfPresent = computed(() => {
  return favoriteObjFiltered.value.some(el => {
    // Ensure 'el' and 'el.favorites' are defined
    if (!el || !el.favorites) return false;
    
    // Check if any favorite has a matching space._id
    return el.favorites.some(favorite => favorite?.space?._id === props.space_id);
  });
});

function selectedItem(item) {
selectedFavoriteItem.value = item
}

function changeTheFolder() {
  changingFolder.value = true
    snackbarFavorite.value=false
    addToFolderDialog.value=true
}

function showSnackbarFunction(item) {
    snackbarFavorite.value = true
  selectedItem(item)
    addToFolderDialog.value =false
}

async function changeFolderOfFavorites(item) {
  const favoriteId = favoriteIdValue.value
  // const spaceId = props.space_id
  const favorite_folder_id = item._id.favorite_folder
  await updateFavoritesFolder( favorite_folder_id as string, favoriteId as string)
    .then((data) => {
      if (data) {
        // console.log(data)
        addToFolderDialog.value = false
        folderCreated()
    }
  })
}
</script>


<style scoped>
.scrollable-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-row {
  flex-wrap: nowrap;
}
</style>