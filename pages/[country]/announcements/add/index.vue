<template>
  <v-row
    no-gutters
    class="w-100"
    color="white"
    style="height: 7dvh"
    justify="center"
  >
    <v-row no-gutters justify="center" class="my-5">
      <v-col cols="12" md="10" lg="8" xl="6" sm="10">
        <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
        <v-form
          @submit.prevent="handleSubmit"
          ref="formValid"
          class="w-100"
          v-else
        >
          <v-app-bar
            flat
            color="white"
            class="px-md-0"
            :class="xs ? 'px-1 pr-4' : 'px-5'"
            width="100%"
            style="border-bottom: 2px solid #dedfe3"
          >
            <v-row no-gutters justify="center">
              <v-col
                cols="12"
                md="10"
                lg="8"
                xl="6"
                class="d-flex ga-2 align-center"
              >
                <v-col class="d-flex align-center pr-3" style="width: 90%">
                  <span class="text-22px font-600">Create Announcement</span>
                  <span
                    ><v-progress-linear
                      color="primary"
                      height="5"
                      rounded="lg"
                      class="mt-1"
                    ></v-progress-linear
                  ></span>
                </v-col>
                <span>
                  <v-btn
                    @click="handleGoToList"
                    variant="outlined"
                    border="secondary md"
                    size="large"
                    text="Exit"
                    rounded="lg"
                  ></v-btn>
                </span>
              </v-col>
            </v-row>
          </v-app-bar>
          <v-main :style="xs ? 'padding-top: 40px' : 'margin-top: 100px'">
            <v-row class="my-2" :class="xs ? 'px-4' : ''">
              <v-col :cols="xs ? '12' : ' 6'">
                <v-row no-gutters>
                  <v-col cols="12" class="d-flex flex-column">
                    <span class="font-weight-bold">Choose banner image</span>
                    <span class="text-caption"
                      >This is what would be displayed for users.</span
                    >
                  </v-col>
                </v-row>
                <v-row class="mt-5" no-gutters>
                  <v-col cols="12" class="text-center mt-2">
                    <CardImageUploader
                      v-if="!formAnnouncement?.bannerPhotos?.path"
                      v-model="bannerPhotoArr"
                      v-model:uploading="uploading"
                      label="Upload banner image"
                      uploader-id="space"
                      @done-uploading="handleUploadBannerPhotos"
                      :height="mdAndDown ? '330' : '285'"
                      width="100%"
                      single-file-only
                    />
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <CardImage
                      v-if="formAnnouncement.photo !== ''"
                      :src="formAnnouncement.bannerPhotos.path"
                      :height="mdAndDown ? '330' : '285'"
                      width="100%"
                      :delete-icon="true"
                      @delete="
                        handleDeletePhoto({
                          id: formAnnouncement.bannerPhotos._id,
                          type: 'country',
                        })
                      "
                      @click="
                        handleFullScreen(formAnnouncement.bannerPhotos._id)
                      "
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col :cols="xs ? '12' : ' 6'">
                <v-row no-gutters>
                  <v-col
                    :cols="mdAndDown ? '12' : '8'"
                    class="d-flex flex-column"
                  >
                    <span class="font-weight-bold">Fill out infromation</span>
                    <span class="text-caption"
                      >Enter information about the announcement</span
                    >
                  </v-col>
                  <v-col
                    :cols="mdAndDown ? '12' : '4'"
                    class="d-flex flex-column justify-center"
                    :class="mdAndDown ? 'align-start mt-2' : 'align-end'"
                  >
                    <v-checkbox
                      v-model="formAnnouncement.isActive"
                      label="Mark as Active"
                      density="compact"
                      :hide-details="true"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row class="mt-3" no-gutters>
                  <v-col cols="12" class="text-center my-3">
                    <v-row no-gutters class="d-flex justify-space-between">
                      <v-col
                        :cols="mdAndDown ? '12' : '6'"
                        :class="mdAndDown ? 'w-100' : ''"
                      >
                        <v-select
                          :style="mdAndDown ? 'width: 100%' : 'width: 90%'"
                          placeholder="Select recipients"
                          label="Select recipients"
                          :items="recipients"
                          item-title="label"
                          item-value="value"
                          v-model="formAnnouncement.recipients"
                          :rules="recipientsRule"
                          :hide-details="true"
                          rounded="lg"
                        ></v-select>
                      </v-col>
                      <v-col
                        :cols="mdAndDown ? '12' : '6'"
                        :class="mdAndDown ? 'mt-4 w-100' : ''"
                      >
                        <v-select
                          placeholder="Target device"
                          label="Target Device"
                          :items="targetDevice"
                          item-title="label"
                          item-value="value"
                          v-model="formAnnouncement.device"
                          :rules="deviceRule"
                          :hide-details="true"
                          rounded="lg"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <v-textarea
                      v-model="formAnnouncement.title"
                      :rules="titleRule"
                      placeholder="Enter title here"
                      row-height="10"
                      rounded="lg"
                      rows="1"
                      auto-grow
                      class="pt-1 pb-3"
                      hide-details
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <v-textarea
                      v-model="formAnnouncement.description"
                      placeholder="Enter description"
                      row-height="10"
                      rounded="lg"
                      rows="5"
                      auto-grow
                      max-rows="10"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-main>
          <v-app-bar
            no-gutters
            class="w-100"
            flat
            location="bottom"
            style="border-top: 2px solid #dedfe3"
          >
            <v-sheet
              class="py-3 px-5 px-md-0"
              width="100%"
              style="
                position: relative;
                bottom: 0;
                left: 0;
                right: 0;
                border-top: 2px solid #dedfe3;
              "
            >
              <v-row no-gutters class="w-100 h-100" justify="center">
                <v-col cols="12" md="10" lg="8" xl="6">
                  <v-row
                    no-gutters
                    class="w-100 h-100"
                    align="center"
                    justify="end"
                  >
                    <!-- Save Button -->
                    <v-col
                      cols="auto"
                      class="d-flex justify-center align-center"
                    >
                      <v-btn
                        color="primary"
                        border="secondary md"
                        rounded="lg"
                        @click="handleSubmit"
                        class="py-5 px-10 bg-primary text-white d-flex align-center justify-center"
                        :loading="submitting"
                      >
                        Save Changes
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-sheet>
          </v-app-bar>
        </v-form>
      </v-col>
    </v-row>
  </v-row>
  <CarouselImageViewer
    v-model:show="showFullScreen"
    v-model:images="carouselImageArray"
    :active-image-id="activeImageId"
  />
  <DialogPromptNew
    v-model="showSaveModal"
    @agree="handleSave"
    :loading="submitting"
    :prompt-title="`Save changes to announcement`"
    disagree-button-text="CANCEL"
    agree-button-text="SAVE"
  />
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
definePageMeta({
  layout: "bare",
  middleware: ["auth", "admin-only"],
});
const { xs, mdAndDown, md } = useDisplay();
const { addAnnouncement } = useAnnouncementAPI();
const formAnnouncement = ref(<any>{
  bannerPhotos: <any>{},
  photo: <any>"",
  title: "",
  description: "",
  recipients: null,
  isActive: false,
  device: null,
});
const recipients = ref([
  { label: "All", value: "ALL" },
  { label: "Venue Owners", value: "VENUE_OWNERS_ONLY" },
  { label: "Users", value: "USERS_ONLY" },
]);

