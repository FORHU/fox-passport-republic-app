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
const { uploadFile, mode } = useVenue();
const { updateSpace, getSpace } = useSpace();
const { spaceId } = useRoute().params;
const dummyInputText = ref("dummy");

const props = defineProps<{
  preview?: boolean;
}>();
const spacePhotoArr = ref([]);
const floorPlanPhotoArr = ref([]);
const venuePhotoArrExterior = ref([]);
const venuePhotoArrInterior = ref([]);
const uploading = ref(false);

const showFullScreen = ref(false);
const activeImageId = ref<string>("");
const carouselImageArray = ref<TFile[] | []>([]);

const space = defineModel<TVenueSpace>({ required: true });

const emit = defineEmits(["delete-photo", "save-draft", "refresh-space-data"]);

const filteredExteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "exterior_venue_photo",
  );
});

const filteredInteriorVenuePhotos = computed(() => {
  return space.value.venue_photo.filter(
    (x: any) => x.description === "interior_venue_photo",
  );
});

const payloadSpacePhoto = computed(() => {
  if (space.value.space_photo.length > 0) {
    return space.value.space_photo.map((x: any) => x._id);
  } else {
    return [];
  }
});

const payloadVenuePhoto = computed(() => {
  if (space.value.venue_photo.length > 0) {
    return space.value.venue_photo.map((x: any) => x._id);
  } else {
    return [];
  }
});

const handleDeletePhoto = async (object: { id: string; type: string }) => {
  if (object.type === "space") {
    space.value.space_photo = space.value.space_photo.filter(
      (x: any) => x._id !== object.id,
    ) as TFile[];
    // await updateSpace(spaceId as string, {
    //   space_photo: payloadSpacePhoto.value,
    // });
    // setSnackbar({
    //   text: "Photo deleted successfully",
    //   color: "success",
    //   modal: true,
    // });
  } else if (object.type == 'floor_plan') {
    space.value.floor_plan = space.value.floor_plan.filter(
      (x: any) => x._id !== object.id,
    ) as TFile[];
    // await updateSpace(spaceId as string, {
    //   floor_plan: payloadFloorPlan.value,
    // });
    // setSnackbar({
    //   text: "Photo deleted successfully",
    //   color: "success",
    //   modal: true,
    // });

  }

  // } else {
  //   space.value.venue_photo = space.value.venue_photo.filter(
  //     (x: any) => x._id !== object.id,
  //   ) as TFile[];
  //   // await updateSpace(spaceId as string, {
  //   //   venue_photo: payloadVenuePhoto.value,
  //   // });
  //   // setSnackbar({
  //   //   text: "Photo deleted successfully",
  //   //   color: "success",
  //   //   modal: true,
  //   // });
  // }
};

const handleUploadSpacePhotos = async () => {
  if (spacePhotoArr.value.length > 0) {
    space.value.space_photo = [
      ...space.value.space_photo,
      ...spacePhotoArr.value,
    ];
    spacePhotoArr.value = []; // clear data

    // const photoStringArr = spacePhotoArr.value.map((x: TFile) => x._id);
    // if (photoStringArr) {
    //   // await updateSpace(spaceId as string, {
    //   //   space_photo: [...payloadSpacePhoto.value, ...photoStringArr],
    //   // });

    //   // emit("refresh-space-data");
    // }
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

    // const photoStringArr = venuePhotoArrInterior.value.map((x: TFile) => x._id);
    // if (photoStringArr) {
    //   // await updateSpace(spaceId as string, {
    //   //   venue_photo: [...payloadVenuePhoto.value, ...photoStringArr],
    //   // });
    //   // emit("refresh-space-data");
    // }
  }
  uploading.value = false;
};

const handleUploadVenueExterior = async () => {
  if (venuePhotoArrExterior.value.length > 0) {
    space.value.venue_photo = [
      ...space.value.venue_photo,
      ...venuePhotoArrExterior.value,
    ];
    venuePhotoArrExterior.value = [];

    // const photoStringArr = venuePhotoArrExterior.value.map((x: TFile) => x._id);
    // if (photoStringArr) {
    //   // await updateSpace(spaceId as string, {
    //   //   venue_photo: [...payloadVenuePhoto.value, ...photoStringArr],
    //   // });

    //   // emit("refresh-space-data");
    // }
  }
  uploading.value = false;
};

const handleUploadVenueInterior = async () => {
  if (venuePhotoArrInterior.value.length > 0) {
    space.value.venue_photo = [
      ...space.value.venue_photo,
      ...venuePhotoArrInterior.value,
    ];
    venuePhotoArrInterior.value = [];

    // const photoStringArr = venuePhotoArrInterior.value.map((x: TFile) => x._id);
    // if (photoStringArr) {
    //   // await updateSpace(spaceId as string, {
    //   //   venue_photo: [...payloadVenuePhoto.value, ...photoStringArr],
    //   // });
    //   // emit("refresh-space-data");
    // }
  }
  uploading.value = false;
};

const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  const spacePhotos = space.value.space_photo as TFile[];
  // // const venuePhotos = space.value.venue_photo as TFile[];
  // if (spacePhotoArr && spacePhotos.length > 0) {
  //   const filteredSpacePhotoArr = spacePhotos.filter((item: TFile) => {
  //     return !carouselImageArray.value.some((x: TFile) => x._id == item._id); //
  //   });
  //   carouselImageArray.value.push(...filteredSpacePhotoArr);
  // }
  // if (venuePhotos.length > 0) {
  //   const filteredVenuePhotoArr = venuePhotos.filter((item: TFile) => {
  //     return !carouselImageArray.value.some((x: TFile) => x._id == item._id); //
  //   });
  //   carouselImageArray.value.push(...filteredVenuePhotoArr);
  // }
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
