<template>
  <v-row no-gutters>
    <v-row no-gutters>
      <v-col cols="12" class="text-18px font-500">
        Capacity for {{ space.name }}
      </v-col>

      <!-- Capacity List 1 -->
      <v-col cols="12" md="6" class="px-0 pt-0">
        <v-row
          no-gutters
          align="center"
          v-for="capacityListItem in capacityList
            .filter((x) => parseInt(x.key as string) <= 3)
            .sort(
              (a, b) => parseInt(a.key as string) - parseInt(b.key as string)
            )"
          :key="capacityListItem.key"
          class="text-secondary mb-3"
          style="margin: 0; padding: 0"
        >
          <v-col cols="12" class="d-flex align-center">
            <v-checkbox
              v-model="capacityListItem.answer"
              color="secondary"
              base-color="light_gray_secondary"
              hide-details
              @change="updateData"
              class="mr-2"
            >
              <template v-slot:label>
                <span class="font-weight-bold">{{
                  capacityListItem.question
                }}</span>
              </template>
            </v-checkbox>
          </v-col>

          <v-col cols="12" v-if="capacityListItem.answer" class="ml-3 ml-md-13">
            <span class="font-500 text-16px"
              >Max {{ capacityListItem.question }} capacity</span
            >
            <v-text-field
              hide-details
              type="number"
              :min="1"
              rounded="lg"
              color="charcoal"
              base-color="charcoal"
              variant="outlined"
              class="custom-capacity-class"
              v-model.number="capacityListItem.max_capacity"
              :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
              style="max-width: 100%; max-width: 300px"
              @update:model-value="updateData()"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <!-- Capacity List 2 -->
      <v-col cols="12" md="6" class="px-0 pt-0">
        <v-row
          no-gutters
          align="center"
          v-for="capacityListItem in capacityList
            .filter((x) => parseInt(x.key as string) > 3)
            .sort(
              (a, b) => parseInt(a.key as string) - parseInt(b.key as string)
            )"
          :key="capacityListItem.key"
          class="text-secondary mb-3"
          style="margin: 0; padding: 0"
        >
          <v-col cols="12" class="d-flex align-center">
            <v-checkbox
              v-model="capacityListItem.answer"
              color="secondary"
              base-color="light_gray_secondary"
              hide-details
              @change="updateData"
              class="mr-2"
            >
              <template v-slot:label>
                <span class="font-weight-bold">{{
                  capacityListItem.question
                }}</span>
              </template>
            </v-checkbox>
          </v-col>

          <v-col cols="12" v-if="capacityListItem.answer" class="ml-3 ml-md-13">
            <p class="font-500 text-16px">
              Max {{ capacityListItem.question }} capacity
            </p>
            <v-text-field
              hide-details
              type="number"
              :min="1"
              variant="outlined"
              class="custom-capacity-class"
              rounded="lg"
              color="charcoal"
              base-color="charcoal"
              v-model.number="capacityListItem.max_capacity"
              :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
              style="max-width: 100%; max-width: 300px"
              @update:model-value="updateData()"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Guest Capacity Preferences -->
    <v-row no-gutters class="my-5">
      <v-col cols="12" class="text-18px font-500 mb-2">
        Guest Capacity Preferences
      </v-col>
      <v-col cols="12" class="text-18px font-500 mb-2">
        Set a minimum number of attendees per event
      </v-col>
      <v-col
        cols="12"
        class="text-16px text-charcoal font-400 pr-2 mb-3"
        style="line-height: 1.2"
      >
        Enter the smallest group size that makes renting your space economically
        viable.
      </v-col>

      <v-col cols="12" lg="4" md="5" sm="4" class="px-1">
        <v-text-field
          v-model.number="space.guest_capacity.minimum"
          rounded="lg"
          color="charcoal"
          base-color="charcoal"
          type="number"
          :min="1"
          :rules="minCapacityRules"
          style="max-width: 300px"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Space Details -->
    <v-row no-gutters class="my-5">
      <v-col cols="12" class="text-18px font-500 mb-2"> Space </v-col>
      <v-col cols="12" class="text-16px font-500 mb-2"> Floor Space </v-col>
      <v-col cols="12" lg="4" md="5" sm="4">
        <v-text-field
          v-model.number="space.guest_capacity.floorspace.value"
          hide-details
          rounded="lg"
          color="charcoal"
          base-color="charcoal"
          persistent-placeholder
          suffix="SQM"
          :min="0"
          type="number"
          :rules="[requiredInput, requiredNumber, requiredGreaterThanZero]"
          style="max-width: 300px"
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="6" xs="6" sm="6" md="2" lg="2" class="px-5">
        <v-select
          class="my-custom-select"
          v-model="space.guest_capacity.floorspace.unit"
          variant="outlined"
          hide-details
          :items="['SQM', 'SQFT']"
          width="100"
        ></v-select>
      </v-col> -->
    </v-row>

    <!-- <OverlayFullScreen v-model:show="showFullScreen" :src="activeImageId" /> -->
    <CarouselImageViewer
      v-model:show="showFullScreen"
      v-model:images="space.floor_plan"
      :active-image-id="activeImageId"
    />
    <LoadingUpload v-if="uploading" />
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, mdAndUp } = useDisplay();
const { setSnackbar } = useLocal();
const { uploadFile, mode } = useVenue();
const { updateSpace } = useSpace();
const { requiredInput, requiredNumber, requiredGreaterThanZero } = useUtils();
const { spaceId } = useRoute().params;
const showFullScreen = ref(false);
const activeImageId = ref<string>("");
const uploading = ref(false);
const capacity = ref([]);
const floorPlanImages = ref<TFile[]>([]);
const space = defineModel<TVenueSpace>({ required: true });
const emit = defineEmits([
  "save-draft",
  "refresh-space-data",
  "clear-validation",
]);

