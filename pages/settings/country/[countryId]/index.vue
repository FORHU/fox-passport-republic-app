<template>
  <v-row no-gutters justify="center" class="mt-7">
    <v-col cols="12" md="10" lg="8" xl="6" sm="10">
      <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>

      <v-form @submit.prevent="onSubmit" ref="formValid" class="w-100" v-else>
        <v-app-bar
          flat
          color="white"
          class="px-5 px-md-0"
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
                <span class="text-22px font-600">{{
                  country?.country_name
                }}</span>
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
                <NuxtLink
                  :to="'/settings/country'"
                  class="text-decoration-none text-black"
                >
                  <v-btn
                    variant="outlined"
                    border="secondary md"
                    size="large"
                    text="Exit"
                    rounded="lg"
                  ></v-btn>
                </NuxtLink>
              </span>
            </v-col>
          </v-row>
        </v-app-bar>

        <v-main>
          <v-row no-gutters class="my-5">
            <!-- Country Selection -->
            <v-col cols="12" class="mt-3">
              <label class="text-18px font-500">Country</label>
              <v-autocomplete
                placeholder="Name"
                item-title="name"
                item-value="name"
                v-model="country.country_name"
                :rules="countryRules"
                :disabled="true"
                class="w-100"
                rounded="lg"
              ></v-autocomplete>
            </v-col>

            <!-- Country Details -->
            <v-col cols="12" xl="12">
              <v-row class="mt-4" wrap>
                <v-col cols="12" sm="6" md="3">
                  <span class="text-16px font-500">Flag</span>
                  <v-img
                    v-if="country.country_name"
                    :src="country.flag_url"
                    max-width="45"
                    height="30"
                    contain
                    alt="flat url"
                    class="border-sm rounded mt-2"
                  ></v-img>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="text-16px font-500">Country Code</span>
                  <span v-if="country.country_name" class="mt-2 d-block">
                    {{ country.country_code }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="text-16px font-500">Currency Sign</span>
                  <span v-if="country.country_name" class="mt-2 d-block">
                    {{
                      country.country_name === "Singapore"
                        ? "S$"
                        : country.currency_sign
                    }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="text-16px font-500">Currency Code</span>
                  <span v-if="country.country_name" class="mt-2 d-block">
                    {{ country.currency }}
                  </span>
                </v-col>
              </v-row>
            </v-col>

            <!-- Commission and Rebate Fields -->
            <v-col cols="12">
              <v-row class="mt-3">
                <v-col cols="12" sm="6">
                  <span class="text-18px font-500">Commission Rate (%)</span>
                  <v-text-field
                    :disabled="isEditCountry"
                    placeholder="Rate"
                    type="number"
                    min="0"
                    :rules="commissionRules"
                    v-model.number="commission"
                    outlined
                    dense
                    class="w-100"
                    rounded="lg"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <span class="text-18px font-500">Rebate Rate (%)</span>
                  <v-text-field
                    :disabled="isEditCountry"
                    placeholder="Rate"
                    type="number"
                    min="0"
                    :rules="rebateRules"
                    v-model.number="rebate"
                    outlined
                    dense
                    class="w-100"
                    rounded="lg"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>

            <!-- Cover Photo Upload -->
            <v-col cols="12" class="mt-3">
              <v-row no-gutters>
                <v-col cols="12">
                  <span class="font-weight-bold">Cover Photo</span>
                </v-col>
                <v-col cols="12">
                  <v-row
                    no-gutters
                    class="mt-3 d-flex ga-2 ga-sm-5 flex-wrap"
                    :class="xs ? 'd-flex justify-center' : ''"
                  >
                    <v-col cols="12" class="text-center">
                      <CardImageUploader
                        v-if="!isEditCountry && country.photo.length == 0"
                        v-model="countryPhotoArr"
                        v-model:uploading="uploading"
                        label="Upload Cover Photo"
                        uploader-id="space"
                        @done-uploading="handleUploadCountryPhotos"
                        height="170"
                        width="100%"
                        single-file-only
                      />
                    </v-col>
                    <v-col cols="12" class="text-center">
                      <CardImage
                        v-for="x in country.photo"
                        :key="x._id"
                        :src="x.path"
                        height="300"
                        width="100%"
                        :delete-icon="!isEditCountry"
                        @delete="
                          handleDeletePhoto({ id: x._id, type: 'country' })
                        "
                        @click="handleFullScreen(x._id)"
                        :disabled="isEditCountry"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-main>

        <v-app-bar
          flat
          location="bottom"
          no-gutters
          class="w-100"
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
                  <v-col cols="auto" class="d-flex justify-center align-center">
                    <v-btn
                      variant="outlined"
                      class=""
                      rounded="lg"
                      size="large"
                      @click="isEditCountry = false"
                      v-if="isEditCountry"
                    >
                      Update
                    </v-btn>
                    <v-btn
                      class="mr-4"
                      size="large"
                      variant="outlined"
                      color="red"
                      v-if="!isEditCountry"
                      @click="showPermanentlyDeletePrompt = true"
                      rounded="lg"
                    >
                      Delete Country
                    </v-btn>
                    <v-btn
                      color="secondary"
                      class="bg-secondary rounded-lg text-white d-flex align-center justify-center"
                      size="large"
                      @click="onSubmit"
                      v-if="!isEditCountry"
                    >
                      Save
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

  <!-- Image Viewer and Dialogs -->
  <CarouselImageViewer
    v-model:show="showFullScreen"
    v-model:images="carouselImageArray"
    :active-image-id="activeImageId"
  />
  <DialogSuccessWithButton
    v-model="showSucessDialog"
    text="Country updated successfully"
    button-text="Got it!"
    @click="navigateTo({ name: 'settings-country' })"
  />
  <DialogPromptNew
    v-model="showPermanentlyDeletePrompt"
    prompt-title="Are you sure you want to PERMANENTLY delete this country?"
    prompt-text="Please note that this action can't be undone."
    agree-button-text="Delete"
    disagree-button-text="No"
    @agree="handlePermanentlyDelete"
    show-header-message
  />
  <LoadingUpload v-if="uploading" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const { setSnackbar } = useLocal();
const { editCountry, getCountry, deleteCountry } = useSettingAPI();
const { convertToDecimal,  convertToPercentage} = useUtils();
const loader = ref(false);
const uploading = ref(false);
const showSucessDialog = ref(false);
const showFullScreen = ref(false);
const isEditCountry = ref(true);
const showPermanentlyDeletePrompt = ref(false);
const country = ref<TCountry | any>();
const toUploadNewPhoto = ref<any>("");
const countryPhotoArr = ref([]);
const carouselImageArray = ref<TFile[] | any[]>([]);
const activeImageId = ref<string>("");
const formValid = ref();
const commission = ref<number | null>(null);
const rebate = ref<number | null>(null);
const countryRules = [(value: string) => !!value || "Please enter a country"];

const somethingWentWrongMessage = {
  modal: true,
  text: "Something went wrong. Please contact the administrator.",
  color: "error",
};

const commissionRules = [
  (value: string) =>
    (!!value) || "Please enter commission",
    (value: string) => parseFloat(value) <= 100 || 'Max value is 100',
    (value: string) => parseFloat(value) >= 4 || 'Minimum value is 4%'
];
const rebateRules = [
  (value: string) =>
    (value !== "" && parseFloat(value) >= 0) ||
    "Please enter rebate rate",
    (value: string) => parseFloat(value) <= 100 || 'Max value is 100'
];

const { countryId } = useRoute().params;



async function initCountrySetting() {
  // const countryId: any = useCookie("countryId").value;
  const result: any = await getCountry(countryId);
  if(!result){
    setSnackbar({modal: true, color: 'error', text: 'Something went wrong. Please try again later.'})
  }
  country.value = result;
  rebate.value = convertToPercentage(result?.rebate)
  commission.value = convertToPercentage(result?.commission)
}

definePageMeta({
  layout: "bare",
});

const handleUploadCountryPhotos = async () => {
  if (countryPhotoArr.value.length > 0) {
    country.value.photo = [...countryPhotoArr.value];
    toUploadNewPhoto.value = country.value.photo[0]._id;
    countryPhotoArr.value = [];
  }
  uploading.value = false;
};

const handleDeletePhoto = async (object: { id: string; type: string }) => {
  country.value.photo = country.value.photo.filter(
    (x: any) => x._id !== object.id
  ) as TFile[];
};

const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  const countryPhotos = country.value.photo as TFile[];
  if (countryPhotos.length > 0) {
    const filteredcountryPhotoArr = countryPhotos.filter((item: TFile) => {
      return !carouselImageArray.value.some((x: TFile) => x._id == item._id);
    });
    carouselImageArray.value.push(...filteredcountryPhotoArr);
  }

  activeImageId.value = imageId;
};

const onSubmit = async () => {
  if (country.value.photo.length === 0) {
    setSnackbar({
      text: "Please upload at least one photo",
      color: "red",
      modal: true,
    });
    return;
  }

  const validationResult = await formValid.value?.validate();

  if (validationResult.valid) {
    try {
      const payload = {
        commission: commission.value ?  convertToDecimal(commission.value) : 0,
        rebate: rebate.value ? convertToDecimal((rebate.value)) : 0,
        status: country.value.status.toUpperCase(),
        photo:
          toUploadNewPhoto.value === ""
            ? [country.value.photo[0]._id]
            : [toUploadNewPhoto.value],
        isDefault: country.value.isDefault,
      };

      const { data, error }: { data: any, error: any } = await editCountry(
        payload,
        country.value._id
      );
      if (data.value) {
        showSucessDialog.value = true;
        isEditCountry.value = true;
      }

      if(error.value){
        setSnackbar(somethingWentWrongMessage)

      }

    } catch (error) {
      console.error(error);
    }
  }
};

const handlePermanentlyDelete = async () => {
  showPermanentlyDeletePrompt.value = false;
  try {
    await deleteCountry(country.value._id);
    navigateTo({ name: "settings-country" });
  } catch (error) {
    console.error(error);
  }
};

const capitalizedStatus = (status: string) => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

onBeforeMount(async () => {
  loader.value = true;
  await initCountrySetting();
  loader.value = false;
});
</script>
