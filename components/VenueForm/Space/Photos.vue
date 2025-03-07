<template>
  <v-row no-gutters class="w-100 text-secondary">
    <v-row no-gutters class="">
      <v-row no-gutters class="">
        <v-row no-gutters>
          <v-col cols="12" class="text-18px font-500">Upload at least 4 space photos or videos.
          </v-col>
          <v-col cols="12" class="text-14px font-400 text-red" style="line-height: 1.5;">* At least one photo is
            required for the main thumbnail.
          </v-col>
        </v-row>
        <v-col cols="12" class="">
          <div no-gutters class="my-5 picture-grid" style="position: relative">

            <div v-if="mode !== 'view'" class="grid-box ma-2 my-3">
              <CardImageUploader v-model="spacePhotoArr" v-model:uploading="uploading" label="Add photos or videos"
                uploader-id="space" :disabled="mode == 'view' || preview" @done-uploading="handleUploadSpacePhotos" />
            </div>


            <div class="grid-box ma-2 my-3" v-for="x in space.space_photo" :key="x._id">
              <CardImage :src="x.path" :delete-icon="mode !== 'view' && !preview"
                @delete="handleDeletePhoto({ id: x._id, type: 'space' })" @click="handleFullScreen(x._id)" />
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="showRestaurantMenuOption" no-gutters class="w-100 mt-3">
        <v-col cols="12" class="text-18px font-500">Upload Menu <span class="font-400">(optional)</span></v-col>
          <v-col cols="12" class="text-14px font-400 text-red" style="line-height: 1.5;">* Upload your menu photos
          </v-col>
        <v-col cols="12">
          <div no-gutters class="my-5 picture-grid">
            <div v-if="mode !== 'view'" class="grid-box ma-2">
              <CardImageUploader v-model="menuPhotoArr" v-model:uploading="uploading" label="Add photos or videos"
                uploader-id="floor_plan" :disabled="mode === 'view' || preview"
                @done-uploading="handleUploadMenuPhotos" />
            </div>

            <div v-for="x in space.menu_photo" :key="x._id" class="grid-box ma-2" >
              <CardImage :src="x.path"
                :delete-icon="mode !== 'view' && !preview"
                @delete="handleDeletePhoto({ id: x._id, type: 'menu_photo' })" @click="handleFullScreenMenu(x._id)"
                class="grid-box ma-2" />
            </div>

          </div>
        </v-col>

      </v-row>

      <v-row no-gutters class="w-100 mt-3">
        <v-col cols="12" class="text-18px font-500">Upload venue floorplan <span class="font-400">(if
            any)</span></v-col>
        <v-col cols="12">
          <div no-gutters class="my-5 picture-grid">
            <div v-if="mode !== 'view'" class="grid-box ma-2">
              <CardImageUploader v-model="floorPlanPhotoArr" v-model:uploading="uploading" label="Add photos or videos"
                uploader-id="floor_plan" :disabled="mode === 'view' || preview"
                @done-uploading="handleUploadFloorPlanPhotos" />
            </div>

            <div v-for="x in space.floor_plan" :key="x._id" class="grid-box ma-2" >
              <CardImage :src="x.path"
                :delete-icon="mode !== 'view' && !preview"
                @delete="handleDeletePhoto({ id: x._id, type: 'floor_plan' })" @click="handleFullScreenFloorPlan(x._id)"
                class="grid-box ma-2" />
            </div>

          </div>
        </v-col>

      </v-row>
    </v-row>
    <v-text-field v-model="dummyInputText" class="d-none" />
  </v-row>
  <CarouselImageViewer v-model:show="showFullScreen" v-model:images="carouselImageArray"
    :active-image-id="activeImageId" />
  <LoadingUpload v-if="uploading" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, mdAndUp, smAndUp } = useDisplay();
