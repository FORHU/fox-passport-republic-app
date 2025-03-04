<template>
  <!-- HEADER -->
  <v-row no-gutters class="w-100" color="white" style="height: 7dvh" justify="center">
    <v-row no-gutters justify="center" class="my-5">
      <v-col cols="12" md="10" lg="8" xl="6" sm="10">
        <v-skeleton-loader type="card" v-if="loader"></v-skeleton-loader>
        <v-form @submit.prevent="onSubmit" ref="formValid" class="w-100" v-else>
          <v-app-bar flat color="white" class="px-5 px-md-0" width="100%" style="border-bottom: 2px solid #dedfe3">
            <v-row no-gutters justify="center">
              <v-col cols="12" md="10" lg="8" xl="6" class="d-flex ga-2 align-center">
                <v-col class="d-flex align-center pr-3" style="width: 90%">
                  <span class="text-22px font-600">Add New Country</span>
                  <span><v-progress-linear color="primary" height="5" rounded="lg"
                      class="mt-1"></v-progress-linear></span>
                </v-col>
                <span>
                  <NuxtLink to="country" class="text-decoration-none text-black">
                    <v-btn variant="outlined" border="secondary md" size="large" text="Exit" rounded="lg"></v-btn>
                  </NuxtLink>
                </span>
              </v-col>
            </v-row>
          </v-app-bar>
          <v-main>
            <v-row no-gutters class="my-5">
              <!-- Country Selection -->
              <v-col cols="12" class="">
                <label class="text-18px font-500">Country</label>
                <v-autocomplete v-model="country_name" :items="updatedCountryOptions" item-title="name"
                  item-value="name" placeholder="Select Country" :rules="countryRules" dense outlined
                  rounded="lg"></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-row class="mt-4" wrap>
                  <!-- Columns for mobile responsiveness -->
                  <v-col cols="12" xs="3" sm="6" md="3">
                    <span class="text-16px font-500">Flag</span>
                    <v-img v-if="country_name" :src="selectedCountry.flag" max-width="45" height="30" contain
                      class="mt-2" alt="country flag"></v-img>
                  </v-col>
                  <v-col cols="12" xs="3" sm="6" md="3">
                    <span class="text-16px font-500">Country Code</span>
                    <span v-if="country_name" class="mt-2 d-block">
                      {{ selectedCountry.countryCode }}
                    </span>
                  </v-col>
                  <v-col cols="12" xs="3" sm="6" md="3">
                    <span class="text-16px font-500">Currency Sign</span>
                    <span v-if="country_name" class="mt-2 d-block">
                      {{ selectedCountry.currencySign }}
                    </span>
                  </v-col>
                  <v-col cols="12" xs="3" sm="6" md="3">
                    <span class="text-16px font-500">Currency Code</span>
                    <span v-if="country_name" class="mt-2 d-block">
                      {{ selectedCountry.currencyCode }}
                    </span>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Commission and Rebate Fields -->
              <v-col cols="12">
                <v-row class="mt-3">
                  <v-col cols="12" sm="6">
                    <label class="text-18px font-500">Commission Rate (%)</label>
                    <v-text-field v-model.number="formCountry.commission" type="number" min="0" :rules="commissionRules"
                      outlined dense rounded="lg"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <label class="text-18px font-500">Rebate Rate (%)</label>
                    <v-text-field v-model.number="formCountry.rebate" type="number" min="0" :rules="rebateRules"
                      outlined dense rounded="lg"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Cover Photo Upload -->
              <v-col cols="12" class="mt-3">
                <span class="font-weight-bold">Cover Photo</span>
                <v-row class="mt-3" no-gutters>
                  <v-col cols="12" class="text-center mt-5">
                    <CardImageUploader v-if="!formCountry?.countryPhotos?.path" v-model="countryPhotoArr"
                      v-model:uploading="uploading" label="Upload Cover Photo" uploader-id="space"
                      @done-uploading="handleUploadCountryPhotos" height="170" width="100%" single-file-only />
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <CardImage v-if="formCountry.photo !== ''" :src="formCountry.countryPhotos.path" height="300"
                      width="100%" :delete-icon="true" @delete="
                        handleDeletePhoto({
                          id: formCountry.countryPhotos._id,
                          type: 'country',
                        })
                        " @click="handleFullScreen(formCountry.countryPhotos._id)" />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-main>
          <v-app-bar no-gutters class="w-100" flat location="bottom" style="border-top: 2px solid #dedfe3">
            <v-sheet class="py-3 px-5 px-md-0" width="100%" style="
                position: relative;
                bottom: 0;
                left: 0;
                right: 0;
                border-top: 2px solid #dedfe3;
              ">
              <v-row no-gutters class="w-100 h-100" justify="center">
                <v-col cols="12" md="10" lg="8" xl="6">
                  <v-row no-gutters class="w-100 h-100" align="center" justify="end">
                    <!-- Save Button -->
                    <v-col cols="auto" class="d-flex justify-center align-center">
                      <v-btn color="secondary" border="secondary md" rounded="lg" @click="onSubmit"
                        :loading="submitting"
                        class="py-5 px-10 bg-secondary text-white d-flex align-center justify-center">
                        Add
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
  <!-- Additional Components -->
  <CarouselImageViewer v-model:show="showFullScreen" v-model:images="carouselImageArray"
    :active-image-id="activeImageId" />
  <DialogSuccessWithButton v-model="showSucessDialog" text="Country added successfully" button-text="Got it!"
    @click="navigateTo({ name: 'settings-country' })" />
  <LoadingUpload v-if="uploading" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs } = useDisplay();