const targetDevice = ref([
  { label: "All", value: "ALL" },
  { label: "Mobile", value: "MOBILE_ONLY" },
  { label: "Web", value: "WEB_ONLY" },
]);

const formValid = ref();
const uploading = ref(false);
const showFullScreen = ref(false);
const submitting = ref(false);
const activeImageId = ref<string>("");
const { country, setSnackbar } = useLocal();
const bannerPhotoArr = ref([]);
const carouselImageArray = ref<TFile[] | any[]>([]);
const loader = ref(false);
const showSaveModal = ref(false);
const showSaveModalLoading = ref(false);
const titleRule = [(value: string) => !!value || "Please enter title"];
const descRule = [(value: string) => !!value || "Please enter description"];
const recipientsRule = [
  (value: string) => !!value || "Please select recipients",
];
const deviceRule = [
  (value: string) => !!value || "Please select target device",
];
const somethingWentWrongMessage = {
  modal: true,
  text: "Something went wrong. Please contact the administrator.",
  color: "error",
};

const handleUploadBannerPhotos = async () => {
  if (bannerPhotoArr.value.length > 0) {
    [formAnnouncement.value.bannerPhotos] = bannerPhotoArr.value;
    formAnnouncement.value.photo = formAnnouncement.value.bannerPhotos._id;
    bannerPhotoArr.value = [];
  }
  uploading.value = false;
};

const handleDeletePhoto = async (object: { id: string; type: string }) => {
  formAnnouncement.value.bannerPhotos = formAnnouncement.value.bannerPhotos
    .id as TFile[];
  formAnnouncement.value.photo = "";
};

const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  carouselImageArray.value.push(formAnnouncement.value.bannerPhotos);
  activeImageId.value = imageId;
};

const handleGoToList = () => {
  navigateTo({
    name: "country-announcements-list",
    params: {
      country: country,
    },
  });
};
const handleSubmit = async () => {
  if (formAnnouncement.value.photo === "") {
    setSnackbar({
      text: "Please upload a photo",
      color: "red",
      modal: true,
    });
    return;
  }

  const validationResult = await formValid.value?.validate();

  if (validationResult.valid) {
    showSaveModal.value = true;
  }
};
const handleSave = async () => {
  submitting.value = true;

  try {
    const payload = {
      attachment: formAnnouncement.value.photo,
      title: formAnnouncement.value.title,
      description: formAnnouncement.value.description,
      active: formAnnouncement.value.isActive,
      target: formAnnouncement.value.recipients,
      target_device: formAnnouncement.value.device,
    };
    const { data, error }: { data: any; error: any } =
      await addAnnouncement(payload);

    if (data.value) {
      handleGoToList();
    }
    if (error.value) {
      setSnackbar(somethingWentWrongMessage);
    }
  } catch (error) {
    setSnackbar(somethingWentWrongMessage);
  } finally {
    submitting.value = false;
  }
};
</script>