const { setSnackbar } = useLocal();
const { uploadFile, mode, getVenue, venue } = useVenue();
const { updateSpace, getSpace } = useSpace();
const { spaceId } = useRoute().params;
const dummyInputText = ref("dummy");

const props = defineProps<{
  preview?: boolean;
}>();
const spacePhotoArr = ref([]);
const floorPlanPhotoArr = ref([]);
const menuPhotoArr = ref([]);
const venuePhotoArrExterior = ref([]);
const venuePhotoArrInterior = ref([]);
const uploading = ref(false);

const showFullScreen = ref(false);
const activeImageId = ref<string>("");
const carouselImageArray = ref<TFile[] | []>([]);

const space = defineModel<TVenueSpace>({ required: true });

const emit = defineEmits(["delete-photo", "save-draft", "refresh-space-data"]);


const handleDeletePhoto = async (object: { id: string; type: string }) => {
  if (object.type === "space") {
    space.value.space_photo = space.value.space_photo.filter(
      (x: any) => x._id !== object.id,
    ) as TFile[];
  } else if (object.type == 'floor_plan') {
    space.value.floor_plan = space.value.floor_plan.filter(
      (x: any) => x._id !== object.id,
    ) as TFile[];


  }  else if (object.type == 'menu_photo') {
    space.value.menu_photo = space.value.menu_photo?.filter(
      (x: any) => x._id !== object.id,
    ) as TFile[];

  }

};

const handleUploadSpacePhotos = async () => {
  if (spacePhotoArr.value.length > 0) {
    space.value.space_photo = [
      ...space.value.space_photo,
      ...spacePhotoArr.value,
    ];
    spacePhotoArr.value = []; // clear data

  }
  uploading.value = false;
};

const handleUploadFloorPlanPhotos = async () => {
  if (floorPlanPhotoArr.value.length > 0) {
    space.value.floor_plan = [
      ...space.value.floor_plan,
      ...floorPlanPhotoArr.value,
    ];
    floorPlanPhotoArr.value = [];

  }
  uploading.value = false;
};


const handleUploadMenuPhotos = async () => {
  if (menuPhotoArr.value.length > 0) {
    space.value.menu_photo = [
      ...(space.value?.menu_photo || []),
      ...menuPhotoArr.value,
    ];
    menuPhotoArr.value = [];

  }
  uploading.value = false;
};



const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  const spacePhotos = space.value.space_photo as TFile[];

  carouselImageArray.value = spacePhotos
  activeImageId.value = imageId;
};

const handleFullScreenFloorPlan = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  const floorPlanPhotos = space.value.floor_plan as TFile[];
  carouselImageArray.value = floorPlanPhotos
  activeImageId.value = imageId;
};

const handleFullScreenMenu = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  const menuPhotos = space.value.menu_photo as TFile[];
  carouselImageArray.value = menuPhotos
  activeImageId.value = imageId;
};


const showRestaurantMenuOption = computed(() => {
  const restaurantVenueKeywordIsSelected = (venue.value.keywords as string[]).some((x: any) => {
    return x.keyword.includes('Restaurant');
  })
  const isRestaurantSelectedInSpaceType = (space.value.type as string)?.includes('Restaurant')

  return restaurantVenueKeywordIsSelected || isRestaurantSelectedInSpaceType;
})

const fetchVenue = async () => {
  try {
    const {data} = await getVenue(space.value.venue._id as string)

    const res = data.value as any;
    if(res && res?.data && res?.data?.data?.[0]){
      venue.value = res?.data?.data?.[0]
      console.log('venue-data', venue.value)
    }
  } catch (e){
    console.log('Error in fetching venue data in Photos component', e)
  }
}

onMounted( async() => {
  // fetch venue details;
  await fetchVenue()

})
</script>

<style scoped>
.picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  justify-items: space-around;
  ;
  grid-gap: 10px;
  grid-row-gap: 0px;
}

.grid-box {
  width: 100%;
  height: 300px;
}
</style>