const { setSnackbar } = useLocal();
const { getCountrySetting, addCountry } = useSettingAPI();
const { convertToDecimal } = useUtils();
const loader = ref(false);
const uploading = ref(false);
const showSucessDialog = ref(false);
const showFullScreen = ref(false);
const submitting = ref(false);
const selectedCountry = ref<any>({
  flag: "",
  countryCode: "",
  currencySign: "",
  currencyCode: "",
});

definePageMeta({
  layout: "bare",
  middleware: ['auth', 'admin-only']
});

const countries = ref<TCountry[] | any>([]);
const country_name = ref<any>("");
const countryList = ref<any>([]);
const statusSelection = ["ACTIVE", "INACTIVE"];
const formCountry = ref(<any>{
  countryPhotos: <any>{},
  photo: <any>"",
  rebate: 0,
  commission: 15,
  status: "",
  isDefault: false,
});
const countryPhotoArr = ref([]);
const carouselImageArray = ref<TFile[] | any[]>([]);
const activeImageId = ref<string>("");
const formValid = ref();
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


const statusRules = [(value: string) => !!value || "Please enter status"];

async function initCountrySetting() {
  countries.value = await getCountrySetting();
}

const fetchCountries = async () => {
  const response: any = await useAPI("https://restcountries.com/v3.1/all");
  const countries = response.data;

  countryList.value = countries.value
    .map((country: any) => ({
      name: country.name.common,
      props: { disabled: false },
    }))
    .sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name)
    );
};

const handleUploadCountryPhotos = async () => {
  if (countryPhotoArr.value.length > 0) {
    [formCountry.value.countryPhotos] = countryPhotoArr.value;
    formCountry.value.photo = formCountry.value.countryPhotos._id;
    countryPhotoArr.value = [];
  }
  uploading.value = false;
};

const handleDeletePhoto = async (object: { id: string; type: string }) => {
  formCountry.value.countryPhotos = formCountry.value.countryPhotos
    .id as TFile[];
  formCountry.value.photo = "";
};

const handleFullScreen = (imageId: string) => {
  if (!imageId) return;
  showFullScreen.value = true;
  carouselImageArray.value.push(formCountry.value.countryPhotos);
  activeImageId.value = imageId;
};

const onSubmit = async () => {
  if (formCountry.value.photo === "") {
    setSnackbar({
      text: "Please upload a photo",
      color: "red",
      modal: true,
    });
    return;
  }

  const validationResult = await formValid.value?.validate();

  if (validationResult.valid) {
    submitting.value = true;
    try {
      const payload = {
        country_name: country_name.value,
        commission: convertToDecimal(formCountry.value.commission),
        rebate: convertToDecimal(formCountry.value.rebate),
        status: "ACTIVE",
        photo: [formCountry.value.photo],
        isDefault: formCountry.value.isDefault,
      };
      const { data, error }: { data: any, error: any } = await addCountry(payload);
      if (data.value) {
        showSucessDialog.value = true;
      }
      if (error.value) {
        setSnackbar(somethingWentWrongMessage)

      }
    } catch (error) {
      console.error(error);
    } finally {
      submitting.value = false;
    }
  }
};

const updatedCountryOptions = computed(() => {
  return countryList.value.map((option: any) => {
    const exists = countries.value.some(
      (country: any) =>
        country.country_name.toLowerCase() === option.name.toLowerCase()
    );
    return { ...option, props: { ...option.props, disabled: exists } };
  });
});

const searchCountry = async () => {
  const response: any = await useAPI(
    `https://restcountries.com/v3.1/name/${country_name.value}`
  );
  const [country] = response.data.value;

  if (response.status.value === "success") {
    const currencies = country.currencies[Object.keys(country.currencies)[0]];
    selectedCountry.value.flag = country.flags.png;
    selectedCountry.value.countryCode = `${country.idd.root}${country.idd.suffixes[0]}`;
    selectedCountry.value.currencySign = currencies.symbol;
    selectedCountry.value.currencyCode = Object.keys(country.currencies)[0];
  } else {
    selectedCountry.value = null;
  }
};

watch(country_name, (oldValue, newwVal) => {
  if (oldValue) {
    searchCountry();
  }
});

onBeforeMount(async () => {
  loader.value = true;
  await initCountrySetting();
  await fetchCountries();
  loader.value = false;
});
</script>