const props = defineProps<{
  preview?: boolean;
}>();

// add reference value same with key
const capacityList = ref<TCapacityLayout[]>([
  {
    question: "Seating",
    key: "0",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Dining",
    key: "1",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Standing",
    key: "2",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Cabaret",
    key: "3",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Classroom",
    key: "4",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Theatre",
    key: "5",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "U-Shaped",
    key: "6",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
  {
    question: "Boardroom",
    key: "7",
    reference: "capacity_and_layout",
    answer: false,
    type: "SPACE",
    options: [],
    max_capacity: null,
  },
]);

// convert images to string array
const floorPlanPhotosStringArr = computed(() => {
  if (space.value.floor_plan.length > 0) {
    return space.value.floor_plan.map((x: any) => x._id);
  } else {
    return [];
  }
});

const handleUploadFloorPlan = async () => {
  console.log("working");

  if (floorPlanImages.value.length > 0) {
    const photoStringArr = floorPlanImages.value.map((x: TFile) => x._id);
    if (photoStringArr) {
      await updateSpace(spaceId as string, {
        floor_plan: [...floorPlanPhotosStringArr.value, ...photoStringArr],
      });
      emit("refresh-space-data");
    }
  }
  uploading.value = false;
};

const handleDeletePhoto = async (id: string) => {
  await saveProgress();
  space.value.floor_plan = space.value.floor_plan.filter(
    (x: any) => x._id !== id
  ) as any;
  await updateSpace(spaceId as string, {
    floor_plan: floorPlanPhotosStringArr.value as any,
  });
  setSnackbar({
    text: "Photo deleted successfully",
    color: "success",
    modal: true,
  });
};

const minCapacityRules = computed(() =>
  !space.value.guest_capacity.minimum
    ? []
    : [
        (v: number) =>
          v <= space?.value?.guest_capacity?.maximum ||
          "Please enter a lower number. The minimum number of attendees cannot exceed the maximum venue capacity.",
        (v: number) =>
          (v > 0 && v !== 0) || "The minimum number must be greater than 0",
      ]
);

onMounted(() => {
  if (space.value.capacity_layout.length > 0) {
    // replacing the array with the new capacity answer if there is changes in answer
    capacityList.value = capacityList.value.map((obj1) => {
      const obj2 = space.value.capacity_layout.find(
        (obj) => obj.key === obj1.key && obj.reference === obj1.reference
      );

      if (obj2) {
        obj1.answer = obj2.answer;
        obj1.max_capacity = obj2.max_capacity;
      }

      return obj1; // Return the updated object
    });
  }
});

watchEffect(() => {
  // get the max_capacity
  let max: number = 0;
  for (let value of space.value?.capacity_layout) {
    const newNum = value?.max_capacity as number;
    if (newNum > max) {
      max = newNum;
    }
  }
  space.value.guest_capacity.maximum = max as number;
});

const updateData = () => {
  capacityList.value.forEach((x) => {
    if (!x.answer) {
      x.max_capacity = null;
    }
  });
  space.value.capacity_layout = capacityList.value;
};

const saveProgress = async () => {
  const payload: Partial<TVenueSpace> = {};
  payload.capacity_layout = space.value.capacity_layout;
  payload.guest_capacity = Object.fromEntries(
    Object.entries(space.value.guest_capacity).filter(
      ([_, v]) => v !== null && v !== undefined
    )
  ) as any;
  await updateSpace(spaceId as string, payload);
};

const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  activeImageId.value = imageId;
};
</script>

<style scoped>
.v-input.custom-capacity-class :deep(input::placeholder) {
  font-size: x-small;
}

.my-custom-select .v-select__selection {
  /* Default font size */
  font-size: 12px;
}

@media (max-width: 600px) {
  /* Custom styles for xs screens */
  .my-custom-select .v-select__selection {
    font-size: 10px;
    /* Smaller font size for xs screens */
    /* Additional styles specific to xs screens */
  }
}

/* vuetify checkbox label */
.v-checkbox :deep(.v-label) {
  opacity: 1 !important;
}

.v-checkbox {
  opacity: 1 !important;
}
</style>
