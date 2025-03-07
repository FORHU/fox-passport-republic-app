<template>
  <v-row no-gutters class="pa-5 pa-md-7 text-secondary text-16px d-flex flex-column justify-start"
    style="min-height: fit-content">
    <v-col cols="12" class="w-100 font-600 text-22px h-100 px-3 d-flex align-center justify-space-between"><span>{{
        totalCountriesCount }} Supported Countries</span>
    </v-col>

    <v-col cols="12" no-gutters class="my-5 w-100 d-flex ga-3 align-center text-16px">
      <v-row no-gutters>
        <v-col cols="6" class="d-flex align-center ga-2 w-100">
          <!-- <span style="width: 100%;"> -->
          <v-text-field v-model="searchText" variant="outlined" color="tertiary" placeholder="Search a country"
            prepend-inner-icon="mdi-magnify" rounded="lg" hide-details height="40" @update:model-value="handleSearch"
            clearable></v-text-field>
          <!-- </span> -->
        </v-col>
        <v-col cols="6" class="d-flex align-center ga-2">
          <v-row no-gutters justify="end">
            <NuxtLink :to="{ name: 'settings-add-country' }" variant="text">
              <v-btn color="secondary" rounded="lg">+ Add Country</v-btn>
            </NuxtLink>
          </v-row>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-data-table-server v-model:items-per-page="pageLimit" :headers="headers" :items="countries"
        :items-length="totalCountriesCount" item-key="name" height="auto" fixed-footer :loading="loader"
        items-per-page-text="Rows per page" @update:options="initCountrySetting" :items-per-page-options="[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
        ]" @update:page="(page: number) => onUpdatePageHandler(page)"
        style="border: 2px solid #dedfe3; border-radius: 8px" last-icon="mdi-chevron-double-right"
        first-icon="mdi-chevron-double-left">
        <template v-slot:headers="{ columns }">
          <tr class="bg-light_gray text-charcoal font-500 text-16px">
            <template v-for="column in columns">
              <td :style="{
                minWidth: column.key == 'country' ? '250px' : '200px',
                height: '40px',
              }">
                <span class="px-2">{{ column.title }}</span>
              </td>
            </template>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr class="cursor-pointer text-charcoal font-500 text-16px" @click.stop="
            handleEditCountry(item._id as string, item?.status as string)
            ">
            <td align="center">
              <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                <v-img :lazy-src="imageSrc(item.photo) || '/svg/default-draft-image.svg'
                  " :src="imageSrc(item.photo) || '/svg/default-draft-image.svg'" height="54px" max-width="54px" cover
                  rounded="lg" alt="Featured Image"></v-img>
                <div class="d-flex align-center ga-3 px-3 py-2 py-md-3">
                  <span>{{ item.country_name }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <v-img class="ml-1 border-sm rounded" :src="item.flag_url" max-width="45" height="30" contain alt="flag url image"></v-img>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <span>{{ item.country_code }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <span>{{ item.currency_sign }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <span>{{ item.currency }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <span>{{ convertToPercentage(item?.commission) }}%</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-3 px-2 py-2 py-md-3">
                <span>{{ convertToPercentage(item?.rebate) }}%</span>
              </div>
            </td>
            <td>
              <v-row no-gutters class="ga-2 justify-end py-2 py-md-3" align="center">
                <v-col cols="auto" class="d-flex">
                  <v-btn flat class="mr-1" border="secondary sm" icon="mdi-square-edit-outline" size="small"
                    rounded="lg" @click.stop="
                      handleEditCountry(
                        item._id as string,
                        item?.status as string
                      )
                      "></v-btn>
                  <v-btn border="secondary sm" flat icon="mdi-trash-can-outline" size="small" rounded="lg"
                    @click.stop="handleDeleteCountry(item)" v-if="item.cca2 != 'SG'"></v-btn>
                </v-col>
              </v-row>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
  <DialogPromptNew v-model="showDialog" :promptTitle="promptTitle"
    :promptText="`Once you delete it, you can't get it back`" :disagreeButtonText="'Nevermind'"
    :agreeButtonText="'Delete it'" @disagree="disagreeButton" @agree="agreeButton" />
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
const { xs, smAndDown } = useDisplay();
const { adminDrawer } = useUtils();
const { getCountryList, getCountry, deleteCountry } = useSettingAPI();
const { convertToPercentage } = useUtils();
const countries = ref<TCountry[] | any>([]);
const loader = ref(false);
const selectedVenue = ref();
const showDeletePrompt = ref(false);
const showDeleteDraftPrompt = ref(false);
const loading = ref(true);
const processing = ref(false);
const page = ref(1);
const pageLimit = ref(10);
const totalPages = ref(1);
const countryList = ref<any>([]);
const selectedCountry = ref(null);
const totalCountriesCount = ref(0);
const searchText = ref("");
let timeoutId: ReturnType<typeof setTimeout>;
const promptTitle = ref("");
const selectedItem = ref();
const showDialog = ref(false);

const headers = ref([
  { title: "Country", align: "start", sortable: false, key: "country" },
  { title: "Flag", align: "end", key: "flag" },
  { title: "Country Code", align: "end", key: "countrycode" },
  { title: "Currency Sign", align: "end", key: "currencysign" },
  { title: "Currency Code", align: "end", key: "currencycode" },
  { title: "Commission", align: "end", key: "commission" },
  { title: "Rebate", align: "end", key: "rebate" },
  { title: "", align: "end", key: "action" },
]);

definePageMeta({
  middleware: ['auth', 'admin-only']
});


async function initCountrySetting() {
  loader.value  = true;
  try {
    const res = await getCountryList(page.value, pageLimit.value, searchText.value);

    if (res.data && res.data.data) {
      countries.value = res.data.data;
      totalCountriesCount.value = res.data.total_items;
    } else {
     
    }


  } catch (error) {

  } finally {
    loader.value  = false;

  }
}

const searchCountry = async () => {
  if (selectedCountry.value) {
    const result: any = await getCountry(selectedCountry.value);
    countries.value = [result];
  }
};

const toCountry = (id: string, name: string) => {
  useCookie("countryId").value = id;
  const router = useRouter();
  router.push(`/settings/country/${name.toLowerCase()}`);
};

watch(selectedCountry, async (oldValue, newwVal) => {
  if (oldValue === null) {
    await initCountrySetting();
  }
});

onBeforeMount(async () => {
  loader.value = true;
  await initCountrySetting();
  loader.value = false;
});

const handleSearch = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    page.value = 1;
    initCountrySetting();
  }, 300); // Adjust the delay as needed (1000ms = 1s)
};


const onUpdatePageHandler = async (pageNum: number) => {
  page.value = pageNum;
  await initCountrySetting();
  // await loadItems();
};

const handleEditCountry = (id: string) => {
  navigateTo({ name: "settings-country-countryId", params: { countryId: id } });
};

const imageSrc = (image: string) => {
  const imageObj = image.find((image) => {
    const extension = image.path
      .substring(image.path.lastIndexOf("."))
      .toLowerCase();
    return extension;
  });

  return imageObj?.path || null;
};

function handleDeleteCountry(val) {
  promptTitle.value = `Are you sure to delete ${val.country_name}?`;
  selectedItem.value = val;
  showDialog.value = true;
}

function disagreeButton() {
  console.log("Disagree");
}

async function agreeButton() {
  const id = selectedItem.value._id;
  await deleteCountry(id as string);
  showDialog.value = false;
  selectedItem.value = "";
  loader.value = true;
  await initCountrySetting();
  loader.value = false;
}
</script>
